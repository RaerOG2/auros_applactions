"use client";

import type { FriendCardItem } from "../../../types/friends";
import { chatTheme, chatUi } from "../../../lib/chat-theme";
import Avatar from "../Avatar";

type FriendListSectionProps = {
  title: string;
  items: FriendCardItem[];
  mode: "friends" | "incoming" | "outgoing";
  onAccept?: (friendshipId: string) => void;
  onReject?: (friendshipId: string) => void;
  onRemove?: (friendshipId: string) => void;
  onStartDm?: (profileId: string) => void;
};

export default function FriendListSection({
  title,
  items,
  mode,
  onAccept,
  onReject,
  onRemove,
  onStartDm,
}: FriendListSectionProps) {
  return (
    <section
      style={{
        ...chatUi.panelCard,
        padding: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span style={chatUi.pill}>{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div style={{ color: chatTheme.textMuted }}>Keine Einträge vorhanden.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item) => (
            <div
              key={item.friendshipId}
              style={{
                display: "grid",
                gridTemplateColumns: "48px minmax(0, 1fr) auto",
                gap: 12,
                alignItems: "center",
                padding: "12px 14px",
                borderRadius: 16,
                border: `1px solid ${chatTheme.border}`,
                background: chatTheme.panelAlt,
              }}
            >
              <Avatar
                name={item.profile.display_name || item.profile.username}
                avatarUrl={item.profile.avatar_url || null}
                size={48}
              />

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: chatTheme.text,
                    fontWeight: 800,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.profile.display_name || item.profile.username}
                </div>
                <div
                  style={{
                    color: chatTheme.textMuted,
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  @{item.profile.username}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {mode === "friends" ? (
                  <>
                    <button onClick={() => onStartDm?.(item.profile.id)} style={chatUi.accentButton}>
                      DM
                    </button>
                    <button
                      onClick={() => onRemove?.(item.friendshipId)}
                      style={{
                        ...chatUi.ghostButton,
                        border: "1px solid rgba(239,68,68,0.22)",
                        background: "rgba(239,68,68,0.12)",
                        color: "#ffb0b0",
                      }}
                    >
                      Remove
                    </button>
                  </>
                ) : null}

                {mode === "incoming" ? (
                  <>
                    <button
                      onClick={() => onAccept?.(item.friendshipId)}
                      style={{
                        ...chatUi.ghostButton,
                        border: "1px solid rgba(34,197,94,0.22)",
                        background: "rgba(34,197,94,0.14)",
                        color: "#b8f7c7",
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onReject?.(item.friendshipId)}
                      style={{
                        ...chatUi.ghostButton,
                        border: "1px solid rgba(239,68,68,0.22)",
                        background: "rgba(239,68,68,0.12)",
                        color: "#ffb0b0",
                      }}
                    >
                      Reject
                    </button>
                  </>
                ) : null}

                {mode === "outgoing" ? (
                  <button onClick={() => onRemove?.(item.friendshipId)} style={chatUi.ghostButton}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}