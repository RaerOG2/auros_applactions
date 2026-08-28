import { supabase } from "../lib/supabase";

import type {
  PatchnoteEditorForm,
  PatchnoteItem,
} from "../types/admin";

export async function getAdminPatchnotes(): Promise<PatchnoteItem[]> {
  const { data, error } = await supabase
    .from("patchnotes")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as PatchnoteItem[];
}

export async function getAdminPatchnoteById(
  id: string
): Promise<PatchnoteItem | null> {
  const { data, error } = await supabase
    .from("patchnotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PatchnoteItem | null;
}

export async function createPatchnote(
  form: PatchnoteEditorForm
) {
  const fallbackContent = form.blocks
    .filter(
      (block) =>
        block.type === "heading" ||
        block.type === "text"
    )
    .map((block) => block.text)
    .join("\n\n");

  const { data, error } = await supabase
    .from("patchnotes")
    .insert({
      version: form.version.trim(),

      title: form.title.trim(),

      slug: form.slug.trim(),

      summary:
        form.summary.trim() || null,

      cover_url:
        form.cover_url.trim() || null,

      content:
        fallbackContent || null,

      content_blocks: form.blocks,

      published: form.published,

      updated_at:
        new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as PatchnoteItem;
}

export async function updatePatchnote(
  id: string,
  form: PatchnoteEditorForm
) {
  const fallbackContent = form.blocks
    .filter(
      (block) =>
        block.type === "heading" ||
        block.type === "text"
    )
    .map((block) => block.text)
    .join("\n\n");

  const { data, error } = await supabase
    .from("patchnotes")
    .update({
      version: form.version.trim(),

      title: form.title.trim(),

      slug: form.slug.trim(),

      summary:
        form.summary.trim() || null,

      cover_url:
        form.cover_url.trim() || null,

      content:
        fallbackContent || null,

      content_blocks: form.blocks,

      published: form.published,

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as PatchnoteItem;
}

export async function deleteAdminPatchnote(
  id: string
) {
  const { error } = await supabase
    .from("patchnotes")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function setPatchnotePublished(
  id: string,
  published: boolean
) {
  const { error } = await supabase
    .from("patchnotes")
    .update({
      published,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

function cleanFilename(
  fileName: string
) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(
      /[^a-z0-9._-]/g,
      ""
    )
    .slice(0, 100);
}

export async function uploadPatchnoteImage(
  file: File,
  folder:
    | "covers"
    | "content" = "content"
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

  const maxSize =
    15 * 1024 * 1024;

  if (
    file.size >
    maxSize
  ) {
    throw new Error(
      "Image is too large. Maximum size is 15 MB."
    );
  }

  const {
    data: userData,
  } =
    await supabase.auth.getUser();

  const user =
    userData.user;

  if (!user) {
    throw new Error(
      "You are not logged in."
    );
  }

  const clean =
    cleanFilename(
      file.name
    ) || "image";

  const path = `${folder}/${user.id}/${Date.now()}-${clean}`;

  const {
    error: uploadError,
  } =
    await supabase.storage
      .from(
        "patchnote-images"
      )
      .upload(
        path,
        file,
        {
          cacheControl:
            "3600",
          upsert: false,
          contentType:
            file.type,
        }
      );

  if (uploadError) {
    throw uploadError;
  }

  const { data } =
    supabase.storage
      .from(
        "patchnote-images"
      )
      .getPublicUrl(
        path
      );

  if (
    !data.publicUrl
  ) {
    throw new Error(
      "Could not create image URL."
    );
  }

  return data.publicUrl;
}