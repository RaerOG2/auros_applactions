import { supabase } from "../lib/supabase";
import type {
  CreateDirectConversationInput,
  DirectConversationItem,
  DirectMessageItem,
} from "../types/chat";
import type { ProfileItem } from "../types/profile";

export async function createDirectConversation(input: CreateDirectConversationInput) {
  const { data: conversation, error: conversationError } = await supabase
    .from("direct_conversations")
    .insert({
      application_id: input.applicationId ?? null,
      is_applicant_thread: input.isApplicantThread ?? false,
    })
    .select("*")
    .single();

  if (conversationError) throw conversationError;

  const conversationId = conversation.id;

  const memberRows = [
    ...(input.memberProfileIds ?? []).map((profileId) => ({
      conversation_id: conversationId,
      profile_id: profileId,
      applicant_chat_account_id: null,
    })),
    ...(input.memberApplicantAccountIds ?? []).map((accountId) => ({
      conversation_id: conversationId,
      profile_id: null,
      applicant_chat_account_id: accountId,
    })),
  ];

  if (memberRows.length > 0) {
    const { error: membersError } = await supabase
      .from("direct_conversation_members")
      .insert(memberRows);

    if (membersError) throw membersError;
  }

  return conversation as DirectConversationItem;
}

export async function getDirectConversationById(conversationId: string) {
  const { data, error } = await supabase
    .from("direct_conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as DirectConversationItem | null;
}

export async function getDirectMessages(conversationId: string, limit = 100) {
  const { data, error } = await supabase
    .from("direct_messages")
    .select(`
      *,
      author_profile:profiles!direct_messages_author_profile_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        role
      ),
      author_applicant_account:applicant_chat_accounts!direct_messages_author_applicant_account_id_fkey (
        id,
        display_name,
        discord_name
      )
    `)
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as DirectMessageItem[];
}

export async function sendDirectMessage(input: {
  conversationId: string;
  content: string;
  authorProfileId?: string | null;
  authorApplicantAccountId?: string | null;
}) {
  const content = input.content.trim();
  if (!content) throw new Error("Message content is required.");

  const { data, error } = await supabase
    .from("direct_messages")
    .insert({
      conversation_id: input.conversationId,
      content,
      author_profile_id: input.authorProfileId ?? null,
      author_applicant_account_id: input.authorApplicantAccountId ?? null,
    })
    .select(`
      *,
      author_profile:profiles!direct_messages_author_profile_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        role
      ),
      author_applicant_account:applicant_chat_accounts!direct_messages_author_applicant_account_id_fkey (
        id,
        display_name,
        discord_name
      )
    `)
    .single();

  if (error) throw error;
  return data as DirectMessageItem;
}

export async function softDeleteDirectMessage(messageId: string) {
  const { error } = await supabase
    .from("direct_messages")
    .update({
      deleted_at: new Date().toISOString(),
      content: "[deleted]",
      content_html: null,
    })
    .eq("id", messageId);

  if (error) throw error;
}

export type DirectConversationListItem = {
  conversation: DirectConversationItem;
  otherProfiles: ProfileItem[];
  lastMessage: DirectMessageItem | null;
};

export async function getDirectConversationsForProfile(profileId: string) {
  const { data: memberRows, error: memberError } = await supabase
    .from("direct_conversation_members")
    .select(`
      id,
      conversation_id,
      profile_id,
      applicant_chat_account_id,
      joined_at,
      direct_conversations!direct_conversation_members_conversation_id_fkey (
        id,
        is_applicant_thread,
        application_id,
        created_at
      )
    `)
    .eq("profile_id", profileId);

  if (memberError) throw memberError;

  const conversations = (memberRows ?? [])
    .map((row: any) => row.direct_conversations)
    .filter(Boolean) as DirectConversationItem[];

  const uniqueConversations = Array.from(
    new Map(conversations.map((conversation) => [conversation.id, conversation])).values()
  );

  const results: DirectConversationListItem[] = [];

  for (const conversation of uniqueConversations) {
    const { data: conversationMembers, error: conversationMembersError } = await supabase
      .from("direct_conversation_members")
      .select(`
        profile_id,
        applicant_chat_account_id,
        profiles!direct_conversation_members_profile_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          role,
          created_at
        )
      `)
      .eq("conversation_id", conversation.id);

    if (conversationMembersError) throw conversationMembersError;

    const otherProfiles = (conversationMembers ?? [])
      .filter((row: any) => row.profile_id && row.profile_id !== profileId)
      .map((row: any) => row.profiles)
      .filter(Boolean) as ProfileItem[];

    const { data: lastMessageData, error: lastMessageError } = await supabase
      .from("direct_messages")
      .select(`
        *,
        author_profile:profiles!direct_messages_author_profile_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          role
        ),
        author_applicant_account:applicant_chat_accounts!direct_messages_author_applicant_account_id_fkey (
          id,
          display_name,
          discord_name
        )
      `)
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastMessageError) throw lastMessageError;

    results.push({
      conversation,
      otherProfiles,
      lastMessage: (lastMessageData ?? null) as DirectMessageItem | null,
    });
  }

  results.sort((a, b) => {
    const aTime = a.lastMessage?.created_at || a.conversation.created_at;
    const bTime = b.lastMessage?.created_at || b.conversation.created_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return results;
}

export async function findExistingDirectConversationBetweenProfiles(params: {
  currentProfileId: string;
  targetProfileId: string;
}) {
  const allConversations = await getDirectConversationsForProfile(params.currentProfileId);

  const existing = allConversations.find((item) => {
    if (item.conversation.is_applicant_thread) return false;
    return item.otherProfiles.some((profile) => profile.id === params.targetProfileId);
  });

  return existing?.conversation ?? null;
}

export async function getOrCreateDirectConversationBetweenProfiles(params: {
  currentProfileId: string;
  targetProfileId: string;
}) {
  const existing = await findExistingDirectConversationBetweenProfiles(params);
  if (existing) return existing;

  return await createDirectConversation({
    isApplicantThread: false,
    memberProfileIds: [params.currentProfileId, params.targetProfileId],
  });
}