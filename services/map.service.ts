import { supabase } from "../lib/supabase";

import type {
  AurosMap,
} from "../types/maps";

/* =========================================================
   PUBLIC MAPS

   Public visitors only receive:
   - published maps
   - non-development maps
   ========================================================= */

export async function getPublishedMaps(): Promise<
  AurosMap[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("maps")
    .select("*")
    .eq(
      "published",
      true
    )
    .eq(
      "dev_only",
      false
    )
    .order(
      "current",
      {
        ascending: false,
      }
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "release_date",
      {
        ascending: false,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as AurosMap[];
}

/* =========================================================
   PUBLIC MAP BY SLUG

   DEV maps can never be loaded through
   the normal public slug query.
   ========================================================= */

export async function getPublishedMapBySlug(
  slug: string
): Promise<
  AurosMap | null
> {
  const {
    data,
    error,
  } = await supabase
    .from("maps")
    .select("*")
    .eq(
      "slug",
      slug
    )
    .eq(
      "published",
      true
    )
    .eq(
      "dev_only",
      false
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AurosMap | null;
}

/* =========================================================
   DEVELOPMENT MAPS

   DEV maps are intentionally NOT filtered by published.

   A DEV map may be:
   - unfinished
   - unpublished
   - used for marker testing
   - used for future map testing

   Access must only be granted to admins by the caller
   and later additionally protected through Supabase RLS.
   ========================================================= */

export async function getDevMaps(): Promise<
  AurosMap[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("maps")
    .select("*")
    .eq(
      "dev_only",
      true
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "release_date",
      {
        ascending: false,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Could not load development maps: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as AurosMap[];
}