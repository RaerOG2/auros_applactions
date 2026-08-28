import { supabase } from "../lib/supabase";

import type { AurosMap } from "../types/maps";

export async function getPublishedMaps(): Promise<AurosMap[]> {
  const { data, error } = await supabase
    .from("maps")
    .select("*")
    .eq("published", true)
    .order("current", {
      ascending: false,
    })
    .order("sort_order", {
      ascending: true,
    })
    .order("release_date", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as AurosMap[];
}

export async function getPublishedMapBySlug(
  slug: string
): Promise<AurosMap | null> {
  const { data, error } = await supabase
    .from("maps")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AurosMap | null;
}