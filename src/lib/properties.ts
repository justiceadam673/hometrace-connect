import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PropertyRow = {
  id: string;
  agent_id: string | null;
  title: string;
  description: string | null;
  price: number;
  listing_type: "sale" | "rent" | "shortlet";
  property_type: "house" | "duplex" | "apartment" | "land" | "commercial" | "office" | "warehouse" | "estate";
  status: "available" | "reserved" | "sold" | "rented" | "draft";
  state: string;
  city: string | null;
  area: string | null;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  parking: number | null;
  sqm: number | null;
  year_built: number | null;
  amenities: string[] | null;
  nearby: string[] | null;
  cover_image: string | null;
  gallery: string[] | null;
  featured: boolean;
  views: number;
  created_at: string;
};

// Resolve seed image paths (/src/assets/...) to Vite-hashed URLs.
const seedAssets = import.meta.glob("/src/assets/property-*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export function resolveImage(src: string | null | undefined): string {
  if (!src) return "";
  if (src.startsWith("/src/assets/")) {
    return seedAssets[src] ?? src;
  }
  return src;
}

export type PropertyFilters = {
  q?: string;
  listing_type?: "sale" | "rent" | "shortlet" | "all";
  property_type?: PropertyRow["property_type"] | "all";
  state?: string | "all";
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  featured?: boolean;
};

export function propertiesQuery(filters: PropertyFilters = {}) {
  return queryOptions({
    queryKey: ["properties", filters],
    queryFn: async (): Promise<PropertyRow[]> => {
      let q = supabase.from("properties").select("*").neq("status", "draft");
      if (filters.q) q = q.ilike("title", `%${filters.q}%`);
      if (filters.listing_type && filters.listing_type !== "all") q = q.eq("listing_type", filters.listing_type);
      if (filters.property_type && filters.property_type !== "all") q = q.eq("property_type", filters.property_type);
      if (filters.state && filters.state !== "all") q = q.eq("state", filters.state);
      if (filters.min_price) q = q.gte("price", filters.min_price);
      if (filters.max_price) q = q.lte("price", filters.max_price);
      if (filters.bedrooms) q = q.gte("bedrooms", filters.bedrooms);
      if (filters.featured) q = q.eq("featured", true);
      const { data, error } = await q.order("featured", { ascending: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PropertyRow[];
    },
  });
}

export function propertyByIdQuery(id: string) {
  return queryOptions({
    queryKey: ["property", id],
    queryFn: async (): Promise<PropertyRow | null> => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return (data ?? null) as PropertyRow | null;
    },
  });
}
