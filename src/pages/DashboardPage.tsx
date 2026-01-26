export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your system activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Users", "Tickets", "Revenue", "Errors"].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-border bg-background p-4 shadow-sm"
          >
            <div className="text-sm text-muted-foreground">{item}</div>
            <div className="mt-2 text-2xl font-semibold">—</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
        <div className="text-sm font-medium">Recent activity</div>
        <div className="mt-4 text-sm text-muted-foreground">
          No recent activity
        </div>
      </div>
    </div>
  );
}
