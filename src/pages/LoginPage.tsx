import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LocationState = { from?: string } | null;

const ADMIN_CONTACT_EMAIL =
  (import.meta.env.VITE_ADMIN_CONTACT_EMAIL as string | undefined) ??
  "admin@company.com";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate(state?.from ?? "/dashboard", { replace: true });
  }

  function onRequestAccess() {
    setError(
      `Request access: This is an internal admin dashboard. Ask an administrator to create your account. Contact: ${ADMIN_CONTACT_EMAIL}`
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle>Sign in</CardTitle>
          <p className="text-sm text-muted-foreground">
            Internal. Accounts are created by an administrator.
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          <form className="space-y-3" onSubmit={onSignIn}>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error ? (
              <div className="text-sm text-destructive whitespace-pre-line">
                {error}
              </div>
            ) : null}

            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <Button
            className="w-full"
            variant="secondary"
            disabled={loading}
            onClick={onRequestAccess}
            type="button"
          >
            Request access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
