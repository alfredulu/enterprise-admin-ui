import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTicket } from "@/hooks/useTicket";
import { useUpdateTicket } from "@/hooks/useUpdateTicket";

export default function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: ticket, isPending, isError, error } = useTicket(id);

  const {
    mutate: updateTicket,
    isPending: isUpdating,
    variables,
  } = useUpdateTicket();

  const updatingThis = isUpdating && variables?.id === id;

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"open" | "in_progress" | "closed">(
    "open"
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [saved, setSaved] = useState(false);

  // Load form state once ticket arrives
  useEffect(() => {
    if (!ticket) return;
    setTitle(ticket.title);
    setStatus(ticket.status as any);
    setPriority(ticket.priority as any);
  }, [ticket]);

  if (isPending) {
    return <div className="text-sm text-muted-foreground">Loading ticket…</div>;
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-destructive">
          Error: {(error as Error).message}
        </div>
        <button
          onClick={() => navigate("/tickets")}
          className="text-sm underline"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          This ticket doesn’t exist or you don’t have access.
        </div>
        <button
          onClick={() => navigate("/tickets")}
          className="text-sm underline"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  function save() {
    if (!id) return;

    const trimmed = title.trim();
    if (!trimmed) return;

    updateTicket({
      id,
      updates: { title: trimmed, status, priority },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Ticket</h2>
          <p className="text-sm text-muted-foreground">
            View and update ticket details.
          </p>
        </div>

        <button
          onClick={() => navigate("/tickets")}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Back
        </button>
      </div>

      <div className="rounded-xl border border-border p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={updatingThis}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              disabled={updatingThis}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              disabled={updatingThis}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-lg border border-border p-3">
            <div className="text-muted-foreground">Ticket ID</div>
            <div className="mt-1 font-medium break-all">{ticket.id}</div>
          </div>

          <div className="rounded-lg border border-border p-3">
            <div className="text-muted-foreground">Created</div>
            <div className="mt-1 font-medium">
              {new Date(ticket.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved ? (
            <span className="mr-auto text-sm text-muted-foreground">Saved</span>
          ) : (
            <span className="mr-auto" />
          )}

          <button
            onClick={() => {
              if (!ticket) return;
              setTitle(ticket.title);
              setStatus(ticket.status as any);
              setPriority(ticket.priority as any);
            }}
            disabled={updatingThis}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            Reset
          </button>

          <button
            onClick={save}
            disabled={updatingThis}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {updatingThis ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium">Activity</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Coming soon: audit log, comments, and assignment.
        </p>
      </div>
    </div>
  );
}
