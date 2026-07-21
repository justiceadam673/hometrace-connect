import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "moderator" | "user";

export function myRolesQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-roles", userId],
    queryFn: async (): Promise<AppRole[]> => {
      if (!userId) return [];
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
    enabled: !!userId,
  });
}

export function adminStatsQuery() {
  return queryOptions({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        usersC, agentsC, verifiedAgentsC, pendingAgentsC,
        propsC, housesC, landsC, aptsC, estatesC, rentalsC,
        salesC, reportsPendingC,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("agents").select("*", { count: "exact", head: true }),
        supabase.from("agents").select("*", { count: "exact", head: true }).eq("verification", "verified"),
        supabase.from("agents").select("*", { count: "exact", head: true }).eq("verification", "pending"),
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("property_type", "house"),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("property_type", "land"),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("property_type", "apartment"),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("listing_type", "rent"),
        supabase.from("unit_sales").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      return {
        users: usersC.count ?? 0,
        agents: agentsC.count ?? 0,
        verifiedAgents: verifiedAgentsC.count ?? 0,
        pendingVerifications: pendingAgentsC.count ?? 0,
        properties: propsC.count ?? 0,
        houses: housesC.count ?? 0,
        lands: landsC.count ?? 0,
        apartments: aptsC.count ?? 0,
        estates: estatesC.count ?? 0,
        rentals: rentalsC.count ?? 0,
        sales: salesC.count ?? 0,
        pendingReports: reportsPendingC.count ?? 0,
      };
    },
  });
}

export function adminUsersQuery() {
  return queryOptions({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, phone, role, is_suspended, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function adminAgentsQuery() {
  return queryOptions({
    queryKey: ["admin-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("id, company, verification, rating, review_count, years_experience, license_number, business_name, nin_number, kyc_address, nin_document_url, cofo_document_url, id_selfie_url, kyc_submitted_at, bio, created_at, profiles!inner(full_name, avatar_url, phone)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function adminDevelopersQuery() {
  return queryOptions({
    queryKey: ["admin-developers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("developers")
        .select("id, company_name, logo_url, website, email, phone, headquarters, established_year, description, verification, featured, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function adminListingsQuery() {
  return queryOptions({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, price, state, city, status, listing_type, property_type, featured, cover_image, agent_id, created_at, views")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function adminReportsQuery() {
  return queryOptions({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*, properties(title, id)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function announcementsQuery() {
  return queryOptions({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function blogPostsQuery() {
  return queryOptions({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function faqsQuery() {
  return queryOptions({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function analyticsQuery() {
  return queryOptions({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data: props } = await supabase.from("properties").select("created_at, price, property_type, listing_type").order("created_at", { ascending: false }).limit(500);
      const { data: sales } = await supabase.from("unit_sales").select("sale_date, sale_price").order("sale_date", { ascending: false }).limit(500);
      return { props: props ?? [], sales: sales ?? [] };
    },
  });
}
