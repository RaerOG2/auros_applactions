"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatChannelItem } from "../types/chat";
import type { DirectConversationListItem } from "../services/dm-service";
import type { ChatMessageItem } from "../types/chat";
import { getChannelLastMessageMap } from "../services/chat-service";

type UseUnreadCountsParams = {
  channels: ChatChannelItem[];
  conversations: DirectConversationListItem[];
  currentChannelSlug?: string;
  currentConversationId?: string | null;
  mode: "friends" | "dm" | "channel";
};

const channelKey = (slug: string) => `auros:last-read:channel:${slug}`;
const dmKey = (conversationId: string) => `auros:last-read:dm:${conversationId}`;

function getStoredTimestamp(key: string) {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(key) || "";
}

function setStoredTimestamp(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

export function useUnreadCounts({
  channels,
  conversations,
  currentChannelSlug,
  currentConversationId,
  mode,
}: UseUnreadCountsParams) {
  const [channelLastMessages, setChannelLastMessages] = useState<Record<string, ChatMessageItem | null>>({});

  async function loadChannelLastMessages() {
    try {
      const map = await getChannelLastMessageMap(channels.map((channel) => channel.id));
      setChannelLastMessages(map);
    } catch (error) {
      console.error("[Unread] loadChannelLastMessages failed:", error);
      setChannelLastMessages({});
    }
  }

  useEffect(() => {
    loadChannelLastMessages();
  }, [channels.map((item) => item.id).join("|")]);

  useEffect(() => {
    if (mode === "channel" && currentChannelSlug) {
      const currentChannel = channels.find((item) => item.slug === currentChannelSlug);
      if (!currentChannel) return;

      const latestMessageAt = channelLastMessages[currentChannel.id]?.created_at;
      if (!latestMessageAt) return;

      setStoredTimestamp(channelKey(currentChannelSlug), latestMessageAt);
    }
  }, [mode, currentChannelSlug, channels, channelLastMessages]);

  useEffect(() => {
    if (mode === "dm" && currentConversationId) {
      const currentConversation = conversations.find(
        (item) => item.conversation.id === currentConversationId
      );

      const latestMessageAt =
        currentConversation?.lastMessage?.created_at || currentConversation?.conversation.created_at;

      if (!latestMessageAt) return;
      setStoredTimestamp(dmKey(currentConversationId), latestMessageAt);
    }
  }, [mode, currentConversationId, conversations]);

  const channelUnreadMap = useMemo(() => {
    const next: Record<string, number> = {};

    channels.forEach((channel) => {
      const latestMessageAt = channelLastMessages[channel.id]?.created_at;
      if (!latestMessageAt) {
        next[channel.slug] = 0;
        return;
      }

      const lastRead = getStoredTimestamp(channelKey(channel.slug));
      next[channel.slug] = !lastRead || new Date(latestMessageAt).getTime() > new Date(lastRead).getTime() ? 1 : 0;
    });

    return next;
  }, [channels, channelLastMessages]);

  const dmUnreadMap = useMemo(() => {
    const next: Record<string, number> = {};

    conversations.forEach((item) => {
      const latestMessageAt = item.lastMessage?.created_at || item.conversation.created_at;
      const lastRead = getStoredTimestamp(dmKey(item.conversation.id));

      next[item.conversation.id] =
        !lastRead || new Date(latestMessageAt).getTime() > new Date(lastRead).getTime() ? 1 : 0;
    });

    return next;
  }, [conversations]);

  const totalDmUnread = useMemo(() => {
    return Object.values(dmUnreadMap).reduce((sum, value) => sum + value, 0);
  }, [dmUnreadMap]);

  const totalChannelUnread = useMemo(() => {
    return Object.values(channelUnreadMap).reduce((sum, value) => sum + value, 0);
  }, [channelUnreadMap]);

  return {
    channelUnreadMap,
    dmUnreadMap,
    totalDmUnread,
    totalChannelUnread,
    reloadUnread: loadChannelLastMessages,
  };
}