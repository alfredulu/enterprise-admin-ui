import { supabase } from "@/lib/supabase";
import type { Ticket } from "@/types/ticket";

export async function getTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select("id,title,status,priority,created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
