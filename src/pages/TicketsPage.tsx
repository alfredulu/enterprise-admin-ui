import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/services/tickets";
import { useCreateTicket } from "@/hooks/useCreateTicket";
import { useUpdateTicket } from "@/hooks/useUpdateTicket";
import { useDeleteTicket } from "@/hooks/useDeleteTicket";

export default function TicketsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: getTickets,
  });
  const { mutate: createTicket, isPending: isCreating } = useCreateTicket();

  const {
    mutate: updateTicket,
    isPending: isUpdating,
    variables,
  } = useUpdateTicket();

  const updatingId = isUpdating ? variables?.id : null;

  const { mutate: deleteTicket } = useDeleteTicket();

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading tickets…</div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive">
        Error: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <p className="text-sm text-muted-foreground">
          Tickets loaded from Supabase.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createTicket({ title, status, priority });
          setStatus("open");
          setPriority("medium");
        }}
        className="space-y-2 rounded-xl border border-border p-4"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ticket title"
          required
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        />

        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 rounded-md border border-border px-3 py-2 text-sm"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex-1 rounded-md border border-border px-3 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {isCreating ? "Creating…" : "Create Ticket"}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium">
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((t) => (
              <tr
                key={t.id}
                className="border-t border-border [&>td]:px-4 [&>td]:py-3"
              >
                <td className="font-medium">{t.title}</td>
                <td>
                  <select
                    value={t.status}
                    disabled={updatingId === t.id}
                    onChange={(e) =>
                      updateTicket({
                        id: t.id,
                        updates: { status: e.target.value },
                      })
                    }
                    className="rounded-md border border-border px-2 py-1 text-sm disabled:opacity-60"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td>
                  <select
                    value={t.priority}
                    disabled={updatingId === t.id}
                    onChange={(e) =>
                      updateTicket({
                        id: t.id,
                        updates: { priority: e.target.value },
                      })
                    }
                    className="rounded-md border border-border px-2 py-1 text-sm disabled:opacity-60"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </td>
                <td className="text-muted-foreground">
                  {new Date(t.created_at).toLocaleString()}
                </td>
                <td>
                  <button
                    disabled={updatingId === t.id}
                    onClick={() => {
                      if (confirm("Delete this ticket?")) {
                        deleteTicket(t.id);
                      }
                    }}
                    className="text-sm text-destructive hover:underline disabled:opacity-60"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!data || data.length === 0) && (
          <div className="p-4 text-sm text-muted-foreground">
            No tickets found. Add some rows in Supabase.
          </div>
        )}
      </div>
    </div>
  );
}
