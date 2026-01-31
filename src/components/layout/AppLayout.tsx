import { Outlet, NavLink } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/features/auth/useSession";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { LogoutConfirmProvider } from "@/app/LogoutConfirmContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tickets", label: "Tickets" },
  { to: "/users", label: "Users" },
  { to: "/settings", label: "Settings" },
];

export default function AppLayout() {
  const { session } = useSession();
  const email = session?.user.email ?? "—";

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    // Apply theme to <html>
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [confirmLogout, setConfirmLogout] = useState(false);

  function requestLogout() {
    setConfirmLogout(true);
  }

  async function onLogoutConfirmed() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Failed to log out");
      return;
    }
    setConfirmLogout(false);
  }

  return (
    <LogoutConfirmProvider value={{ requestLogout }}>
      <div className="min-h-screen bg-muted text-foreground p-6 md:p-8">
        <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
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
              <header className="sticky top-0 z-10 border-b border-border bg-background/70 backdrop-blur">
                <div className="flex h-14 items-center justify-between px-4 md:px-6">
                  <div className="text-sm text-muted-foreground">
                    Admin Dashboard
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">{email}</div>

                    <button
                      type="button"
                      onClick={() =>
                        setTheme((t) => (t === "dark" ? "light" : "dark"))
                      }
                      className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                      title="Toggle theme"
                    >
                      {theme === "dark" ? "Light" : "Dark"}
                    </button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={requestLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </header>

              <main className="min-w-0 flex-1 p-4 md:p-6">
                <div className="mb-6">
                  <h1 className="text-xl font-semibold">Enterprise Admin UI</h1>
                  <p className="text-sm text-muted-foreground">
                    Internal dashboard for managing tickets, users, and system
                    settings.
                  </p>
                </div>
                <Outlet />
              </main>
              {confirmLogout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-2xl ring-1 ring-border">
                    <h3 className="text-lg font-semibold">Confirm logout</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Are you sure you want to log out?
                    </p>

                    <div className="mt-6 flex justify-end gap-2">
                      <button
                        onClick={() => setConfirmLogout(false)}
                        className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={onLogoutConfirmed}
                        className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LogoutConfirmProvider>
  );
}
