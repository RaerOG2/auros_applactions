import { supabase } from "../lib/supabase";
import { getCurrentAuthUser } from "./profile.service";

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension) return "png";

  return extension.replace(/[^a-z0-9]/g, "") || "png";
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "")
    .slice(0, 80);
}

async function uploadToBucket(bucket: string, file: File, folder: string) {
  const user = await getCurrentAuthUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  const extension = getFileExtension(file);
  const cleanName = sanitizeFileName(file.name);
  const filePath = `${folder}/${user.id}/${Date.now()}-${cleanName || `upload.${extension}`}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("[storage.service] Upload failed:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  if (!data.publicUrl) {
    throw new Error("Could not create public file URL.");
  }

  return data.publicUrl;
}

export async function uploadUserAvatar(file: File) {
  return uploadToBucket("chat-avatars", file, "avatars");
}

export async function uploadUserBanner(file: File) {
  return uploadToBucket("chat-banners", file, "banners");
}

export async function uploadServerIcon(file: File) {
  return uploadToBucket("chat-server-icons", file, "icons");
}

export async function uploadChatAttachment(file: File) {
  return uploadToBucket("chat-attachments", file, "attachments");
}

export async function uploadCustomEmoji(file: File) {
  return uploadToBucket("chat-emojis", file, "emojis");
}