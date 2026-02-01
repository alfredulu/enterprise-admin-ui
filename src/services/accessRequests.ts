import { supabase } from "@/lib/supabase";

export async function createAccessRequest(email: string) {
  const cleaned = email.trim().toLowerCase();
  if (!cleaned) throw new Error("Please enter an email.");

  const { error } = await supabase
    .from("access_requests")
    .insert({ email: cleaned });

  if (error) {
    // Friendly duplicate message
    if (error.code === "23505") {
      throw new Error("Request already submitted. Please wait for approval.");
    }
    throw new Error(error.message);
  }
}
