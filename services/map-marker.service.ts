import { supabase } from "../lib/supabase";

import type {
  MapMarker,
} from "../types/map-markers";


export async function getPublishedMapMarkers(
  mapId: string
): Promise<MapMarker[]> {
  const { data, error } = await supabase
    .from("map_markers")
    .select("*")
    .eq("map_id", mapId)
    .eq("published", true)
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not load map markers: ${error.message}`
    );
  }

  return (data ?? []) as MapMarker[];
}