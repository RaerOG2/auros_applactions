"use client";

import Link from "next/link";
import type { DirectConversationListItem } from "../../services/dm-service";

type DmListProps = {
  conversations: DirectConversationListItem[];
  currentConversationId?: string | null;
};

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "18px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

function getConversationTitle(item: DirectConversationListItem) {
  if (item.conversation.is_applicant_thread) return "Applicant Thread";
  if (item.otherProfiles.length === 0) return "Direct Conversation";

  return item.otherProfiles
    .map((profile) => profile.display_name || `@${profile.username}`)
    .join(", ");
}

function getConversationSubtitle(item: DirectConversationListItem) {
  if (item.lastMessage?.content) {
    return item.lastMessage.content.length > 70
      ? `${item.lastMessage.content.slice(0, 70)}...`
      : item.lastMessage.content;
  }

  return item.otherProfiles
    .map((profile) => `@${profile.username}`)
    .join(", ");
}

export default function DmList({
  conversations,
  currentConversationId,
}: DmListProps) {
  return (
    <aside style={glassCardStyle}>
      <p
        style={{
          color: "#4cc9f0",
          fontWeight: 800,
          marginTop: 0,
          marginBottom: 14,
          fontSize: "12px",
          letterSpacing: "0.08em",
        }}
      >
        DIRECT CONVERSATIONS
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {conversations.length === 0 ? (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1px solid #22304d",
              background: "rgba(11, 21, 43, 0.9)",
              color: "#9fb0d0",
            }}
          >
            No direct conversations found.
          </div>
        ) : (
          conversations.map((item) => {
            const active = currentConversationId === item.conversation.id;

            return (
              <Link
                key={item.conversation.id}
                href={`/dm/${item.conversation.id}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  border: active
                    ? "1px solid rgba(76, 201, 240, 0.35)"
                    : "1px solid #22304d",
                  background: active
                    ? "linear-gradient(90deg, rgba(76, 201, 240, 0.16) 0%, rgba(123, 97, 255, 0.14) 100%)"
                    : "rgba(11, 21, 43, 0.9)",
                  color: "white",
                }}
              >
                <div style={{ fontWeight: active ? 800 : 700 }}>
                  {getConversationTitle(item)}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color: "#9fb0d0",
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {getConversationSubtitle(item)}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    color: "#9fb0d0",
                    fontSize: 12,
                  }}
                >
                  {new Date(
                    item.lastMessage?.created_at || item.conversation.created_at
                  ).toLocaleString()}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}