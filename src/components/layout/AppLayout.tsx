import { Outlet, NavLink } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/features/auth/useSession";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { LogoutConfirmProvider } from "@/app/LogoutConfirmContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tickets", label: "Tickets" },
  { to: "/users", label: "Users" },
  { to: "/settings", label: "Settings" },
];

function SidebarContent({
  email,
  requestLogout,
  onNavigate,
}: {
  email: string;
  requestLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <div className="text-lg font-semibold">Enterprise Admin UI</div>

      {/* nav scrolls if needed */}
      <div className="mt-4 flex-1 min-h-0 overflow-y-auto">
        <nav className="space-y-1 pr-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
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

      <div className="mt-4 border-t border-[hsl(var(--sidebar-hover))] pt-4">
        <div className="text-xs text-[hsl(var(--sidebar-muted))]">
          Signed in as
        </div>
        <div className="mt-1 truncate text-sm text-[hsl(var(--sidebar-foreground))]">
          {email}
        </div>

        <button
          onClick={requestLogout}
          className="mt-3 w-full rounded-md bg-[hsl(var(--sidebar-hover))] px-3 py-2 text-xs text-[hsl(var(--sidebar-foreground))] hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { session } = useSession();
  const email = session?.user.email ?? "—";

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
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

  {
    /* Mobile sheet close */
  }
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <LogoutConfirmProvider value={{ requestLogout }}>
      <div className="min-h-screen bg-muted text-foreground p-6 md:p-8">
        <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
          <div className="grid h-[calc(100vh-3rem)] grid-cols-1 md:grid-cols-[260px_1fr] overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block h-full border-b border-border bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] md:border-b-0 md:border-r">
              <SidebarContent email={email} requestLogout={requestLogout} />
            </aside>

            {/* Main */}
            <div className="flex min-w-0 min-h-0 flex-col">
              <header className="sticky top-0 z-10 border-b border-border bg-background/70 backdrop-blur">
                <div className="flex h-14 items-center justify-between px-4 md:px-6">
                  <div className="flex items-center gap-2">
                    {/* Mobile Menu */}
                    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                      <SheetTrigger asChild>
                        <button
                          type="button"
                          className="md:hidden inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                          title="Open menu"
                        >
                          <Menu className="h-4 w-4" />
                          Menu
                        </button>
                      </SheetTrigger>

                      <SheetContent
                        side="left"
                        className="w-80 p-0 bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] border-r border-border"
                      >
                        <SidebarContent
                          email={email}
                          requestLogout={() => {
                            setMobileNavOpen(false);
                            requestLogout();
                          }}
                          onNavigate={() => setMobileNavOpen(false)}
                        />
                      </SheetContent>
                    </Sheet>

                    <div className="text-sm text-muted-foreground">
                      Admin Dashboard
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-sm text-muted-foreground">
                      {email}
                    </div>

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

              <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mb-6">
                  <h1 className="text-xl font-semibold">Enterprise Admin UI</h1>
                  <p className="text-sm text-muted-foreground">
                    Internal dashboard for managing tickets, users, and system
                    settings.
                  </p>
                </div>
                <Outlet />
              </main>

              {/* Logout confirm modal */}
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
