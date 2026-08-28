import {
  supabase,
} from "../lib/supabase";

import type {
  NewsEditorForm,
  NewsItem,
} from "../types/community";

export async function getAdminNews(): Promise<
  NewsItem[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("news")
      .select("*")
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
  ) as NewsItem[];
}

export async function getAdminNewsById(
  id: string
): Promise<
  NewsItem | null
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data as
    | NewsItem
    | null;
}

export async function createNewsItem(
  form: NewsEditorForm
) {
  const {
    data,
    error,
  } =
    await supabase
      .from("news")
      .insert({
        title:
          form.title.trim(),

        slug:
          form.slug.trim(),

        summary:
          form.summary.trim() ||
          null,

        content:
          form.content.trim() ||
          null,

        image_url:
          form.image_url.trim() ||
          null,

        pinned:
          form.pinned,

        published:
          form.published,
      })
      .select("*")
      .single();

  if (error) {
    throw error;
  }

  return data as NewsItem;
}

export async function updateNewsItem(
  id: string,
  form: NewsEditorForm
) {
  const {
    data,
    error,
  } =
    await supabase
      .from("news")
      .update({
        title:
          form.title.trim(),

        slug:
          form.slug.trim(),

        summary:
          form.summary.trim() ||
          null,

        content:
          form.content.trim() ||
          null,

        image_url:
          form.image_url.trim() ||
          null,

        pinned:
          form.pinned,

        published:
          form.published,
      })
      .eq("id", id)
      .select("*")
      .single();

  if (error) {
    throw error;
  }

  return data as NewsItem;
}

export async function deleteNewsItem(
  id: string
) {
  const {
    error,
  } =
    await supabase
      .from("news")
      .delete()
      .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function setNewsPublished(
  id: string,
  published: boolean
) {
  const {
    error,
  } =
    await supabase
      .from("news")
      .update({
        published,
      })
      .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function setNewsPinned(
  id: string,
  pinned: boolean
) {
  const {
    error,
  } =
    await supabase
      .from("news")
      .update({
        pinned,
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

export async function uploadNewsImage(
  file: File
) {
  if (
    !file.type.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Only images are allowed."
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
    ) || "news-image";

  const path =
    `${authData.user.id}/` +
    `${Date.now()}-${name}`;

  const {
    error,
  } =
    await supabase.storage
      .from(
        "news-images"
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
        "news-images"
      )
      .getPublicUrl(
        path
      );

  return data.publicUrl;
}