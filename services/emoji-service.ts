import { supabase } from "../lib/supabase";
import type { CustomEmojiItem } from "../types/emoji";

export async function getCustomEmojis() {
  const { data, error } = await supabase
    .from("custom_emojis")
    .select("*")
    .eq("is_active", true)
    .order("shortcode", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CustomEmojiItem[];
}

export async function createCustomEmoji(params: {
  shortcode: string;
  imageUrl: string;
  createdBy?: string | null;
}) {
  const { data, error } = await supabase
    .from("custom_emojis")
    .insert({
      shortcode: params.shortcode,
      image_url: params.imageUrl,
      created_by: params.createdBy ?? null,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as CustomEmojiItem;
}

export async function deactivateCustomEmoji(emojiId: string) {
  const { error } = await supabase
    .from("custom_emojis")
    .update({ is_active: false })
    .eq("id", emojiId);

  if (error) throw error;
}