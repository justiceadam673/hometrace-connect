import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { BadgeCheck, Building2, LayoutDashboard, LineChart, ShieldAlert, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { myDeveloperQuery } from "@/lib/developers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/developer")({
  head: () => ({
    meta: [
      { title: "Developer workspace — HomeTrace" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeveloperLayout,
});

const TABS = [
  { to: "/developer", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/developer/projects", label: "Projects", icon: Building2 },
  { to: "/developer/team", label: "Team", icon: Users },
  { to: "/developer/marketing", label: "Marketing", icon: LineChart },
  { to: "/developer/profile", label: "Company", icon: BadgeCheck },
] as const;

function DeveloperLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: dev, isLoading } = useQuery(myDeveloperQuery(user?.id));

  useEffect(() => {
    if (isLoading) return;
    if (!dev && !location.pathname.startsWith("/developer/profile")) {
      navigate({ to: "/developer/profile" });
    }
  }, [dev, isLoading, location.pathname, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Developer workspace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {dev?.company_name ?? "Set up your company"}
            </h1>
          </div>
          {dev ? <VerificationBadge status={dev.verification} /> : null}
        </div>

        <nav className="mt-8 flex flex-wrap gap-1 border-b">
          {TABS.map((t) => {
            const active = t.exact
              ? location.pathname === t.to
              : location.pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="py-8">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function VerificationBadge({ status }: { status: "unverified" | "pending" | "verified" }) {
  if (status === "verified")
    return (
      <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/20">
        <BadgeCheck className="mr-1 size-3.5" /> Verified developer
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge variant="secondary" className="rounded-full">Verification pending</Badge>
    );
  return (
    <Badge variant="outline" className="rounded-full">
      <ShieldAlert className="mr-1 size-3.5" /> Unverified
    </Badge>
  );
}
