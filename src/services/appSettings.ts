import { supabase } from "@/lib/supabase";

export async function getAdminContactEmail(): Promise<string | null> {
  const { data, error } = await supabase
    .from("public_settings")
    .select("value")
    .eq("key", "admin_contact_email")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.value ?? null;
}
