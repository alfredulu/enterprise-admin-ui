import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/services/tickets";

export default function TicketsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: getTickets,
  });

  if (isLoading) {
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <p className="text-sm text-muted-foreground">
          Tickets loaded from Supabase.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium">
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((t) => (
              <tr
                key={t.id}
                className="border-t border-border [&>td]:px-4 [&>td]:py-3"
              >
                <td className="font-medium">{t.title}</td>
                <td className="text-muted-foreground">{t.status}</td>
                <td className="text-muted-foreground">{t.priority}</td>
                <td className="text-muted-foreground">
                  {new Date(t.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!data || data.length === 0) && (
          <div className="p-4 text-sm text-muted-foreground">
            No tickets found. Add some rows in Supabase.
          </div>
        )}
      </div>
    </div>
  );
}
