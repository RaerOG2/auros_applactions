export type ChatChannelItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
};

export type ChatChannelMemberItem = {
  id: string;
  channel_id: string;
  profile_id: string;
  role: string;
  created_at: string;
  profile?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    role: string;
  } | null;
};

export type ApplicantChatAccountItem = {
  id: string;
  application_id: string;
  chat_identity_code: string;
  display_name: string | null;
  discord_name: string | null;
  created_by_admin_id: string | null;
  is_active: boolean;
  created_at: string;
};

export type ChatMessageItem = {
  id: string;
  channel_id: string;
  author_profile_id: string | null;
  author_applicant_account_id: string | null;
  content: string;
  content_html: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  author_profile?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    role: string;
  } | null;
  author_applicant_account?: {
    id: string;
    display_name: string | null;
    discord_name: string | null;
  } | null;
};

export type DirectConversationItem = {
  id: string;
  is_applicant_thread: boolean;
  application_id: string | null;
  created_at: string;
};

export type DirectConversationMemberItem = {
  id: string;
  conversation_id: string;
  profile_id: string | null;
  applicant_chat_account_id: string | null;
  joined_at: string;
};

export type DirectMessageItem = {
  id: string;
  conversation_id: string;
  author_profile_id: string | null;
  author_applicant_account_id: string | null;
  content: string;
  content_html: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  author_profile?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    role: string;
  } | null;
  author_applicant_account?: {
    id: string;
    display_name: string | null;
    discord_name: string | null;
  } | null;
};

export type MessageReactionItem = {
  id: string;
  message_id: string | null;
  direct_message_id: string | null;
  profile_id: string | null;
  applicant_chat_account_id: string | null;
  emoji_key: string;
  created_at: string;
};

export type MessageMentionItem = {
  id: string;
  message_id: string | null;
  direct_message_id: string | null;
  mentioned_profile_id: string;
  created_at: string;
};

export type CreateApplicantChatAccountInput = {
  applicationId: string;
  displayName?: string | null;
  discordName?: string | null;
  createdByAdminId?: string | null;
};

export type CreateChannelInput = {
  slug: string;
  name: string;
  description?: string | null;
  isPublic?: boolean;
  createdBy?: string | null;
};

export type SendChannelMessageInput = {
  channelId: string;
  content: string;
  authorProfileId?: string | null;
  authorApplicantAccountId?: string | null;
};

export type SendDirectMessageInput = {
  conversationId: string;
  content: string;
  authorProfileId?: string | null;
  authorApplicantAccountId?: string | null;
};

export type CreateDirectConversationInput = {
  applicationId?: string | null;
  isApplicantThread?: boolean;
  memberProfileIds?: string[];
  memberApplicantAccountIds?: string[];
};