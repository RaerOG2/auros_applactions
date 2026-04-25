export type UserStatus = "online" | "idle" | "dnd" | "offline";

export type ChatUserProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  status: UserStatus;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeen: string | null;
};

export type ChatServer = {
  id: string;
  ownerId: string;
  name: string;
  slug: string | null;
  description: string | null;
  iconUrl: string | null;
  bannerUrl: string | null;
  isPublic: boolean;
  createdAt: string;
};

export type ChatServerMemberRole =
  | "owner"
  | "admin"
  | "moderator"
  | "member";

export type ChatServerMember = {
  id: string;
  serverId: string;
  userId: string;
  role: ChatServerMemberRole;
  joinedAt: string;
};

export type ChatChannelType = "text" | "announcement" | "application";

export type ChatChannel = {
  id: string;
  serverId: string;
  createdBy: string | null;
  name: string;
  type: ChatChannelType;
  topic: string | null;
  position: number;
  isPrivate: boolean;
  createdAt: string;
};

export type DirectConversation = {
  id: string;
  createdAt: string;
};

export type DirectConversationMember = {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: string;
};

export type ApplicationChatStatus = "open" | "review" | "closed";

export type ApplicationChat = {
  id: string;
  chatId: string;
  applicantName: string;
  applicantEmail: string | null;
  createdByAdminId: string | null;
  status: ApplicationChatStatus;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export type ChatMessageType = "text" | "system";

export type ChatMessageReaction = {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  authorId: string | null;
  channelId: string | null;
  directConversationId: string | null;
  applicationChatId: string | null;
  content: string;
  messageType: ChatMessageType;
  replyToId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  author?: ChatUserProfile | null;
  reactions?: ChatMessageReaction[];
};

export type ChatCustomEmoji = {
  id: string;
  serverId: string;
  name: string;
  imageUrl: string;
  createdBy: string | null;
  createdAt: string;
};

export type ChatModerationActionType =
  | "ban"
  | "kick"
  | "mute"
  | "warn"
  | "delete_message";

export type ChatModerationAction = {
  id: string;
  targetUserId: string | null;
  moderatorUserId: string | null;
  serverId: string | null;
  actionType: ChatModerationActionType;
  reason: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ChatAuthLog = {
  id: string;
  userId: string | null;
  email: string | null;
  eventType: string;
  success: boolean;
  details: Record<string, unknown>;
  createdAt: string;
};

export type DirectMessagePreview = {
  id: string;
  label: string;
  user: ChatUserProfile | null;
};

export type ChatView =
  | { type: "home" }
  | { type: "server"; serverId: string; channelId: string }
  | { type: "dm"; dmId: string }
  | { type: "application"; applicationChatId: string };