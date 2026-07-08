import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PropertyRow } from "@/lib/properties";

export function myPropertiesQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-properties", userId],
    queryFn: async (): Promise<PropertyRow[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("agent_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PropertyRow[];
    },
    enabled: !!userId,
  });
}

export async function uploadPropertyImage(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("property-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  // Bucket is private; sign a long-lived URL for public display.
  const { data, error: signErr } = await supabase.storage
    .from("property-images")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (signErr) throw signErr;
  return data.signedUrl;
}
