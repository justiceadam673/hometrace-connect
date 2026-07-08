import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyForm } from "@/components/property-form";
import { useAuth } from "@/lib/auth-context";
import { propertyByIdQuery } from "@/lib/properties";

export const Route = createFileRoute("/_authenticated/properties/$id/edit")({
  component: EditPropertyPage,
  head: () => ({ meta: [{ title: "Edit listing — HomeTrace" }, { name: "robots", content: "noindex" }] }),
});

function EditPropertyPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { data: property } = useSuspenseQuery(propertyByIdQuery(id));
  if (!property) throw notFound();
  if (!user) return null;
  if (property.agent_id !== user.id) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16 text-center">
          <h1 className="text-2xl font-semibold">Not your listing</h1>
          <p className="mt-2 text-sm text-muted-foreground">You can only edit properties you created.</p>
          <Link to="/dashboard" className="mt-6 inline-flex items-center gap-1 text-sm text-primary">Go to dashboard</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Edit property</h1>
        <div className="mt-8">
          <PropertyForm mode="edit" initial={property} userId={user.id} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
