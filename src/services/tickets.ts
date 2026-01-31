import { supabase } from "@/lib/supabase";
import type { Ticket } from "@/types/ticket";

export const PAGE_SIZE = 10;

/** ---------- Tickets list (paged) ---------- */
export type TicketsResponse = {
  tickets: Ticket[];
  total: number;
};

export async function getTickets(page: number): Promise<TicketsResponse> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("tickets")
    .select("id,title,status,priority,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    tickets: (data ?? []) as Ticket[],
    total: count ?? 0,
  };
}

/** ---------- Create / Update / Delete ---------- */
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

  if (error) throw new Error(error.message);
  return data as Ticket;
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

  if (error) throw new Error(error.message);
  return data as Ticket;
}

export async function deleteTicket(id: string): Promise<void> {
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** ---------- Dashboard stats (RPC) ---------- */
export type TicketStats = {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
  low: number;
  medium: number;
  high: number;
};

export async function getTicketStats(): Promise<TicketStats> {
  const { data, error } = await supabase.rpc("ticket_stats");

  if (error) throw new Error(error.message);

  // PostgREST returns an array for RETURNS TABLE
  const row = Array.isArray(data) ? data[0] : data;

  return {
    total: Number(row?.total ?? 0),
    open: Number(row?.open ?? 0),
    in_progress: Number(row?.in_progress ?? 0),
    closed: Number(row?.closed ?? 0),
    low: Number(row?.low ?? 0),
    medium: Number(row?.medium ?? 0),
    high: Number(row?.high ?? 0),
  };
}

export type DailyCount = {
  day: string; // ISO date string
  count: number;
};

export async function getTicketDailyCounts(days = 7): Promise<DailyCount[]> {
  const { data, error } = await supabase.rpc("ticket_daily_counts", { days });

  if (error) throw new Error(error.message);

  const rows = Array.isArray(data) ? data : [];
  return rows.map((r: any) => ({
    day: String(r.day),
    count: Number(r.count ?? 0),
  }));
}

export async function getTicketById(id: string): Promise<Ticket> {
  const { data, error } = await supabase
    .from("tickets")
    .select("id,title,status,priority,created_at")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Ticket;
}
