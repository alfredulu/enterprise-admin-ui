# Enterprise Admin UI

A modern SaaS-style admin dashboard built with React, TypeScript, and Supabase.

The project focuses on real-world frontend and full-stack patterns including authentication, row-level security, optimistic UI updates, and scalable state management commonly found in production systems.

---

## Tech Stack

- **Frontend**

  - React + TypeScript (Vite)
  - Tailwind CSS
  - React Router
  - TanStack Query

- **Backend / Services**
  - Supabase (Auth, Database, Row Level Security)

---

## Core Features

### Authentication & Security

- Email/password authentication via Supabase
- Protected routes
- Row Level Security (RLS) enforcing per-user data access

### Tickets Module (CRUD)

- View tickets (React Query)
- Create tickets
- Inline edit (title, status, priority)
- Optimistic updates with rollback on failure
- Per-row loading and locking
- Delete tickets with confirmation

### Admin UX

- Client-side filtering (status, priority)
- Debounced search by title
- Clear empty-state handling
- Clean, responsive layout

---

## Architecture Highlights

- Clear separation of concerns:
  - `services/` → Supabase data access
  - `hooks/` → React Query mutations
  - `pages/` → UI composition
- Optimistic UI patterns using TanStack Query
- No client-side auth assumptions — all ownership enforced in the database

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/enterprise-admin-ui.git
cd enterprise-admin-ui
```
