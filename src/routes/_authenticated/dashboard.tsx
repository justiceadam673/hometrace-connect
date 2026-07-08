import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { myPropertiesQuery } from "@/lib/dashboard";
import { resolveImage } from "@/lib/properties";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Agent dashboard — HomeTrace" }, { name: "robots", content: "noindex" }] }),
});

function DashboardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: properties } = useSuspenseQuery(myPropertiesQuery(user?.id));

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === "available").length,
    views: properties.reduce((s, p) => s + (p.views ?? 0), 0),
  };

  async function handleDelete(id: string) {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Property deleted");
    qc.invalidateQueries({ queryKey: ["my-properties"] });
    qc.invalidateQueries({ queryKey: ["properties"] });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Agent workspace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">My listings</h1>
          </div>
          <Button onClick={() => navigate({ to: "/properties/new" })} className="rounded-full">
            <Plus className="mr-2 size-4" /> New property
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total listings" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Total views" value={stats.views} />
        </div>

        <div className="mt-10">
          {properties.length === 0 ? (
            <div className="rounded-xl border border-dashed p-16 text-center">
              <h2 className="text-lg font-semibold">No listings yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">Add your first property to start receiving inquiries.</p>
              <Button className="mt-6 rounded-full" onClick={() => navigate({ to: "/properties/new" })}>
                <Plus className="mr-2 size-4" /> Add property
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Views</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                            {p.cover_image ? (
                              <img src={resolveImage(p.cover_image)} alt="" className="size-full object-cover" />
                            ) : (
                              <div className="grid size-full place-items-center text-muted-foreground"><ImageOff className="size-4" /></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{p.title}</p>
                            <p className="text-xs text-muted-foreground">{[p.area, p.city, p.state].filter(Boolean).join(", ")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatNaira(p.price)}<span className="text-xs text-muted-foreground">{p.listing_type === "rent" ? "/yr" : p.listing_type === "shortlet" ? "/night" : ""}</span></td>
                      <td className="px-4 py-3"><Badge variant={p.status === "available" ? "default" : "secondary"}>{p.status}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{p.views}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button asChild size="icon" variant="ghost"><Link to="/properties/$id" params={{ id: p.id }} title="View"><Eye className="size-4" /></Link></Button>
                          <Button asChild size="icon" variant="ghost"><Link to="/properties/$id/edit" params={{ id: p.id }} title="Edit"><Pencil className="size-4" /></Link></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" title="Delete"><Trash2 className="size-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                                <AlertDialogDescription>This cannot be undone. "{p.title}" will be permanently removed.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
