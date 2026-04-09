import { supabase } from "../lib/supabase";
import type {
  ChatChannelItem,
  ChatChannelMemberItem,
  ChatMessageItem,
  CreateChannelInput,
  SendChannelMessageInput,
} from "../types/chat";

export async function getChatChannels() {
  const { data, error } = await supabase
    .from("chat_channels")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ChatChannelItem[];
}

export async function getVisibleChatChannels(profileId?: string | null) {
  const allChannels = await getChatChannels();

  if (!profileId) {
    return allChannels.filter((channel) => channel.is_public);
  }

  const { data: memberships, error } = await supabase
    .from("chat_channel_members")
    .select("channel_id")
    .eq("profile_id", profileId);

  if (error) throw error;

  const memberChannelIds = new Set((memberships ?? []).map((item: any) => item.channel_id));

  return allChannels.filter(
    (channel) => channel.is_public || memberChannelIds.has(channel.id)
  );
}

export async function getChatChannelBySlug(slug: string) {
  const { data, error } = await supabase
    .from("chat_channels")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ChatChannelItem | null;
}

export async function getChatChannelById(channelId: string) {
  const { data, error } = await supabase
    .from("chat_channels")
    .select("*")
    .eq("id", channelId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ChatChannelItem | null;
}

export async function createChatChannel(input: CreateChannelInput) {
  const { data, error } = await supabase
    .from("chat_channels")
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      is_public: input.isPublic ?? true,
      created_by: input.createdBy ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ChatChannelItem;
}

export async function updateChatChannel(params: {
  channelId: string;
  slug: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
}) {
  const { data, error } = await supabase
    .from("chat_channels")
    .update({
      slug: params.slug,
      name: params.name,
      description: params.description ?? null,
      is_public: params.isPublic,
    })
    .eq("id", params.channelId)
    .select("*")
    .single();

  if (error) throw error;
  return data as ChatChannelItem;
}

export async function deleteChatChannel(channelId: string) {
  const { error } = await supabase
    .from("chat_channels")
    .delete()
    .eq("id", channelId);

  if (error) throw error;
}

export async function getChannelMembers(channelId: string) {
  const { data, error } = await supabase
    .from("chat_channel_members")
    .select(`
      *,
      profile:profiles!chat_channel_members_profile_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        role
      )
    `)
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ChatChannelMemberItem[];
}

export async function addChannelMember(params: {
  channelId: string;
  profileId: string;
  role?: string;
}) {
  const { data, error } = await supabase
    .from("chat_channel_members")
    .insert({
      channel_id: params.channelId,
      profile_id: params.profileId,
      role: params.role ?? "member",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ChatChannelMemberItem;
}

export async function removeChannelMember(channelId: string, profileId: string) {
  const { error } = await supabase
    .from("chat_channel_members")
    .delete()
    .eq("channel_id", channelId)
    .eq("profile_id", profileId);

  if (error) throw error;
}

export async function isProfileChannelMember(channelId: string, profileId: string) {
  const { data, error } = await supabase
    .from("chat_channel_members")
    .select("id")
    .eq("channel_id", channelId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function canAccessChannel(channelId: string, profileId?: string | null) {
  const channel = await getChatChannelById(channelId);
  if (!channel) return false;
  if (channel.is_public) return true;
  if (!profileId) return false;
  return await isProfileChannelMember(channelId, profileId);
}

export async function getChannelMessages(channelId: string, limit = 100) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select(`
      *,
      author_profile:profiles!chat_messages_author_profile_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        role
      ),
      author_applicant_account:applicant_chat_accounts!chat_messages_author_applicant_account_id_fkey (
        id,
        display_name,
        discord_name
      )
    `)
    .eq("channel_id", channelId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as ChatMessageItem[];
}

export async function getChannelLastMessageMap(channelIds: string[]) {
  if (channelIds.length === 0) return {};

  const result: Record<string, ChatMessageItem | null> = {};

  await Promise.all(
    channelIds.map(async (channelId) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          *,
          author_profile:profiles!chat_messages_author_profile_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            role
          ),
          author_applicant_account:applicant_chat_accounts!chat_messages_author_applicant_account_id_fkey (
            id,
            display_name,
            discord_name
          )
        `)
        .eq("channel_id", channelId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      result[channelId] = (data ?? null) as ChatMessageItem | null;
    })
  );

  return result;
}

export async function sendChannelMessage(input: SendChannelMessageInput) {
  const content = input.content.trim();
  if (!content) throw new Error("Message content is required.");

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      channel_id: input.channelId,
      content,
      author_profile_id: input.authorProfileId ?? null,
      author_applicant_account_id: input.authorApplicantAccountId ?? null,
    })
    .select(`
      *,
      author_profile:profiles!chat_messages_author_profile_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        role
      ),
      author_applicant_account:applicant_chat_accounts!chat_messages_author_applicant_account_id_fkey (
        id,
        display_name,
        discord_name
      )
    `)
    .single();

  if (error) throw error;
  return data as ChatMessageItem;
}

export async function editChannelMessage(messageId: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message content is required.");

  const { error } = await supabase
    .from("chat_messages")
    .update({
      content: trimmed,
      edited_at: new Date().toISOString(),
    })
    .eq("id", messageId);

  if (error) throw error;
}

export async function softDeleteChannelMessage(messageId: string) {
  const { error } = await supabase
    .from("chat_messages")
    .update({
      deleted_at: new Date().toISOString(),
      content: "[deleted]",
      content_html: null,
    })
    .eq("id", messageId);

  if (error) throw error;
}