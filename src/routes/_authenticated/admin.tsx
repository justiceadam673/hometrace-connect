import { createFileRoute, Link, Outlet, useRouterState, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, ShieldCheck, ListChecks, Flag, Megaphone, BookOpen, HelpCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { myRolesQuery } from "@/lib/admin";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/agents", label: "Agents", icon: ShieldCheck },
  { to: "/admin/listings", label: "Listings", icon: ListChecks },
  { to: "/admin/reports", label: "Reports", icon: Flag },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/blog", label: "Blog", icon: BookOpen },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
];

function AdminLayout() {
  const { user } = useAuth();
  useQuery(myRolesQuery(user?.id));
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
      <aside className="space-y-1">
        <div className="mb-4">
          <h1 className="text-lg font-semibold">Admin</h1>
          <p className="text-xs text-muted-foreground">Platform control</p>
        </div>
        {NAV.map((n) => {
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {n.label}
            </Link>
          );
        })}
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
