import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Eye, Layers, ShoppingBag, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { allSalesQuery, myDeveloperQuery, projectsQuery } from "@/lib/developers";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/developer/marketing")({
  component: DeveloperMarketing,
});

function DeveloperMarketing() {
  const { user } = useAuth();
  const { data: dev } = useQuery(myDeveloperQuery(user?.id));
  const { data: projects = [] } = useQuery(projectsQuery(dev?.id));
  const { data: sales = [] } = useQuery(allSalesQuery(dev?.id));

  const totalViews = projects.reduce((s, p) => s + (p.views ?? 0), 0);
  const totalRevenue = sales.reduce((s, x) => s + Number(x.sale_price), 0);
  const avgSale = sales.length ? totalRevenue / sales.length : 0;

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sales) {
      const d = new Date(s.sale_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + Number(s.sale_price));
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-12)
      .map(([month, revenue]) => ({ month, revenue }));
  }, [sales]);

  const perProject = useMemo(() => {
    return projects
      .map((p) => {
        const projSales = sales.filter((s) => s.project_id === p.id);
        return {
          name: p.name,
          views: p.views ?? 0,
          sold: projSales.length,
          revenue: projSales.reduce((s, x) => s + Number(x.sale_price), 0),
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [projects, sales]);

  if (!dev) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Marketing & performance</h2>
        <p className="text-sm text-muted-foreground">Track reach, engagement and revenue across your portfolio.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Impressions" value={totalViews.toLocaleString()} icon={Eye} />
        <Metric label="Units sold" value={sales.length} icon={ShoppingBag} />
        <Metric label="Revenue" value={formatNaira(totalRevenue)} icon={TrendingUp} />
        <Metric label="Avg. deal size" value={formatNaira(avgSale)} icon={Layers} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Monthly revenue</CardTitle></CardHeader>
        <CardContent className="h-72">
          {monthly.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Record sales to populate this chart.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatNaira(Number(v))} tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(v: number) => formatNaira(v)} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Performance by project</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Units sold</th>
                  <th className="px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {perProject.map((p) => (
                  <tr key={p.name}>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.views.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.sold}</td>
                    <td className="px-4 py-3">{formatNaira(p.revenue)}</td>
                  </tr>
                ))}
                {perProject.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No projects yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
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
