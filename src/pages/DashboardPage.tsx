import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Page, PageHeader, CardSection } from "@/components/ui/page";
import { getTicketStats } from "@/services/tickets";
import type { TicketStats } from "@/services/tickets";

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
} from "recharts";

const STATUS_COLORS = [
  "hsl(215 20% 55%)", // slate-ish
  "hsl(38 85% 55%)", // muted amber
  "hsl(142 45% 45%)", // muted green
];

const PRIORITY_COLORS = [
  "hsl(142 45% 45%)", // low
  "hsl(38 85% 55%)", // medium
  "hsl(0 65% 55%)", // high (muted red)
];

function PriorityBarShape(props: BarShapeProps) {
  const fill = PRIORITY_COLORS[props.index % PRIORITY_COLORS.length];
  return <Rectangle {...props} fill={fill} radius={[8, 8, 0, 0]} />;
}

function ColorLegend({ payload }: any) {
  return (
    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
      {payload?.map((item: any) => (
        <div key={item.value} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: item.payload.fill }}
          />
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isPending, isError, error } = useQuery<TicketStats>({
    queryKey: ["ticket_stats"],
    queryFn: getTicketStats,
  });

  const stats = data ?? {
    total: 0,
    open: 0,
    in_progress: 0,
    closed: 0,
    low: 0,
    medium: 0,
    high: 0,
  };

  const statusData = [
    { name: "Open", value: stats.open, fill: STATUS_COLORS[0] },
    { name: "In Progress", value: stats.in_progress, fill: STATUS_COLORS[1] },
    { name: "Closed", value: stats.closed, fill: STATUS_COLORS[2] },
  ];

  const priorityData = useMemo(
    () => [
      { name: "Low", value: stats.low },
      { name: "Medium", value: stats.medium },
      { name: "High", value: stats.high },
    ],
    [stats.low, stats.medium, stats.high]
  );

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

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CardSection className="p-5">
          <div className="mb-3">
            <h2 className="text-sm font-medium">Status breakdown</h2>
            <p className="text-xs text-muted-foreground">Doughnut chart</p>
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
                <Legend content={<ColorLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardSection>

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

          <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
            <span>Low: {stats.low}</span>
            <span>Medium: {stats.medium}</span>
            <span>High: {stats.high}</span>
          </div>
        </CardSection>
      </div>
    </Page>
  );
}
