import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminStatsQuery, analyticsQuery } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: stats } = useQuery(adminStatsQuery());
  const { data: analytics } = useQuery(analyticsQuery());

  const stat = (label: string, value: number | undefined, tone?: string) => (
    <Card key={label}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-semibold ${tone ?? ""}`}>{value ?? "—"}</div>
      </CardContent>
    </Card>
  );

  const monthly = groupByMonth(analytics?.props ?? [], "created_at");
  const salesMonthly = groupByMonth(analytics?.sales ?? [], "sale_date");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Platform-wide statistics.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stat("Total Users", stats?.users)}
        {stat("Total Agents", stats?.agents)}
        {stat("Verified Agents", stats?.verifiedAgents, "text-emerald-600")}
        {stat("Pending Verifications", stats?.pendingVerifications, "text-amber-600")}
        {stat("Total Properties", stats?.properties)}
        {stat("Houses", stats?.houses)}
        {stat("Lands", stats?.lands)}
        {stat("Apartments", stats?.apartments)}
        {stat("Estates (Projects)", stats?.estates)}
        {stat("Rentals", stats?.rentals)}
        {stat("Total Sales", stats?.sales)}
        {stat("Pending Reports", stats?.pendingReports, "text-red-600")}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>New listings by month</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sales by month</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesMonthly}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function groupByMonth<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  const buckets = new Map<string, number>();
  for (const r of rows) {
    const d = new Date(r[key] as string);
    if (isNaN(d.getTime())) continue;
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([label, count]) => ({ label, count }));
}
