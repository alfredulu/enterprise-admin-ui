# 🏢 Enterprise Admin UI

A modern internal admin dashboard for managing support tickets, users, and system settings.  
Built with a real-world SaaS architecture, production-grade tooling, and clean UX patterns.

> Designed as an internal admin tool today, with a foundation that can evolve into a multi-tenant SaaS product.

---

## ✨ Features

### 🔐 Authentication & Authorization

- 🔑 Secure login with **Supabase Auth**
- 🛡️ Role-aware data access using **Row Level Security (RLS)**

### 🎟️ Ticket Management

- 📝 Create, edit, update, and delete tickets
- ⚡ Inline editing with **optimistic UI**
- 🔄 Status & priority workflows
- 🔍 Pagination, filtering, and search

### 📊 Dashboard Analytics

- 🔢 Total ticket counts (server-side, not page-limited)
- 🥧 Status breakdown (Open / In Progress / Closed)
- ⚠️ Priority distribution (Low / Medium / High)
- 📈 Daily ticket trends (**SQL-powered aggregates**)

### 🌗 Theming

- 🌙 Light / Dark mode
- 💾 Theme persisted in `localStorage`
- 🎨 Design tokens via **CSS variables**

### 🧭 Layout & UX

- 📍 Fixed sidebar with scroll-safe behavior
- 📱 Responsive layout (desktop-first, mobile-safe)
- ❓ Confirmation dialogs for destructive actions
- ♿ Accessible, consistent UI components

---

## 🧱 Tech Stack

### 💻 Frontend

- ⚛️ **React + TypeScript**
- 🛣️ **React Router**
- 📡 **TanStack Query** (server state)
- 🎨 **Tailwind CSS**
- 📊 **Recharts** (data visualization)
- ✨ **Lucide Icons**

### ⚙️ Backend

- ⚡ **Supabase** (Postgres + Auth)
- 🛡️ **Row Level Security (RLS)**
- 💾 **SQL functions (RPC)** for analytics

### 🏗️ State & Architecture

- 📂 Feature-based folder structure
- 🔄 Server state isolated from UI state
- 📜 Typed service layer
- 🧩 Reusable layout & UI primitives

---

## 🗂️ Project Structure (simplified)

# 🏢 Enterprise Admin UI

A modern internal admin dashboard for managing support tickets, users, and system settings.  
Built with a real-world SaaS architecture, production-grade tooling, and clean UX patterns.

Designed as an internal admin tool today, with a foundation that can evolve into a multi-tenant SaaS product.

---

## ✨ Features

### 🔐 Authentication & Authorization

- 🔑 Secure login with **Supabase Auth**
- 🛡️ Role-aware data access using **Row Level Security (RLS)**

### 🎟️ Ticket Management

- 📝 Create, edit, update, and delete tickets
- ⚡ Inline editing with **optimistic UI**
- 🔄 Status & priority workflows
- 🔍 Pagination, filtering, and search

### 📊 Dashboard Analytics

- 🔢 Total ticket counts (server-side, not page-limited)
- 🥧 Status breakdown (Open / In Progress / Closed)
- ⚠️ Priority distribution (Low / Medium / High)
- 📈 Daily ticket trends (**SQL-powered aggregates**)

### 🌗 Theming

- 🌙 Light / Dark mode
- 💾 Theme persisted in `localStorage`
- 🎨 Design tokens via **CSS variables**

### 🧭 Layout & UX

- 📍 Fixed sidebar with scroll-safe behavior
- 📱 Responsive layout (desktop-first, mobile-safe)
- ❓ Confirmation dialogs for destructive actions
- ♿ Accessible, consistent UI components

---

## 🧱 Tech Stack

### 💻 Frontend

- ⚛️ **React + TypeScript**
- 🛣️ **React Router**
- 📡 **TanStack Query** (server state)
- 🎨 **Tailwind CSS**
- 📊 **Recharts** (data visualization)
- ✨ **Lucide Icons**

### ⚙️ Backend

- ⚡ **Supabase** (Postgres + Auth)
- 🛡️ **Row Level Security (RLS)**
- 💾 **SQL functions (RPC)** for analytics

### 🏗️ State & Architecture

- 📂 Feature-based folder structure
- 🔄 Server state isolated from UI state
- 📜 Typed service layer
- 🧩 Reusable layout & UI primitives

---

## 🗂️ Project Structure (simplified)

```text
src/
├─ 📂 app/ # App-level providers & context
├─ 📂 components/ # Reusable UI components
├─ 📂 features/ # Feature-specific logic (auth, etc.)
├─ 📂 hooks/ # Custom React hooks
├─ 📂 pages/ # Route-level pages
├─ 📂 services/ # Supabase data access layer
└─ 📂 types/ # Shared TypeScript types
```

---

## 🛠️ Setup (Local)

### 1️⃣ Install Dependencies

`npm install`

### 2️⃣ Start dev server

`npm run dev`

### 3️⃣ Create an .env file:

```VITE_SUPABASE_URL=your_supabase_url

VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🔒 Security Notes

- 🔒 All data access is protected with Supabase RLS

- ✅ Sensitive operations are server-validated

- 🚫 Client never trusts itself for authorization

---

## 📈 Future Improvements

- 👥 Role-based UI permissions (Admin / Member)

- 🏢 Team & organization support

- 📜 Activity audit logs

- 📑 Advanced reporting & exports

- 📱 Mobile-first navigation refinement

--

## License

### MIT
