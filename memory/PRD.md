# Radiyah UK - Islamic Ebook Store PRD

## Problem Statement
Create an Islamic ebook store called "Radiyah UK" with dark aesthetic (white font, black background, grey shades). Features include Stripe payments, ebooks organized in series (~5 per series), About Me page, Contact Us page, and admin dashboard.

## Architecture
- **Backend**: FastAPI (Python) with MongoDB via Motor
- **Frontend**: React with Tailwind CSS + Shadcn UI
- **Payments**: Stripe via emergentintegrations library
- **Auth**: JWT (admin only) with bcrypt password hashing
- **Database**: MongoDB (collections: series, ebooks, orders, payment_transactions, users, contact_messages)

## User Personas
1. **Customer**: Browses ebooks, purchases via email + Stripe, downloads after payment
2. **Admin**: Manages series, ebooks, views orders and messages

## Core Requirements
- Dark aesthetic UI (black bg, white text, grey accents)
- Ebook series with ~5 volumes each
- Stripe checkout with email-only flow
- Download link after successful payment
- Admin CRUD for series/ebooks
- Contact form and About page

## What's Been Implemented (Feb 2026)
- Full homepage with hero, featured series, mission section
- Browse series page with all series
- Series detail with ebook listings
- Ebook detail with purchase flow
- Stripe checkout integration (GBP currency)
- Payment status polling + download link
- Contact form (frontend + backend)
- About page with mission/values
- Admin login + dashboard (series, ebooks, orders, messages)
- Seeded 3 series with 15 ebooks
- Admin account seeded

## Prioritized Backlog
- P0: None (MVP complete)
- P1: Real ebook file uploads (object storage), email notifications on purchase
- P2: Search/filter ebooks, customer order history, series bundles with discount
