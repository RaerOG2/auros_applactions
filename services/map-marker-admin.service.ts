import { supabase } from "../lib/supabase";

import type {
  MapMarker,
  MapMarkerForm,
} from "../types/map-markers";


function markerFormToDatabase(
  mapId: string,
  form: MapMarkerForm
) {
  return {
    map_id: mapId,

    name: form.name.trim(),

    type: form.type,

    description:
      form.description.trim() || null,

    image_url:
      form.image_url.trim() || null,

    icon:
      form.icon.trim() || null,

    x: Number(form.x),
    y: Number(form.y),

    published:
      form.published,

    sort_order:
      Number(form.sort_order) || 0,
  };
}


export async function getAdminMapMarkers(
  mapId: string
): Promise<MapMarker[]> {
  const { data, error } = await supabase
    .from("map_markers")
    .select("*")
    .eq("map_id", mapId)
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not load markers: ${error.message}`
    );
  }

  return (data ?? []) as MapMarker[];
}


export async function createMapMarker(
  mapId: string,
  form: MapMarkerForm
): Promise<MapMarker> {
  if (!form.name.trim()) {
    throw new Error(
      "Marker name is required."
    );
  }

  const { data, error } = await supabase
    .from("map_markers")
    .insert(
      markerFormToDatabase(
        mapId,
        form
      )
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Could not create marker: ${error.message}`
    );
  }

  return data as MapMarker;
}


export async function updateMapMarker(
  markerId: string,
  mapId: string,
  form: MapMarkerForm
): Promise<MapMarker> {
  const { data, error } = await supabase
    .from("map_markers")
    .update(
      markerFormToDatabase(
        mapId,
        form
      )
    )
    .eq("id", markerId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Could not update marker: ${error.message}`
    );
  }

  return data as MapMarker;
}


export async function deleteMapMarker(
  markerId: string
) {
  const { error } = await supabase
    .from("map_markers")
    .delete()
    .eq("id", markerId);

  if (error) {
    throw new Error(
      `Could not delete marker: ${error.message}`
    );
  }
}


export async function uploadMarkerImage(
  file: File
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error(
      "Only image files are allowed."
    );
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error(
      "Marker images may not exceed 15 MB."
    );
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() || "png";

  const randomId =
    `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 12)}`;

  const fileName =
    `markers/${randomId}.${extension}`;

  const { error } = await supabase.storage
    .from("map-marker-images")
    .upload(
      fileName,
      file,
      {
        cacheControl: "3600",
        upsert: false,
      }
    );

  if (error) {
    throw new Error(
      `Marker image upload failed: ${error.message}`
    );
  }

  const { data } = supabase.storage
    .from("map-marker-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}