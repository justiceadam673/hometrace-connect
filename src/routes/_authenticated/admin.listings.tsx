import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminListingsQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/listings")({
  component: AdminListings,
});

function AdminListings() {
  const qc = useQueryClient();
  const { data: listings } = useQuery(adminListingsQuery());

  async function toggleFeatured(id: string, featured: boolean) {
    const { error } = await supabase.from("properties").update({ featured: !featured }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(featured ? "Unfeatured" : "Featured");
    qc.invalidateQueries({ queryKey: ["admin-listings"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this listing permanently?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Listing removed");
    qc.invalidateQueries({ queryKey: ["admin-listings"] });
  }

  return (
    <Card>
      <CardHeader><CardTitle>All listings ({listings?.length ?? 0})</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {listings?.map((l) => (
          <div key={l.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {l.cover_image ? <img src={l.cover_image} alt="" className="size-full object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{l.title}</p>
                  {l.featured ? <Badge className="bg-amber-500">Featured</Badge> : null}
                  <Badge variant="outline">{l.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(l.price)} · {l.property_type} · {l.listing_type} · {l.city ?? l.state} · {l.views} views
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggleFeatured(l.id, l.featured)}>
                <Star className={`size-4 ${l.featured ? "fill-amber-500 text-amber-500" : ""}`} />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(l.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
