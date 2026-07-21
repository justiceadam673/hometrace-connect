import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ChevronLeft, Clock, Loader2, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyForm } from "@/components/property-form";
import { useAuth } from "@/lib/auth-context";
import { myAgentQuery, isAgentKycSubmitted, isAgentVerified } from "@/lib/agent-kyc";
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

  const submitted = isAgentKycSubmitted(agent);
  const verified = isAgentVerified(agent);
  const rejected = submitted && agent?.verification === "unverified";

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
        ) : !submitted ? (
          <div className="mt-6 rounded-2xl border bg-muted/20 p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
              <ShieldAlert className="size-7" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Complete agent verification first
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              To keep HomeTrace trustworthy, every agent completes a one-time KYC.
              Upload your NIN, C of O and a selfie — an admin will review and approve you before you can list.
            </p>
            <Button className="mt-6 rounded-full" size="lg" onClick={() => navigate({ to: "/agent/verification" })}>
              Start verification
            </Button>
          </div>
        ) : !verified ? (
          <div className="mt-6 rounded-2xl border bg-muted/20 p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-amber-100 text-amber-600">
              {rejected ? <ShieldAlert className="size-7" /> : <Clock className="size-7" />}
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              {rejected ? "Verification was rejected" : "Verification pending admin review"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {rejected
                ? "An admin reviewed your documents and could not approve them. Please resubmit with clearer, valid documents."
                : "Thanks for submitting your KYC — an admin will review your documents and approve you shortly. You'll be able to post listings as soon as you're verified."}
            </p>
            <Button className="mt-6 rounded-full" size="lg" variant={rejected ? "default" : "outline"} onClick={() => navigate({ to: "/agent/verification" })}>
              {rejected ? "Resubmit documents" : "View submission"}
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
              <BadgeCheck className="size-3.5" /> Verified agent
            </div>
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
