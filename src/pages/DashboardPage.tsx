import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Page, PageHeader, CardSection } from "@/components/ui/page";
import {
  getTicketStats,
  getTicketDailyCounts,
  getTickets,
} from "@/services/tickets";
import type {
  TicketStats,
  DailyCount,
  TicketsResponse,
} from "@/services/tickets";
import { Link } from "react-router-dom";

import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Rectangle,
  type BarShapeProps,
  LineChart,
  Line,
} from "recharts";

const STATUS_FILL = {
  Open: "hsl(var(--chart-1))",
  "In Progress": "hsl(var(--chart-2))",
  Closed: "hsl(var(--chart-3))",
} as const;

const PRIORITY_FILL = {
  Low: "hsl(var(--chart-3))",
  Medium: "hsl(var(--chart-2))",
  High: "hsl(var(--chart-4))",
} as const;

function PriorityBarShape(props: BarShapeProps) {
  const name = (props?.payload as any)?.name as keyof typeof PRIORITY_FILL;
  const fill = PRIORITY_FILL[name] ?? "hsl(var(--chart-1))";
  return <Rectangle {...props} fill={fill} radius={[10, 10, 0, 0]} />;
}

function ChartLegend({ payload }: any) {
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
      {payload?.map((item: any) => (
        <div key={item.value} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function formatDayLabel(iso: string) {
  // iso: "2026-01-31"
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  // 1) Stats (total/open/closed + priority counts)
  const statsQuery = useQuery<TicketStats>({
    queryKey: ["ticket_stats"],
    queryFn: getTicketStats,
  });

  // 2) Daily counts (trend)
  const dailyQuery = useQuery<DailyCount[]>({
    queryKey: ["ticket_daily_counts", 7],
    queryFn: () => getTicketDailyCounts(7),
  });

  // 3) Recent tickets (just for “activity” preview)
  const recentQuery = useQuery<TicketsResponse>({
    queryKey: ["tickets_recent_preview"],
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

  const statusData = useMemo(
    () => [
      { name: "Open", value: stats.open, fill: STATUS_FILL["Open"] },
      {
        name: "In Progress",
        value: stats.in_progress,
        fill: STATUS_FILL["In Progress"],
      },
      { name: "Closed", value: stats.closed, fill: STATUS_FILL["Closed"] },
    ],
    [stats.open, stats.in_progress, stats.closed]
  );

  const priorityData = useMemo(
    () => [
      { name: "Low", value: stats.low },
      { name: "Medium", value: stats.medium },
      { name: "High", value: stats.high },
    ],
    [stats.low, stats.medium, stats.high]
  );

  const dailyData = useMemo(() => {
    const rows = dailyQuery.data ?? [];
    return rows.map((r) => ({
      day: r.day,
      label: formatDayLabel(r.day),
      count: r.count,
    }));
  }, [dailyQuery.data]);

  const recentTickets = (recentQuery.data?.tickets ?? []).slice(0, 5);

  const isLoading =
    statsQuery.isPending || dailyQuery.isPending || recentQuery.isPending;
  const isError =
    statsQuery.isError || dailyQuery.isError || recentQuery.isError;

  const error =
    (statsQuery.error as Error | null) ??
    (dailyQuery.error as Error | null) ??
    (recentQuery.error as Error | null);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading dashboard…</div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive">
        Error: {error?.message ?? "Unknown error"}
      </div>
    );
  }

  return (
    <Page>
      <PageHeader
        title="Dashboard"
        description="Overview of your support tickets."
      />

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Tickets</p>
          <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="mt-2 text-3xl font-semibold">{stats.open}</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="mt-2 text-3xl font-semibold">{stats.in_progress}</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Closed</p>
          <p className="mt-2 text-3xl font-semibold">{stats.closed}</p>
        </div>
      </div>

      {/* 4 visuals */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* (1) Donut */}
        <CardSection className="p-5">
          <div className="mb-3">
            <h2 className="text-sm font-medium">Status breakdown</h2>
            <p className="text-xs text-muted-foreground">
              Open / In Progress / Closed
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  isAnimationActive={false}
                />
                <Tooltip />
                <Legend content={<ChartLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardSection>

        {/* (2) Priority bars + counts */}
        <CardSection className="p-5">
          <div className="mb-3">
            <h2 className="text-sm font-medium">Priority breakdown</h2>
            <p className="text-xs text-muted-foreground">Low / Medium / High</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  shape={PriorityBarShape}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: PRIORITY_FILL.Low }}
              />
              Low: {stats.low}
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: PRIORITY_FILL.Medium }}
              />
              Medium: {stats.medium}
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: PRIORITY_FILL.High }}
              />
              High: {stats.high}
            </span>
          </div>
        </CardSection>

        {/* (3) Daily trend */}
        <CardSection className="p-5">
          <div className="mb-3">
            <h2 className="text-sm font-medium">New tickets trend</h2>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardSection>

        {/* (4) Recent tickets preview */}
        <CardSection className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">Recent tickets</h2>
              <p className="text-xs text-muted-foreground">
                Quick jump into details
              </p>
            </div>
            <Link
              to="/tickets"
              className="text-xs text-muted-foreground hover:underline"
            >
              View all
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="text-sm text-muted-foreground">No tickets yet.</div>
          ) : (
            <div className="space-y-2">
              {recentTickets.map((t) => (
                <Link
                  key={t.id}
                  to={`/tickets/${t.id}`}
                  className="block rounded-lg border border-border bg-background px-3 py-2 hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {t.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.status.replace("_", " ")} • {t.priority}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardSection>
      </div>
    </Page>
  );
}
