import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminUsersQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const qc = useQueryClient();
  const { data: users } = useQuery(adminUsersQuery());

  async function toggleSuspend(id: string, current: boolean) {
    const { error } = await supabase.from("profiles").update({ is_suspended: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(current ? "User unsuspended" : "User suspended");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  async function grantAdmin(id: string) {
    const { error } = await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
    if (error) return toast.error(error.message);
    toast.success("Admin role granted");
  }

  return (
    <Card>
      <CardHeader><CardTitle>Users ({users?.length ?? 0})</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {users?.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{u.full_name ?? "Unnamed"}</p>
                {u.role ? <Badge variant="outline">{u.role}</Badge> : null}
                {u.is_suspended ? <Badge variant="destructive">Suspended</Badge> : null}
              </div>
              <p className="text-xs text-muted-foreground">{u.phone ?? "no phone"} · {new Date(u.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => grantAdmin(u.id)}>Make admin</Button>
              <Button size="sm" variant={u.is_suspended ? "outline" : "destructive"} onClick={() => toggleSuspend(u.id, u.is_suspended)}>
                {u.is_suspended ? "Unsuspend" : "Suspend"}
              </Button>
            </div>
          </div>
        ))}
        {users?.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No users yet.</p> : null}
      </CardContent>
    </Card>
  );
}
