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
export type CreateTicketInput = {
  title: string;
  status: string;
  priority: string;
};

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const { data, error } = await supabase
    .from("tickets")
    .insert(input)
    .select("id,title,status,priority,created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
