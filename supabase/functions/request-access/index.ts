// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function allowedOriginsSet(): Set<string> {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set(list);
}

function corsHeadersFor(origin: string | null) {
  const allowed = allowedOriginsSet();
  const ok = Boolean(origin && allowed.has(origin));

  // Never use "*" here because you're doing credentialed/auth-style requests.
  // We echo back the origin ONLY if it is allowed.
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (ok) headers["Access-Control-Allow-Origin"] = origin!;

  return { ok, headers };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const { ok, headers } = corsHeadersFor(origin);

  // 1) Always respond to preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: ok ? 200 : 403, headers });
  }

  // 2) Block unknown origins (professional fail-closed)
  if (!ok) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  // 3) Only allow POST after origin checks
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers,
    });
  }

  const { email } = await req.json().catch(() => ({ email: "" }));
  const clean = String(email ?? "")
    .trim()
    .toLowerCase();

  if (!clean || !isValidEmail(clean)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), {
      status: 400,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  const SB_PROJECT_URL = Deno.env.get("SB_PROJECT_URL")!;
  const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

  const supabase = createClient(SB_PROJECT_URL, SB_SERVICE_ROLE_KEY);

  // read admin email from DB (public_settings)
  const { data: adminRow } = await supabase
    .from("public_settings")
    .select("value")
    .eq("key", "admin_contact_email")
    .maybeSingle();

  const ADMIN_CONTACT_EMAIL = String(adminRow?.value ?? "").trim();

  // store request
  const { error: insertErr } = await supabase
    .from("access_requests")
    .insert({ email: clean });

  if (
    insertErr &&
    !String(insertErr.message).toLowerCase().includes("duplicate")
  ) {
    return new Response(JSON.stringify({ error: insertErr.message }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  // If admin email missing, just succeed without emailing
  if (!ADMIN_CONTACT_EMAIL) {
    return new Response(JSON.stringify({ ok: true, emailed: false }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
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
    headers: { ...headers, "Content-Type": "application/json" },
  });
});
