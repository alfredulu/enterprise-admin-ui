import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Page, PageHeader, CardSection } from "@/components/ui/page";
import { getTickets, getTicketStats } from "@/services/tickets";
import type { TicketStats, TicketsResponse } from "@/services/tickets";

function formatPct(part: number, total: number) {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export default function CommandCenterPage() {
  const statsQuery = useQuery<TicketStats>({
    queryKey: ["ticket_stats"],
    queryFn: getTicketStats,
  });

  const latestQuery = useQuery<TicketsResponse>({
    queryKey: ["tickets", 1],
    queryFn: () => getTickets(1),
  });

  const stats =
    statsQuery.data ??
    ({
      total: 0,
      open: 0,
      in_progress: 0,
      closed: 0,
      low: 0,
      medium: 0,
      high: 0,
    } satisfies TicketStats);

  const latestTickets = latestQuery.data?.tickets ?? [];

  const queueHealth = useMemo(() => {
    if (stats.total === 0) return "Healthy";
    const highOpenRatio =
      stats.high / Math.max(stats.open + stats.in_progress, 1);

    if (highOpenRatio >= 0.45) return "Critical";
    if (highOpenRatio >= 0.2) return "Watch";
    return "Healthy";
  }, [stats]);

  if (statsQuery.isPending || latestQuery.isPending) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading command center…
      </div>
    );
  }

  if (statsQuery.isError || latestQuery.isError) {
    const message =
      (statsQuery.error as Error | null)?.message ??
      (latestQuery.error as Error | null)?.message;
    return (
      <div className="text-sm text-destructive">
        Error: {message ?? "Unknown error"}
      </div>
    );
  }

  return (
    <Page>
      <PageHeader
        title="Command Center"
        description="Fast triage view with actionable queue health signals."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CardSection className="p-4">
          <p className="text-xs text-muted-foreground">Queue health</p>
          <p className="mt-1 text-2xl font-semibold">{queueHealth}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Based on ratio of high-priority active tickets.
          </p>
        </CardSection>

        <CardSection className="p-4">
          <p className="text-xs text-muted-foreground">Active tickets</p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.open + stats.in_progress}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Open + in progress.
          </p>
        </CardSection>

        <CardSection className="p-4">
          <p className="text-xs text-muted-foreground">High-priority load</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatPct(stats.high, stats.total)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Share of all tickets marked high.
          </p>
        </CardSection>

        <CardSection className="p-4">
          <p className="text-xs text-muted-foreground">Resolution rate</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatPct(stats.closed, stats.total)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Closed tickets as share of total.
          </p>
        </CardSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CardSection className="p-4">
          <h3 className="text-base font-semibold">Recommended actions</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Prioritize high severity active tickets first.</li>
            <li>• Move stale "open" tickets into "in progress" ownership.</li>
            <li>• Run daily queue export for standup reporting.</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <Link
              to="/tickets"
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              Open ticket workspace
            </Link>
            <Link
              to="/reports"
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              Open reports
            </Link>
          </div>
        </CardSection>

        <CardSection className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold">Latest incoming tickets</h3>
            <Link
              to="/tickets"
              className="text-xs text-muted-foreground hover:underline"
            >
              View all
            </Link>
          </div>

          {latestTickets.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No recent tickets.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {latestTickets.slice(0, 6).map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="block rounded-md border border-border px-3 py-2 hover:bg-muted"
                >
                  <p className="truncate text-sm font-medium">{ticket.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.status.replace("_", " ")} • {ticket.priority} •{" "}
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardSection>
      </div>
    </Page>
  );
}
