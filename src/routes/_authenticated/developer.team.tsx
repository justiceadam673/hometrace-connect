import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { myDeveloperQuery, teamQuery, type TeamRole } from "@/lib/developers";

export const Route = createFileRoute("/_authenticated/developer/team")({
  component: DeveloperTeamPage,
});

const ROLES: TeamRole[] = ["admin", "manager", "agent", "viewer"];

function DeveloperTeamPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: dev } = useQuery(myDeveloperQuery(user?.id));
  const { data: team = [] } = useQuery(teamQuery(dev?.id));
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", invite_email: "", role: "viewer" as TeamRole });

  async function invite(e: FormEvent) {
    e.preventDefault();
    if (!dev) return;
    if (!form.invite_email.trim()) return toast.error("Email required");
    setSaving(true);
    const { error } = await supabase.from("developer_team").insert({
      developer_id: dev.id,
      invite_email: form.invite_email.trim().toLowerCase(),
      full_name: form.full_name.trim() || null,
      role: form.role,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Team member invited");
    qc.invalidateQueries({ queryKey: ["dev-team"] });
    setForm({ full_name: "", invite_email: "", role: "viewer" });
  }

  async function remove(id: string) {
    if (!confirm("Remove this team member?")) return;
    const { error } = await supabase.from("developer_team").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    qc.invalidateQueries({ queryKey: ["dev-team"] });
  }

  async function updateRole(id: string, role: TeamRole) {
    const { error } = await supabase.from("developer_team").update({ role }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["dev-team"] });
  }

  if (!dev) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
      <div>
        <h2 className="text-xl font-semibold">Team</h2>
        <p className="text-sm text-muted-foreground">
          Invite colleagues to help manage projects, units and sales.
        </p>
        <div className="mt-6 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3">
                  <p className="font-medium">You</p>
                  <p className="text-xs text-muted-foreground">Owner</p>
                </td>
                <td className="px-4 py-3"><Badge>owner</Badge></td>
                <td className="px-4 py-3"><Badge variant="outline">Active</Badge></td>
                <td className="px-4 py-3"></td>
              </tr>
              {team.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{m.full_name ?? m.invite_email}</p>
                    <p className="text-xs text-muted-foreground">{m.invite_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={m.role} onValueChange={(v) => updateRole(m.id, v as TeamRole)}>
                      <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={m.user_id ? "default" : "secondary"}>
                      {m.user_id ? "Active" : "Invited"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Button size="icon" variant="ghost" onClick={() => remove(m.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {team.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No team members yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="size-4 text-primary" /> Invite team member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={invite} className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.invite_email} onChange={(e) => setForm({ ...form, invite_email: e.target.value })} required />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as TeamRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={saving} className="w-full rounded-full">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
              Send invite
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
