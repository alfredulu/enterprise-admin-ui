import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/services/tickets";
import { useCreateTicket } from "@/hooks/useCreateTicket";
import { useUpdateTicket } from "@/hooks/useUpdateTicket";
import { useDeleteTicket } from "@/hooks/useDeleteTicket";
import { Link } from "react-router-dom";
import { Pencil, X, Check } from "lucide-react";
import { Page, PageHeader, CardSection } from "@/components/ui/page";
import type { TicketsResponse } from "@/services/tickets";
import { PAGE_SIZE } from "@/services/tickets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
            <div className="flex-1">
              <Select value={status} onValueChange={(v) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={priority} onValueChange={(v) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
      <CardSection className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title…"
              className="h-10 w-full min-w-0 rounded-md border border-border bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="min-w-45">
                <Select
                  value={filterStatus}
                  onValueChange={(v) => setFilterStatus(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-45">
                <Select
                  value={filterPriority}
                  onValueChange={(v) => setFilterPriority(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isFiltering ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
                setFilterPriority("all");
              }}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm shadow-sm hover:bg-muted"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </CardSection>

      {/* Table */}
      <CardSection className="p-0 overflow-hidden">
        {/* Horizontal scroll only for the table area */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-sm tickets-table">
            <thead className="bg-muted/70 text-muted-foreground">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium">
                <th>Title</th>
                <th className="whitespace-nowrap">Status</th>
                <th className="whitespace-nowrap">Priority</th>
                <th className="whitespace-nowrap">Created</th>
                <th className="w-30 text-right whitespace-nowrap">Actions</th>
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
                          className="h-9 w-full min-w-0 rounded-md border border-border bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                        />

                        <button
                          type="button"
                          onClick={() => saveTitle(t.id)}
                          disabled={lockedId === t.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background shadow-sm hover:bg-muted disabled:opacity-50"
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={lockedId === t.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background shadow-sm hover:bg-muted disabled:opacity-50"
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
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background shadow-sm hover:bg-muted disabled:opacity-50"
                          title="Edit title"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>

                  <td>
                    <div className="min-w-35">
                      <Select
                        value={t.status}
                        onValueChange={(v) =>
                          updateTicket({ id: t.id, updates: { status: v } })
                        }
                        disabled={updatingId === t.id}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>

                  <td>
                    <div className="min-w-35">
                      <Select
                        value={t.priority}
                        onValueChange={(v) =>
                          updateTicket({ id: t.id, updates: { priority: v } })
                        }
                        disabled={updatingId === t.id}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>

                  <td className="whitespace-nowrap text-muted-foreground">
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
                      className="inline-flex h-9 items-center justify-center rounded-md border border-destructive/30 bg-background px-3 text-sm text-destructive shadow-sm hover:bg-destructive/10 disabled:opacity-60"
                      title="Delete ticket"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil((data?.total ?? 0) / PAGE_SIZE)}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm shadow-sm hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>

            <button
              disabled={page >= Math.ceil((data?.total ?? 0) / PAGE_SIZE)}
              onClick={() => setPage((p) => p + 1)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm shadow-sm hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Empty states */}
        {data && data.tickets.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No tickets yet. Create your first ticket.
          </div>
        ) : null}

        {data &&
        data.tickets.length > 0 &&
        filteredTickets.length === 0 &&
        isFiltering ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No tickets match your filters.
          </div>
        ) : null}
      </CardSection>
    </Page>
  );
}
