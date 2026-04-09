"use client";

import type { ChatMessageItem } from "../../types/chat";

type MessageModerationTableProps = {
  messages: ChatMessageItem[];
  onDeleteMessage: (message: ChatMessageItem) => void;
};

const panelStyle: React.CSSProperties = {
  background: "rgba(11, 21, 43, 0.88)",
  border: "1px solid #22304d",
  borderRadius: "20px",
  padding: "18px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #5b2333",
  background: "#1d1220",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

export default function MessageModerationTable({
  messages,
  onDeleteMessage,
}: MessageModerationTableProps) {
  return (
    <section style={panelStyle}>
      <h3 style={{ marginTop: 0 }}>Channel Messages</h3>

      {messages.length === 0 ? (
        <div style={{ color: "#9fb0d0" }}>No messages found.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {messages.map((message) => {
            const author =
              message.author_profile?.display_name ||
              message.author_profile?.username ||
              message.author_applicant_account?.display_name ||
              message.author_applicant_account?.discord_name ||
              "Unknown";

            return (
              <div
                key={message.id}
                style={{
                  padding: "14px",
                  borderRadius: "14px",
                  border: "1px solid #22304d",
                  background: "#081225",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "start",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "#dbe7ff", fontWeight: 700 }}>{author}</div>
                    <div style={{ color: "#9fb0d0", fontSize: 13, marginTop: 4 }}>
                      {new Date(message.created_at).toLocaleString()}
                    </div>
                    <div
                      style={{
                        color: "#dbe7ff",
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        marginTop: 10,
                      }}
                    >
                      {message.content}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMessage(message)}
                    style={dangerButtonStyle}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}