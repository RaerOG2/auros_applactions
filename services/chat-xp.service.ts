import { supabase } from "../lib/supabase";

export type ChatUserXp = {
  userId: string;
  xp: number;
  level: number;
};

function mapXpRow(row: any): ChatUserXp {
  return {
    userId: row.user_id,
    xp: row.xp ?? 0,
    level: row.level ?? 1,
  };
}

export async function getUserChatXp(userId: string): Promise<ChatUserXp | null> {
  const { data, error } = await supabase
    .from("chat_user_xp")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapXpRow(data);
}

export async function getUsersChatXp(userIds: string[]): Promise<Record<string, ChatUserXp>> {
  if (userIds.length === 0) return {};

  const { data, error } = await supabase
    .from("chat_user_xp")
    .select("*")
    .in("user_id", userIds);

  if (error) throw error;

  return Object.fromEntries((data ?? []).map((row) => [row.user_id, mapXpRow(row)]));
}