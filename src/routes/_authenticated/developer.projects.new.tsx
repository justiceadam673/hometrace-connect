import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Clock, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { myDeveloperQuery } from "@/lib/developers";
import { ProjectForm } from "@/components/project-form";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/developer/projects/new")({
  component: NewProjectPage,
});

function NewProjectPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: dev, isLoading } = useQuery(myDeveloperQuery(user?.id));
  if (!dev || isLoading) return null;

  const verified = dev.verification === "verified";
  const pending = dev.verification === "pending";

  if (!verified) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/developer/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to projects
        </Link>
        <div className="rounded-2xl border bg-muted/20 p-8 text-center">
          <div className={`mx-auto grid size-14 place-items-center rounded-full ${pending ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}>
            {pending ? <Clock className="size-7" /> : <ShieldAlert className="size-7" />}
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            {pending ? "Verification pending admin review" : "Developer verification required"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {pending
              ? "Your company is being reviewed by an admin. You'll be able to create projects once you're approved."
              : "Only verified developers can create projects. Complete your company profile and request verification — an admin will review and approve you."}
          </p>
          <Button className="mt-6 rounded-full" size="lg" onClick={() => navigate({ to: "/developer/profile" })}>
            {pending ? "View company profile" : "Go to verification"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/developer/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to projects
      </Link>
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
          <BadgeCheck className="size-3.5" /> Verified developer
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">New project</h2>
        <p className="text-sm text-muted-foreground">Add a new estate or development to your portfolio.</p>
      </div>
      <ProjectForm developerId={dev.id} mode="create" />
    </div>
  );
}
