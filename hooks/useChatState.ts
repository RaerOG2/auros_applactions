"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ApplicationChat,
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
} from "../services/profile.service";
import {
  createCustomEmoji,
  deleteCustomEmoji,
  getServerCustomEmojis,
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
} from "../services/dm.service";
import {
  deleteOwnMessage,
  getApplicationChatMessages,
  getChannelMessages,
  getDirectMessages,
  sendApplicationChatMessage,
  sendChannelMessage,
  sendDirectMessage,
  subscribeToApplicationChatMessages,
  subscribeToChannelMessages,
  subscribeToDirectMessages,
  toggleReaction,
  subscribeToMessageReactions,
} from "../services/chat.service";
import { getMyApplicationChats } from "../services/application-chat.service";
import {
  uploadServerIcon,
  uploadUserAvatar,
  uploadUserBanner,
  uploadChatAttachment,
} from "../services/storage.service";
import { supabase } from "../lib/supabase";

type ServerRole = "owner" | "admin" | "moderator" | "member" | null;

type ChatStateReturn = {
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;

  currentUser: ChatUserProfile | null;
  servers: ChatServer[];
  channels: ChatChannel[];
  directConversations: DirectConversation[];
  dms: DirectMessagePreview[];
  applicationChats: ApplicationChat[];

  activeView: ChatView;
  activeServer: ChatServer | null;
  activeChannel: ChatChannel | null;
  activeMessages: ChatMessage[];
  activeDirectConversation: DirectConversation | null;
  activeDirectUser: ChatUserProfile | null;
  activeApplicationChat: ApplicationChat | null;

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
  selectApplicationChat: (applicationChatId: string) => void;

  sendMessage: (content: string, files?: File[]) => Promise<void>;
  toggleMessageReaction: (messageId: string, emoji: string) => Promise<void>;

  createNewServer: (input: {
    name: string;
    slug?: string | null;
    description?: string | null;
    isPublic?: boolean;
  }) => Promise<void>;

  createNewChannel: (input: {
    name: string;
    type?: "text" | "announcement" | "application";
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
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<ChatUserProfile | null>(null);
  const [servers, setServers] = useState<ChatServer[]>([]);
  const [serverMentionUsers, setServerMentionUsers] = useState<ChatUserProfile[]>([]);
  const lastMentionMessageIdRef = useRef<string | null>(null);

  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [directConversations, setDirectConversations] = useState<
    DirectConversation[]
  >([]);
  const [dmUsers, setDmUsers] = useState<Record<string, ChatUserProfile | null>>(
    {}
  );
  const [applicationChats, setApplicationChats] = useState<ApplicationChat[]>([]);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);

  const [activeView, setActiveView] = useState<ChatView>({ type: "home" });
  const [activeServerRole, setActiveServerRole] = useState<ServerRole>(null);
  const [serverInviteLink, setServerInviteLink] = useState<string | null>(null);
  const [customEmojis, setCustomEmojis] = useState<ChatCustomEmoji[]>([]);

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

  const activeApplicationChat = useMemo(() => {
    if (activeView.type !== "application") return null;
    return (
      applicationChats.find(
        (applicationChat) =>
          applicationChat.id === activeView.applicationChatId
      ) ?? null
    );
  }, [activeView, applicationChats]);

  async function refreshActiveServerRole(serverId: string) {
    const role = await getMyServerRole(serverId).catch((roleError) => {
      console.warn("[useChatState] Failed to load server role:", roleError);
      return null;
    });

    setActiveServerRole(role);
  }


function playMentionSound() {
  try {
    const audio = new Audio("/sounds/mention.mp3");
    audio.volume = 0.45;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

function checkMentions(messages: ChatMessage[]) {
  if (!currentUser?.username) return;

  const username = currentUser.username.toLowerCase();

  const mentionMessage = [...messages].reverse().find((message) => {
    return message.content.toLowerCase().includes(`@${username}`);
  });

  if (!mentionMessage) return;

  if (lastMentionMessageIdRef.current === mentionMessage.id) {
    return;
  }

  lastMentionMessageIdRef.current = mentionMessage.id;
  playMentionSound();
}

  async function refreshMessagesForView(view: ChatView) {
    if (view.type === "server") {
      return getChannelMessages(view.channelId);
    }

    if (view.type === "dm") {
      return getDirectMessages(view.dmId);
    }

    if (view.type === "application") {
      return getApplicationChatMessages(view.applicationChatId);
    }

    return [];
  }

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

        const myApplicationChats = await getMyApplicationChats().catch(
          (applicationError) => {
            console.warn(
              "[useChatState] Failed to load application chats:",
              applicationError
            );
            return [];
          }
        );

        if (!isMounted) return;

        setServers(myServers);
        setDirectConversations(myDirectConversations);
        setApplicationChats(myApplicationChats);

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
    let cancelled = false;

    async function startPresence() {
      try {
        await updatePresence("online");

        const freshProfile = await getProfileById(userId);

        if (!cancelled) {
          setCurrentUser(freshProfile);
        }
      } catch (presenceError) {
        if (!cancelled) {
          console.error("[useChatState] Failed to update presence:", presenceError);
        }
      }
    }

    startPresence();

    const interval = window.setInterval(() => {
      updatePresence("online").catch((presenceError) => {
        console.error("[useChatState] Failed to refresh presence:", presenceError);
      });
    }, 15000);

    const handleBeforeUnload = () => {
      setOfflinePresence().catch(() => {});
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setOfflinePresence().catch(() => {});
    };
  }, [currentUser?.id]);

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

useEffect(() => {
  let isMounted = true;

  async function loadMessagesForActiveView() {
    if (activeView.type === "home") {
      setActiveMessages([]);
      setMessagesLoading(false);
      return;
    }

    setMessagesLoading(true);

    try {
      const messages = await refreshMessagesForView(activeView);

      if (isMounted) {
        setActiveMessages(messages);
        checkMentions(messages);
      }
    } catch (messageError) {
      console.warn("[useChatState] Failed to load messages:", messageError);

      if (isMounted) {
        setError(
          messageError instanceof Error
            ? messageError.message
            : "Failed to load messages."
        );
      }
    } finally {
      if (isMounted) {
        setMessagesLoading(false);
      }
    }
  }

  loadMessagesForActiveView();

  const liveFallbackInterval = window.setInterval(() => {
    if (activeView.type === "home") return;

    refreshMessagesForView(activeView)
      .then((messages) => {
        if (isMounted) {
          setActiveMessages(messages);
          checkMentions(messages);
        }
      })
      .catch((refreshError) => {
        console.warn("[useChatState] Live fallback refresh failed:", refreshError);
      });
  }, 2500);

  if (activeView.type === "home") {
    return () => {
      isMounted = false;
        window.clearInterval(liveFallbackInterval);
    };
  }

  let subscription:
    | ReturnType<typeof subscribeToChannelMessages>
    | ReturnType<typeof subscribeToDirectMessages>
    | ReturnType<typeof subscribeToApplicationChatMessages>
    | null = null;

  if (activeView.type === "server") {
    const safeChannelId = activeView.channelId;

    subscription = subscribeToChannelMessages(safeChannelId, async () => {
      try {
        const refreshed = await getChannelMessages(safeChannelId);

        if (isMounted) {
          setActiveMessages(refreshed);
        }
      } catch (refreshError) {
        console.warn(
          "[useChatState] Failed to refresh channel messages:",
          refreshError
        );
      }
    });
  }

  if (activeView.type === "dm") {
    const safeDmId = activeView.dmId;

    subscription = subscribeToDirectMessages(safeDmId, async () => {
      try {
        const refreshed = await getDirectMessages(safeDmId);

        if (isMounted) {
          setActiveMessages(refreshed);
        }
      } catch (refreshError) {
        console.warn("[useChatState] Failed to refresh DM messages:", refreshError);
      }
    });
  }

  if (activeView.type === "application") {
    const safeApplicationChatId = activeView.applicationChatId;

    subscription = subscribeToApplicationChatMessages(
      safeApplicationChatId,
      async () => {
        try {
          const refreshed = await getApplicationChatMessages(
            safeApplicationChatId
          );

          if (isMounted) {
            setActiveMessages(refreshed);
          }
        } catch (refreshError) {
          console.warn(
            "[useChatState] Failed to refresh application chat messages:",
            refreshError
          );
        }
      }
    );
  }

  const reactionSubscription = subscribeToMessageReactions(async () => {
    try {
      const refreshed = await refreshMessagesForView(activeView);

      if (isMounted) {
        setActiveMessages(refreshed);
      }
    } catch (reactionRefreshError) {
      console.warn(
        "[useChatState] Failed to refresh message reactions:",
        reactionRefreshError
      );
    }
  });

  return () => {
    isMounted = false;
    window.clearInterval(liveFallbackInterval);

    if (subscription) {
      supabase.removeChannel(subscription);
    }

    supabase.removeChannel(reactionSubscription);
  };
}, [activeView]);

  async function selectServer(serverId: string) {
    try {
      setError(null);
      setServerInviteLink(null);

      const serverChannels = await getServerChannels(serverId);
      setChannels(serverChannels);

      await refreshActiveServerRole(serverId);;
      //Custom Emojis
      const emojis = await getServerCustomEmojis(serverId).catch(() => []);
      setCustomEmojis(emojis);
      //Mentation
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

  function selectApplicationChat(applicationChatId: string) {
    setActiveServerRole(null);
    setServerInviteLink(null);
    setServerMentionUsers([]);

    setActiveView({
      type: "application",
      applicationChatId,
    });
  }

  function selectHome() {
    setActiveServerRole(null);
    setServerInviteLink(null);
    setServerMentionUsers([]);
    setActiveView({ type: "home" });
  }

async function sendMessage(content: string, files: File[] = []) {
  const trimmed = content.trim();

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

    if (activeView.type === "application") {
      await sendApplicationChatMessage({
        applicationChatId: activeView.applicationChatId,
        content: trimmed,
      });

      const refreshed = await getApplicationChatMessages(
        activeView.applicationChatId
      );
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
    type?: "text" | "announcement" | "application";
    topic?: string | null;
    isPrivate?: boolean;
  }) {
    if (activeView.type !== "server") {
      setError("You need to be inside a server to create a channel.");
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

async function createNewCustomEmoji(input: { name: string; file: File }) {
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
    applicationChats,
    activeView,
    activeServer,
    activeChannel,
    activeMessages,
    activeDirectConversation,
    activeDirectUser,
    activeApplicationChat,
    activeServerRole,
    serverInviteLink,
    customEmojis,
    serverMentionUsers,
    deleteCustomEmojiFromActiveServer,
    createNewCustomEmoji,
    selectHome,
    selectServer,
    selectChannel,
    selectDM,
    selectApplicationChat,
    sendMessage,
    toggleMessageReaction,
    createNewServer,
    createNewChannel,
    updateMyProfile,
    updateActiveServer,
    deleteActiveServer,
    deleteMessage,
    createInviteForActiveServer,
    joinServerWithInvite,
  };
}