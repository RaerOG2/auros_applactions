"use client";

import { useState } from "react";
import type { ChatMessageItem, MessageReactionItem } from "../../types/chat";
import type { ProfileItem } from "../../types/profile";
import { chatTheme } from "../../lib/chat-theme";
import Avatar from "./Avatar";
import ProfileMiniCard from "./ProfileMiniCard";
import ReactionBar from "./ReactionBar";
import PresenceDot from "./PresenceDot";

type ChatMessageItemProps = {
  message: ChatMessageItem;
  isOwnMessage: boolean;
  reactions: MessageReactionItem[];
  currentProfileId?: string | null;
  onToggleReaction: (messageId: string, emojiKey: string) => void;
  customEmojiMap?: Record<string, string>;
  isAuthorOnline?: boolean;
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

export default function ChatMessageItem({
  message,
  isOwnMessage,
  reactions,
  currentProfileId,
  onToggleReaction,
  customEmojiMap = {},
  isAuthorOnline = false,
}: ChatMessageItemProps) {
  const [showMiniCard, setShowMiniCard] = useState(false);

  const authorName =
    message.author_profile?.display_name ||
    message.author_profile?.username ||
    message.author_applicant_account?.display_name ||
    message.author_applicant_account?.discord_name ||
    "Unknown User";

  const role = message.author_profile?.role || null;

  return (
    <div
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
          position: "relative",
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
            onMouseEnter={() => setShowMiniCard(true)}
            onMouseLeave={() => setShowMiniCard(false)}
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
                  fallbackRole={role}
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
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <PresenceDot online={isAuthorOnline} />
                <strong style={{ color: chatTheme.text }}>{authorName}</strong>

                {role ? (
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "999px",
                      fontSize: 12,
                      fontWeight: 700,
                      border: `1px solid ${chatTheme.border}`,
                      background: chatTheme.accentSoft,
                      color: chatTheme.accentStrong,
                    }}
                  >
                    {role}
                  </span>
                ) : null}
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
              reactions={reactions}
              currentProfileId={currentProfileId}
              onToggle={(emojiKey) => onToggleReaction(message.id, emojiKey)}
            />

            {message.edited_at ? (
              <div style={{ marginTop: 8, color: chatTheme.textMuted, fontSize: 12 }}>
                edited
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}