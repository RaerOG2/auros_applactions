"use client";

import { useEffect, useRef } from "react";
import type { ChatMessageItem as ChatMessageItemType, MessageReactionItem } from "../../types/chat";
import type { ProfileItem } from "../../types/profile";
import ChatMessageItem from "./ChatMessageItem";

type ChatMessageListProps = {
  messages: ChatMessageItemType[];
  loading: boolean;
  profile: ProfileItem | null;
  reactionsMap: Record<string, MessageReactionItem[]>;
  onToggleReaction: (messageId: string, emojiKey: string) => void;
  customEmojiMap?: Record<string, string>;
  isUserOnline?: (profileId?: string | null) => boolean;
};

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "20px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

export default function ChatMessageList({
  messages,
  loading,
  profile,
  reactionsMap,
  onToggleReaction,
  customEmojiMap = {},
  isUserOnline,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <section style={glassCardStyle}>
      <h2 style={{ marginTop: 0, marginBottom: 14 }}>Messages</h2>

      {loading ? (
        <div style={{ color: "#9fb0d0" }}>Loading messages...</div>
      ) : messages.length === 0 ? (
        <div style={{ color: "#9fb0d0" }}>No messages yet.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 12,
            maxHeight: 620,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              isOwnMessage={!!profile && message.author_profile_id === profile.id}
              reactions={reactionsMap[message.id] ?? []}
              currentProfileId={profile?.id ?? null}
              onToggleReaction={onToggleReaction}
              customEmojiMap={customEmojiMap}
              isAuthorOnline={isUserOnline?.(message.author_profile_id) ?? false}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </section>
  );
}