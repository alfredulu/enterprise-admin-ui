import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tickets", label: "Tickets" },
  { to: "/users", label: "Users" },
  { to: "/settings", label: "Settings" },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-muted text-foreground p-6 md:p-8">
      <div className="mx-auto w-full max-w-7xl rounded-2xl border border-border bg-background shadow-lg">
        <div className="grid min-h-[calc(100vh-3rem)] grid-cols-1 md:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="border-b border-border bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] md:border-b-0 md:border-r">
            <div className="p-4">
              <div className="text-lg font-semibold">SaaS Admin</div>

              <nav className="mt-6 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "block rounded-md px-3 py-2 text-sm transition",
                        isActive
                          ? "bg-[hsl(var(--sidebar-hover))] font-medium"
                          : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-foreground))]",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <div className="flex min-w-0 flex-col">
            <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
              <div className="flex h-14 items-center justify-between px-4 md:px-6">
                <div className="text-sm text-muted-foreground">
                  Admin Dashboard
                </div>
                <div className="text-sm text-muted-foreground">User menu</div>
              </div>
            </header>

            <main className="min-w-0 flex-1 p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
