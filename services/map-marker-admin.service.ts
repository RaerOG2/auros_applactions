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

export async function getAllAdminMapMarkers(): Promise<
  MapMarker[]
> {
  const { data, error } = await supabase
    .from("map_markers")
    .select("*")
    .order("map_id", {
      ascending: true,
    })
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

export async function deleteAllMapMarkers(
  mapId: string
) {
  const { error } = await supabase
    .from("map_markers")
    .delete()
    .eq("map_id", mapId);

  if (error) {
    throw new Error(
      `Could not delete markers: ${error.message}`
    );
  }
}

/* =========================================================
   COPY MARKERS
========================================================= */

export async function copyMapMarkers(
  sourceMapId: string,
  targetMapId: string,
  options?: {
    replaceExisting?: boolean;
  }
): Promise<number> {
  if (
    !sourceMapId ||
    !targetMapId
  ) {
    throw new Error(
      "Source and target map are required."
    );
  }

  if (
    sourceMapId ===
    targetMapId
  ) {
    throw new Error(
      "Source and target map cannot be the same."
    );
  }

  const sourceMarkers =
    await getAdminMapMarkers(
      sourceMapId
    );

  if (
    sourceMarkers.length ===
    0
  ) {
    throw new Error(
      "The source map has no markers."
    );
  }

  if (
    options?.replaceExisting
  ) {
    await deleteAllMapMarkers(
      targetMapId
    );
  }

  const rows =
    sourceMarkers.map(
      (marker) => ({
        map_id:
          targetMapId,

        name:
          marker.name,

        type:
          marker.type,

        description:
          marker.description,

        image_url:
          marker.image_url,

        icon:
          marker.icon,

        x:
          Number(
            marker.x
          ),

        y:
          Number(
            marker.y
          ),

        published:
          marker.published,

        sort_order:
          marker.sort_order,
      })
    );

  const { error } =
    await supabase
      .from("map_markers")
      .insert(rows);

  if (error) {
    throw new Error(
      `Could not copy markers: ${error.message}`
    );
  }

  return rows.length;
}

/* =========================================================
   COPY SELECTED MARKERS
========================================================= */

export async function copySelectedMapMarkers(
  markerIds: string[],
  targetMapId: string
): Promise<number> {
  if (
    markerIds.length === 0
  ) {
    throw new Error(
      "No markers selected."
    );
  }

  const { data, error } =
    await supabase
      .from("map_markers")
      .select("*")
      .in(
        "id",
        markerIds
      );

  if (error) {
    throw new Error(
      `Could not load selected markers: ${error.message}`
    );
  }

  const markers =
    (data ?? []) as MapMarker[];

  if (
    markers.length ===
    0
  ) {
    throw new Error(
      "No markers found."
    );
  }

  const rows =
    markers.map(
      (marker) => ({
        map_id:
          targetMapId,

        name:
          marker.name,

        type:
          marker.type,

        description:
          marker.description,

        image_url:
          marker.image_url,

        icon:
          marker.icon,

        x:
          Number(
            marker.x
          ),

        y:
          Number(
            marker.y
          ),

        published:
          marker.published,

        sort_order:
          marker.sort_order,
      })
    );

  const {
    error: insertError,
  } = await supabase
    .from("map_markers")
    .insert(rows);

  if (insertError) {
    throw new Error(
      `Could not copy selected markers: ${insertError.message}`
    );
  }

  return rows.length;
}

/* =========================================================
   IMAGE UPLOAD
========================================================= */

export async function uploadMarkerImage(
  file: File
): Promise<string> {
  if (
    !file.type.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Only image files are allowed."
    );
  }

  if (
    file.size >
    15 * 1024 * 1024
  ) {
    throw new Error(
      "Marker images may not exceed 15 MB."
    );
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "png";

  const randomId =
    `${Date.now()}-${Math.random()
      .toString(36)
      .substring(
        2,
        12
      )}`;

  const fileName =
    `markers/${randomId}.${extension}`;

  const { error } =
    await supabase.storage
      .from(
        "map-marker-images"
      )
      .upload(
        fileName,
        file,
        {
          cacheControl:
            "3600",
          upsert: false,
        }
      );

  if (error) {
    throw new Error(
      `Marker image upload failed: ${error.message}`
    );
  }

  const { data } =
    supabase.storage
      .from(
        "map-marker-images"
      )
      .getPublicUrl(
        fileName
      );

  return data.publicUrl;
}