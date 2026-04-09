"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  DirectConversationItem,
  DirectMessageItem,
  MessageReactionItem,
} from "../types/chat";
import type { ProfileItem } from "../types/profile";
import type { CustomEmojiItem } from "../types/emoji";
import {
  getDirectConversationById,
  getDirectMessages,
  getOrCreateDirectConversationBetweenProfiles,
} from "../services/dm-service";
import { sendDirectMessage } from "../services/dm-service";
import { getCustomEmojis } from "../services/emoji-service";
import {
  getDirectReactionsMap,
  toggleReactionOnDirectMessage,
} from "../services/reaction-service";
import { useMentions } from "./useMentions";

type UseDmConversationParams = {
  conversationId?: string | null;
  profile: ProfileItem | null;
};

export function useDmConversation({
  conversationId,
  profile,
}: UseDmConversationParams) {
  const [conversation, setConversation] = useState<DirectConversationItem | null>(null);
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [reactionsMap, setReactionsMap] = useState<Record<string, MessageReactionItem[]>>({});
  const [customEmojis, setCustomEmojis] = useState<CustomEmojiItem[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const mentions = useMentions(messageInput);

  async function loadConversation() {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      setReactionsMap({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const nextConversation = await getDirectConversationById(conversationId);
      setConversation(nextConversation);

      if (!nextConversation) {
        setMessages([]);
        setReactionsMap({});
        return;
      }

      const nextMessages = await getDirectMessages(conversationId, 150);
      setMessages(nextMessages);

      const reactionMap = await getDirectReactionsMap(nextMessages.map((item) => item.id));
      setReactionsMap(reactionMap);
    } catch (error) {
      console.error("[DM] loadConversation failed:", error);
      setConversation(null);
      setMessages([]);
      setReactionsMap({});
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomEmojiData() {
    try {
      const data = await getCustomEmojis();
      setCustomEmojis(data);
    } catch (error) {
      console.error("[DM] loadCustomEmojis failed:", error);
      setCustomEmojis([]);
    }
  }

  async function sendMessage() {
    if (!profile) {
      alert("You must be logged in to send direct messages.");
      return;
    }

    if (!conversationId) return;

    const trimmed = messageInput.trim();
    if (!trimmed) return;

    try {
      setSending(true);

      await sendDirectMessage({
        conversationId,
        content: trimmed,
        authorProfileId: profile.id,
      });

      setMessageInput("");
    } catch (error) {
      console.error("[DM] sendMessage failed:", error);
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
      await toggleReactionOnDirectMessage({
        directMessageId: messageId,
        emojiKey,
        profileId: profile.id,
      });

      const reactionMap = await getDirectReactionsMap(messages.map((item) => item.id));
      setReactionsMap(reactionMap);
    } catch (error) {
      console.error("[DM] toggleReaction failed:", error);
    }
  }

  async function createNewConversationWithProfile(targetProfileId: string) {
    if (!profile) {
      throw new Error("You must be logged in.");
    }

    const created = await getOrCreateDirectConversationBetweenProfiles({
      currentProfileId: profile.id,
      targetProfileId,
    });

    return created;
  }

  function applyMention(username: string) {
    setMessageInput(mentions.applyMention(messageInput, username));
  }

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    loadCustomEmojiData();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`dm-conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          try {
            const nextMessages = await getDirectMessages(conversationId, 150);
            setMessages(nextMessages);

            const reactionMap = await getDirectReactionsMap(
              nextMessages.map((item) => item.id)
            );
            setReactionsMap(reactionMap);
          } catch (error) {
            console.error("[DM] realtime reload failed:", error);
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
            const reactionMap = await getDirectReactionsMap(messages.map((item) => item.id));
            setReactionsMap(reactionMap);
          } catch (error) {
            console.error("[DM] reaction realtime reload failed:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, messages]);

  const customEmojiMap = useMemo(() => {
    return customEmojis.reduce<Record<string, string>>((acc, emoji) => {
      acc[emoji.shortcode] = emoji.image_url;
      return acc;
    }, {});
  }, [customEmojis]);

  return {
    conversation,
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
    reload: loadConversation,
    createNewConversationWithProfile,
    mentionResults: mentions.results,
    mentionLoading: mentions.loading,
    mentionOpen: mentions.hasActiveMention,
    applyMention,
  };
}