import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyForm } from "@/components/property-form";
import { useAuth } from "@/lib/auth-context";
import { myAgentQuery, isAgentKycSubmitted } from "@/lib/agent-kyc";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/properties/new")({
  component: NewPropertyPage,
  head: () => ({ meta: [{ title: "New listing — HomeTrace" }, { name: "robots", content: "noindex" }] }),
});

function NewPropertyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: agent, isLoading } = useQuery(myAgentQuery(user?.id));


  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Back to dashboard
        </Link>

        {isLoading ? (
          <div className="flex items-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Checking your account…
          </div>
        ) : !isAgentKycSubmitted(agent) ? (
          <div className="mt-6 rounded-2xl border bg-muted/20 p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
              <ShieldAlert className="size-7" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Complete agent verification first
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              To keep HomeTrace trustworthy, every agent completes a one-time KYC.
              Upload your NIN, C of O and a selfie — then you can post as many listings as you like.
            </p>
            <Button
              className="mt-6 rounded-full"
              size="lg"
              onClick={() => navigate({ to: "/agent/verification" })}
            >
              Start verification
            </Button>
          </div>
        ) : (
          <>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Add a new property</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill in details buyers care about. You can save as draft and publish later.
            </p>
            <div className="mt-8">
              <PropertyForm mode="create" userId={user.id} />
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
