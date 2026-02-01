import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, PageHeader, CardSection } from "@/components/ui/page";
import { useTicket } from "@/hooks/useTicket";
import { useUpdateTicket } from "@/hooks/useUpdateTicket";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Status = "open" | "in_progress" | "closed";
type Priority = "low" | "medium" | "high";

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
  const [status, setStatus] = useState<Status>("open");
  const [priority, setPriority] = useState<Priority>("medium");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!ticket) return;
    setTitle(ticket.title ?? "");
    setStatus((ticket.status as Status) ?? "open");
    setPriority((ticket.priority as Priority) ?? "medium");
  }, [ticket]);

  const createdLabel = useMemo(() => {
    if (!ticket?.created_at) return "—";
    return new Date(ticket.created_at).toLocaleString();
  }, [ticket?.created_at]);

  function resetToServer() {
    if (!ticket) return;
    setTitle(ticket.title ?? "");
    setStatus((ticket.status as Status) ?? "open");
    setPriority((ticket.priority as Priority) ?? "medium");
  }

  function save() {
    if (!id) return;
    const trimmed = title.trim();
    if (!trimmed) return;

    updateTicket(
      { id, updates: { title: trimmed, status, priority } },
      {
        onSuccess: () => {
          setSaved(true);
          window.setTimeout(() => setSaved(false), 1200);
        },
      }
    );
  }

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

  return (
    <Page>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Ticket details"
          description="View and update ticket information."
        />

        <button
          onClick={() => navigate("/tickets")}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
        >
          Back
        </button>
      </div>

      <CardSection className="p-6">
        <div className="grid gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={updatingThis}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as Status)}
                disabled={updatingThis}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
                disabled={updatingThis}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-muted-foreground">Ticket ID</div>
              <div className="mt-1 break-all font-medium">{ticket.id}</div>
            </div>

            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-muted-foreground">Created</div>
              <div className="mt-1 font-medium">{createdLabel}</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <div className="mr-auto text-sm text-muted-foreground">
              {saved ? "Saved ✓" : " "}
            </div>

            <button
              onClick={resetToServer}
              disabled={updatingThis}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
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
      </CardSection>

      {/* Activity */}
      <CardSection className="p-6">
        <h3 className="text-sm font-medium">Activity</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Coming soon: audit log, comments, and assignment.
        </p>
      </CardSection>
    </Page>
  );
}
