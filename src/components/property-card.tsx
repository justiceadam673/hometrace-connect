import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bath, BedDouble, Heart, MapPin, Ruler, ShieldCheck } from "lucide-react";
import type { PropertyRow } from "@/lib/properties";
import { resolveImage } from "@/lib/properties";
import { agentVerificationByIdQuery } from "@/lib/agent-kyc";
import { formatNaira } from "@/lib/format";

export function PropertyCard({ property }: { property: PropertyRow }) {
  const img = resolveImage(property.cover_image);
  const { data: agentVerification } = useQuery(agentVerificationByIdQuery(property.agent_id));
  const isAgentVerified = agentVerification === "verified";
  const priceSuffix = property.listing_type === "rent" ? "/year" : property.listing_type === "shortlet" ? "/night" : "";

  return (
    <Link
      to="/properties/$id"
      params={{ id: property.id }}
      className="group block"
    >
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-muted ring-1 ring-black/5">
        <div className="aspect-[4/3] w-full">
          {img ? (
            <img
              src={img}
              alt={property.title}
              width={1200}
              height={900}
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="absolute left-4 top-4 flex gap-2">
          {isAgentVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground ring-1 ring-black/5">
              <ShieldCheck className="size-3 text-primary" />
              Verified
            </span>
          ) : null}
          {property.featured ? (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              Featured
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-background/90 text-muted-foreground ring-1 ring-black/5 transition-colors hover:text-primary"
          aria-label="Save property"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <Heart className="size-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-medium leading-tight text-foreground text-balance line-clamp-2">
            {property.title}
          </h3>
          <span className="shrink-0 text-base font-semibold">
            {formatNaira(property.price)}
            {priceSuffix ? <span className="text-xs font-normal text-muted-foreground">{priceSuffix}</span> : null}
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {[property.area, property.city, property.state].filter(Boolean).join(", ")}
        </p>
        <div className="flex items-center gap-4 border-t border-border/60 pt-3 text-xs font-medium text-muted-foreground">
          {property.bedrooms ? (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="size-3.5" /> {property.bedrooms} beds
            </span>
          ) : null}
          {property.bathrooms ? (
            <span className="inline-flex items-center gap-1.5">
              <Bath className="size-3.5" /> {property.bathrooms} baths
            </span>
          ) : null}
          {property.sqm ? (
            <span className="inline-flex items-center gap-1.5">
              <Ruler className="size-3.5" /> {property.sqm} sqm
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
