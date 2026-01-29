import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/services/tickets";
import type { Ticket } from "@/types/ticket";
import type React from "react";

type TicketsResponse = {
  tickets: Ticket[];
  total: number;
};

export default function DashboardPage() {
  const { data, isPending, isError, error } = useQuery<TicketsResponse>({
    queryKey: ["tickets", "dashboard"],
    queryFn: () => getTickets(1),
  });

  if (isPending) {
    return (
      <div className="text-sm text-muted-foreground">Loading dashboard…</div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive">
        Error: {(error as Error).message}
      </div>
    );
  }

  const tickets = data?.tickets ?? [];

  const total = data?.total ?? 0;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "in_progress"
  ).length;
  const closedCount = tickets.filter((t) => t.status === "closed").length;
  const recentTickets = tickets.slice(0, 5);

  function statusBadgeClass(status: Ticket["status"]) {
    switch (status) {
      case "open":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20";
      case "in_progress":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20";
      case "closed":
        return "bg-slate-500/10 text-slate-700 dark:text-slate-300 ring-slate-500/20";
      default:
        return "bg-muted text-foreground ring-border";
    }
  }

  function priorityBadgeClass(priority: Ticket["priority"]) {
    switch (priority) {
      case "low":
        return "bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/20";
      case "medium":
        return "bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/20";
      case "high":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/20";
      default:
        return "bg-muted text-foreground ring-border";
    }
  }

  function Badge({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your support tickets.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative rounded-xl border border-border bg-muted/40 p-5 transition hover:bg-muted/60">
          <p className="text-sm text-muted-foreground">Total Tickets</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">{total}</p>
        </div>

        <div className="group relative rounded-xl border border-border bg-muted/40 p-5 transition hover:bg-muted/60">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="mt-2 text-3xl font-semibold">{openCount}</p>
        </div>

        <div className="group relative rounded-xl border border-border bg-muted/40 p-5 transition hover:bg-muted/60">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="mt-2 text-3xl font-semibold">{inProgressCount}</p>
        </div>

        <div className="group relative rounded-xl border border-border bg-muted/40 p-5 transition hover:bg-muted/60">
          <p className="text-sm text-muted-foreground">Closed</p>
          <p className="mt-2 text-3xl font-semibold">{closedCount}</p>
        </div>
      </div>
      <div className="rounded-xl border border-border">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Recent Tickets</h2>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium">
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {recentTickets.map((t) => (
              <tr
                key={t.id}
                className="border-t border-border [&>td]:px-4 [&>td]:py-2"
              >
                <td className="font-medium">{t.title}</td>
                <td>
                  <Badge className={statusBadgeClass(t.status)}>
                    {t.status === "in_progress"
                      ? "In Progress"
                      : t.status[0].toUpperCase() + t.status.slice(1)}
                  </Badge>
                </td>

                <td>
                  <Badge className={priorityBadgeClass(t.priority)}>
                    {t.priority[0].toUpperCase() + t.priority.slice(1)}
                  </Badge>
                </td>

                <td className="text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {recentTickets.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            No tickets yet.
          </div>
        )}
      </div>
    </div>
  );
}
