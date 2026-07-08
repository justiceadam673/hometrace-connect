import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { myDeveloperQuery } from "@/lib/developers";
import { ProjectForm } from "@/components/project-form";

export const Route = createFileRoute("/_authenticated/developer/projects/new")({
  component: NewProjectPage,
});

function NewProjectPage() {
  const { user } = useAuth();
  const { data: dev } = useQuery(myDeveloperQuery(user?.id));
  if (!dev) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/developer/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to projects
      </Link>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">New project</h2>
        <p className="text-sm text-muted-foreground">Add a new estate or development to your portfolio.</p>
      </div>
      <ProjectForm developerId={dev.id} mode="create" />
    </div>
  );
}
