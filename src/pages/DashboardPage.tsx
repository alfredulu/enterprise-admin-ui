import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/services/tickets";
import type { Ticket } from "@/types/ticket";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const DASHBOARD_PAGE = 1;

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tickets", "dashboard"],
    queryFn: () => getTickets(DASHBOARD_PAGE),
    placeholderData: (prev) => prev,
  });

  if (isLoading) {
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

  const tickets: Ticket[] = data?.tickets ?? [];
  const total = data?.total ?? 0;

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "in_progress"
  ).length;
  const closedCount = tickets.filter((t) => t.status === "closed").length;

  const donutData = [
    { name: "Open", value: openCount },
    { name: "In Progress", value: inProgressCount },
    { name: "Closed", value: closedCount },
  ].filter((x) => x.value > 0);

  const barData = [
    { name: "Low", value: tickets.filter((t) => t.priority === "low").length },
    {
      name: "Medium",
      value: tickets.filter((t) => t.priority === "medium").length,
    },
    {
      name: "High",
      value: tickets.filter((t) => t.priority === "high").length,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your support tickets.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tickets" value={total} />
        <StatCard label="Open" value={openCount} />
        <StatCard label="In Progress" value={inProgressCount} />
        <StatCard label="Closed" value={closedCount} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Donut */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="mb-4">
            <h2 className="text-sm font-medium">Status distribution</h2>
            <p className="text-xs text-muted-foreground">
              Current tickets by status
            </p>
          </div>

          <div className="h-72">
            {donutData.length === 0 ? (
              <EmptyChart label="No ticket data yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    stroke="hsl(var(--border))"
                    fill="hsl(var(--primary))"
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="mb-4">
            <h2 className="text-sm font-medium">Priority breakdown</h2>
            <p className="text-xs text-muted-foreground">
              Tickets grouped by priority
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 3"
                />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-full place-items-center rounded-xl border border-dashed border-border">
      <div className="text-center">
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Create tickets to populate charts.
        </div>
      </div>
    </div>
  );
}
