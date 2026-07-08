import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Filter, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyCard } from "@/components/property-card";
import { propertiesQuery } from "@/lib/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const searchSchema = z.object({
  q: z.string().optional(),
  listing_type: z.enum(["sale", "rent", "shortlet", "all"]).optional(),
  property_type: z
    .enum(["house", "duplex", "apartment", "land", "commercial", "office", "warehouse", "estate", "all"])
    .optional(),
  state: z.string().optional(),
  bedrooms: z.coerce.number().optional(),
});

export const Route = createFileRoute("/properties/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      propertiesQuery({
        q: deps.q,
        listing_type: deps.listing_type,
        property_type: deps.property_type,
        state: deps.state,
        bedrooms: deps.bedrooms,
      }),
    ),
  head: ({ params: _p }) => ({
    meta: [
      { title: "Property Listings — HomeTrace Nigeria" },
      {
        name: "description",
        content:
          "Browse verified homes, apartments, land and commercial property for sale and rent across Nigeria on HomeTrace.",
      },
    ],
  }),
  component: PropertiesPage,
});

const NIGERIAN_STATES = ["Lagos", "FCT", "Rivers", "Oyo", "Kano", "Ogun", "Enugu"];

function PropertiesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(
    propertiesQuery({
      q: search.q,
      listing_type: search.listing_type,
      property_type: search.property_type,
      state: search.state,
      bedrooms: search.bedrooms,
    }),
  );

  const update = (patch: Record<string, unknown>) =>
    navigate({ to: "/properties", search: { ...search, ...patch } });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="border-b border-border/60 bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold md:text-3xl">Property listings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.length} verified {data.length === 1 ? "property" : "properties"} across Nigeria
              </p>
            </div>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back home
            </Link>
          </div>

          {/* Filter bar */}
          <div className="flex flex-col gap-2 rounded-2xl bg-background p-2 shadow-sm ring-1 ring-black/5 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2 border-b border-border px-3 py-2 md:border-b-0 md:border-r">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <Input
                defaultValue={search.q ?? ""}
                onChange={(e) => update({ q: e.target.value || undefined })}
                placeholder="Search by title or location"
                className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex-1 md:border-r md:border-border">
              <Select
                value={search.listing_type ?? "all"}
                onValueChange={(v) => update({ listing_type: v === "all" ? undefined : v })}
              >
                <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0">
                  <SelectValue placeholder="Sale or rent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All listings</SelectItem>
                  <SelectItem value="sale">For sale</SelectItem>
                  <SelectItem value="rent">For rent</SelectItem>
                  <SelectItem value="shortlet">Shortlet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 md:border-r md:border-border">
              <Select
                value={search.property_type ?? "all"}
                onValueChange={(v) => update({ property_type: v === "all" ? undefined : v })}
              >
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
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select
                value={search.state ?? "all"}
                onValueChange={(v) => update({ state: v === "all" ? undefined : v })}
              >
                <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any state</SelectItem>
                  {NIGERIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s === "FCT" ? "Abuja (FCT)" : s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/properties", search: {} })}
              className="hidden md:inline-flex"
            >
              <Filter className="size-4" /> Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {data.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border p-16 text-center">
            <p className="text-lg font-medium">No properties match those filters.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try widening your search.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate({ to: "/properties", search: {} })}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
