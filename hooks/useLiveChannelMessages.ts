"use client";

import { useEffect, useState } from "react";
import type { ChatMessage } from "../types/chat";
import {
  getChannelMessages,
  subscribeToChannelMessages,
} from "../services/chat.service";
import { supabase } from "../lib/supabase";

export function useLiveChannelMessages(channelId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const safeChannelId = channelId;
    let isMounted = true;

    async function loadMessages() {
      setLoading(true);

      try {
        const data = await getChannelMessages(safeChannelId);

        if (isMounted) {
          setMessages(data);
        }
      } catch (error) {
        console.error(
          "[useLiveChannelMessages] Failed to load messages:",
          error
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMessages();

    const subscription = subscribeToChannelMessages(safeChannelId, async () => {
      try {
        const freshMessages = await getChannelMessages(safeChannelId);

        if (isMounted) {
          setMessages(freshMessages);
        }
      } catch (error) {
        console.error(
          "[useLiveChannelMessages] Failed to refresh messages:",
          error
        );
      }
    });

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, [channelId]);

  return {
    messages,
    loading,
  };
}