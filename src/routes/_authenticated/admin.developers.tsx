import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminDevelopersQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/developers")({
  component: AdminDevelopers,
});

function AdminDevelopers() {
  const qc = useQueryClient();
  const { data: developers } = useQuery(adminDevelopersQuery());

  async function setVerification(id: string, verification: "verified" | "unverified" | "pending") {
    const { error } = await supabase.from("developers").update({ verification }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Developer ${verification}`);
    qc.invalidateQueries({ queryKey: ["admin-developers"] });
    qc.invalidateQueries({ queryKey: ["my-developer"] });
  }

  return (
    <Card>
      <CardHeader><CardTitle>Developer verification</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {developers?.map((d) => (
          <div key={d.id} className="flex flex-wrap items-start justify-between gap-3 rounded-md border p-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                {d.logo_url ? <img src={d.logo_url} alt="" className="size-full object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{d.company_name}</p>
                  <Badge
                    variant={d.verification === "verified" ? "default" : d.verification === "pending" ? "secondary" : "outline"}
                    className={d.verification === "verified" ? "bg-emerald-500" : ""}
                  >
                    {d.verification}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.headquarters ?? "—"} · Est. {d.established_year ?? "—"} · {d.email ?? "no email"} · {d.phone ?? "no phone"}
                </p>
                {d.website ? (
                  <a href={d.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    {d.website}
                  </a>
                ) : null}
                {d.description ? (
                  <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{d.description}</p>
                ) : null}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => setVerification(d.id, "verified")}>
                <Check className="mr-1 size-4" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => setVerification(d.id, "unverified")}>
                <X className="mr-1 size-4" /> Reject
              </Button>
            </div>
          </div>
        ))}
        {developers?.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No developers yet.</p> : null}
      </CardContent>
    </Card>
  );
}
