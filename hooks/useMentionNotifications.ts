"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatServer, ChatUserProfile, ChatView } from "../types/chat";
import { supabase } from "../lib/supabase";
import { getServerChannels } from "../services/server.service";

type MentionNotifications = Record<
  string,
  {
    count: number;
    channelIds: string[];
  }
>;

type UseMentionNotificationsInput = {
  currentUser: ChatUserProfile | null;
  servers: ChatServer[];
  activeView: ChatView;
};

export function useMentionNotifications({
  currentUser,
  servers,
  activeView,
}: UseMentionNotificationsInput) {
  const [mentionNotifications, setMentionNotifications] =
    useState<MentionNotifications>({});

  const activeViewRef = useRef<ChatView>(activeView);
  const channelServerMapRef = useRef<Record<string, string>>({});
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    activeViewRef.current = activeView;
  }, [activeView]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("auros_seen_mentions_v2");
      if (saved) {
        seenMessageIdsRef.current = new Set(JSON.parse(saved));
      }
    } catch {
      seenMessageIdsRef.current = new Set();
    }
  }, []);

  function saveSeenMentions() {
    try {
      const ids = Array.from(seenMessageIdsRef.current).slice(-500);
      window.localStorage.setItem("auros_seen_mentions_v2", JSON.stringify(ids));
    } catch {}
  }

  function markSeen(messageId: string) {
    seenMessageIdsRef.current.add(messageId);
    saveSeenMentions();
  }

  function playMentionSound() {
    try {
      const audio = new Audio("/sounds/mention.mp3");
      audio.volume = 0.45;
      audio.play().catch(() => {});
    } catch {}
  }

  function playNotificationSound() {
    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.45;
      audio.play().catch(() => {});
    } catch {}
  }

function messageMentionsMe(content: string) {
  if (!currentUser?.id || !currentUser.username) return false;

  const lowerContent = content.toLowerCase();
  const username = currentUser.username.toLowerCase();

  return (
    lowerContent.includes(`@${username}`) ||
    content.includes(`<@${currentUser.id}>`) ||
    lowerContent.includes("@everyone") ||
    lowerContent.includes("@here")
  );
}

function addNotification(serverId: string, channelId: string) {
  setMentionNotifications((prev) => {
    const old = prev[serverId];

    return {
      ...prev,
      [serverId]: {
        count: (old?.count ?? 0) + 1,
        channelIds: old?.channelIds.includes(channelId)
          ? old.channelIds
          : [...(old?.channelIds ?? []), channelId],
      },
    };
  });
}

function clearChannelNotification(serverId: string, channelId: string) {
  setMentionNotifications((prev) => {
    const old = prev[serverId];
    if (!old) return prev;

    const channelIds = old.channelIds.filter((id) => id !== channelId);

    if (channelIds.length === 0) {
      const next = { ...prev };
      delete next[serverId];
      return next;
    }

    return {
      ...prev,
      [serverId]: {
        count: old.count,
        channelIds,
      },
    };
  });
}

  function clearServerNotifications(serverId: string) {
    setMentionNotifications((prev) => {
      const next = { ...prev };
      delete next[serverId];
      return next;
    });
  }

  useEffect(() => {
    if (!currentUser?.id || !currentUser.username || servers.length === 0) return;

    let mounted = true;

    async function buildChannelMap() {
      const nextMap: Record<string, string> = {};

      await Promise.all(
        servers.map(async (server) => {
          const channels = await getServerChannels(server.id).catch(() => []);

          for (const channel of channels) {
            nextMap[channel.id] = server.id;
          }
        })
      );

      if (mounted) {
        channelServerMapRef.current = nextMap;
      }

      return nextMap;
    }

    buildChannelMap();

    const subscription = supabase
      .channel(`mention-notifications:${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        async (payload) => {
          const row = payload.new as any;

          const messageId = row.id as string | undefined;
          const channelId = row.channel_id as string | null;
          const authorId = row.author_id as string | null;
          const content = row.content as string | null;

          if (!messageId || !channelId || !content) return;
          if (authorId === currentUser.id) return;
          if (seenMessageIdsRef.current.has(messageId)) return;
          if (!messageMentionsMe(content)) return;

          let serverId = channelServerMapRef.current[channelId];

          if (!serverId) {
            const rebuiltMap = await buildChannelMap();
            serverId = rebuiltMap[channelId];
          }

          if (!serverId) return;

          markSeen(messageId);

          const view = activeViewRef.current;

          const isCurrentChannel =
            view.type === "server" &&
            view.serverId === serverId &&
            view.channelId === channelId;

          if (isCurrentChannel) {
            playMentionSound();
            return;
          }

          addNotification(serverId, channelId);
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(subscription);
    };
  }, [currentUser?.id, currentUser?.username, servers]);

  return {
    mentionNotifications,
    clearChannelNotification,
    clearServerNotifications,
  };
}