import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminReportsQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: AdminReports,
});

function AdminReports() {
  const qc = useQueryClient();
  const { data: reports } = useQuery(adminReportsQuery());

  async function setStatus(id: string, status: "reviewed" | "resolved" | "dismissed") {
    const { error } = await supabase
      .from("reports")
      .update({ status, resolved_at: status !== "reviewed" ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Report ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  return (
    <Card>
      <CardHeader><CardTitle>Reports ({reports?.length ?? 0})</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {reports?.map((r) => {
          const prop = (r as unknown as { properties: { title: string | null } | null }).properties;
          return (
            <div key={r.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{r.reason}</p>
                  <Badge
                    variant={r.status === "pending" ? "destructive" : "outline"}
                    className={r.status === "resolved" ? "bg-emerald-500 text-white" : ""}
                  >
                    {r.status}
                  </Badge>
                </div>
                {prop?.title ? <p className="text-xs text-muted-foreground">Listing: {prop.title}</p> : null}
                {r.details ? <p className="mt-1 text-sm">{r.details}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "reviewed")}>Reviewed</Button>
                <Button size="sm" onClick={() => setStatus(r.id, "resolved")}>Resolve</Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "dismissed")}>Dismiss</Button>
              </div>
            </div>
          );
        })}
        {reports?.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No reports.</p> : null}
      </CardContent>
    </Card>
  );
}
