import { supabase } from "../lib/supabase";
import { getCurrentAuthUser } from "./profile.service";

const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024;

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension) return "bin";

  return extension.replace(/[^a-z0-9]/g, "") || "bin";
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "")
    .slice(0, 80);
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function isAllowedAttachment(file: File) {
  const allowedTypes = [
    "image/",
    "video/",
    "audio/",
    "application/pdf",
    "text/",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/json",
    "text/csv",
  ];

  const allowedExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".mp4",
    ".webm",
    ".mov",
    ".mp3",
    ".wav",
    ".ogg",
    ".pdf",
    ".txt",
    ".zip",
    ".rar",
    ".7z",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".json",
    ".csv",
  ];

  const lowerName = file.name.toLowerCase();

  const allowedByType = allowedTypes.some((type) =>
    type.endsWith("/") ? file.type.startsWith(type) : file.type === type
  );

  const allowedByExtension = allowedExtensions.some((ext) =>
    lowerName.endsWith(ext)
  );

  return allowedByType || allowedByExtension;
}

async function uploadToBucket(
  bucket: string,
  file: File,
  folder: string,
  options?: {
    imagesOnly?: boolean;
    maxSize?: number;
  }
) {
  const user = await getCurrentAuthUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const maxSize = options?.maxSize ?? 20 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(`File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
  }

  if (options?.imagesOnly && !isImageFile(file)) {
    throw new Error("Only image files are allowed.");
  }

  const extension = getFileExtension(file);
  const cleanName = sanitizeFileName(file.name);
  const filePath = `${folder}/${user.id}/${Date.now()}-${
    cleanName || `upload.${extension}`
  }`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "application/octet-stream",
    });

  if (uploadError) {
    console.error("[storage.service] Upload failed:", uploadError);
    throw new Error(uploadError.message || "Failed to upload file.");
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  if (!data.publicUrl) {
    throw new Error("Could not create public file URL.");
  }

  return data.publicUrl;
}

export async function uploadUserAvatar(file: File) {
  return uploadToBucket("chat-avatars", file, "avatars", {
    imagesOnly: true,
    maxSize: 10 * 1024 * 1024,
  });
}

export async function uploadUserBanner(file: File) {
  return uploadToBucket("chat-banners", file, "banners", {
    imagesOnly: true,
    maxSize: 15 * 1024 * 1024,
  });
}

export async function uploadServerIcon(file: File) {
  return uploadToBucket("chat-server-icons", file, "icons", {
    imagesOnly: true,
    maxSize: 10 * 1024 * 1024,
  });
}

export async function uploadChatAttachment(file: File) {
  if (file.size > MAX_ATTACHMENT_SIZE) {
    throw new Error("File is too large. Maximum size is 100MB.");
  }

  if (!isAllowedAttachment(file)) {
    throw new Error("This file type is not allowed.");
  }

  return uploadToBucket("chat-attachments", file, "attachments", {
    imagesOnly: false,
    maxSize: MAX_ATTACHMENT_SIZE,
  });
}

export async function uploadCustomEmoji(file: File) {
  return uploadToBucket("chat-emojis", file, "emojis", {
    imagesOnly: true,
    maxSize: 5 * 1024 * 1024,
  });
}