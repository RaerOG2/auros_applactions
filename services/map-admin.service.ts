import { supabase } from "../lib/supabase";

import type {
  AurosMap,
  MapEditorForm,
} from "../types/maps";


function mapFormToDatabase(
  form: MapEditorForm
) {
  return {
    name: form.name.trim(),

    venture_name:
      form.venture_name.trim() || null,

    season_name:
      form.season_name.trim() || null,

    season_number:
      form.season_number.trim() !== ""
        ? Number(form.season_number)
        : null,

    version:
      form.version.trim() || null,

    description:
      form.description.trim() || null,

    image_url:
      form.image_url.trim(),

    thumbnail_url:
      form.thumbnail_url.trim() || null,

    release_date:
      form.release_date || null,

    current:
      form.current,

    published:
      form.published,

    sort_order:
      Number(form.sort_order) || 0,
  };
}


export async function getAdminMaps(): Promise<
  AurosMap[]
> {
  const { data, error } = await supabase
    .from("maps")
    .select("*")
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


export async function getAdminMapById(
  id: string
): Promise<AurosMap | null> {
  const { data, error } = await supabase
    .from("maps")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AurosMap | null;
}


export async function createMap(
  form: MapEditorForm
): Promise<AurosMap> {
  if (!form.name.trim()) {
    throw new Error("Map name is required.");
  }

  if (!form.image_url.trim()) {
    throw new Error("A map image is required.");
  }

  if (form.current) {
    const { error: resetError } = await supabase
      .from("maps")
      .update({
        current: false,
      })
      .eq("current", true);

    if (resetError) {
      throw new Error(
        `Could not reset current map: ${resetError.message}`
      );
    }
  }

  const payload = mapFormToDatabase(form);

  const { data, error } = await supabase
    .from("maps")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Could not create map: ${error.message}${
        error.details ? ` | ${error.details}` : ""
      }${
        error.hint ? ` | Hint: ${error.hint}` : ""
      }`
    );
  }

  return data as AurosMap;
}


export async function updateMap(
  id: string,
  form: MapEditorForm
): Promise<AurosMap> {
  if (!form.name.trim()) {
    throw new Error("Map name is required.");
  }

  if (!form.image_url.trim()) {
    throw new Error("A map image is required.");
  }

  if (form.current) {
    const { error: resetError } = await supabase
      .from("maps")
      .update({
        current: false,
      })
      .eq("current", true)
      .neq("id", id);

    if (resetError) {
      throw new Error(
        `Could not reset current map: ${resetError.message}`
      );
    }
  }

  const payload = mapFormToDatabase(form);

  const { data, error } = await supabase
    .from("maps")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Could not update map: ${error.message}${
        error.details ? ` | ${error.details}` : ""
      }${
        error.hint ? ` | Hint: ${error.hint}` : ""
      }`
    );
  }

  return data as AurosMap;
}


export async function deleteMap(
  id: string
) {
  const { error } = await supabase
    .from("maps")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}


export async function setMapPublished(
  id: string,
  published: boolean
) {
  const { error } = await supabase
    .from("maps")
    .update({
      published,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}


export async function setCurrentMap(
  id: string
) {
  const { error: resetError } =
    await supabase
      .from("maps")
      .update({
        current: false,
      })
      .eq("current", true);

  if (resetError) {
    throw resetError;
  }

  const { error } = await supabase
    .from("maps")
    .update({
      current: true,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}


export async function uploadMapImage(
  file: File,
  type: "map" | "thumbnail"
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error(
      "Only image files are allowed."
    );
  }

  if (file.size > 25 * 1024 * 1024) {
    throw new Error(
      "The image may not exceed 25 MB."
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
    `${type}/${randomId}.${extension}`;

  const { error } = await supabase.storage
    .from("map-images")
    .upload(
      fileName,
      file,
      {
        cacheControl: "3600",
        upsert: false,
      }
    );

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("map-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}