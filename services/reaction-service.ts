import { supabase } from "../lib/supabase";
import type { MessageReactionItem } from "../types/chat";

export async function getMessageReactionsForChannelMessage(messageId: string) {
  const { data, error } = await supabase
    .from("message_reactions")
    .select("*")
    .eq("message_id", messageId)
    .is("direct_message_id", null);

  if (error) throw error;
  return (data ?? []) as MessageReactionItem[];
}

export async function getMessageReactionsForDirectMessage(directMessageId: string) {
  const { data, error } = await supabase
    .from("message_reactions")
    .select("*")
    .eq("direct_message_id", directMessageId)
    .is("message_id", null);

  if (error) throw error;
  return (data ?? []) as MessageReactionItem[];
}

export async function getChannelReactionsMap(messageIds: string[]) {
  if (messageIds.length === 0) return {};

  const { data, error } = await supabase
    .from("message_reactions")
    .select("*")
    .in("message_id", messageIds)
    .is("direct_message_id", null);

  if (error) throw error;

  const map: Record<string, MessageReactionItem[]> = {};
  for (const item of (data ?? []) as MessageReactionItem[]) {
    if (!item.message_id) continue;
    if (!map[item.message_id]) map[item.message_id] = [];
    map[item.message_id].push(item);
  }

  return map;
}

export async function getDirectReactionsMap(messageIds: string[]) {
  if (messageIds.length === 0) return {};

  const { data, error } = await supabase
    .from("message_reactions")
    .select("*")
    .in("direct_message_id", messageIds)
    .is("message_id", null);

  if (error) throw error;

  const map: Record<string, MessageReactionItem[]> = {};
  for (const item of (data ?? []) as MessageReactionItem[]) {
    if (!item.direct_message_id) continue;
    if (!map[item.direct_message_id]) map[item.direct_message_id] = [];
    map[item.direct_message_id].push(item);
  }

  return map;
}

export async function toggleReactionOnChannelMessage(params: {
  messageId: string;
  emojiKey: string;
  profileId?: string | null;
  applicantChatAccountId?: string | null;
}) {
  const query = supabase
    .from("message_reactions")
    .select("id")
    .eq("message_id", params.messageId)
    .eq("emoji_key", params.emojiKey)
    .is("direct_message_id", null);

  const filteredQuery = params.profileId
    ? query.eq("profile_id", params.profileId).is("applicant_chat_account_id", null)
    : query
        .is("profile_id", null)
        .eq("applicant_chat_account_id", params.applicantChatAccountId ?? null);

  const { data: existing, error: existingError } = await filteredQuery.maybeSingle();

  if (existingError) throw existingError;

  if (existing?.id) {
    const { error } = await supabase
      .from("message_reactions")
      .delete()
      .eq("id", existing.id);

    if (error) throw error;
    return { removed: true };
  }

  const { error } = await supabase.from("message_reactions").insert({
    message_id: params.messageId,
    direct_message_id: null,
    profile_id: params.profileId ?? null,
    applicant_chat_account_id: params.applicantChatAccountId ?? null,
    emoji_key: params.emojiKey,
  });

  if (error) throw error;
  return { removed: false };
}

export async function toggleReactionOnDirectMessage(params: {
  directMessageId: string;
  emojiKey: string;
  profileId?: string | null;
  applicantChatAccountId?: string | null;
}) {
  const query = supabase
    .from("message_reactions")
    .select("id")
    .eq("direct_message_id", params.directMessageId)
    .eq("emoji_key", params.emojiKey)
    .is("message_id", null);

  const filteredQuery = params.profileId
    ? query.eq("profile_id", params.profileId).is("applicant_chat_account_id", null)
    : query
        .is("profile_id", null)
        .eq("applicant_chat_account_id", params.applicantChatAccountId ?? null);

  const { data: existing, error: existingError } = await filteredQuery.maybeSingle();

  if (existingError) throw existingError;

  if (existing?.id) {
    const { error } = await supabase
      .from("message_reactions")
      .delete()
      .eq("id", existing.id);

    if (error) throw error;
    return { removed: true };
  }

  const { error } = await supabase.from("message_reactions").insert({
    message_id: null,
    direct_message_id: params.directMessageId,
    profile_id: params.profileId ?? null,
    applicant_chat_account_id: params.applicantChatAccountId ?? null,
    emoji_key: params.emojiKey,
  });

  if (error) throw error;
  return { removed: false };
}