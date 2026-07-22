import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { BadgeCheck, MapPin, Phone, MessageCircle, ShieldCheck, User as UserIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { waLink, telLink } from "@/lib/profile";

type VerifiedAgent = {
  id: string;
  company: string | null;
  business_name: string | null;
  bio: string | null;
  years_experience: number | null;
  rating: number | null;
  review_count: number;
  kyc_address: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    whatsapp_number: string | null;
    location: string | null;
  } | null;
};

function verifiedAgentsQuery() {
  return queryOptions({
    queryKey: ["verified-agents"],
    queryFn: async (): Promise<VerifiedAgent[]> => {
      const { data, error } = await supabase
        .from("agents")
        .select("id, company, business_name, bio, years_experience, rating, review_count, kyc_address, profiles!inner(full_name, avatar_url, phone, whatsapp_number, location)")
        .eq("verification", "verified")
        .order("rating", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as unknown as VerifiedAgent[];
    },
  });
}

export const Route = createFileRoute("/agents")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(verifiedAgentsQuery());
    return null;
  },
  head: () => ({
    meta: [
      { title: "Verified Agents — HomeTrace" },
      { name: "description", content: "Meet HomeTrace's admin-verified real estate agents across Nigeria. All KYC'd, all trusted." },
      { property: "og:title", content: "Verified Agents — HomeTrace" },
      { property: "og:description", content: "Browse Nigeria's verified real estate agents — every one KYC-approved by HomeTrace." },
    ],
  }),
  component: VerifiedAgentsPage,
  errorComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <p className="text-muted-foreground">Could not load agents. Please refresh.</p>
    </div>
  ),
});

function VerifiedAgentsPage() {
  const { data: agents } = useSuspenseQuery(verifiedAgentsQuery());

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="size-3.5" /> Trusted network
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Verified agents</h1>
          <p className="mt-3 text-muted-foreground">
            Every agent below has completed HomeTrace KYC (NIN, C of O, ID verification) and been manually approved by our admin team.
          </p>
        </div>

        {agents.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No verified agents yet. Check back soon.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => {
              const name = a.business_name || a.profiles?.full_name || "HomeTrace Agent";
              const initials = (name.match(/\b\w/g) ?? ["H", "T"]).slice(0, 2).join("").toUpperCase();
              const loc = a.kyc_address || a.profiles?.location;
              const wa = waLink(a.profiles?.whatsapp_number || a.profiles?.phone, `Hi ${name}, I found you on HomeTrace.`);
              const tel = telLink(a.profiles?.phone || a.profiles?.whatsapp_number);
              return (
                <article key={a.id} className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-elegant">
                  <div className="flex items-center gap-4">
                    <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-primary font-semibold">
                      {a.profiles?.avatar_url ? (
                        <img src={a.profiles.avatar_url} alt={name} className="size-full object-cover" />
                      ) : (
                        <span>{initials || <UserIcon className="size-6" />}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="truncate text-base font-semibold">{name}</h2>
                        <BadgeCheck className="size-4 shrink-0 text-primary" />
                      </div>
                      {a.company ? <p className="truncate text-xs text-muted-foreground">{a.company}</p> : null}
                    </div>
                  </div>
                  {loc ? (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" /> {loc}
                    </p>
                  ) : null}
                  {a.bio ? <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{a.bio}</p> : null}
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    {a.years_experience ? <span>{a.years_experience}y experience</span> : null}
                    {a.rating ? <span>★ {Number(a.rating).toFixed(1)} ({a.review_count})</span> : null}
                  </div>
                  <div className="mt-5 flex gap-2">
                    {wa ? (
                      <Button asChild size="sm" className="flex-1">
                        <a href={wa} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="size-4" /> WhatsApp
                        </a>
                      </Button>
                    ) : null}
                    {tel ? (
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <a href={tel}>
                          <Phone className="size-4" /> Call
                        </a>
                      </Button>
                    ) : null}
                    {!wa && !tel ? (
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to="/properties" search={{}}>See listings</Link>
                      </Button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
