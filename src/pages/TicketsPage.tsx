import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/services/tickets";
import { useCreateTicket } from "@/hooks/useCreateTicket";
import { useUpdateTicket } from "@/hooks/useUpdateTicket";
import { useDeleteTicket } from "@/hooks/useDeleteTicket";
import type { Ticket } from "@/types/ticket";
import { Link } from "react-router-dom";
import { Pencil, X, Check } from "lucide-react";
import { Page, PageHeader, CardSection } from "@/components/ui/page";

type TicketsResponse = {
  tickets: Ticket[];
  total: number;
};

const PAGE_SIZE = 10;

export default function TicketsPage() {
  const { mutate: createTicket, isPending: isCreating } = useCreateTicket();

  const {
    mutate: updateTicket,
    isPending: isUpdating,
    variables,
  } = useUpdateTicket();

  const updatingId = isUpdating && variables?.id ? variables.id : null;

  const { mutate: deleteTicket } = useDeleteTicket();

  const [page, setPage] = useState(1);

  const {
    data,
    isPending: isLoadingTickets,
    isError,
    error,
  } = useQuery<TicketsResponse>({
    queryKey: ["tickets", page],
    queryFn: () => getTickets(page),
    placeholderData: (prev) => prev,
  });

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const [filterStatus, setFilterStatus] = useState<
    "all" | "open" | "in_progress" | "closed"
  >("all");

  const [filterPriority, setFilterPriority] = useState<
    "all" | "low" | "medium" | "high"
  >("all");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [lockedId, setLockedId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterPriority, debouncedSearch]);

  function startEditing(id: string, currentTitle: string) {
    setEditingId(id);
    setDraftTitle(currentTitle);
  }

  function cancelEditing() {
    setEditingId(null);
    setDraftTitle("");
  }

  function saveTitle(id: string) {
    const trimmed = draftTitle.trim();
    if (!trimmed) return;

    setLockedId(id);

    updateTicket(
      { id, updates: { title: trimmed } },
      {
        onSettled: () => setLockedId(null),
      }
    );

    setEditingId(null);
  }

  const filteredTickets = (data?.tickets ?? []).filter((t) => {
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || t.priority === filterPriority;
    const matchesSearch =
      debouncedSearch.trim() === "" ||
      t.title.toLowerCase().includes(debouncedSearch.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const isFiltering =
    search.trim() !== "" || filterStatus !== "all" || filterPriority !== "all";

  if (isLoadingTickets) {
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
    <Page>
      <PageHeader
        title="Tickets"
        description="Create, search, and manage support tickets."
      />

      {/* Create ticket */}
      <CardSection>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createTicket({ title, status, priority });
            setTitle("");
            setStatus("open");
            setPriority("medium");
          }}
          className="space-y-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ticket title"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <button
              type="submit"
              disabled={isCreating}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {isCreating ? "Creating…" : "Create Ticket"}
            </button>
          </div>
        </form>
      </CardSection>

      {/* Filters */}
      <CardSection>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </CardSection>

      {/* Table */}
      <CardSection className="p-0 overflow-hidden">
        <table className="w-full text-sm tickets-table">
          <thead className="bg-muted/70 text-muted-foreground">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium">
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th className="w-30 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.map((t) => (
              <tr
                key={t.id}
                className="border-t border-border transition-colors [&>td]:px-4 [&>td]:py-3"
              >
                <td className="font-medium">
                  {editingId === t.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        disabled={lockedId === t.id}
                        autoFocus
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() => saveTitle(t.id)}
                        disabled={lockedId === t.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-50"
                        title="Save"
                      >
                        <Check className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={lockedId === t.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-50"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to={`/tickets/${t.id}`}
                        className="min-w-0 flex-1 truncate text-left hover:underline"
                        title="Open ticket details"
                      >
                        {t.title}
                      </Link>

                      <button
                        type="button"
                        onClick={() => startEditing(t.id, t.title)}
                        disabled={updatingId === t.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-50"
                        title="Edit title"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>

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
                    className="rounded-md border border-border bg-background px-2 py-1 text-sm disabled:opacity-60"
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
                    className="rounded-md border border-border bg-background px-2 py-1 text-sm disabled:opacity-60"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </td>

                <td className="text-muted-foreground">
                  {new Date(t.created_at).toLocaleString()}
                </td>

                <td className="text-right">
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

        {/* Footer / pagination */}
        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil((data?.total ?? 0) / PAGE_SIZE)}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>

            <button
              disabled={page >= Math.ceil((data?.total ?? 0) / PAGE_SIZE)}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Empty states */}
        {data && data.tickets.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No tickets yet. Create your first ticket.
          </div>
        ) : null}

        {data &&
        data.tickets.length > 0 &&
        filteredTickets.length === 0 &&
        isFiltering ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No tickets match your filters.
          </div>
        ) : null}
      </CardSection>
    </Page>
  );
}
