import { useQuery } from "@tanstack/react-query";
import { getProfiles } from "@/services/profiles";

function RoleBadge({ role }: { role: "owner" | "member" }) {
  const isOwner = role === "owner";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        isOwner
          ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300"
          : "border-border bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {isOwner ? "Owner" : "Member"}
    </span>
  );
}

export default function UsersPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
  });

  if (isPending) {
    return <div className="text-sm text-muted-foreground">Loading staff…</div>;
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive">
        Error: {(error as Error).message}
      </div>
    );
  }

  const users = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Staff</h2>
        <p className="text-sm text-muted-foreground">
          Internal staff accounts with access to the admin dashboard.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium">
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-border [&>td]:px-4 [&>td]:py-3"
              >
                <td className="font-medium">{u.email}</td>
                <td>
                  <RoleBadge role={u.role} />
                </td>
                <td className="text-muted-foreground">
                  {new Date(u.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            No staff accounts found.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        Owners can manage access and view staff. Members have limited visibility
        based on permissions.
      </div>
    </div>
  );
}
