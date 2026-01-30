import { supabase } from "@/lib/supabase";
import { useSession } from "@/features/auth/useSession";

export default function SettingsPage() {
  const { session } = useSession();

  const user = session?.user;

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Failed to log out");
    }
  }

  async function handlePasswordReset() {
    if (!user?.email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: window.location.origin + "/login",
    });

    if (error) {
      alert("Failed to send password reset email");
    } else {
      alert("Password reset email sent");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences.
        </p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-border p-6">
        <h2 className="mb-4 text-sm font-medium">Profile</h2>

        <div className="text-sm">
          <p className="text-muted-foreground">Email</p>
          <p className="font-medium">{user?.email ?? "—"}</p>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-border p-6">
        <h2 className="mb-4 text-sm font-medium">Security</h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handlePasswordReset}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Reset Password
          </button>

          <button
            onClick={handleLogout}
            className="rounded-md border border-destructive px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
