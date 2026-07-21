import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ExternalLink, X } from "lucide-react";
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
    qc.invalidateQueries({ queryKey: ["agent-verification"] });
  }

  return (
    <Card>
      <CardHeader><CardTitle>Agent verification</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {agents?.map((a) => {
          const profile = (a as unknown as { profiles: { full_name: string | null } }).profiles;
          const submitted = !!a.kyc_submitted_at;
          return (
            <div key={a.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{a.business_name || profile?.full_name || "Agent"}</p>
                    <Badge
                      variant={a.verification === "verified" ? "default" : a.verification === "pending" ? "secondary" : "outline"}
                      className={a.verification === "verified" ? "bg-emerald-500" : ""}
                    >
                      {a.verification}
                    </Badge>
                    {submitted ? (
                      <Badge variant="outline" className="text-xs">KYC submitted</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">No KYC yet</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.company ?? "no company"} · License: {a.license_number ?? "—"} · NIN: {a.nin_number ?? "—"} · {a.years_experience ?? 0}y exp
                  </p>
                  {a.kyc_address ? (
                    <p className="text-xs text-muted-foreground">Address: {a.kyc_address}</p>
                  ) : null}
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

              {submitted ? (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <DocPreview label="NIN slip" url={a.nin_document_url} />
                  <DocPreview label="C of O / Governor's Consent" url={a.cofo_document_url} />
                  <DocPreview label="Selfie with ID" url={a.id_selfie_url} />
                </div>
              ) : null}
            </div>
          );
        })}
        {agents?.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No agents yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function DocPreview({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="rounded-md border bg-muted/20 p-2">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <div className="aspect-video overflow-hidden rounded bg-muted">
            <img src={url} alt={label} className="size-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          </div>
          <span className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Open <ExternalLink className="size-3" />
          </span>
        </a>
      ) : (
        <p className="text-xs text-muted-foreground">Not uploaded</p>
      )}
    </div>
  );
}
