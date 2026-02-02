# 🏢 Enterprise Admin UI

**Live demo:** https://enterprise-admin-ui.vercel.app/

A modern **internal admin dashboard** for managing support tickets, users, and system settings.  
Built with real SaaS patterns: typed services, server-side analytics (SQL/RPC), and clean UX.

> Designed as an internal enterprise admin tool today, with foundations to evolve into multi-tenant SaaS later.

---

## ✨ Features

### 🔐 Authentication

- Email/password login using **Supabase Auth**
- Optional Google OAuth flow
- **Demo access (temporary)** for quick review/testing
- “Request access” flow: user submits email → stored in DB + admin notified

### 🎟️ Ticket Management

- Create / update / delete tickets
- Inline editing (title, status, priority)
- Search + filtering
- Pagination with correct **total count** (not limited to page 1)

### 📊 Dashboard Analytics (SQL-powered)

- Total tickets (server-side)
- Ticket status breakdown (Open / In Progress / Closed)
- Priority distribution (Low / Medium / High)
- Daily ticket trend (RPC aggregate)

### 🌗 UI / UX

- Light/Dark mode (persisted)
- Responsive layout (desktop-first, mobile-safe)
- Polished tables (zebra rows + hover)
- Consistent cards, spacing, and inputs

---

## 🧱 Tech Stack

**Frontend**

- React + TypeScript (Vite)
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui + Radix UI
- Recharts
- Lucide Icons

**Backend**

- Supabase (Postgres + Auth)
- Row Level Security (RLS)
- SQL RPC functions for analytics
- Supabase Edge Function for “Request access” notifications

---

## 🗂️ Project Structure (simplified)

````text
src/
├─ app/           # app-level providers & routing guards
├─ components/    # layout + reusable UI
├─ features/      # auth/session logic
├─ hooks/         # react-query hooks
├─ pages/         # route pages
├─ services/      # typed supabase data access
└─ types/         # shared types

supabase/
└─ functions/     # edge functions (Deno runtime)

---

## ✅ Prerequisites (important)

### This project assumes:

- A Supabase project with the required tables + RPC functions (tickets + analytics functions).
- Optional: A configured email provider (e.g. Resend) for admin notifications when someone requests access.
If you don't configure email sending, you can still store access requests in the database.

---

## 🛠️ Run locally

### 1️⃣ Install Dependencies

`npm install`

### 2️⃣ Create .env
Create .env in the project root:

```
VITE_SUPABASE_URL=(your supabase project url)
VITE_SUPABASE_ANON_KEY=(your supabase anon key)

# Displayed in the UI as the admin contact
VITE_ADMIN_CONTACT_EMAIL=(your preferred admin email)

# Optional demo login (temporary)
VITE_DEMO_EMAIL=(demo user email)
VITE_DEMO_PASSWORD=(demo user password)
```

### 3️⃣ Start

`npm run dev`

---

## 🔧 Supabase Edge Function (Request Access)

### The “Request access” button calls a Supabase Edge Function that:
- Inserts the request into an access_requests table
- Optionally emails the admin using an email provider (Resend)

### The Edge Function uses Supabase secrets (server-side environment variables), for example:

- SB_PROJECT_URL

- SB_SERVICE_ROLE_KEY

- ADMIN_CONTACT_EMAIL

- RESEND_API_KEY

### To change the admin contact shown in the UI, set `VITE_ADMIN_CONTACT_EMAIL`.

### To change where request-access notifications are sent, update the Supabase Edge Function secret `ADMIN_CONTACT_EMAIL`.

---

## 🔒 Security notes

- Data access protected by Supabase RLS

- Aggregations use SQL/RPC for correctness and performance

- Service role key is used only inside Edge Functions (never in the client)

---

## ⚖️ License

### MIT
````
