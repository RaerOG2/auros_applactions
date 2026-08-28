import { supabase } from "../lib/supabase";

export type SiteAnnouncement = {
  enabled: boolean;
  title: string | null;
  message: string | null;
};

export async function getSiteAnnouncement(): Promise<SiteAnnouncement> {
  const { data, error } = await supabase
    .from("site_announcements")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to load site announcement.");
  }

  return {
    enabled: !!data?.enabled,
    title: data?.title ?? null,
    message: data?.message ?? null,
  };
}

export async function updateSiteAnnouncement(input: {
  enabled: boolean;
  title?: string | null;
  message?: string | null;
}) {
  const { error } = await supabase.from("site_announcements").upsert({
    id: "main",
    enabled: input.enabled,
    title: input.title ?? null,
    message: input.message ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message || "Failed to update site announcement.");
  }
}