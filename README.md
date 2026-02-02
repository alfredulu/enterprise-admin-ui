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
- **Request access** flow:
  - user submits email
  - request is stored in the database
  - admin can optionally be notified via email (Edge Function + email provider)

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

```text
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

### This project assumes you have a Supabase project with:

- tables used by the app (tickets, profiles, etc.)

- SQL/RPC functions for analytics

- RLS policies applied

## Optional:

- An email provider (e.g. Resend) if you want admin email notifications when someone requests access.

> If not configured, the request can still be stored in access_requests.

---

## 🛠️ Run locally

### 1) Install dependencies

`npm install`

### 2) Create .env in the project root

```
VITE_SUPABASE_URL=(your supabase project url)
VITE_SUPABASE_ANON_KEY=(your supabase anon key)
```

### Optional demo login (temporary)

```
VITE_DEMO_EMAIL=(demo user email)
VITE_DEMO_PASSWORD=(demo user password)
```

### 3) Start dev server

`npm run dev`

---

## ⚙️ Admin contact email (DB-driven)

### The login page displays the admin contact email by reading a single row from:

**Table**: `public.app_settings`
**Row**: `key = 'admin_contact_email'`

**Example setup:**

```
create table if not exists public.app_settings (
key text primary key,
value text not null
);

insert into public.app_settings(key, value)
values ('admin_contact_email', 'admin@company.com')
on conflict (key) do update set value = excluded.value;
```

## RLS (read-only for just that row)

### The login page loads before authentication, so it needs public read access to only that one row:

```
alter table public.app_settings enable row level security;

drop policy if exists "read admin_contact_email" on public.app_settings;

create policy "read admin_contact_email"
on public.app_settings
for select
to anon, authenticated
using (key = 'admin_contact_email');
```

- ✅ Anyone can read only admin_contact_email
- 🚫 No client inserts/updates/deletes are allowed (no policies added for those)

> Owner role assignment is an admin action.

---

## 🔧 Supabase Edge Function (Request Access)

The “Request access” button calls a Supabase Edge Function that:

- inserts the request into access_requests

- optionally emails the admin (via Resend)

**Required Supabase secrets (server-side)**

Set these in Supabase Edge Function secrets:

- SB_PROJECT_URL (your Supabase Project URL)

- SB_SERVICE_ROLE_KEY (service role key — server only)

- RESEND_API_KEY (optional — only if emailing)

> The admin email target is read from app_settings(admin_contact_email).

---

🔒 Security notes

- Data access protected by Supabase RLS

- Aggregations use SQL/RPC for correctness and performance

- Service role key is used only inside Edge Functions (never in the client)

---

### ⚖️ License

## MIT
