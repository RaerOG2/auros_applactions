"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  ApplicantChatAccountItem,
  DirectConversationItem,
  DirectMessageItem,
  MessageReactionItem,
} from "../types/chat";
import type { CustomEmojiItem } from "../types/emoji";
import {
  createDirectConversation,
  getDirectMessages,
  sendDirectMessage,
} from "../services/dm-service";
import { getApplicantChatAccountByCode } from "../services/temp-account-service";
import { getCustomEmojis } from "../services/emoji-service";
import {
  getDirectReactionsMap,
  toggleReactionOnDirectMessage,
} from "../services/reaction-service";

type UseApplicantThreadParams = {
  chatIdentityCode?: string | null;
};

export function useApplicantThread({
  chatIdentityCode,
}: UseApplicantThreadParams) {
  const [account, setAccount] = useState<ApplicantChatAccountItem | null>(null);
  const [conversation, setConversation] = useState<DirectConversationItem | null>(null);
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [reactionsMap, setReactionsMap] = useState<Record<string, MessageReactionItem[]>>({});
  const [customEmojis, setCustomEmojis] = useState<CustomEmojiItem[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadThread() {
    if (!chatIdentityCode?.trim()) {
      setAccount(null);
      setConversation(null);
      setMessages([]);
      setReactionsMap({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const nextAccount = await getApplicantChatAccountByCode(chatIdentityCode.trim());
      setAccount(nextAccount);

      if (!nextAccount) {
        setConversation(null);
        setMessages([]);
        setReactionsMap({});
        return;
      }

      const { data: existingMembers, error: membersError } = await supabase
        .from("direct_conversation_members")
        .select(`
          conversation_id,
          direct_conversations!direct_conversation_members_conversation_id_fkey (
            id,
            is_applicant_thread,
            application_id,
            created_at
          )
        `)
        .eq("applicant_chat_account_id", nextAccount.id);

      if (membersError) {
        throw membersError;
      }

      const existingConversation =
        existingMembers?.find(
          (row: any) => row.direct_conversations?.is_applicant_thread === true
        )?.direct_conversations ?? null;

      let threadConversation = existingConversation as DirectConversationItem | null;

      if (!threadConversation) {
        threadConversation = await createDirectConversation({
          applicationId: nextAccount.application_id,
          isApplicantThread: true,
          memberApplicantAccountIds: [nextAccount.id],
        });
      }

      setConversation(threadConversation);

      const nextMessages = await getDirectMessages(threadConversation.id, 150);
      setMessages(nextMessages);

      const reactionMap = await getDirectReactionsMap(nextMessages.map((item) => item.id));
      setReactionsMap(reactionMap);
    } catch (error) {
      console.error("[ApplicantThread] loadThread failed:", error);
      setAccount(null);
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
      console.error("[ApplicantThread] loadCustomEmojis failed:", error);
      setCustomEmojis([]);
    }
  }

  async function sendApplicantMessage() {
    if (!account || !conversation) {
      alert("Applicant thread not available.");
      return;
    }

    const trimmed = messageInput.trim();
    if (!trimmed) return;

    try {
      setSending(true);

      await sendDirectMessage({
        conversationId: conversation.id,
        content: trimmed,
        authorApplicantAccountId: account.id,
      });

      setMessageInput("");
    } catch (error) {
      console.error("[ApplicantThread] sendMessage failed:", error);
      alert("Message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  async function toggleReaction(messageId: string, emojiKey: string) {
    if (!account) {
      alert("Applicant account is required to react.");
      return;
    }

    try {
      await toggleReactionOnDirectMessage({
        directMessageId: messageId,
        emojiKey,
        applicantChatAccountId: account.id,
      });

      const reactionMap = await getDirectReactionsMap(messages.map((item) => item.id));
      setReactionsMap(reactionMap);
    } catch (error) {
      console.error("[ApplicantThread] toggleReaction failed:", error);
    }
  }

  useEffect(() => {
    loadThread();
  }, [chatIdentityCode]);

  useEffect(() => {
    loadCustomEmojiData();
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;

    const channel = supabase
      .channel(`applicant-thread-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async () => {
          try {
            const nextMessages = await getDirectMessages(conversation.id, 150);
            setMessages(nextMessages);

            const reactionMap = await getDirectReactionsMap(
              nextMessages.map((item) => item.id)
            );
            setReactionsMap(reactionMap);
          } catch (error) {
            console.error("[ApplicantThread] realtime reload failed:", error);
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
            console.error("[ApplicantThread] reaction realtime reload failed:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id, messages]);

  const customEmojiMap = useMemo(() => {
    return customEmojis.reduce<Record<string, string>>((acc, emoji) => {
      acc[emoji.shortcode] = emoji.image_url;
      return acc;
    }, {});
  }, [customEmojis]);

  return {
    account,
    conversation,
    messages,
    reactionsMap,
    customEmojis,
    customEmojiMap,
    messageInput,
    setMessageInput,
    loading,
    sending,
    sendApplicantMessage,
    toggleReaction,
    reload: loadThread,
  };
}