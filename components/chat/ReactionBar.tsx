"use client";

import type { MessageReactionItem } from "../../types/chat";

type ReactionBarProps = {
  reactions: MessageReactionItem[];
  currentProfileId?: string | null;
  currentApplicantAccountId?: string | null;
  onToggle: (emojiKey: string) => void;
};

export default function ReactionBar({
  reactions,
  currentProfileId,
  currentApplicantAccountId,
  onToggle,
}: ReactionBarProps) {
  const grouped = reactions.reduce<Record<string, MessageReactionItem[]>>((acc, reaction) => {
    if (!acc[reaction.emoji_key]) acc[reaction.emoji_key] = [];
    acc[reaction.emoji_key].push(reaction);
    return acc;
  }, {});

  const entries = Object.entries(grouped);

  if (entries.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 10,
      }}
    >
      {entries.map(([emojiKey, items]) => {
        const reactedByCurrentUser = items.some((item) => {
          if (currentProfileId && item.profile_id === currentProfileId) return true;
          if (
            currentApplicantAccountId &&
            item.applicant_chat_account_id === currentApplicantAccountId
          ) {
            return true;
          }
          return false;
        });

        return (
          <button
            key={emojiKey}
            onClick={() => onToggle(emojiKey)}
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              border: reactedByCurrentUser
                ? "1px solid rgba(76, 201, 240, 0.35)"
                : "1px solid #22304d",
              background: reactedByCurrentUser
                ? "rgba(76, 201, 240, 0.12)"
                : "rgba(11, 21, 43, 0.9)",
              color: "white",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {emojiKey} {items.length}
          </button>
        );
      })}
    </div>
  );
}