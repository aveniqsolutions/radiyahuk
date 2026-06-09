import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  BookOpen, Layers, ShoppingCart, MessageSquare,
  LogOut, Plus, Pencil, Trash2, X
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function getAuthHeaders() {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}

const api = axios.create({ baseURL: API });
api.interceptors.request.use(config => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Sidebar ───
function Sidebar() {
  const location = useLocation();
  const links = [
    { path: "/admin", icon: Layers, label: "Series", exact: true },
    { path: "/admin/ebooks", icon: BookOpen, label: "Ebooks" },
    { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { path: "/admin/contacts", icon: MessageSquare, label: "Messages" },
  ];

  return (
    <div className="w-56 border-r border-[#262626] bg-[#050505] min-h-screen p-6 flex flex-col">
      <Link to="/" className="font-['Cormorant_Garamond'] text-lg text-[#FAFAFA] tracking-wide mb-10">
        RADIYAH
      </Link>
      <nav className="flex-1 space-y-1">
        {links.map(l => {
          const active = l.exact
            ? location.pathname === l.path
            : location.pathname.startsWith(l.path);
          return (
            <Link
              key={l.path}
              to={l.path}
              data-testid={`admin-nav-${l.label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                active ? "text-[#FAFAFA] bg-[#1A1A1A]" : "text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-[#0F0F0F]"
              }`}
            >
              <l.icon size={16} />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Series Management ───
function SeriesManager() {
  const [series, setSeries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", image_url: "", is_featured: false, order: 0, bundle_price: "" });

  const load = useCallback(async () => {
    try {
      const res = await api.get("/admin/series");
      setSeries(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error("Failed to load series"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (payload.bundle_price === "" || payload.bundle_price === null) {
        delete payload.bundle_price;
      } else {
        payload.bundle_price = parseFloat(payload.bundle_price) || null;
      }
      if (editing) {
        await api.put(`/admin/series/${editing}`, payload);
        toast.success("Series updated.");
      } else {
        await api.post("/admin/series", payload);
        toast.success("Series created.");
      }
      setEditing(null);
      setForm({ title: "", description: "", image_url: "", is_featured: false, order: 0, bundle_price: "" });
      load();
    } catch { toast.error("Failed to save series."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this series and all its ebooks?")) return;
    try {
      await api.delete(`/admin/series/${id}`);
      toast.success("Series deleted.");
      load();
    } catch { toast.error("Failed to delete series."); }
  };

  const startEdit = (s) => {
    setEditing(s.id);
    setForm({ title: s.title, description: s.description, image_url: s.image_url || "", is_featured: s.is_featured, order: s.order, bundle_price: s.bundle_price || "" });
  };

  return (
    <div data-testid="admin-series-manager">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-['Cormorant_Garamond'] text-2xl text-[#FAFAFA]">Series</h2>
        <button
          data-testid="add-series-btn"
          onClick={() => { setEditing(null); setForm({ title: "", description: "", image_url: "", is_featured: false, order: 0, bundle_price: "" }); }}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 text-xs uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors"
        >
          <Plus size={14} /> New Series
        </button>
      </div>

      {/* Form */}
      <div className="border border-[#262626] bg-[#0F0F0F] p-6 mb-8 space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">
          {editing ? "Edit Series" : "Create New Series"}
        </p>
        <input
          data-testid="series-title-input"
          value={form.title}
          onChange={e => setForm({...form, title: e.target.value})}
          placeholder="Series title"
          className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white placeholder:text-[#525252]"
        />
        <textarea
          data-testid="series-description-input"
          value={form.description}
          onChange={e => setForm({...form, description: e.target.value})}
          placeholder="Description"
          rows={3}
          className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white placeholder:text-[#525252] resize-none"
        />
        <input
          data-testid="series-image-input"
          value={form.image_url}
          onChange={e => setForm({...form, image_url: e.target.value})}
          placeholder="Image URL (optional)"
          className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white placeholder:text-[#525252]"
        />
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-[#A3A3A3]">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={e => setForm({...form, is_featured: e.target.checked})}
              className="accent-white"
            />
            Featured
          </label>
          <input
            type="number"
            value={form.order}
            onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})}
            placeholder="Order"
            className="w-20 bg-transparent border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white"
          />
          <input
            type="number"
            step="0.01"
            data-testid="series-bundle-price-input"
            value={form.bundle_price}
            onChange={e => setForm({...form, bundle_price: e.target.value})}
            placeholder="Bundle price"
            className="w-32 bg-transparent border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white placeholder:text-[#525252]"
          />
        </div>
        <div className="flex gap-3">
          <button
            data-testid="save-series-btn"
            onClick={handleSave}
            className="bg-white text-black px-6 py-2 text-xs uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors"
          >
            {editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button
              onClick={() => { setEditing(null); setForm({ title: "", description: "", image_url: "", is_featured: false, order: 0, bundle_price: "" }); }}
              className="border border-[#262626] text-[#A3A3A3] px-6 py-2 text-xs uppercase tracking-[0.15em] hover:text-[#FAFAFA] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-px">
        {series.map(s => (
          <div key={s.id} className="border border-[#262626] bg-[#0F0F0F] p-4 flex items-center justify-between">
            <div>
              <p className="text-[#FAFAFA] text-sm font-medium">{s.title}</p>
              <p className="text-xs text-[#737373]">
                {s.ebook_count || 0} ebooks &middot; Order: {s.order} {s.is_featured && " &middot; Featured"}
                {s.bundle_price && ` &middot; Bundle: \u00A3${Number(s.bundle_price).toFixed(2)}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(s)} className="p-2 text-[#737373] hover:text-[#FAFAFA] transition-colors" data-testid={`edit-series-${s.id}`}>
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-2 text-[#737373] hover:text-red-400 transition-colors" data-testid={`delete-series-${s.id}`}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Ebook Management ───
function EbookManager() {
  const [ebooks, setEbooks] = useState([]);
  const [series, setSeries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ series_id: "", title: "", description: "", price: 0, image_url: "", download_url: "", order_in_series: 1 });

  const load = useCallback(async () => {
    try {
      const [ebookRes, seriesRes] = await Promise.all([api.get("/admin/ebooks"), api.get("/admin/series")]);
      etEbooks(Array.isArray(ebookRes.data) ? ebookRes.data : []);
      setSeries(Array.isArray(seriesRes.data) ? seriesRes.data : []);
    } catch { toast.error("Failed to load data"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      const payload = { ...form, price: parseFloat(form.price) || 0 };
      if (editing) {
        await api.put(`/admin/ebooks/${editing}`, payload);
        toast.success("Ebook updated.");
      } else {
        await api.post("/admin/ebooks", payload);
        toast.success("Ebook created.");
      }
      setEditing(null);
      setForm({ series_id: "", title: "", description: "", price: 0, image_url: "", download_url: "", order_in_series: 1 });
      load();
    } catch { toast.error("Failed to save ebook."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ebook?")) return;
    try {
      await api.delete(`/admin/ebooks/${id}`);
      toast.success("Ebook deleted.");
      load();
    } catch { toast.error("Failed to delete ebook."); }
  };

  const getSeriesTitle = (sid) => series.find(s => s.id === sid)?.title || "Unknown";

  const startEdit = (eb) => {
    setEditing(eb.id);
    setForm({
      series_id: eb.series_id, title: eb.title, description: eb.description,
      price: eb.price, image_url: eb.image_url || "", download_url: eb.download_url || "",
      order_in_series: eb.order_in_series
    });
  };

  return (
    <div data-testid="admin-ebook-manager">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-['Cormorant_Garamond'] text-2xl text-[#FAFAFA]">Ebooks</h2>
        <button
          data-testid="add-ebook-btn"
          onClick={() => { setEditing(null); setForm({ series_id: series[0]?.id || "", title: "", description: "", price: 0, image_url: "", download_url: "", order_in_series: 1 }); }}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 text-xs uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors"
        >
          <Plus size={14} /> New Ebook
        </button>
      </div>

      {/* Form */}
      <div className="border border-[#262626] bg-[#0F0F0F] p-6 mb-8 space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">
          {editing ? "Edit Ebook" : "Create New Ebook"}
        </p>
        <select
          data-testid="ebook-series-select"
          value={form.series_id}
          onChange={e => setForm({...form, series_id: e.target.value})}
          className="w-full bg-[#0F0F0F] border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white"
        >
          <option value="">Select Series</option>
          {series.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <input
          data-testid="ebook-title-input"
          value={form.title}
          onChange={e => setForm({...form, title: e.target.value})}
          placeholder="Ebook title"
          className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white placeholder:text-[#525252]"
        />
        <textarea
          data-testid="ebook-description-input"
          value={form.description}
          onChange={e => setForm({...form, description: e.target.value})}
          placeholder="Description"
          rows={3}
          className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white placeholder:text-[#525252] resize-none"
        />
        <div className="flex gap-4">
          <input
            data-testid="ebook-price-input"
            type="number"
            step="0.01"
            value={form.price}
            onChange={e => setForm({...form, price: e.target.value})}
            placeholder="Price"
            className="w-32 bg-transparent border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white"
          />
          <input
            type="number"
            value={form.order_in_series}
            onChange={e => setForm({...form, order_in_series: parseInt(e.target.value) || 1})}
            placeholder="Volume #"
            className="w-24 bg-transparent border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white"
          />
        </div>
        <input
          value={form.download_url}
          onChange={e => setForm({...form, download_url: e.target.value})}
          placeholder="Download URL"
          className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white placeholder:text-[#525252]"
        />
        <div className="flex gap-3">
          <button
            data-testid="save-ebook-btn"
            onClick={handleSave}
            className="bg-white text-black px-6 py-2 text-xs uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors"
          >
            {editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button
              onClick={() => { setEditing(null); setForm({ series_id: "", title: "", description: "", price: 0, image_url: "", download_url: "", order_in_series: 1 }); }}
              className="border border-[#262626] text-[#A3A3A3] px-6 py-2 text-xs uppercase tracking-[0.15em] hover:text-[#FAFAFA] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-px">
        {ebooks.map(eb => (
          <div key={eb.id} className="border border-[#262626] bg-[#0F0F0F] p-4 flex items-center justify-between">
            <div>
              <p className="text-[#FAFAFA] text-sm font-medium">{eb.title}</p>
              <p className="text-xs text-[#737373]">
                {getSeriesTitle(eb.series_id)} &middot; Vol. {eb.order_in_series} &middot; &pound;{Number(eb.price).toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(eb)} className="p-2 text-[#737373] hover:text-[#FAFAFA] transition-colors" data-testid={`edit-ebook-${eb.id}`}>
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(eb.id)} className="p-2 text-[#737373] hover:text-red-400 transition-colors" data-testid={`delete-ebook-${eb.id}`}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Orders ───
function OrdersView() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/admin/orders\").then(r => setOrders(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-orders-view">
      <h2 className="font-['Cormorant_Garamond'] text-2xl text-[#FAFAFA] mb-8">Orders</h2>
      {orders.length === 0 ? (
        <p className="text-[#A3A3A3] text-sm">No orders yet.</p>
      ) : (
        <div className="space-y-px">
          {orders.map(o => (
            <div key={o.id} className="border border-[#262626] bg-[#0F0F0F] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[#FAFAFA] text-sm font-medium">{o.ebook_title}</p>
                <span className={`text-xs uppercase tracking-[0.15em] px-2 py-1 ${
                  o.payment_status === "paid" ? "text-green-400 bg-green-400/10" : "text-[#737373] bg-[#1A1A1A]"
                }`}>
                  {o.payment_status}
                </span>
              </div>
              <p className="text-xs text-[#737373]">
                {o.email} &middot; &pound;{Number(o.amount).toFixed(2)} &middot; {new Date(o.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Messages ───
function MessagesView() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    api.get(\"/admin/contacts\").then(r => setMessages(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-messages-view">
      <h2 className="font-['Cormorant_Garamond'] text-2xl text-[#FAFAFA] mb-8">Messages</h2>
      {messages.length === 0 ? (
        <p className="text-[#A3A3A3] text-sm">No messages yet.</p>
      ) : (
        <div className="space-y-px">
          {messages.map(m => (
            <div key={m.id} className="border border-[#262626] bg-[#0F0F0F] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[#FAFAFA] text-sm font-medium">{m.name}</p>
                <p className="text-xs text-[#525252]">{new Date(m.created_at).toLocaleDateString()}</p>
              </div>
              <p className="text-xs text-[#737373] mb-2">{m.email}</p>
              <p className="text-sm text-[#A3A3A3]">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───
export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) navigate("/admin/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    api.post("/auth/logout").catch(() => {});
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-[#050505]" data-testid="admin-dashboard">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#737373]">Admin Dashboard</p>
          <button
            data-testid="admin-logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-[#737373] hover:text-[#FAFAFA] transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
        <Routes>
          <Route index element={<SeriesManager />} />
          <Route path="ebooks" element={<EbookManager />} />
          <Route path="orders" element={<OrdersView />} />
          <Route path="contacts" element={<MessagesView />} />
        </Routes>
      </div>
    </div>
  );
}
