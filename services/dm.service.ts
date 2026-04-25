import { supabase } from "../lib/supabase";
import { mapDirectConversationRow, mapProfileRow } from "../lib/chat-mappers";
import type { ChatUserProfile, DirectConversation } from "../types/chat";
import { getCurrentAuthUser } from "./profile.service";

export async function getMyDirectConversations(): Promise<DirectConversation[]> {
  const user = await getCurrentAuthUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("direct_conversation_members")
    .select(`
      conversation:direct_conversations (*)
    `)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row: any) => row.conversation)
    .filter(Boolean)
    .map(mapDirectConversationRow);
}

export async function getDirectConversationOtherUser(
  conversationId: string
): Promise<ChatUserProfile | null> {
  const user = await getCurrentAuthUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("direct_conversation_members")
    .select(`
      user_id,
      profile:profiles (*)
    `)
    .eq("conversation_id", conversationId);

  if (error) {
    throw error;
  }

  const otherMember = (data ?? []).find((row: any) => row.user_id !== user.id);

  if (!otherMember?.profile) {
    return null;
  }

  return mapProfileRow(otherMember.profile);
}