"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChatChannel,
  ChatCustomEmoji,
  ChatMessage,
  ChatServer,
  ChatUserProfile,
  ChatView,
  DirectConversation,
  DirectMessagePreview,
} from "../types/chat";
import {
  getOrCreateProfile,
  getProfileById,
  setOfflinePresence,
  subscribeToProfile,
  updateCurrentProfile,
  updatePresence,
  markStaleProfilesOffline,
} from "../services/profile.service";
import {
  createCustomEmoji,
  deleteCustomEmoji,
  getServerCustomEmojis,
  subscribeToServerCustomEmojis,
} from "../services/emoji.service";
import {
  createChannel,
  createServer,
  createServerInvite,
  deleteServer,
  getMyServerRole,
  getMyServers,
  getServerChannels,
  joinServerByInvite,
  updateServer,
  getServerMentionUsers,
} from "../services/server.service";
import {
  getDirectConversationOtherUser,
  getMyDirectConversations,
  getOrCreateDirectConversationWithUser,
} from "../services/dm.service";
import {
  deleteOwnMessage,
  getChannelMessages,
  getDirectMessages,
  sendChannelMessage,
  sendDirectMessage,
  subscribeToChannelMessages,
  subscribeToDirectMessages,
  toggleReaction,
  subscribeToMessageReactions,
  editOwnMessage,
  getChannelMessagesBefore,
  getDirectMessagesBefore,
} from "../services/chat.service";
import {
  kickServerMember,
  banServerMember as banServerMemberService,
  muteServerMember,
} from "../services/server-admin.service";
import {
  uploadServerIcon,
  uploadUserAvatar,
  uploadUserBanner,
  uploadChatAttachment,
} from "../services/storage.service";
import { useMentionNotifications } from "./useMentionNotifications";
import { usePresence } from "./usePresence";
import { supabase } from "../lib/supabase";

type ServerRole = "owner" | "admin" | "moderator" | "member" | null;

type ChatStateReturn = {
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;

  olderMessagesLoading: boolean;
  hasOlderMessages: boolean;
  loadOlderMessages: () => Promise<void>;

  currentUser: ChatUserProfile | null;
  servers: ChatServer[];
  channels: ChatChannel[];
  directConversations: DirectConversation[];
  dms: DirectMessagePreview[];
  createOrOpenDM: (userId: string) => Promise<void>;

  editMessage: (messageId: string, content: string) => Promise<void>;
  replyToMessage: ChatMessage | null;
  setReplyToMessage: (message: ChatMessage | null) => void;

  kickMember: (userId: string) => Promise<void>;
  banMember: (userId: string, reason?: string | null) => Promise<void>;
  muteMember: (userId: string, reason?: string | null) => Promise<void>;

  activeView: ChatView;
  activeServer: ChatServer | null;
  activeChannel: ChatChannel | null;
  activeMessages: ChatMessage[];
  activeDirectConversation: DirectConversation | null;
  activeDirectUser: ChatUserProfile | null;

  activeServerRole: ServerRole;
  serverInviteLink: string | null;
  serverMentionUsers: ChatUserProfile[];

  customEmojis: ChatCustomEmoji[];
  deleteCustomEmojiFromActiveServer: (emojiId: string) => Promise<void>;
  createNewCustomEmoji: (input: { name: string; file: File }) => Promise<void>;

  selectHome: () => void;
  selectServer: (serverId: string) => Promise<void>;
  selectChannel: (serverId: string, channelId: string) => void;
  selectDM: (dmId: string) => void;

  sendMessage: (content: string, files?: File[]) => Promise<void>;
  toggleMessageReaction: (messageId: string, emoji: string) => Promise<void>;
  mentionNotifications: Record<string, { count: number; channelIds: string[] }>;
  clearServerNotifications: (serverId: string) => void;

  createNewServer: (input: {
    name: string;
    slug?: string | null;
    description?: string | null;
    isPublic?: boolean;
  }) => Promise<void>;

  createNewChannel: (input: {
    name: string;
    type?: "text" | "announcement";
    topic?: string | null;
    isPrivate?: boolean;
  }) => Promise<void>;

  updateMyProfile: (input: {
    username?: string;
    displayName?: string;
    bio?: string | null;
    avatarFile?: File | null;
    bannerFile?: File | null;
    removeAvatar?: boolean;
    removeBanner?: boolean;
  }) => Promise<void>;

  updateActiveServer: (input: {
    name?: string;
    description?: string | null;
    iconFile?: File | null;
  }) => Promise<void>;

  deleteActiveServer: () => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  createInviteForActiveServer: () => Promise<void>;
  joinServerWithInvite: (tokenOrLink: string) => Promise<void>;
};

function extractInviteToken(tokenOrLink: string) {
  const value = tokenOrLink.trim();

  if (!value) return "";

  try {
    const url = new URL(value);
    return url.searchParams.get("invite") ?? "";
  } catch {
    return value;
  }
}

export function useChatState(): ChatStateReturn {
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [olderMessagesLoading, setOlderMessagesLoading] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<ChatUserProfile | null>(null);
  const [servers, setServers] = useState<ChatServer[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [serverMentionUsers, setServerMentionUsers] = useState<ChatUserProfile[]>([]);

  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);

  const [messagesByView, setMessagesByView] = useState<Record<string, ChatMessage[]>>({});

  const [directConversations, setDirectConversations] = useState<
    DirectConversation[]
  >([]);

  const [dmUsers, setDmUsers] = useState<Record<string, ChatUserProfile | null>>(
    {}
  );

  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const messagesCacheRef = useRef<Record<string, ChatMessage[]>>({});

  const [activeView, setActiveView] = useState<ChatView>({ type: "home" });
  const [activeServerRole, setActiveServerRole] = useState<ServerRole>(null);
  const [serverInviteLink, setServerInviteLink] = useState<string | null>(null);
  const [customEmojis, setCustomEmojis] = useState<ChatCustomEmoji[]>([]);

  const {
    mentionNotifications,
    clearChannelNotification,
    clearServerNotifications,
  } = useMentionNotifications({
    currentUser,
    servers,
    activeView,

  });

  usePresence(currentUser?.id);


  const dms = useMemo<DirectMessagePreview[]>(() => {
    return directConversations.map((conversation, index) => {
      const user = dmUsers[conversation.id] ?? null;

      return {
        id: conversation.id,
        label: user?.displayName ?? `Direct Message ${index + 1}`,
        user,
      };
    });
  }, [directConversations, dmUsers]);

  const activeServer = useMemo(() => {
    if (activeView.type !== "server") return null;
    return servers.find((server) => server.id === activeView.serverId) ?? null;
  }, [activeView, servers]);

  const activeChannel = useMemo(() => {
    if (activeView.type !== "server") return null;
    return channels.find((channel) => channel.id === activeView.channelId) ?? null;
  }, [activeView, channels]);

  const activeDirectConversation = useMemo(() => {
    if (activeView.type !== "dm") return null;
    return (
      directConversations.find(
        (conversation) => conversation.id === activeView.dmId
      ) ?? null
    );
  }, [activeView, directConversations]);

  const activeDirectUser = useMemo(() => {
    if (activeView.type !== "dm") return null;
    return dmUsers[activeView.dmId] ?? null;
  }, [activeView, dmUsers]);

  function getViewCacheKey(view: ChatView) {
    if (view.type === "server") return `server:${view.channelId}`;
    if (view.type === "dm") return `dm:${view.dmId}`;
    return "home";
  }

  function setCachedMessages(view: ChatView, messages: ChatMessage[]) {
    messagesCacheRef.current[getViewCacheKey(view)] = messages;
    setActiveMessages(messages);
  }

  function patchCachedMessages(
  view: ChatView,
  updater: (messages: ChatMessage[]) => ChatMessage[]
) {
  const key = getViewCacheKey(view);
  const current = messagesCacheRef.current[key] ?? [];

  const updated = updater(current);

  messagesCacheRef.current[key] = updated;

  if (getViewCacheKey(activeView) === key) {
    setActiveMessages(updated);
  }
}

  function cacheMessagesForView(view: ChatView, messages: ChatMessage[]) {
    const key = getViewCacheKey(view);

    setMessagesByView((prev) => ({
      ...prev,
      [key]: messages,
    }));
  }

  async function refreshActiveServerRole(serverId: string) {
    const role = await getMyServerRole(serverId).catch((roleError) => {
      console.warn("[useChatState] Failed to load server role:", roleError);
      return null;
    });

    setActiveServerRole(role);
  }

  async function refreshMessagesForView(view: ChatView) {
    if (view.type === "server") {
      return getChannelMessages(view.channelId);
    }

    if (view.type === "dm") {
      return getDirectMessages(view.dmId);
    }

    return [];
  }

  async function loadMessagesBefore(view: ChatView, beforeCreatedAt: string) {
    if (view.type === "server") {
      return getChannelMessagesBefore(view.channelId, beforeCreatedAt);
    }

    if (view.type === "dm") {
      return getDirectMessagesBefore(view.dmId, beforeCreatedAt);
    }

    return [];
  }

  async function refreshServerMembers(serverId: string) {
  const mentionUsers = await getServerMentionUsers(serverId).catch(() => []);
  setServerMentionUsers(mentionUsers);
}

async function kickMember(userId: string) {
  if (activeView.type !== "server") return;

  try {
    setError(null);

    await kickServerMember({
      serverId: activeView.serverId,
      userId,
    });

    await refreshServerMembers(activeView.serverId);
  } catch (kickError) {
    console.warn("[useChatState] Failed to kick member:", kickError);

    setError(
      kickError instanceof Error
        ? kickError.message
        : JSON.stringify(kickError)
    );
  }
}

async function banMember(userId: string, reason?: string | null) {
  if (activeView.type !== "server") return;

  try {
    setError(null);

    await banServerMemberService({
      serverId: activeView.serverId,
      userId,
      reason,
    });

    await refreshServerMembers(activeView.serverId);
  } catch (banError) {
    console.warn("[useChatState] Failed to ban member:", banError);

    setError(
      banError instanceof Error
        ? banError.message
        : JSON.stringify(banError)
    );
  }
}

async function muteMember(userId: string, reason?: string | null) {
  if (activeView.type !== "server") return;

  try {
    setError(null);

    await muteServerMember({
      serverId: activeView.serverId,
      userId,
      reason,
    });

    await refreshServerMembers(activeView.serverId);
  } catch (muteError) {
    console.warn("[useChatState] Failed to mute member:", muteError);

    setError(
      muteError instanceof Error
        ? muteError.message
        : JSON.stringify(muteError)
    );
  }
}

  useEffect(() => {
    markStaleProfilesOffline().catch(() => {});

    const interval = window.setInterval(() => {
      markStaleProfilesOffline().catch(() => {});
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (activeView.type !== "server") return;

    const serverId = activeView.serverId;

    const subscription = supabase
      .channel(`server-member-status-${serverId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        async () => {
          const users = await getServerMentionUsers(serverId).catch(() => []);
          setServerMentionUsers(users);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeView]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      setLoading(true);
      setError(null);

      try {
        const profile = await getOrCreateProfile();

        if (!isMounted) return;

        setCurrentUser(profile);

        const myServers = await getMyServers().catch((serverError) => {
          console.warn("[useChatState] Failed to load servers:", serverError);
          return [];
        });

        const myDirectConversations = await getMyDirectConversations().catch(
          (dmError) => {
            console.warn("[useChatState] Failed to load DMs:", dmError);
            return [];
          }
        );


        if (!isMounted) return;

        setServers(myServers);
        setDirectConversations(myDirectConversations);

        const dmUserEntries = await Promise.all(
          myDirectConversations.map(async (conversation) => {
            const otherUser = await getDirectConversationOtherUser(
              conversation.id
            ).catch((dmUserError) => {
              console.warn("[useChatState] Failed to load DM user:", dmUserError);
              return null;
            });

            return [conversation.id, otherUser] as const;
          })
        );

        if (isMounted) {
          setDmUsers(Object.fromEntries(dmUserEntries));
        }

        if (myServers.length > 0) {
          const firstServer = myServers[0];

          const serverChannels = await getServerChannels(firstServer.id).catch(
            (channelError) => {
              console.warn(
                "[useChatState] Failed to load channels:",
                channelError
              );
              return [];
            }
          );

          if (!isMounted) return;

          setChannels(serverChannels);
          await refreshActiveServerRole(firstServer.id);
          //Emojis
          const emojis = await getServerCustomEmojis(firstServer.id).catch(() => []);
          setCustomEmojis(emojis);
          //mention
          const mentionUsers = await getServerMentionUsers(firstServer.id).catch(() => []);
          setServerMentionUsers(mentionUsers);

          if (serverChannels.length > 0) {
            setActiveView({
              type: "server",
              serverId: firstServer.id,
              channelId: serverChannels[0].id,
            });
          } else {
            setActiveView({ type: "home" });
          }
        } else {
          setChannels([]);
          setActiveServerRole(null);
          setActiveView({ type: "home" });
        }
      } catch (loadError) {
        console.error("[useChatState] Failed to load profile:", loadError);

        if (isMounted) {
          setError("Failed to load your profile.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    const userId = currentUser.id;

    const subscription = subscribeToProfile(userId, async () => {
      try {
        const freshProfile = await getProfileById(userId);
        setCurrentUser(freshProfile);
      } catch (profileError) {
        console.error(
          "[useChatState] Failed to refresh current profile:",
          profileError
        );
      }
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (!activeDirectUser?.id || activeView.type !== "dm") return;

    const directUserId = activeDirectUser.id;
    const dmId = activeView.dmId;

    const subscription = subscribeToProfile(directUserId, async () => {
      try {
        const freshProfile = await getProfileById(directUserId);

        setDmUsers((prev) => ({
          ...prev,
          [dmId]: freshProfile,
        }));
      } catch (dmProfileError) {
        console.error(
          "[useChatState] Failed to refresh DM user profile:",
          dmProfileError
        );
      }
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeDirectUser?.id, activeView]);

;
useEffect(() => {
  if (activeView.type !== "server") return;

  const serverId = activeView.serverId;
  let isMounted = true;

  async function refreshEmojis() {
    try {
      const emojis = await getServerCustomEmojis(serverId);

      if (isMounted) {
        setCustomEmojis(emojis);
      }
    } catch (emojiError) {
      console.warn("[useChatState] Failed to refresh custom emojis:", emojiError);
    }
  }

  refreshEmojis();

  const subscription = subscribeToServerCustomEmojis(serverId, refreshEmojis);

  return () => {
    isMounted = false;
    supabase.removeChannel(subscription);
  };
}, [activeView]);


  useEffect(() => {
  let isMounted = true;

  setHasOlderMessages(true);

  if (activeView.type === "home") {
    setActiveMessages([]);
    setMessagesLoading(false);

    return () => {
      isMounted = false;
    };
  }

  const cacheKey = getViewCacheKey(activeView);
  const cachedMessages = messagesCacheRef.current[cacheKey];

  if (cachedMessages) {
    setActiveMessages(cachedMessages);
    setMessagesLoading(false);
  } else {
    setMessagesLoading(true);

    refreshMessagesForView(activeView)
      .then((messages) => {
        if (!isMounted) return;
        setCachedMessages(activeView, messages);
      })
      .catch((messageError) => {
        console.warn("[useChatState] Failed to load messages:", messageError);

        if (isMounted) {
          setError(
            messageError instanceof Error
              ? messageError.message
              : "Failed to load messages."
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setMessagesLoading(false);
        }
      });
  }

  async function handleMessageRealtime(payload: any) {
    if (!isMounted) return;

    const eventType = payload.eventType as "INSERT" | "UPDATE" | "DELETE";
    const row = payload.new as any;
    const oldRow = payload.old as any;

    if (eventType === "INSERT") {
      const refreshed = await refreshMessagesForView(activeView);
      if (!isMounted) return;

      setCachedMessages(activeView, refreshed);
      return;
    }

    if (eventType === "UPDATE") {
      const messageId = row?.id;
      if (!messageId) return;

      patchCachedMessages(activeView, (messages) =>
        messages
          .map((message) => {
            if (message.id !== messageId) return message;

            if (row.deleted_at) return null;

            return {
              ...message,
              content: row.content ?? message.content,
              editedAt: row.edited_at ?? message.editedAt,
            };
          })
          .filter(Boolean) as ChatMessage[]
      );

      return;
    }

    if (eventType === "DELETE") {
      const messageId = oldRow?.id;
      if (!messageId) return;

      patchCachedMessages(activeView, (messages) =>
        messages.filter((message) => message.id !== messageId)
      );
    }
  }

  let subscription:
    | ReturnType<typeof subscribeToChannelMessages>
    | ReturnType<typeof subscribeToDirectMessages>
    | null = null;

  if (activeView.type === "server") {
    subscription = subscribeToChannelMessages(
      activeView.channelId,
      handleMessageRealtime
    );
  }

  if (activeView.type === "dm") {
    subscription = subscribeToDirectMessages(activeView.dmId, handleMessageRealtime);
  }

  const reactionSubscription = subscribeToMessageReactions(async () => {
    const refreshed = await refreshMessagesForView(activeView);
    if (!isMounted) return;

    setCachedMessages(activeView, refreshed);
  });

  return () => {
    isMounted = false;

    if (subscription) {
      supabase.removeChannel(subscription);
    }

    supabase.removeChannel(reactionSubscription);
  };
}, [activeView]);

async function loadOlderMessages() {
  if (activeView.type === "home") return;
  if (olderMessagesLoading) return;

  const currentMessages =
    messagesCacheRef.current[getViewCacheKey(activeView)] ?? activeMessages;

  const oldestMessage = currentMessages[0];

  if (!oldestMessage) return;

  try {
    setOlderMessagesLoading(true);
    setError(null);

    const olderMessages = await loadMessagesBefore(
      activeView,
      oldestMessage.createdAt
    );

    if (olderMessages.length === 0) {
      setHasOlderMessages(false);
      return;
    }

    const existingIds = new Set(currentMessages.map((message) => message.id));

    const mergedMessages = [
      ...olderMessages.filter((message) => !existingIds.has(message.id)),
      ...currentMessages,
    ];

    const limitedMessages = mergedMessages.slice(0, 150);

    setCachedMessages(activeView, limitedMessages);
    setHasOlderMessages(olderMessages.length === 50);
  } catch (loadError) {
    console.warn("[useChatState] Failed to load older messages:", loadError);
    setError("Failed to load older messages.");
  } finally {
    setOlderMessagesLoading(false);
  }
}

async function refreshDirectConversations() {
  const conversations = await getMyDirectConversations().catch(() => []);

  setDirectConversations(conversations);

  const dmUserEntries = await Promise.all(
    conversations.map(async (conversation) => {
      const otherUser = await getDirectConversationOtherUser(conversation.id).catch(
        () => null
      );

      return [conversation.id, otherUser] as const;
    })
  );

  setDmUsers(Object.fromEntries(dmUserEntries));

  return conversations;
}

async function createOrOpenDM(userId: string) {
  try {
    setError(null);

    const conversation = await getOrCreateDirectConversationWithUser(userId);

    await refreshDirectConversations();

    setActiveServerRole(null);
    setServerInviteLink(null);
    setServerMentionUsers([]);

    setActiveView({
      type: "dm",
      dmId: conversation.id,
    });
  } catch (dmError) {
    console.warn("[useChatState] Failed to create/open DM:", dmError);

    setError(
      dmError instanceof Error ? dmError.message : "Failed to open direct message."
    );
  }
}

async function editMessage(messageId: string, content: string) {
  const trimmed = content.trim();

  if (!trimmed) {
    setError("Message cannot be empty.");
    return;
  }

  try {
    setError(null);

    await editOwnMessage({
      messageId,
      content: trimmed,
    });

    if (activeView.type !== "home") {
      const refreshed = await refreshMessagesForView(activeView);
      setActiveMessages(refreshed);
    }
  } catch (editError) {
    console.warn("[useChatState] Failed to edit message:", editError);

    setError(
      editError instanceof Error ? editError.message : "Failed to edit message."
    );
  }
}

  async function selectServer(serverId: string) {
  try {
    setError(null);
    setServerInviteLink(null);

    const serverChannels = await getServerChannels(serverId);
    setChannels(serverChannels);

    await refreshActiveServerRole(serverId);

    const emojis = await getServerCustomEmojis(serverId).catch(() => []);
    setCustomEmojis(emojis);

    const mentionUsers = await getServerMentionUsers(serverId).catch(() => []);
    setServerMentionUsers(mentionUsers);

    if (serverChannels.length > 0) {
      setActiveView({
        type: "server",
        serverId,
        channelId: serverChannels[0].id,
      });
    } else {
      setActiveView({ type: "home" });
    }
  } catch (selectError) {
    console.warn("[useChatState] Failed to select server:", selectError);
    setError("Failed to load the selected server.");
  }
}

  function selectChannel(serverId: string, channelId: string) {
  clearChannelNotification(serverId, channelId);

  setServerInviteLink(null);
  refreshActiveServerRole(serverId);

  getServerMentionUsers(serverId)
    .then(setServerMentionUsers)
    .catch(() => setServerMentionUsers([]));

  setActiveView({
    type: "server",
    serverId,
    channelId,
  });
}

  function selectDM(dmId: string) {
    setActiveServerRole(null);
    setServerInviteLink(null);
    setServerMentionUsers([]);

    setActiveView({
      type: "dm",
      dmId,
    });
  }

  function selectHome() {
    setActiveServerRole(null);
    setServerInviteLink(null);
    setServerMentionUsers([]);
    setActiveView({ type: "home" });
  }

  function encodeMentionsForStorage(content: string) {
  let encoded = content;

  for (const user of serverMentionUsers) {
    if (!user.username) continue;

    const escapedUsername = user.username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    encoded = encoded.replace(
      new RegExp(`@${escapedUsername}\\b`, "g"),
      `<@${user.id}>`
    );
  }

  return encoded;
}

async function sendMessage(content: string, files: File[] = []) {
  const trimmed = encodeMentionsForStorage(content.trim());

  if (!trimmed && files.length === 0) return;

  try {
    setError(null);

    const uploadedAttachments = await Promise.all(
      files.map(async (file) => {
        const fileUrl = await uploadChatAttachment(file);

        return {
          fileUrl,
          fileName: file.name,
          fileType: file.type || null,
          fileSize: file.size || null,
        };
      })
    );

    if (activeView.type === "server") {
      await sendChannelMessage({
        channelId: activeView.channelId,
        content: trimmed,
        attachments: uploadedAttachments,
        replyToId: replyToMessage?.id ?? null,
      });

      const refreshed = await getChannelMessages(activeView.channelId);
      setActiveMessages(refreshed);
    }

    if (activeView.type === "dm") {
      await sendDirectMessage({
        directConversationId: activeView.dmId,
        content: trimmed,
      });

      const refreshed = await getDirectMessages(activeView.dmId);
      setActiveMessages(refreshed);
    }

  } catch (sendError) {
    console.warn("[useChatState] Failed to send message:", sendError);

    setError(
      sendError instanceof Error ? sendError.message : "Failed to send message."
    );
  }
}

  async function toggleMessageReaction(messageId: string, emoji: string) {
    try {
      setError(null);

      await toggleReaction({ messageId, emoji });

      if (activeView.type !== "home") {
        const refreshed = await refreshMessagesForView(activeView);
        setActiveMessages(refreshed);
      }
    } catch (reactionError) {
      console.warn("[useChatState] Failed to toggle reaction:", reactionError);
      setError("Failed to toggle reaction.");
    }
  }

  async function createNewServer(input: {
    name: string;
    slug?: string | null;
    description?: string | null;
    isPublic?: boolean;
  }) {
    try {
      setError(null);
      setServerInviteLink(null);

      const newServer = await createServer(input);
      const refreshedServers = await getMyServers();
      const serverChannels = await getServerChannels(newServer.id).catch(() => []);

      setServers(refreshedServers);
      setChannels(serverChannels);

      await refreshActiveServerRole(newServer.id);

      if (serverChannels.length > 0) {
        setActiveView({
          type: "server",
          serverId: newServer.id,
          channelId: serverChannels[0].id,
        });
      } else {
        setActiveView({ type: "home" });
      }
    } catch (createError) {
      console.warn("[useChatState] Failed to create server:", createError);
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create server."
      );
    }
  }

  async function createNewChannel(input: {
    name: string;
    type?: "text" | "announcement";
    topic?: string | null;
    isPrivate?: boolean;
  }) {
    if (activeView.type !== "server") {
      setError("You need to be inside a server to create a channel.");
      return;
    }

    if (activeServerRole !== "owner" && activeServerRole !== "admin") {
      setError("Only server owners or admins can create channels.");
      return;
    }

    try {
      setError(null);

      const newChannel = await createChannel({
        serverId: activeView.serverId,
        name: input.name,
        type: input.type,
        topic: input.topic,
        isPrivate: input.isPrivate,
        position: channels.length,
      });

      const refreshedChannels = await getServerChannels(activeView.serverId);
      setChannels(refreshedChannels);

      await refreshActiveServerRole(activeView.serverId);

      setActiveView({
        type: "server",
        serverId: activeView.serverId,
        channelId: newChannel.id,
      });
    } catch (createError) {
      console.warn("[useChatState] Failed to create channel:", createError);
      setError("Failed to create channel.");
    }
  }

  async function updateMyProfile(input: {
    username?: string;
    displayName?: string;
    bio?: string | null;
    avatarFile?: File | null;
    bannerFile?: File | null;
    removeAvatar?: boolean;
    removeBanner?: boolean;
  }) {
    try {
      setError(null);

      let avatarUrl: string | null | undefined = undefined;
      let bannerUrl: string | null | undefined = undefined;

      if (input.removeAvatar) {
        avatarUrl = null;
      } else if (input.avatarFile) {
        avatarUrl = await uploadUserAvatar(input.avatarFile);
      }

      if (input.removeBanner) {
        bannerUrl = null;
      } else if (input.bannerFile) {
        bannerUrl = await uploadUserBanner(input.bannerFile);
      }

      const updated = await updateCurrentProfile({
        username: input.username,
        displayName: input.displayName,
        bio: input.bio,
        avatarUrl,
        bannerUrl,
      });

      setCurrentUser(updated);
    } catch (updateError) {
      console.warn("[useChatState] Failed to update profile:", updateError);
      setError("Failed to update profile.");
    }
  }

  async function updateActiveServer(input: {
    name?: string;
    description?: string | null;
    iconFile?: File | null;
  }) {
    if (!activeServer) {
      setError("No active server selected.");
      return;
    }

    try {
      setError(null);

      let iconUrl: string | null | undefined = undefined;

      if (input.iconFile) {
        iconUrl = await uploadServerIcon(input.iconFile);
      }

      const updatedServer = await updateServer({
        serverId: activeServer.id,
        name: input.name,
        description: input.description,
        iconUrl,
      });

      const refreshedServers = servers.map((server) =>
        server.id === updatedServer.id ? updatedServer : server
      );

      setServers(refreshedServers);
    } catch (updateError) {
      console.warn("[useChatState] Failed to update server:", updateError);
      setError("Failed to update server.");
    }
  }

  async function deleteActiveServer() {
    if (activeView.type !== "server") {
      setError("No server selected.");
      return;
    }

    if (activeServer?.slug === "auros-community") {
      setError("The Auros Community server cannot be deleted.");
      return;
    }

    if (activeServerRole !== "owner") {
      setError("Only the server owner can delete this server.");
      return;
    }

    try {
      setError(null);

      await deleteServer(activeView.serverId);

      const refreshedServers = await getMyServers();
      setServers(refreshedServers);
      setServerInviteLink(null);
      setActiveServerRole(null);

      if (refreshedServers.length > 0) {
        const firstServer = refreshedServers[0];
        const serverChannels = await getServerChannels(firstServer.id).catch(
          () => []
        );

        setChannels(serverChannels);
        await refreshActiveServerRole(firstServer.id);

        if (serverChannels.length > 0) {
          setActiveView({
            type: "server",
            serverId: firstServer.id,
            channelId: serverChannels[0].id,
          });
        } else {
          setActiveView({ type: "home" });
        }
      } else {
        setChannels([]);
        setActiveView({ type: "home" });
      }
    } catch (deleteError) {
      console.warn("[useChatState] Failed to delete server:", deleteError);

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete server."
      );
    }
  }

  async function deleteMessage(messageId: string) {
    try {
      setError(null);

      await deleteOwnMessage(messageId);

      if (activeView.type !== "home") {
        const refreshed = await refreshMessagesForView(activeView);
        setActiveMessages(refreshed);
      }
    } catch (deleteError) {
      console.warn("[useChatState] Failed to delete message:", deleteError);

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete message."
      );
    }
  }

  async function createInviteForActiveServer() {
    if (activeView.type !== "server") {
      setError("No server selected.");
      return;
    }

    if (
      activeServerRole !== "owner" &&
      activeServerRole !== "admin" &&
      activeServerRole !== "moderator"
    ) {
      setError("You do not have permission to create an invite.");
      return;
    }

    try {
      setError(null);

      const token = await createServerInvite(activeView.serverId);
      const origin = window.location.origin;

      setServerInviteLink(`${origin}/chat?invite=${token}`);
    } catch (inviteError) {
      console.warn("[useChatState] Failed to create invite:", inviteError);

      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "Failed to create invite."
      );
    }
  }

  async function joinServerWithInvite(tokenOrLink: string) {
    const token = extractInviteToken(tokenOrLink);

    if (!token) {
      setError("Please enter a valid invite link or token.");
      return;
    }

    try {
      setError(null);

      const joinedServer = await joinServerByInvite(token);
      const refreshedServers = await getMyServers();
      const serverChannels = await getServerChannels(joinedServer.id).catch(
        () => []
      );

      setServers(refreshedServers);
      setChannels(serverChannels);
      setServerInviteLink(null);

      await refreshActiveServerRole(joinedServer.id);

      if (serverChannels.length > 0) {
        setActiveView({
          type: "server",
          serverId: joinedServer.id,
          channelId: serverChannels[0].id,
        });
      } else {
        setActiveView({ type: "home" });
      }
    } catch (joinError) {
      console.warn("[useChatState] Failed to join server:", joinError);

      setError(
        joinError instanceof Error ? joinError.message : "Failed to join server."
      );
    }
  }

async function createNewCustomEmoji(input: {
  name: string;
  file: File;
}) {
  if (activeView.type !== "server") {
    setError("You need to be inside a server to create custom emojis.");
    return;
  }

  try {
    setError(null);

    await createCustomEmoji({
      serverId: activeView.serverId,
      name: input.name,
      file: input.file,
    });

    // 🔥 WICHTIG: DIREKT NEU LADEN
    const emojis = await getServerCustomEmojis(activeView.serverId);
    setCustomEmojis(emojis);
  } catch (emojiError) {
    console.warn("[useChatState] Failed to create custom emoji:", emojiError);

    setError(
      emojiError instanceof Error
        ? emojiError.message
        : "Failed to create custom emoji."
    );
  }
}

async function deleteCustomEmojiFromActiveServer(emojiId: string) {
  if (activeView.type !== "server") {
    setError("You need to be inside a server to delete custom emojis.");
    return;
  }

  try {
    setError(null);

    await deleteCustomEmoji(emojiId);

    const emojis = await getServerCustomEmojis(activeView.serverId);
    setCustomEmojis(emojis);
  } catch (emojiError) {
    console.warn("[useChatState] Failed to delete custom emoji:", emojiError);
    setError(
      emojiError instanceof Error
        ? emojiError.message
        : "Failed to delete custom emoji."
    );
  }
}

  return {
    loading,
    messagesLoading,
    error,
    currentUser,
    servers,
    channels,
    directConversations,
    dms,
    activeView,
    activeServer,
    activeChannel,
    activeMessages,
    activeDirectConversation,
    activeDirectUser,
    activeServerRole,
    serverInviteLink,
    customEmojis,
    serverMentionUsers,
    mentionNotifications,
    replyToMessage,
    olderMessagesLoading,
    hasOlderMessages,
    kickMember,
    banMember,
    muteMember,
    loadOlderMessages,
    editMessage,
    setReplyToMessage,
    clearServerNotifications,
    deleteCustomEmojiFromActiveServer,
    createNewCustomEmoji,
    selectHome,
    selectServer,
    selectChannel,
    selectDM,
    sendMessage,
    toggleMessageReaction,
    createNewServer,
    updateMyProfile,
    updateActiveServer,
    deleteActiveServer,
    deleteMessage,
    createInviteForActiveServer,
    joinServerWithInvite,
    createOrOpenDM,
  };
}