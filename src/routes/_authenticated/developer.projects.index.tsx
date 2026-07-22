import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { myDeveloperQuery, projectsQuery } from "@/lib/developers";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/developer/projects/")({
  component: DeveloperProjectsList,
});

function DeveloperProjectsList() {
  const { user } = useAuth();
  const { data: dev } = useQuery(myDeveloperQuery(user?.id));
  const { data: projects = [] } = useQuery(projectsQuery(dev?.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Projects & estates</h2>
          <p className="text-sm text-muted-foreground">
            Every development you manage, its units, and sales activity.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/developer/projects/new">
            <Plus className="mr-2 size-4" /> New project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-16 text-center">
            <h3 className="text-base font-semibold">No projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first development to upload units and track sales.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/developer/projects/new">
                <Plus className="mr-2 size-4" /> New project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Starting price</th>
                <th className="px-4 py-3">Units</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {p.cover_image ? (
                          <img src={p.cover_image} alt="" className="size-full object-cover" />
                        ) : null}
                      </div>
                      <Link
                        to="/developer/projects/$id"
                        params={{ id: p.id }}
                        className="font-medium hover:text-primary"
                      >
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[p.area, p.city, p.state].filter(Boolean).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="uppercase text-[10px]">
                      {p.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {p.starting_price ? formatNaira(Number(p.starting_price)) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.total_units ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
