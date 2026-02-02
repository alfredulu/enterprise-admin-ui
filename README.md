# 🏢 Enterprise Admin UI

### A Production-Ready Full-Stack Dashboard

**Live demo:** https://enterprise-admin-ui.vercel.app/

This project focuses on Data Integrity and Scalability. It is a production-ready internal admin system built with a strict separation of concerns, mimicking the architecture of high-scale SaaS platforms. It bridges the gap between a polished React UI and a complex, secured Supabase backend.

---

## High-Performance Architecture

This project is built on the philosophy that the UI should be a "dumb" consumer of a highly intelligent Service Layer.

### 🎨 Premium UI/UX

1. **Modern Dashboard:** Clean, high-density layouts designed for data clarity.
2. **Adaptive Theming:** System-aware Dark/Light mode with persistent state.
3. **Data-Dense Tables:** Zebra-striped, hover-active tables featuring pagination that actually works (correct total counts, not just page-by-page).
4. **Responsive Core:** Desktop-first precision with a mobile-safe fallback.

## The Data Flow Pipeline

1. **Database (PostgreSQL):** Raw data storage with Row Level Security (RLS).
2. **Logic Layer (SQL/RPC & Edge Functions):** Complex aggregations and notifications happen on the server, not the client.
3. **Service Layer (src/services):** A strictly typed TypeScript "API Client" that abstracts Supabase logic.
4. **Cache Layer (TanStack Query):** Handles state synchronization, optimistic updates, and background refetching.
5. **View Layer (React):** Consumes clean, predictable hooks.

---

## ⚡ Key API & Engineering Features

### 🛠️ The "API-First" Service Layer

Instead of scattered database calls, this project uses a centralized Service Boundary.
- **Encapsulation:** All data fetching logic is isolated in src/services/.
- **Type Safety:** End-to-end TypeScript ensures that a change in the database schema breaks the build at the service layer, preventing runtime UI crashes.
- **Abstraction:** Switching from Supabase to a custom REST or GraphQL API would only require modifying the Service Layer, leaving the UI components untouched.

### 📊 Server-Side Intelligence (SQL/RPC)

#### Rather than fetching thousands of rows and calculating totals in the browser (which kills performance), this app offloads heavy lifting to the database:

- **Direct RPC Calls:** Dashboard analytics (Ticket trends, Priority distribution) are calculated via PostgreSQL Functions.
- **Performance:** Reduces payload size by ~90% for analytical views.

### 🤖 Serverless Edge Orchestration

The "Request Access" flow isn't just a database insert. It triggers a Deno-based Edge Function that:
1. Validates the request via the Service Role (Bypassing RLS securely).
2. Communicates with external Third-Party APIs (Resend for Email).
3. Returns a unified response to the frontend.

---

## 🧩 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Fast, modern UI library & build tool. |
| **State / API** | TanStack Query | The "brain" that manages server-state, caching, and synchronization. |
| **Logic** | TypeScript | Ensures the "API Contract" is never broken with end-to-end type safety. |
| **Backend** | Supabase (Postgres) | Real-time database with built-in Authentication. |
| **Security** | RLS (Row Level Security) | Enterprise-grade, database-level API security. |
| **UI** | shadcn/ui + Tailwind | Consistent, accessible design tokens and headless components. |

---    

### 🗂️ Project Structure
``` Text
src/
├─ services/      # The "API Client" - Typed data access layer
├─ hooks/         # The "Data Connectors" - React Query wrappers
├─ app/           # Guarded routes & Global Providers
├─ features/      # Business logic (Auth, Session management)
├─ pages/         # Pure UI Layouts
└─ supabase/      # Backend-as-Code (Edge functions & SQL)
```

## 🚀 Getting Started

### 1. Clone & Install
`npm install`

### 2. Environment Configuration
#### Create a .env file with your Supabase API Gateway credentials:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Initialize the "API" (Database)
#### To enable the Admin Contact API, run this in your Supabase SQL Editor:
```
-- Creates the settings 'API endpoint' inside your DB
create table if not exists public.app_settings (
  key text primary key,
  value text not null
);

insert into public.app_settings(key, value)
values ('admin_contact_email', 'admin@company.com');

-- Secure the endpoint
alter table public.app_settings enable row level security;
create policy "Public Read Access" on public.app_settings for select using (key = 'admin_contact_email');
```

---

## 🔒 Security Policy

This project implements Zero Trust at the API level. Even if the frontend code is compromised, the data is protected by:
- JWT Verification: Every request is signed and verified.
- RLS Policies: Users can only "See" what the database API allows them to see.
- Server-Side Secrets: Sensitive keys (Like Resend API) never reach the browser; they live exclusively in Supabase Vault.

---

## ⚖️ License

### MIT License.

---
