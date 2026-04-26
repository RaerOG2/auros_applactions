import type {
  ApplicationChat,
  ChatChannel,
  ChatMessage,
  ChatMessageReaction,
  ChatServer,
  ChatUserProfile,
  DirectConversation,
  ChatMessageAttachment,
} from "../types/chat";

function safeString(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return fallback;
}

export function mapProfileRow(row: any): ChatUserProfile {
  const username = safeString(row?.username, "user");
  const displayName = safeString(row?.display_name, username || "User");

  return {
    id: row.id,
    username,
    displayName,
    avatarUrl: row.avatar_url ?? null,
    bannerUrl: row.banner_url ?? null,
    bio: row.bio ?? null,
    status: row.status ?? "offline",
    isAdmin: !!row.is_admin,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    lastSeen: row.last_seen ?? null,
  };
}

export function mapServerRow(row: any): ChatServer {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name ?? "Unnamed Server",
    slug: row.slug ?? null,
    description: row.description ?? null,
    iconUrl: row.icon_url ?? null,
    bannerUrl: row.banner_url ?? null,
    isPublic: !!row.is_public,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export function mapChannelRow(row: any): ChatChannel {
  return {
    id: row.id,
    serverId: row.server_id,
    createdBy: row.created_by ?? null,
    name: row.name ?? "general",
    type: row.type ?? "text",
    topic: row.topic ?? null,
    position: row.position ?? 0,
    isPrivate: !!row.is_private,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export function mapReactionRow(row: any) {
  return {
    id: row.id,
    messageId: row.message_id,
    userId: row.user_id,
    emoji: row.emoji,
    createdAt: row.created_at,
  };
}

export function mapMessageRow(row: any): ChatMessage {
  return {
    id: row.id,
    authorId: row.author_id ?? null,
    channelId: row.channel_id ?? null,
    directConversationId: row.direct_conversation_id ?? null,
    applicationChatId: row.application_chat_id ?? null,
    content: row.content ?? "",
    messageType: row.message_type ?? "text",
    replyToId: row.reply_to_id ?? null,
    editedAt: row.edited_at ?? null,
    deletedAt: row.deleted_at ?? null,
    createdAt: row.created_at ?? new Date().toISOString(),
    author: row.author ? mapProfileRow(row.author) : null,
    reactions: Array.isArray(row.reactions)
      ? row.reactions.map(mapReactionRow)
      : [],
    attachments: Array.isArray(row.attachments)
      ? row.attachments.map(mapAttachmentRow)
      : [],
  };
}

export function mapDirectConversationRow(row: any): DirectConversation {
  return {
    id: row.id,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export function mapApplicationChatRow(row: any): ApplicationChat {
  return {
    id: row.id,
    chatId: row.chat_id,
    applicantName: row.applicant_name ?? "Applicant",
    applicantEmail: row.applicant_email ?? null,
    createdByAdminId: row.created_by_admin_id ?? null,
    status: row.status ?? "open",
    isActive: !!row.is_active,
    expiresAt: row.expires_at ?? null,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export function mapAttachmentRow(row: any): ChatMessageAttachment {
  return {
    id: row.id,
    messageId: row.message_id,
    fileUrl: row.file_url,
    fileName: row.file_name,
    fileType: row.file_type ?? null,
    fileSize: row.file_size ?? null,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}