import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Developer = {
  id: string;
  company_name: string;
  slug: string | null;
  logo_url: string | null;
  cover_url: string | null;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  headquarters: string | null;
  established_year: number | null;
  verification: "unverified" | "pending" | "verified";
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectStatus =
  | "planning"
  | "pre_launch"
  | "selling"
  | "sold_out"
  | "completed";

export type Project = {
  id: string;
  developer_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  state: string;
  city: string | null;
  area: string | null;
  address: string | null;
  cover_image: string | null;
  gallery: string[] | null;
  layout_image: string | null;
  brochure_url: string | null;
  total_units: number | null;
  starting_price: number | null;
  status: ProjectStatus;
  launch_date: string | null;
  completion_date: string | null;
  amenities: string[] | null;
  featured: boolean;
  views: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type UnitStatus = "available" | "reserved" | "sold";

export type Unit = {
  id: string;
  project_id: string;
  developer_id: string;
  unit_number: string;
  unit_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqm: number | null;
  price: number;
  status: UnitStatus;
  floor_plan_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type UnitSale = {
  id: string;
  unit_id: string;
  project_id: string;
  developer_id: string;
  buyer_name: string;
  buyer_email: string | null;
  buyer_phone: string | null;
  sale_price: number;
  deposit: number | null;
  sale_date: string;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
};

export type TeamRole = "admin" | "manager" | "agent" | "viewer";

export type TeamMember = {
  id: string;
  developer_id: string;
  user_id: string | null;
  invite_email: string | null;
  full_name: string | null;
  role: TeamRole;
  created_at: string;
};

export function myDeveloperQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-developer", userId],
    queryFn: async (): Promise<Developer | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("developers")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Developer | null;
    },
    enabled: !!userId,
  });
}

export function projectsQuery(developerId: string | undefined) {
  return queryOptions({
    queryKey: ["dev-projects", developerId],
    queryFn: async (): Promise<Project[]> => {
      if (!developerId) return [];
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("developer_id", developerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
    enabled: !!developerId,
  });
}

export function projectByIdQuery(id: string) {
  return queryOptions({
    queryKey: ["project", id],
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Project | null;
    },
  });
}

export function unitsQuery(projectId: string) {
  return queryOptions({
    queryKey: ["project-units", projectId],
    queryFn: async (): Promise<Unit[]> => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("project_id", projectId)
        .order("unit_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Unit[];
    },
  });
}

export function salesByProjectQuery(projectId: string) {
  return queryOptions({
    queryKey: ["project-sales", projectId],
    queryFn: async (): Promise<UnitSale[]> => {
      const { data, error } = await supabase
        .from("unit_sales")
        .select("*")
        .eq("project_id", projectId)
        .order("sale_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UnitSale[];
    },
  });
}

export function allSalesQuery(developerId: string | undefined) {
  return queryOptions({
    queryKey: ["dev-sales", developerId],
    queryFn: async (): Promise<UnitSale[]> => {
      if (!developerId) return [];
      const { data, error } = await supabase
        .from("unit_sales")
        .select("*")
        .eq("developer_id", developerId)
        .order("sale_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UnitSale[];
    },
    enabled: !!developerId,
  });
}

export function teamQuery(developerId: string | undefined) {
  return queryOptions({
    queryKey: ["dev-team", developerId],
    queryFn: async (): Promise<TeamMember[]> => {
      if (!developerId) return [];
      const { data, error } = await supabase
        .from("developer_team")
        .select("*")
        .eq("developer_id", developerId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TeamMember[];
    },
    enabled: !!developerId,
  });
}
