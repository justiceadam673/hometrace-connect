import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Coins, Layers, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { allSalesQuery, myDeveloperQuery, projectsQuery, teamQuery } from "@/lib/developers";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/developer/")({
  component: DeveloperOverview,
});

function DeveloperOverview() {
  const { user } = useAuth();
  const { data: dev } = useQuery(myDeveloperQuery(user?.id));
  const { data: projects = [] } = useQuery(projectsQuery(dev?.id));
  const { data: sales = [] } = useQuery(allSalesQuery(dev?.id));
  const { data: team = [] } = useQuery(teamQuery(dev?.id));

  if (!dev) return null;

  const totalRevenue = sales.reduce((s, x) => s + Number(x.sale_price), 0);
  const activeProjects = projects.filter((p) => p.status === "selling" || p.status === "pre_launch").length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total projects" value={projects.length} icon={Building2} />
        <Stat label="Active launches" value={activeProjects} icon={Layers} />
        <Stat label="Total sales" value={formatNaira(totalRevenue)} icon={Coins} />
        <Stat label="Team members" value={team.length + 1} icon={Users} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent projects</h2>
          <Button asChild size="sm" variant="ghost">
            <Link to="/developer/projects">View all</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <Card className="col-span-full border-dashed">
              <CardContent className="p-10 text-center">
                <h3 className="text-base font-semibold">No projects yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Launch your first estate or development to start tracking units and sales.
                </p>
                <Button asChild className="mt-6 rounded-full">
                  <Link to="/developer/projects/new">
                    <Plus className="mr-2 size-4" /> New project
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            projects.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to="/developer/projects/$id"
                params={{ id: p.id }}
                className="group overflow-hidden rounded-xl border transition-colors hover:border-primary/40"
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  {p.cover_image ? (
                    <img
                      src={p.cover_image}
                      alt={p.name}
                      className="size-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{p.name}</p>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {p.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[p.area, p.city, p.state].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-2 text-sm">
                    {p.starting_price ? `From ${formatNaira(Number(p.starting_price))}` : "—"}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
