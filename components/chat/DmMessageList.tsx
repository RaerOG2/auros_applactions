"use client";

import { useEffect, useRef, useState } from "react";
import type { DirectMessageItem, MessageReactionItem } from "../../types/chat";
import type { ProfileItem } from "../../types/profile";
import { chatTheme, chatUi } from "../../lib/chat-theme";
import Avatar from "./Avatar";
import ProfileMiniCard from "./ProfileMiniCard";
import ReactionBar from "./ReactionBar";
import PresenceDot from "./PresenceDot";

type DmMessageListProps = {
  messages: DirectMessageItem[];
  loading: boolean;
  profile: ProfileItem | null;
  reactionsMap: Record<string, MessageReactionItem[]>;
  onToggleReaction: (messageId: string, emojiKey: string) => void;
  customEmojiMap?: Record<string, string>;
  currentApplicantAccountId?: string | null;
  isUserOnline?: (profileId?: string | null) => boolean;
};

function renderContentWithCustomEmoji(
  content: string,
  customEmojiMap: Record<string, string>
) {
  const parts = content.split(/(:[a-zA-Z0-9_.-]+:)/g);

  return parts.map((part, index) => {
    const match = part.match(/^:([a-zA-Z0-9_.-]+):$/);
    if (!match) return <span key={index}>{part}</span>;

    const shortcode = match[1];
    const imageUrl = customEmojiMap[shortcode];

    if (!imageUrl) return <span key={index}>{part}</span>;

    return (
      <img
        key={index}
        src={imageUrl}
        alt={shortcode}
        style={{
          width: 22,
          height: 22,
          objectFit: "contain",
          verticalAlign: "middle",
          display: "inline-block",
          margin: "0 2px",
        }}
      />
    );
  });
}

export default function DmMessageList({
  messages,
  loading,
  profile,
  reactionsMap,
  onToggleReaction,
  customEmojiMap = {},
  currentApplicantAccountId,
  isUserOnline,
}: DmMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <section
      style={{
        ...chatUi.panelCard,
        padding: 16,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 14 }}>Messages</h2>

      {loading ? (
        <div style={{ color: chatTheme.textMuted }}>Loading messages...</div>
      ) : messages.length === 0 ? (
        <div style={{ color: chatTheme.textMuted }}>No messages yet.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 12,
            maxHeight: 720,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {messages.map((message) => {
            const authorName =
              message.author_profile?.display_name ||
              message.author_profile?.username ||
              message.author_applicant_account?.display_name ||
              message.author_applicant_account?.discord_name ||
              "Unknown User";

            const isOwnMessage =
              (!!profile && message.author_profile_id === profile.id) ||
              (!!currentApplicantAccountId &&
                message.author_applicant_account_id === currentApplicantAccountId);

            const showMiniCard = hoveredMessageId === message.id;

            return (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: 980,
                    padding: "14px 16px",
                    borderRadius: "18px",
                    border: `1px solid ${chatTheme.border}`,
                    background: isOwnMessage
                      ? "linear-gradient(90deg, rgba(212,175,55,0.18) 0%, rgba(240,204,103,0.08) 100%)"
                      : chatTheme.panelAlt,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "44px minmax(0, 1fr)",
                      gap: 12,
                      alignItems: "start",
                    }}
                  >
                    <div
                      style={{ position: "relative" }}
                      onMouseEnter={() => setHoveredMessageId(message.id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      <Avatar
                        name={authorName}
                        avatarUrl={message.author_profile?.avatar_url || null}
                        size={44}
                      />

                      {showMiniCard ? (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 52,
                            zIndex: 20,
                          }}
                        >
                          <ProfileMiniCard
                            profile={message.author_profile as ProfileItem | null}
                            fallbackName={authorName}
                            fallbackRole={message.author_profile?.role || null}
                          />
                        </div>
                      ) : null}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                          flexWrap: "wrap",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <PresenceDot
                            online={isUserOnline?.(message.author_profile_id) ?? false}
                          />
                          <strong style={{ color: chatTheme.text }}>{authorName}</strong>
                        </div>

                        <span style={{ color: chatTheme.textMuted, fontSize: 12 }}>
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div
                        style={{
                          color: chatTheme.text,
                          lineHeight: 1.7,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {message.deleted_at
                          ? "[deleted]"
                          : renderContentWithCustomEmoji(message.content, customEmojiMap)}
                      </div>

                      <ReactionBar
                        reactions={reactionsMap[message.id] ?? []}
                        currentProfileId={profile?.id ?? null}
                        currentApplicantAccountId={currentApplicantAccountId ?? null}
                        onToggle={(emojiKey) => onToggleReaction(message.id, emojiKey)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </section>
  );
}