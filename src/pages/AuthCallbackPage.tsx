import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate("/dashboard", { replace: true });
      else navigate("/login", { replace: true });
    }, 50);

    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-muted p-6">
      <div className="text-sm text-muted-foreground">Completing sign-in…</div>
    </div>
  );
}
