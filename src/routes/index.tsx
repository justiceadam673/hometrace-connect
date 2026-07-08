import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Home as HomeIcon, LandPlot, MapPin, Search, ShieldCheck, Sparkles, Store, Warehouse } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyCard } from "@/components/property-card";
import { propertiesQuery } from "@/lib/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroImage from "@/assets/hero-property.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HomeTrace — Nigeria's Verified Property Marketplace" },
      {
        name: "description",
        content:
          "Search verified homes, apartments and land across Lagos, Abuja, Port Harcourt and beyond. Connect directly with vetted agents on HomeTrace.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQuery({ featured: true })),
  component: LandingPage,
});

const CATEGORIES = [
  { label: "Houses", type: "house", icon: HomeIcon },
  { label: "Apartments", type: "apartment", icon: Building2 },
  { label: "Duplexes", type: "duplex", icon: HomeIcon },
  { label: "Land", type: "land", icon: LandPlot },
  { label: "Commercial", type: "commercial", icon: Store },
  { label: "Warehouse", type: "warehouse", icon: Warehouse },
] as const;

const NIGERIAN_STATES = ["Lagos", "FCT", "Rivers", "Oyo", "Kano", "Ogun", "Enugu"];

function LandingPage() {
  const { data: featured } = useSuspenseQuery(propertiesQuery({ featured: true }));
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [state, setState] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="px-4 pt-4 pb-16 md:px-6 md:pt-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src={heroImage}
              alt="Modern luxury villa in Lekki, Lagos"
              width={1920}
              height={1080}
              className="aspect-[16/10] w-full object-cover md:aspect-[21/9]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-14">
              <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur">
                <ShieldCheck className="size-3.5" />
                Nigeria's verified marketplace
              </span>
              <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight text-white md:text-6xl">
                Discover homes where trust is the foundation.
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-sm text-white/80 md:text-base">
                Every listing on HomeTrace is verified. Connect directly with vetted agents and top developers across Lagos, Abuja, Port Harcourt and beyond.
              </p>

              {/* Floating search */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate({
                    to: "/properties",
                    search: {
                      q: q || undefined,
                      state: state !== "all" ? state : undefined,
                      property_type: type !== "all" ? type : undefined,
                    },
                  });
                }}
                className="mt-8 flex max-w-4xl flex-col gap-2 rounded-2xl bg-background p-2 shadow-elegant ring-1 ring-black/5 md:flex-row md:items-center"
              >
                <div className="flex flex-1 items-center gap-3 border-b border-border px-4 py-3 md:border-b-0 md:border-r">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Location, estate or LGA"
                    className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex-1 px-2 py-1 md:border-r md:border-border">
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0">
                      <SelectValue placeholder="Any state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any state</SelectItem>
                      {NIGERIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s === "FCT" ? "Abuja (FCT)" : s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 px-2 py-1">
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0">
                      <SelectValue placeholder="Property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any type</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" size="lg" className="rounded-xl">
                  Search properties
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-border/60 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-8 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to="/properties"
                search={{ property_type: cat.type }}
                className="group flex shrink-0 flex-col items-center gap-3"
              >
                <div className="grid size-14 place-items-center rounded-full bg-muted ring-1 ring-black/5 transition-all group-hover:bg-primary-soft group-hover:ring-primary/30">
                  <cat.icon className="size-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Curated selection
              </span>
              <h2 className="mt-2 text-3xl font-semibold text-balance md:text-4xl">
                Featured listings
              </h2>
            </div>
            <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
              <Link to="/properties" search={{}}>
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section id="verified" className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Why HomeTrace
            </span>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-balance md:text-4xl">
              Every property is manually verified for your peace of mind.
            </h2>
            <p className="mt-4 max-w-prose text-pretty text-muted-foreground">
              In the Nigerian real estate market, trust is everything. Our on-the-ground team verifies title documents, physical existence, and agent credentials before a listing goes live.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <TrustItem
                icon={<ShieldCheck className="size-5" />}
                title="Title verification"
                body="Governor's Consent and C of O checked for every listing before publish."
              />
              <TrustItem
                icon={<Sparkles className="size-5" />}
                title="Vetted agents"
                body="Only licensed professionals with proven track records get the verified badge."
              />
              <TrustItem
                icon={<MapPin className="size-5" />}
                title="Real Nigerian coverage"
                body="Lagos, Abuja, Port Harcourt, Ibadan and every state in between."
              />
              <TrustItem
                icon={<Building2 className="size-5" />}
                title="Direct developer access"
                body="Skip the middleman on off-plan projects and estate launches."
              />
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-3xl ring-1 ring-black/5">
              <img
                src={heroImage}
                alt="Verified property in Nigeria"
                width={1200}
                height={1200}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 max-w-[240px] rounded-2xl bg-background p-6 shadow-elegant ring-1 ring-black/5">
              <div className="mb-3 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-trust-soft text-trust">
                  <ShieldCheck className="size-5" />
                </div>
                <span className="text-sm font-semibold">100% secure</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Every transaction is protected by our verification and dispute team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-foreground p-12 text-center md:p-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold text-background text-balance md:text-4xl">
            List your property with Nigeria's most trusted platform.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-background/70">
            Reach verified buyers actively searching in your area. Get your verified agent badge in under 48 hours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/auth">Become a verified agent</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-background/20 bg-background/10 text-background hover:bg-background/20 hover:text-background"
            >
              <Link to="/properties" search={{}}>Browse properties</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function TrustItem({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
