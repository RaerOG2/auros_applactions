import { supabase } from "../lib/supabase";
import { mapMessageRow, mapReactionRow } from "../lib/chat-mappers";
import type { ChatMessage, ChatMessageReaction } from "../types/chat";
import { getCurrentAuthUser } from "./profile.service";

const MESSAGE_SELECT = `
  *,
  author:profiles (*),
  attachments:chat_message_attachments (*),
  reactions:chat_message_reactions (*)
`;

export async function getChannelMessages(channelId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select(`
      *,
      author:profiles (*),
      attachments:chat_message_attachments (*)
    `)
    .eq("channel_id", channelId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const messages = (data ?? []).map(mapMessageRow);
  return attachReactionsToMessages(messages);
}

export async function getDirectMessages(
  directConversationId: string
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select(MESSAGE_SELECT)
    .eq("direct_conversation_id", directConversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[chat.service] getDirectMessages failed:", error.message, error);
    throw new Error(error.message || "Failed to load direct messages.");
  }

  return (data ?? []).map(mapMessageRow);
}

export async function getApplicationChatMessages(
  applicationChatId: string
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select(MESSAGE_SELECT)
    .eq("application_chat_id", applicationChatId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapMessageRow);
}

export async function sendChannelMessage(input: {
  channelId: string;
  content: string;
  replyToId?: string | null;
  attachments?: {
    fileUrl: string;
    fileName: string;
    fileType: string | null;
    fileSize: number | null;
  }[];
}): Promise<ChatMessage> {
  const user = await getCurrentAuthUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const payload = {
    author_id: user.id,
    channel_id: input.channelId,
    direct_conversation_id: null,
    application_chat_id: null,
    content: input.content || "",
    reply_to_id: input.replyToId ?? null,
    message_type: "text",
  };

  const { data, error } = await supabase
    .from("chat_messages")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.warn("[chat.service] sendChannelMessage failed:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      payload,
    });

    throw new Error(
      error.message ||
        error.details ||
        error.hint ||
        "Failed to send channel message."
    );
  }

  if (input.attachments?.length) {
    const { error: attachmentError } = await supabase
      .from("chat_message_attachments")
      .insert(
        input.attachments.map((attachment) => ({
          message_id: data.id,
          file_url: attachment.fileUrl,
          file_name: attachment.fileName,
          file_type: attachment.fileType,
          file_size: attachment.fileSize,
        }))
      );

    if (attachmentError) {
      throw new Error(
        attachmentError.message || "Failed to save message attachments."
      );
    }
  }

  const { data: fullMessage, error: fullError } = await supabase
    .from("chat_messages")
    .select(MESSAGE_SELECT)
    .eq("id", data.id)
    .single();

  if (fullError) {
    throw new Error(fullError.message || "Failed to load sent message.");
  }

  return mapMessageRow(fullMessage);
}

export async function sendDirectMessage(input: {
  directConversationId: string;
  content: string;
  replyToId?: string | null;
}): Promise<ChatMessage> {
  const user = await getCurrentAuthUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      author_id: user.id,
      direct_conversation_id: input.directConversationId,
      content: input.content,
      reply_to_id: input.replyToId ?? null,
      message_type: "text",
    })
    .select(MESSAGE_SELECT)
    .single();

  if (error) {
    console.warn("[chat.service] sendDirectMessage failed:", error.message, error);
    throw new Error(error.message || "Failed to send direct message.");
  }

  return mapMessageRow(data);
}

export async function sendApplicationChatMessage(input: {
  applicationChatId: string;
  content: string;
  replyToId?: string | null;
}): Promise<ChatMessage> {
  const user = await getCurrentAuthUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      author_id: user.id,
      application_chat_id: input.applicationChatId,
      content: input.content,
      reply_to_id: input.replyToId ?? null,
      message_type: "text",
    })
    .select(MESSAGE_SELECT)
    .single();

  if (error) {
  console.warn("[chat.service] Send message failed:", error.message, error);
  throw new Error(error.message || "Failed to send message.");
  }
  return mapMessageRow(data);
}

export async function toggleReaction(input: {
  messageId: string;
  emoji: string;
}): Promise<void> {
  const user = await getCurrentAuthUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: existing, error: existingError } = await supabase
    .from("chat_message_reactions")
    .select("*")
    .eq("message_id", input.messageId)
    .eq("user_id", user.id)
    .eq("emoji", input.emoji)
    .maybeSingle();

  if (existingError) {
    console.warn("[chat.service] reaction check failed:", existingError);
    throw new Error(existingError.message || "Failed to check reaction.");
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("chat_message_reactions")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      console.warn("[chat.service] reaction delete failed:", deleteError);
      throw new Error(deleteError.message || "Failed to remove reaction.");
    }

    return;
  }

  const { error: insertError } = await supabase
    .from("chat_message_reactions")
    .insert({
      message_id: input.messageId,
      user_id: user.id,
      emoji: input.emoji,
    });

  if (insertError) {
    console.warn("[chat.service] reaction insert failed:", insertError);
    throw new Error(insertError.message || "Failed to add reaction.");
  }
}

export async function getMessageReactions(
  messageId: string
): Promise<ChatMessageReaction[]> {
  const { data, error } = await supabase
    .from("chat_message_reactions")
    .select("*")
    .eq("message_id", messageId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapReactionRow);
}

export function subscribeToChannelMessages(
  channelId: string,
  onChange: () => void
) {
  return supabase
    .channel(`live-channel-messages-${channelId}-${Date.now()}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_messages",
        filter: `channel_id=eq.${channelId}`,
      },
      () => onChange()
    )
    .subscribe((status) => {
      console.log("[Realtime] channel messages status:", status, channelId);
    });
}

export function subscribeToDirectMessages(
  directConversationId: string,
  onChange: () => void
) {
  return supabase
    .channel(`direct-messages:${directConversationId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_messages",
        filter: `direct_conversation_id=eq.${directConversationId}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe((status) => {
      console.log("[Realtime] direct messages:", status);
    });
}

export function subscribeToApplicationChatMessages(
  applicationChatId: string,
  onChange: () => void
) {
  return supabase
    .channel(`application-messages:${applicationChatId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_messages",
        filter: `application_chat_id=eq.${applicationChatId}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe((status) => {
      console.log("[Realtime] application messages:", status);
    });
}

export async function deleteOwnMessage(messageId: string): Promise<void> {
  const user = await getCurrentAuthUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("chat_messages")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .eq("author_id", user.id);

  if (error) {
    throw new Error(error.message || "Failed to delete message.");
  }
}

export function subscribeToMessageReactions(onChange: () => void) {
  return supabase
    .channel(`message-reactions-${Date.now()}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_message_reactions",
      },
      () => onChange()
    )
    .subscribe((status) => {
      console.log("[Realtime] message reactions:", status);
    });
}

async function attachReactionsToMessages(messages: ChatMessage[]) {
  if (messages.length === 0) return messages;

  const messageIds = messages.map((message) => message.id);

  const { data, error } = await supabase
    .from("chat_message_reactions")
    .select("*")
    .in("message_id", messageIds);

  if (error) {
    console.warn("[chat.service] Failed to load reactions:", error);
    return messages;
  }

  const reactionsByMessageId = new Map<string, any[]>();

  for (const reaction of data ?? []) {
    const list = reactionsByMessageId.get(reaction.message_id) ?? [];
    list.push(reaction);
    reactionsByMessageId.set(reaction.message_id, list);
  }

  return messages.map((message) => ({
    ...message,
    reactions: (reactionsByMessageId.get(message.id) ?? []).map(mapReactionRow),
  }));
}