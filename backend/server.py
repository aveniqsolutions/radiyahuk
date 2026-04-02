from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import secrets
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
from bson import ObjectId
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# JWT Config
JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=24), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─── Pydantic Models ───

class LoginRequest(BaseModel):
    email: str
    password: str

class SeriesCreate(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = ""
    is_featured: bool = False
    order: int = 0

class SeriesUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    order: Optional[int] = None

class EbookCreate(BaseModel):
    series_id: str
    title: str
    description: str
    price: float
    image_url: Optional[str] = ""
    download_url: Optional[str] = ""
    order_in_series: int = 0

class EbookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    download_url: Optional[str] = None
    order_in_series: Optional[int] = None
    series_id: Optional[str] = None

class CheckoutRequest(BaseModel):
    ebook_id: str
    email: str
    origin_url: str

class ContactRequest(BaseModel):
    name: str
    email: str
    message: str

# ─── Auth Routes ───

@api_router.post("/auth/login")
async def admin_login(req: LoginRequest, response: Response):
    email = req.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user["_id"]), email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    return {"email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin"), "token": token}

@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    return {"email": user["email"], "name": user.get("name", ""), "role": user.get("role", "")}

@api_router.post("/auth/logout")
async def auth_logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}

# ─── Public Series & Ebook Routes ───

@api_router.get("/series")
async def list_series():
    series_list = await db.series.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for s in series_list:
        ebook_count = await db.ebooks.count_documents({"series_id": s["id"]})
        s["ebook_count"] = ebook_count
    return series_list

@api_router.get("/series/{series_id}")
async def get_series(series_id: str):
    s = await db.series.find_one({"id": series_id}, {"_id": 0})
    if not s:
        raise HTTPException(status_code=404, detail="Series not found")
    ebooks = await db.ebooks.find({"series_id": series_id}, {"_id": 0}).sort("order_in_series", 1).to_list(100)
    s["ebooks"] = ebooks
    return s

@api_router.get("/featured")
async def get_featured():
    series_list = await db.series.find({"is_featured": True}, {"_id": 0}).sort("order", 1).to_list(10)
    for s in series_list:
        ebooks = await db.ebooks.find({"series_id": s["id"]}, {"_id": 0}).sort("order_in_series", 1).to_list(10)
        s["ebooks"] = ebooks
    return series_list

@api_router.get("/ebooks/{ebook_id}")
async def get_ebook(ebook_id: str):
    ebook = await db.ebooks.find_one({"id": ebook_id}, {"_id": 0})
    if not ebook:
        raise HTTPException(status_code=404, detail="Ebook not found")
    series = await db.series.find_one({"id": ebook["series_id"]}, {"_id": 0})
    ebook["series"] = series
    return ebook

# ─── Stripe Checkout ───

@api_router.post("/checkout")
async def create_checkout(req: CheckoutRequest, http_request: Request):
    ebook = await db.ebooks.find_one({"id": req.ebook_id}, {"_id": 0})
    if not ebook:
        raise HTTPException(status_code=404, detail="Ebook not found")

    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = req.origin_url.rstrip("/")
    webhook_url = str(http_request.base_url).rstrip("/") + "/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    success_url = f"{host_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/ebooks/{req.ebook_id}"

    amount = float(ebook["price"])
    metadata = {
        "ebook_id": req.ebook_id,
        "ebook_title": ebook["title"],
        "customer_email": req.email
    }

    checkout_req = CheckoutSessionRequest(
        amount=amount,
        currency="gbp",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    session = await stripe_checkout.create_checkout_session(checkout_req)

    # Create payment transaction record
    download_token = secrets.token_urlsafe(32)
    tx = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "ebook_id": req.ebook_id,
        "ebook_title": ebook["title"],
        "email": req.email,
        "amount": amount,
        "currency": "gbp",
        "payment_status": "pending",
        "download_token": download_token,
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(tx)

    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, http_request: Request):
    api_key = os.environ.get("STRIPE_API_KEY")
    webhook_url = str(http_request.base_url).rstrip("/") + "/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    status = await stripe_checkout.get_checkout_status(session_id)

    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if tx and tx["payment_status"] != "paid" and status.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "status": status.status}}
        )
        # Create order
        order = {
            "id": str(uuid.uuid4()),
            "email": tx["email"],
            "ebook_id": tx["ebook_id"],
            "ebook_title": tx["ebook_title"],
            "amount": tx["amount"],
            "currency": tx["currency"],
            "session_id": session_id,
            "payment_status": "paid",
            "download_token": tx["download_token"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        existing_order = await db.orders.find_one({"session_id": session_id})
        if not existing_order:
            await db.orders.insert_one(order)
    elif tx and status.payment_status != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": status.payment_status, "status": status.status}}
        )

    download_token = tx["download_token"] if tx else None
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
        "download_token": download_token if status.payment_status == "paid" else None
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    api_key = os.environ.get("STRIPE_API_KEY")
    webhook_url = str(request.base_url).rstrip("/") + "/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {"payment_status": "paid", "status": "complete"}}
            )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# ─── Download ───

@api_router.get("/download/{token}")
async def download_ebook(token: str):
    tx = await db.payment_transactions.find_one({"download_token": token, "payment_status": "paid"}, {"_id": 0})
    if not tx:
        order = await db.orders.find_one({"download_token": token, "payment_status": "paid"}, {"_id": 0})
        if not order:
            raise HTTPException(status_code=404, detail="Invalid or expired download link")
        ebook_id = order["ebook_id"]
    else:
        ebook_id = tx["ebook_id"]

    ebook = await db.ebooks.find_one({"id": ebook_id}, {"_id": 0})
    if not ebook:
        raise HTTPException(status_code=404, detail="Ebook not found")

    return {
        "title": ebook["title"],
        "download_url": ebook.get("download_url", ""),
        "message": "Your ebook is ready for download."
    }

# ─── Contact ───

@api_router.post("/contact")
async def submit_contact(req: ContactRequest):
    msg = {
        "id": str(uuid.uuid4()),
        "name": req.name,
        "email": req.email,
        "message": req.message,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(msg)
    return {"message": "Thank you for your message. We will get back to you soon."}

# ─── Admin CRUD ───

@api_router.get("/admin/series")
async def admin_list_series(request: Request):
    await get_current_user(request)
    series_list = await db.series.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for s in series_list:
        s["ebook_count"] = await db.ebooks.count_documents({"series_id": s["id"]})
    return series_list

@api_router.post("/admin/series")
async def admin_create_series(req: SeriesCreate, request: Request):
    await get_current_user(request)
    doc = req.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.series.insert_one(doc)
    del doc["_id"]
    return doc

@api_router.put("/admin/series/{series_id}")
async def admin_update_series(series_id: str, req: SeriesUpdate, request: Request):
    await get_current_user(request)
    update = {k: v for k, v in req.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.series.update_one({"id": series_id}, {"$set": update})
    updated = await db.series.find_one({"id": series_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/series/{series_id}")
async def admin_delete_series(series_id: str, request: Request):
    await get_current_user(request)
    await db.series.delete_one({"id": series_id})
    await db.ebooks.delete_many({"series_id": series_id})
    return {"message": "Series and associated ebooks deleted"}

@api_router.get("/admin/ebooks")
async def admin_list_ebooks(request: Request):
    await get_current_user(request)
    ebooks = await db.ebooks.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return ebooks

@api_router.post("/admin/ebooks")
async def admin_create_ebook(req: EbookCreate, request: Request):
    await get_current_user(request)
    doc = req.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.ebooks.insert_one(doc)
    del doc["_id"]
    return doc

@api_router.put("/admin/ebooks/{ebook_id}")
async def admin_update_ebook(ebook_id: str, req: EbookUpdate, request: Request):
    await get_current_user(request)
    update = {k: v for k, v in req.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.ebooks.update_one({"id": ebook_id}, {"$set": update})
    updated = await db.ebooks.find_one({"id": ebook_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/ebooks/{ebook_id}")
async def admin_delete_ebook(ebook_id: str, request: Request):
    await get_current_user(request)
    await db.ebooks.delete_one({"id": ebook_id})
    return {"message": "Ebook deleted"}

@api_router.get("/admin/orders")
async def admin_list_orders(request: Request):
    await get_current_user(request)
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders

@api_router.get("/admin/contacts")
async def admin_list_contacts(request: Request):
    await get_current_user(request)
    contacts = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return contacts

# ─── Include Router & Middleware ───

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Startup: Seed Admin + Sample Data ───

@app.on_event("startup")
async def startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.series.create_index("id", unique=True)
    await db.ebooks.create_index("id", unique=True)
    await db.payment_transactions.create_index("session_id")
    await db.orders.create_index("session_id")

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@radiyah.co.uk")
    admin_password = os.environ.get("ADMIN_PASSWORD", "RadiyahAdmin2026!")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # Write test credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(f"# Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n## Auth Endpoints\n- POST /api/auth/login\n- GET /api/auth/me\n- POST /api/auth/logout\n")

    # Seed sample data if empty
    count = await db.series.count_documents({})
    if count == 0:
        await seed_sample_data()

async def seed_sample_data():
    series_data = [
        {
            "id": str(uuid.uuid4()),
            "title": "Foundations of Faith",
            "description": "A comprehensive series exploring the core principles of Islamic belief, worship, and spiritual growth. Each volume builds upon the last, guiding the reader from fundamental concepts to a deeper, more rooted understanding of their faith.",
            "image_url": "https://images.pexels.com/photos/7956724/pexels-photo-7956724.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "is_featured": True,
            "order": 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "The Mindful Muslim",
            "description": "Practical guides for integrating Islamic teachings into modern daily life. From managing stress through dhikr to building healthy habits grounded in Prophetic tradition, this series addresses real challenges with timeless wisdom.",
            "image_url": "https://images.unsplash.com/photo-1600783355836-71c1717faf25?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwzfHxtaW5pbWFsaXN0JTIwYmxhY2slMjBib29rfGVufDB8fHx8MTc3NTE1MjUyMHww&ixlib=rb-4.1.0&q=85",
            "is_featured": True,
            "order": 2,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Parenting with Purpose",
            "description": "A series dedicated to raising children with strong moral foundations and Islamic values in the modern world. Covering discipline, communication, education, and spiritual nurturing from infancy through adolescence.",
            "image_url": "https://images.pexels.com/photos/34256958/pexels-photo-34256958.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "is_featured": True,
            "order": 3,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]

    ebooks_data = []
    # Series 1: Foundations of Faith
    s1 = series_data[0]["id"]
    foundations_books = [
        ("Understanding Tawheed", "An accessible introduction to the concept of monotheism in Islam, exploring its meaning, categories, and practical implications for daily life.", 4.99),
        ("The Pillars Explained", "A clear, thorough guide to the five pillars of Islam — Shahada, Salah, Zakat, Sawm, and Hajj — with practical steps and spiritual insights.", 4.99),
        ("Purification of the Heart", "Drawing from classical Islamic scholarship, this volume examines the diseases of the heart and presents actionable remedies for spiritual purification.", 5.99),
        ("Living the Sunnah", "A practical manual for implementing the Prophetic way in everyday routines, from morning adhkar to interpersonal conduct.", 4.99),
        ("Seeking Sacred Knowledge", "Guidance on the etiquettes, methods, and rewards of seeking Islamic knowledge, with advice for self-study and structured learning.", 5.99),
    ]
    for i, (title, desc, price) in enumerate(foundations_books):
        ebooks_data.append({
            "id": str(uuid.uuid4()), "series_id": s1, "title": title,
            "description": desc, "price": price,
            "image_url": "", "download_url": "#",
            "order_in_series": i + 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    # Series 2: The Mindful Muslim
    s2 = series_data[1]["id"]
    mindful_books = [
        ("Morning & Evening Adhkar", "A guide to the daily remembrances prescribed by the Prophet, with explanations of their meanings and spiritual benefits.", 3.99),
        ("Stress, Anxiety & the Quran", "Practical techniques for managing modern-day stress through Quranic verses, du'a, and mindfulness rooted in Islamic tradition.", 5.99),
        ("Digital Detox for the Soul", "How to reclaim your time and attention from screens and social media, replacing digital noise with meaningful spiritual practice.", 4.99),
        ("Productivity the Prophetic Way", "Time management and goal-setting strategies inspired by the habits and routines of the Prophet Muhammad (peace be upon him).", 4.99),
        ("Building Healthy Habits", "A step-by-step framework for creating lasting positive habits, from consistent worship to healthy eating and exercise, grounded in Islamic teaching.", 4.99),
    ]
    for i, (title, desc, price) in enumerate(mindful_books):
        ebooks_data.append({
            "id": str(uuid.uuid4()), "series_id": s2, "title": title,
            "description": desc, "price": price,
            "image_url": "", "download_url": "#",
            "order_in_series": i + 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    # Series 3: Parenting with Purpose
    s3 = series_data[2]["id"]
    parenting_books = [
        ("The First Seven Years", "Islamic guidance for nurturing children from birth to age seven — covering love, play, du'a, and building emotional security.", 5.99),
        ("Teaching Salah to Children", "A gentle, practical approach to introducing prayer to young children, with age-appropriate techniques and encouragement methods.", 3.99),
        ("Raising Confident Muslims", "Strategies for building self-esteem, identity, and resilience in Muslim children growing up in Western societies.", 5.99),
        ("Discipline Without Harm", "Positive discipline techniques drawn from Islamic ethics and modern child psychology, replacing punishment with understanding.", 4.99),
        ("Teenagers & Tarbiyah", "Navigating the challenging teenage years with wisdom, patience, and Islamic principles — covering identity, peer pressure, and faith development.", 5.99),
    ]
    for i, (title, desc, price) in enumerate(parenting_books):
        ebooks_data.append({
            "id": str(uuid.uuid4()), "series_id": s3, "title": title,
            "description": desc, "price": price,
            "image_url": "", "download_url": "#",
            "order_in_series": i + 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    await db.series.insert_many(series_data)
    await db.ebooks.insert_many(ebooks_data)
    logger.info("Sample data seeded: 3 series, 15 ebooks")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
