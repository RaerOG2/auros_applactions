"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  ChatChannelItem,
  ChatMessageItem,
  MessageReactionItem,
} from "../types/chat";
import type { ProfileItem } from "../types/profile";
import type { CustomEmojiItem } from "../types/emoji";
import {
  canAccessChannel,
  getChannelMessages,
  getChatChannelBySlug,
  getVisibleChatChannels,
  sendChannelMessage,
} from "../services/chat-service";
import { getCustomEmojis } from "../services/emoji-service";
import {
  getChannelReactionsMap,
  toggleReactionOnChannelMessage,
} from "../services/reaction-service";
import { useMentions } from "./useMentions";

type UseChatRoomParams = {
  channelSlug?: string;
  profile: ProfileItem | null;
};

export function useChatRoom({ channelSlug = "general", profile }: UseChatRoomParams) {
  const [channels, setChannels] = useState<ChatChannelItem[]>([]);
  const [currentChannel, setCurrentChannel] = useState<ChatChannelItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [reactionsMap, setReactionsMap] = useState<Record<string, MessageReactionItem[]>>({});
  const [customEmojis, setCustomEmojis] = useState<CustomEmojiItem[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const mentions = useMentions(messageInput);

  async function loadChannels() {
    try {
      const data = await getVisibleChatChannels(profile?.id ?? null);
      setChannels(data);
    } catch (error) {
      console.error("[Chat] loadChannels failed:", error);
      setChannels([]);
    }
  }

  async function loadCustomEmojiData() {
    try {
      const data = await getCustomEmojis();
      setCustomEmojis(data);
    } catch (error) {
      console.error("[Chat] loadCustomEmojis failed:", error);
      setCustomEmojis([]);
    }
  }

  async function loadChannelAndMessages() {
    try {
      setLoading(true);
      setAccessDenied(false);

      const channel = await getChatChannelBySlug(channelSlug);
      setCurrentChannel(channel);

      if (!channel) {
        setMessages([]);
        setReactionsMap({});
        return;
      }

      const allowed = await canAccessChannel(channel.id, profile?.id ?? null);
      if (!allowed) {
        setMessages([]);
        setReactionsMap({});
        setAccessDenied(true);
        return;
      }

      const nextMessages = await getChannelMessages(channel.id, 150);
      setMessages(nextMessages);

      const reactionMap = await getChannelReactionsMap(nextMessages.map((item) => item.id));
      setReactionsMap(reactionMap);
    } catch (error) {
      console.error("[Chat] loadChannelAndMessages failed:", error);
      setMessages([]);
      setReactionsMap({});
      setCurrentChannel(null);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!profile) {
      alert("You must be logged in to send messages.");
      return;
    }

    const trimmed = messageInput.trim();
    if (!trimmed || !currentChannel) return;

    try {
      setSending(true);

      await sendChannelMessage({
        channelId: currentChannel.id,
        content: trimmed,
        authorProfileId: profile.id,
      });

      setMessageInput("");
    } catch (error) {
      console.error("[Chat] sendMessage failed:", error);
      alert("Message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  async function toggleReaction(messageId: string, emojiKey: string) {
    if (!profile) {
      alert("You must be logged in to react.");
      return;
    }

    try {
      await toggleReactionOnChannelMessage({
        messageId,
        emojiKey,
        profileId: profile.id,
      });

      const reactionMap = await getChannelReactionsMap(messages.map((item) => item.id));
      setReactionsMap(reactionMap);
    } catch (error) {
      console.error("[Chat] toggleReaction failed:", error);
    }
  }

  function applyMention(username: string) {
    setMessageInput(mentions.applyMention(messageInput, username));
  }

  useEffect(() => {
    loadChannels();
    loadCustomEmojiData();
  }, [profile?.id]);

  useEffect(() => {
    loadChannelAndMessages();
  }, [channelSlug, profile?.id]);

  useEffect(() => {
    if (!currentChannel?.id || accessDenied) return;

    const channel = supabase
      .channel(`chat-room-${currentChannel.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${currentChannel.id}`,
        },
        async () => {
          try {
            const nextMessages = await getChannelMessages(currentChannel.id, 150);
            setMessages(nextMessages);

            const reactionMap = await getChannelReactionsMap(
              nextMessages.map((item) => item.id)
            );
            setReactionsMap(reactionMap);
          } catch (error) {
            console.error("[Chat] realtime reload failed:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        async () => {
          try {
            const reactionMap = await getChannelReactionsMap(messages.map((item) => item.id));
            setReactionsMap(reactionMap);
          } catch (error) {
            console.error("[Chat] reaction realtime reload failed:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentChannel?.id, messages, accessDenied]);

  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => a.name.localeCompare(b.name));
  }, [channels]);

  const customEmojiMap = useMemo(() => {
    return customEmojis.reduce<Record<string, string>>((acc, emoji) => {
      acc[emoji.shortcode] = emoji.image_url;
      return acc;
    }, {});
  }, [customEmojis]);

  return {
    channels: sortedChannels,
    currentChannel,
    messages,
    reactionsMap,
    customEmojis,
    customEmojiMap,
    messageInput,
    setMessageInput,
    loading,
    sending,
    sendMessage,
    toggleReaction,
    reload: loadChannelAndMessages,
    mentionResults: mentions.results,
    mentionLoading: mentions.loading,
    mentionOpen: mentions.hasActiveMention,
    applyMention,
    accessDenied,
  };
}