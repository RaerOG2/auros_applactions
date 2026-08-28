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

export async function searchUsersForDirectMessage(
  query: string
): Promise<ChatUserProfile[]> {
  const currentUser = await getCurrentAuthUser();

  if (!currentUser) {
    return [];
  }

  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", currentUser.id)
    .or(`username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%`)
    .limit(12);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapProfileRow);
}

export async function getOrCreateDirectConversationWithUser(
  otherUserId: string
): Promise<DirectConversation> {
  const currentUser = await getCurrentAuthUser();

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  if (currentUser.id === otherUserId) {
    throw new Error("You cannot start a DM with yourself.");
  }

  const { data: myMemberships, error: membershipsError } = await supabase
    .from("direct_conversation_members")
    .select("conversation_id")
    .eq("user_id", currentUser.id);

  if (membershipsError) {
    throw membershipsError;
  }

  const conversationIds = (myMemberships ?? []).map(
    (member) => member.conversation_id
  );

  if (conversationIds.length > 0) {
    const { data: existingConversation, error: existingError } = await supabase
      .from("direct_conversation_members")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", conversationIds)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingConversation?.conversation_id) {
      const { data: conversation, error: conversationError } = await supabase
        .from("direct_conversations")
        .select("*")
        .eq("id", existingConversation.conversation_id)
        .single();

      if (conversationError) {
        throw conversationError;
      }

      return mapDirectConversationRow(conversation);
    }
  }

  const { data: newConversation, error: conversationCreateError } =
    await supabase.from("direct_conversations").insert({}).select("*").single();

  if (conversationCreateError) {
    throw conversationCreateError;
  }

  const { error: membersCreateError } = await supabase
    .from("direct_conversation_members")
    .insert([
      {
        conversation_id: newConversation.id,
        user_id: currentUser.id,
      },
      {
        conversation_id: newConversation.id,
        user_id: otherUserId,
      },
    ]);

  if (membersCreateError) {
    throw membersCreateError;
  }

  return mapDirectConversationRow(newConversation);
}