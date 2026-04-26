import { supabase } from "../lib/supabase";
import type { ChatCustomEmoji } from "../types/chat";
import { getCurrentAuthUser } from "./profile.service";
import { uploadCustomEmoji } from "./storage.service";

function mapCustomEmojiRow(row: any): ChatCustomEmoji {
  return {
    id: row.id,
    serverId: row.server_id,
    name: row.name,
    imageUrl: row.image_url,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
  };
}

export async function getServerCustomEmojis(
  serverId: string
): Promise<ChatCustomEmoji[]> {
  const { data, error } = await supabase
    .from("chat_custom_emojis")
    .select("*")
    .eq("server_id", serverId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to load custom emojis.");
  }

  return (data ?? []).map(mapCustomEmojiRow);
}

export async function createCustomEmoji(input: {
  serverId: string;
  name: string;
  file: File;
}): Promise<ChatCustomEmoji> {
  const user = await getCurrentAuthUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const cleanName = input.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);

  if (!cleanName) {
    throw new Error("Emoji name is required.");
  }

  const imageUrl = await uploadCustomEmoji(input.file);

  const { data, error } = await supabase
    .from("chat_custom_emojis")
    .insert({
      server_id: input.serverId,
      name: cleanName,
      image_url: imageUrl,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create custom emoji.");
  }

  return mapCustomEmojiRow(data);
}

export async function deleteCustomEmoji(emojiId: string): Promise<void> {
  const { error } = await supabase
    .from("chat_custom_emojis")
    .delete()
    .eq("id", emojiId);

  if (error) {
    throw new Error(error.message || "Failed to delete custom emoji.");
  }
}