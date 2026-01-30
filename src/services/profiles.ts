import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  email: string;
  created_at: string;
};

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
