import { useQuery } from "@tanstack/react-query";
import { getProfiles } from "@/services/profiles";

export default function UsersPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
  });

  if (isPending) {
    return <div className="text-sm text-muted-foreground">Loading users…</div>;
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive">
        Error: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Users registered in your app.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium">
              <th>Email</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((u) => (
              <tr
                key={u.id}
                className="border-t border-border [&>td]:px-4 [&>td]:py-3"
              >
                <td className="font-medium">{u.email}</td>
                <td className="text-muted-foreground">
                  {new Date(u.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!data || data.length === 0) && (
          <div className="p-4 text-sm text-muted-foreground">No users yet.</div>
        )}
      </div>
    </div>
  );
}
