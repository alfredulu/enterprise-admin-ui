// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { email } = await req.json().catch(() => ({ email: "" }));
  const clean = String(email ?? "")
    .trim()
    .toLowerCase();

  if (!clean || !isValidEmail(clean)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const SB_PROJECT_URL = Deno.env.get("SB_PROJECT_URL")!;
  const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

  const supabase = createClient(SB_PROJECT_URL, SB_SERVICE_ROLE_KEY);

  const { data: adminRow } = await supabase
    .from("public_settings")
    .select("value")
    .eq("key", "admin_contact_email")
    .maybeSingle();

  const ADMIN_CONTACT_EMAIL = String(adminRow?.value ?? "").trim();

  const { error: insertErr } = await supabase
    .from("access_requests")
    .insert({ email: clean });

  if (
    insertErr &&
    !String(insertErr.message).toLowerCase().includes("duplicate")
  ) {
    return new Response(JSON.stringify({ error: insertErr.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!ADMIN_CONTACT_EMAIL) {
    return new Response(JSON.stringify({ ok: true, emailed: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const subject = `Access request — ${clean}`;
  const html = `
    <div style="font-family:ui-sans-serif,system-ui">
      <h2>Access request</h2>
      <p>A user requested access:</p>
      <p><b>${clean}</b></p>
      <p>Open Supabase Auth/Users to create this user.</p>
    </div>
  `;

  const resendResp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Enterprise Admin UI <onboarding@resend.dev>",
      to: [ADMIN_CONTACT_EMAIL],
      subject,
      html,
    }),
  });

  return new Response(JSON.stringify({ ok: true, emailed: resendResp.ok }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
