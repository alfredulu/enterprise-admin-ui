import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Page, PageHeader, CardSection } from "@/components/ui/page";
import {
  getTicketDailyCounts,
  getTicketStats,
  getTickets,
} from "@/services/tickets";
import type {
  DailyCount,
  TicketStats,
  TicketsResponse,
} from "@/services/tickets";

function download(
  content: string,
  fileName: string,
  type = "text/plain;charset=utf-8;"
) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const statsQuery = useQuery<TicketStats>({
    queryKey: ["ticket_stats"],
    queryFn: getTicketStats,
  });

  const dailyQuery = useQuery<DailyCount[]>({
    queryKey: ["ticket_daily_counts", 14],
    queryFn: () => getTicketDailyCounts(14),
  });

  const recentQuery = useQuery<TicketsResponse>({
    queryKey: ["tickets", 1],
    queryFn: () => getTickets(1),
  });

  const dailyTotal = useMemo(
    () => (dailyQuery.data ?? []).reduce((acc, item) => acc + item.count, 0),
    [dailyQuery.data]
  );

  const avgDaily = useMemo(() => {
    const rows = dailyQuery.data ?? [];
    if (rows.length === 0) return 0;
    return (
      rows.reduce((acc, item) => acc + item.count, 0) / rows.length
    ).toFixed(1);
  }, [dailyQuery.data]);

  function exportSummary() {
    const stats = statsQuery.data;
    const rows = dailyQuery.data ?? [];

    const summary = {
      generated_at: new Date().toISOString(),
      stats,
      last_14_days: rows,
      sample_recent_tickets: recentQuery.data?.tickets ?? [],
    };

    download(
      JSON.stringify(summary, null, 2),
      "admin-report-summary.json",
      "application/json;charset=utf-8;"
    );
  }

  function exportDailyCsv() {
    const rows = dailyQuery.data ?? [];
    const csv = [
      "day,count",
      ...rows.map((row) => `${row.day},${row.count}`),
    ].join("\n");
    download(csv, "daily-ticket-volume.csv", "text/csv;charset=utf-8;");
  }

  if (statsQuery.isPending || dailyQuery.isPending || recentQuery.isPending) {
    return (
      <div className="text-sm text-muted-foreground">Loading reports…</div>
    );
  }

  if (statsQuery.isError || dailyQuery.isError || recentQuery.isError) {
    const message =
      (statsQuery.error as Error | null)?.message ??
      (dailyQuery.error as Error | null)?.message ??
      (recentQuery.error as Error | null)?.message;
    return (
      <div className="text-sm text-destructive">
        Error: {message ?? "Unknown error"}
      </div>
    );
  }

  const stats = statsQuery.data;

  return (
    <Page>
      <PageHeader
        title="Reports"
        description="Export-ready operational reporting for weekly reviews and leadership updates."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSection className="p-4">
          <p className="text-xs text-muted-foreground">Total tickets</p>
          <p className="mt-1 text-2xl font-semibold">{stats?.total ?? 0}</p>
        </CardSection>
        <CardSection className="p-4">
          <p className="text-xs text-muted-foreground">Open now</p>
          <p className="mt-1 text-2xl font-semibold">{stats?.open ?? 0}</p>
        </CardSection>
        <CardSection className="p-4">
          <p className="text-xs text-muted-foreground">Created (14d)</p>
          <p className="mt-1 text-2xl font-semibold">{dailyTotal}</p>
        </CardSection>
        <CardSection className="p-4">
          <p className="text-xs text-muted-foreground">Average daily (14d)</p>
          <p className="mt-1 text-2xl font-semibold">{avgDaily}</p>
        </CardSection>
      </div>

      <CardSection className="p-4">
        <h3 className="text-base font-semibold">One-click exports</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate handoff artifacts for async updates, standups, and weekly
          operations review.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportSummary}
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            Export JSON summary
          </button>

          <button
            type="button"
            onClick={exportDailyCsv}
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            Export daily CSV
          </button>
        </div>
      </CardSection>

      <CardSection className="p-4">
        <h3 className="text-base font-semibold">Last 14 days ticket volume</h3>
        <div className="mt-3 overflow-auto rounded-md border border-border">
          <table className="w-full min-w-96 text-sm">
            <thead className="bg-muted/60">
              <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left">
                <th>Date</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {(dailyQuery.data ?? []).map((row) => (
                <tr
                  key={row.day}
                  className="border-t border-border [&>td]:px-3 [&>td]:py-2"
                >
                  <td>{new Date(row.day).toLocaleDateString()}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardSection>
    </Page>
  );
}
