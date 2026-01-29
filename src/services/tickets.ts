import { supabase } from "@/lib/supabase";
import type { Ticket } from "@/types/ticket";

const PAGE_SIZE = 10;

export async function getTickets(page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("tickets")
    .select("id,title,status,priority,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    tickets: data ?? [],
    total: count ?? 0,
  };
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
export async function updateTicket(
  id: string,
  updates: Partial<Pick<Ticket, "status" | "priority" | "title">>
): Promise<Ticket> {
  const { data, error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", id)
    .select("id,title,status,priority,created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTicket(id: string): Promise<void> {
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}
