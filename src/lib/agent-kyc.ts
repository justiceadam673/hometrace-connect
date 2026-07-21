import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AgentRow = {
  id: string;
  company: string | null;
  bio: string | null;
  years_experience: number | null;
  license_number: string | null;
  verification: "unverified" | "pending" | "verified";
  rating: number | null;
  review_count: number;
  nin_number: string | null;
  nin_document_url: string | null;
  cofo_document_url: string | null;
  id_selfie_url: string | null;
  business_name: string | null;
  kyc_address: string | null;
  kyc_submitted_at: string | null;
};

export function myAgentQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-agent", userId],
    queryFn: async (): Promise<AgentRow | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as AgentRow | null;
    },
    enabled: !!userId,
  });
}

export function agentVerificationByIdQuery(userId: string | null | undefined) {
  return queryOptions({
    queryKey: ["agent-verification", userId],
    queryFn: async (): Promise<"unverified" | "pending" | "verified" | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("agents")
        .select("verification")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data?.verification ?? null) as "unverified" | "pending" | "verified" | null;
    },
    enabled: !!userId,
  });
}

export function isAgentKycSubmitted(agent: AgentRow | null | undefined) {
  return !!agent?.kyc_submitted_at;
}

export function isAgentVerified(agent: AgentRow | null | undefined) {
  return agent?.verification === "verified";
}
