import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminAgentsQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/agents")({
  component: AdminAgents,
});

function AdminAgents() {
  const qc = useQueryClient();
  const { data: agents } = useQuery(adminAgentsQuery());

  async function setVerification(id: string, verification: "verified" | "unverified" | "pending") {
    const { error } = await supabase.from("agents").update({ verification }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Agent ${verification}`);
    qc.invalidateQueries({ queryKey: ["admin-agents"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  return (
    <Card>
      <CardHeader><CardTitle>Agent verification</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {agents?.map((a) => {
          const profile = (a as unknown as { profiles: { full_name: string | null } }).profiles;
          return (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{profile?.full_name ?? "Agent"}</p>
                  <Badge
                    variant={a.verification === "verified" ? "default" : a.verification === "pending" ? "secondary" : "outline"}
                    className={a.verification === "verified" ? "bg-emerald-500" : ""}
                  >
                    {a.verification}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {a.company ?? "no company"} · License: {a.license_number ?? "—"} · {a.years_experience ?? 0}y exp · ★ {a.rating ?? 0} ({a.review_count})
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => setVerification(a.id, "verified")}>
                  <Check className="mr-1 size-4" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => setVerification(a.id, "unverified")}>
                  <X className="mr-1 size-4" /> Reject
                </Button>
              </div>
            </div>
          );
        })}
        {agents?.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No agents yet.</p> : null}
      </CardContent>
    </Card>
  );
}
