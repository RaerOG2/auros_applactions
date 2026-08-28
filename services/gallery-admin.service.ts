import {
  supabase,
} from "../lib/supabase";

import type {
  GalleryEditorForm,
  GalleryItem,
} from "../types/community";

export async function getAdminGallery(): Promise<
  GalleryItem[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("gallery")
      .select("*")
      .order(
        "featured",
        {
          ascending:
            false,
        }
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as GalleryItem[];
}

export async function getAdminGalleryById(
  id: string
): Promise<
  GalleryItem | null
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("gallery")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data as
    | GalleryItem
    | null;
}

export async function createGalleryItem(
  form: GalleryEditorForm
) {
  const {
    data,
    error,
  } =
    await supabase
      .from("gallery")
      .insert({
        title:
          form.title.trim(),

        image_url:
          form.image_url.trim(),

        category:
          form.category.trim() ||
          null,

        description:
          form.description.trim() ||
          null,

        featured:
          form.featured,

        published:
          form.published,
      })
      .select("*")
      .single();

  if (error) {
    throw error;
  }

  return data as GalleryItem;
}

export async function updateGalleryItem(
  id: string,
  form: GalleryEditorForm
) {
  const {
    data,
    error,
  } =
    await supabase
      .from("gallery")
      .update({
        title:
          form.title.trim(),

        image_url:
          form.image_url.trim(),

        category:
          form.category.trim() ||
          null,

        description:
          form.description.trim() ||
          null,

        featured:
          form.featured,

        published:
          form.published,
      })
      .eq("id", id)
      .select("*")
      .single();

  if (error) {
    throw error;
  }

  return data as GalleryItem;
}

export async function deleteGalleryItem(
  id: string
) {
  const {
    error,
  } =
    await supabase
      .from("gallery")
      .delete()
      .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function setGalleryPublished(
  id: string,
  published: boolean
) {
  const {
    error,
  } =
    await supabase
      .from("gallery")
      .update({
        published,
      })
      .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function setGalleryFeatured(
  id: string,
  featured: boolean
) {
  const {
    error,
  } =
    await supabase
      .from("gallery")
      .update({
        featured,
      })
      .eq("id", id);

  if (error) {
    throw error;
  }
}

function cleanFilename(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /[^a-z0-9._-]/g,
      ""
    )
    .slice(
      0,
      100
    );
}

export async function uploadGalleryImage(
  file: File
) {
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
    15 *
      1024 *
      1024
  ) {
    throw new Error(
      "Maximum image size is 15 MB."
    );
  }

  const {
    data: authData,
  } =
    await supabase.auth.getUser();

  if (
    !authData.user
  ) {
    throw new Error(
      "You are not logged in."
    );
  }

  const name =
    cleanFilename(
      file.name
    ) || "gallery-image";

  const path =
    `${authData.user.id}/` +
    `${Date.now()}-${name}`;

  const {
    error,
  } =
    await supabase.storage
      .from(
        "gallery-images"
      )
      .upload(
        path,
        file,
        {
          cacheControl:
            "3600",

          upsert:
            false,

          contentType:
            file.type,
        }
      );

  if (error) {
    throw error;
  }

  const {
    data,
  } =
    supabase.storage
      .from(
        "gallery-images"
      )
      .getPublicUrl(
        path
      );

  return data.publicUrl;
}