import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getAdminContactEmail } from "@/services/appSettings";

type LocationState = { from?: string } | null;

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL as string | undefined;
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD as string | undefined;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [requestEmail, setRequestEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: adminEmail } = useQuery({
    queryKey: ["admin_contact_email"],
    queryFn: getAdminContactEmail,
    staleTime: 5 * 60 * 1000,
  });

  const adminEmailText = adminEmail ?? "";

  const demoEnabled = useMemo(() => Boolean(DEMO_EMAIL && DEMO_PASSWORD), []);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate(state?.from ?? "/dashboard", { replace: true });
  }

  async function onRequestAccess() {
    setError(null);
    setInfo(null);

    const clean = requestEmail.trim().toLowerCase();
    if (!clean) {
      setError("Please enter your email to request access.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("request-access", {
        body: { email: clean },
      });

      if (error) throw error;

      setInfo(
        `Request submitted.\nAn admin will review it.\nContact: ${adminEmailText}`
      );
      setRequestEmail("");
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  }

  async function onDemoLogin() {
    setError(null);
    setInfo(null);

    if (!DEMO_EMAIL || !DEMO_PASSWORD) {
      setError("Demo is not configured.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle>Sign in</CardTitle>
          <p className="text-sm text-muted-foreground">
            Internal dashboard for managing tickets, users, and settings.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
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

            {info ? (
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {info}
              </div>
            ) : null}

            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="pt-5 border-t border-border" />

          <div className="space-y-2">
            <div className="text-sm font-medium">Not registered?</div>
            <p className="text-sm text-muted-foreground">
              Submit your email to request access from the admin{" "}
              <span className="font-medium">{adminEmailText || " "}</span>.
            </p>

            <Input
              placeholder="Your email for access request"
              type="email"
              value={requestEmail}
              onChange={(e) => setRequestEmail(e.target.value)}
              autoComplete="email"
            />

            <Button
              className="w-full"
              variant="outline"
              disabled={loading || !requestEmail.trim()}
              onClick={onRequestAccess}
              type="button"
            >
              Request access
            </Button>
          </div>

          <div className="pt-8 border-t border-border" />

          <div className="space-y-2">
            <div className="text-sm font-medium">Demo access (temporary)</div>
            <p className="text-sm text-muted-foreground">
              For review purposes, you can explore the app using a demo account.
              This will be removed in production.
            </p>

            <Button
              className="w-full"
              variant="secondary"
              disabled={loading || !demoEnabled}
              onClick={onDemoLogin}
              type="button"
              title={
                demoEnabled
                  ? "Sign in with demo user"
                  : "Set VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD"
              }
            >
              Use demo account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
