import { supabase } from "../lib/supabase";

import type {
  CommunityPatchnote,
  GalleryItem,
  NewsItem,
} from "../types/community";

export async function getPublishedPatchnotes(
  limit?: number
): Promise<CommunityPatchnote[]> {
  let query = supabase
    .from("patchnotes")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as CommunityPatchnote[];
}

export async function getPatchnoteBySlug(
  slug: string
): Promise<CommunityPatchnote | null> {
  const { data, error } = await supabase
    .from("patchnotes")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as CommunityPatchnote | null;
}

export async function getPublishedNews(
  limit?: number
): Promise<NewsItem[]> {
  let query = supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as NewsItem[];
}

export async function getNewsBySlug(
  slug: string
): Promise<NewsItem | null> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as NewsItem | null;
}

export async function getPublishedGallery(
  limit?: number
): Promise<GalleryItem[]> {
  let query = supabase
    .from("gallery")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as GalleryItem[];
}