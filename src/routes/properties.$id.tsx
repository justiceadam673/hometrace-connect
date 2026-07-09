import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Car,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Share2,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { propertyByIdQuery, resolveImage } from "@/lib/properties";
import { profileByIdQuery, waLink, telLink } from "@/lib/profile";
import { formatNairaFull } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/properties/$id")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(propertyByIdQuery(params.id));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Property — HomeTrace" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} — HomeTrace`;
    const description = `${loaderData.title} in ${[loaderData.area, loaderData.city, loaderData.state].filter(Boolean).join(", ")}. Verified on HomeTrace.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PropertyDetail,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Property not found</h1>
        <p className="mt-2 text-muted-foreground">This listing may have been removed.</p>
        <Button asChild className="mt-4">
          <Link to="/properties" search={{}}>Browse listings</Link>
        </Button>
      </div>
    </div>
  ),
});

function PropertyDetail() {
  const params = Route.useParams();
  const { data: property } = useSuspenseQuery(propertyByIdQuery(params.id));
  if (!property) return null;

  const img = resolveImage(property.cover_image);
  const location = [property.area, property.city, property.state].filter(Boolean).join(", ");
  const priceSuffix = property.listing_type === "rent" ? " /year" : property.listing_type === "shortlet" ? " /night" : "";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <Link
          to="/properties"
          search={{}}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to listings
        </Link>
      </div>

      {/* Gallery */}
      <section className="px-6 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2">
            <div className="md:col-span-2 md:row-span-2">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-black/5">
                {img ? (
                  <img
                    src={img}
                    alt={property.title}
                    width={1600}
                    height={1200}
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="hidden aspect-[4/3] overflow-hidden rounded-2xl bg-muted ring-1 ring-black/5 md:block">
                {img ? (
                  <img
                    src={img}
                    alt={`${property.title} view ${i + 2}`}
                    width={800}
                    height={600}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          {/* Main */}
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <ShieldCheck className="size-3.5" /> Verified listing
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                For {property.listing_type}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-muted-foreground">
                {property.property_type}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              {property.title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4" /> {location}
            </p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-primary md:text-4xl">
                {formatNairaFull(property.price)}
              </span>
              {priceSuffix ? <span className="text-sm text-muted-foreground">{priceSuffix}</span> : null}
            </div>

            {/* Spec grid */}
            <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-card p-6 md:grid-cols-4">
              <SpecItem icon={<BedDouble className="size-4" />} label="Bedrooms" value={property.bedrooms ?? "—"} />
              <SpecItem icon={<Bath className="size-4" />} label="Bathrooms" value={property.bathrooms ?? "—"} />
              <SpecItem icon={<Car className="size-4" />} label="Parking" value={property.parking ?? "—"} />
              <SpecItem icon={<Ruler className="size-4" />} label="Size" value={property.sqm ? `${property.sqm} sqm` : "—"} />
            </div>

            <h2 className="mt-10 text-xl font-semibold">Description</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              {property.description || "No description provided."}
            </p>

            {property.amenities && property.amenities.length > 0 ? (
              <>
                <h2 className="mt-10 text-xl font-semibold">Amenities</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {property.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                      <Sparkles className="size-4 text-primary" />
                      {a}
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {property.nearby && property.nearby.length > 0 ? (
              <>
                <h2 className="mt-10 text-xl font-semibold">What's nearby</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {property.nearby.map((n) => (
                    <div key={n} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="size-4 text-trust" /> {n}
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {property.year_built ? (
              <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" /> Built in {property.year_built}
              </p>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="md:sticky md:top-24 md:self-start">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-elegant">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary text-sm font-semibold">
                  HT
                </div>
                <div>
                  <p className="text-sm font-semibold">HomeTrace Verified Agent</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ShieldCheck className="size-3 text-primary" /> Verified · Responds within 24h
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button className="w-full" size="lg" onClick={() => toast("Sign in to chat with the agent", { description: "Create a free account to start a conversation." })}>
                  <MessageCircle className="size-4" /> Chat with agent
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={() => toast("Sign in to reveal contact details")}>
                  <Phone className="size-4" /> Call agent
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => toast("Inspection scheduling is coming soon")}
                >
                  <Calendar className="size-4" /> Schedule inspection
                </Button>
              </div>

              <div className="mt-6 flex justify-between border-t border-border/60 pt-4">
                <button
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  onClick={() => toast("Sign in to save this property")}
                >
                  <Heart className="size-4" /> Save
                </button>
                <button
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard");
                    } catch {
                      toast.error("Could not copy link");
                    }
                  }}
                >
                  <Share2 className="size-4" /> Share
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-trust-soft p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-trust">
                <ShieldCheck className="size-4" /> Buy with confidence
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                This listing has been manually verified by the HomeTrace team. Title documents were reviewed and the property physically inspected.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
