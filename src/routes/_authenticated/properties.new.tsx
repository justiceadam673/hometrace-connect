import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyForm } from "@/components/property-form";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/properties/new")({
  component: NewPropertyPage,
  head: () => ({ meta: [{ title: "New listing — HomeTrace" }, { name: "robots", content: "noindex" }] }),
});

function NewPropertyPage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Add a new property</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fill in details buyers care about. You can save as draft and publish later.</p>
        <div className="mt-8">
          <PropertyForm mode="create" userId={user.id} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
