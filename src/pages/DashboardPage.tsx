import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/services/tickets";
import type { Ticket } from "@/types/ticket";
import { Page, PageHeader, CardSection } from "@/components/ui/page";

const PAGE_SIZE = 10;

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["tickets", 1],
    queryFn: () => getTickets(1),
  });

  const tickets: Ticket[] = data?.tickets ?? [];
  const total = data?.total ?? 0;

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "in_progress"
  ).length;
  const closedCount = tickets.filter((t) => t.status === "closed").length;

  return (
    <Page>
      <PageHeader
        title="Dashboard"
        description="Overview of your support tickets."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSection>
          <p className="text-sm text-muted-foreground">Total Tickets</p>
          <p className="mt-2 text-3xl font-semibold">{total}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Showing last {PAGE_SIZE}
          </p>
        </CardSection>

        <CardSection>
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="mt-2 text-3xl font-semibold">{openCount}</p>
        </CardSection>

        <CardSection>
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="mt-2 text-3xl font-semibold">{inProgressCount}</p>
        </CardSection>

        <CardSection>
          <p className="text-sm text-muted-foreground">Closed</p>
          <p className="mt-2 text-3xl font-semibold">{closedCount}</p>
        </CardSection>
      </div>
    </Page>
  );
}
