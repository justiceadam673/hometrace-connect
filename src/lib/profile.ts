import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
};

export function myProfileQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-profile", userId],
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, phone, whatsapp_number, email, bio, company, location")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Profile | null;
    },
    enabled: !!userId,
  });
}

export function profileByIdQuery(userId: string | null | undefined) {
  return queryOptions({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, phone, whatsapp_number, email, bio, company, location")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Profile | null;
    },
    enabled: !!userId,
  });
}

/** Normalise to E.164-ish digits for wa.me / tel: links. */
export function normalisePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Keep leading + if present, strip everything else non-digit
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  // Nigerian local format: 0XXXXXXXXXX -> 234XXXXXXXXXX
  if (!hasPlus && digits.startsWith("0") && digits.length === 11) {
    digits = "234" + digits.slice(1);
  }
  return digits;
}

export function waLink(phone: string | null | undefined, message?: string): string | null {
  const digits = normalisePhone(phone);
  if (!digits) return null;
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${q}`;
}

export function telLink(phone: string | null | undefined): string | null {
  const digits = normalisePhone(phone);
  if (!digits) return null;
  return `tel:+${digits}`;
}
