import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { announcementsQuery } from "@/lib/admin";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  component: AdminAnnouncements,
});

function AdminAnnouncements() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery(announcementsQuery());
  const [form, setForm] = useState({ title: "", body: "", audience: "all" });

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return toast.error("Fill in title and message");
    const { error } = await supabase.from("announcements").insert({
      title: form.title.trim(),
      body: form.body.trim(),
      audience: form.audience,
      created_by: user?.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Announcement sent");
    setForm({ title: "", body: "", audience: "all" });
    qc.invalidateQueries({ queryKey: ["announcements"] });
  }

  async function toggle(id: string, active: boolean) {
    await supabase.from("announcements").update({ active: !active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["announcements"] });
  }
  async function remove(id: string) {
    await supabase.from("announcements").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["announcements"] });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>New announcement</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={send} className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <div>
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="agents">Agents</SelectItem>
                  <SelectItem value="developers">Developers</SelectItem>
                  <SelectItem value="buyers">Buyers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="rounded-full">Send announcement</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sent</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data?.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{a.title}</p>
                  <Badge variant="outline">{a.audience}</Badge>
                  {!a.active ? <Badge variant="secondary">Inactive</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle(a.id, a.active)}>{a.active ? "Disable" : "Enable"}</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(a.id)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
