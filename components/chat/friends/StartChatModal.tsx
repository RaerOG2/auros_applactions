"use client";


import type { FriendCardItem } from "../../../types/friends";
import { chatTheme, chatUi } from "../../../lib/chat-theme";
import Avatar from "../Avatar";

type StartChatModalProps = {
  open: boolean;
  onClose: () => void;
  friends: FriendCardItem[];
  onStartDm: (profileId: string) => Promise<void>;
};

export function StartChatModal({
  open,
  onClose,
  friends,
  onStartDm,
}: StartChatModalProps) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.56)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(760px, 100%)",
          maxHeight: "80vh",
          overflowY: "auto",
          background: chatTheme.panel,
          border: `1px solid ${chatTheme.borderStrong}`,
          borderRadius: 20,
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: chatTheme.accentStrong,
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "0.08em",
              }}
            >
              START DIRECT MESSAGE
            </p>
            <h2 style={{ margin: "8px 0 0 0" }}>Neuen Chat starten</h2>
          </div>

          <button onClick={onClose} style={chatUi.ghostButton}>
            Close
          </button>
        </div>

        {friends.length === 0 ? (
          <div style={{ color: chatTheme.textMuted }}>
            Du hast aktuell keine Freunde, mit denen du einen DM starten kannst.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {friends.map((friend) => (
              <button
                key={friend.friendshipId}
                onClick={async () => {
                  await onStartDm(friend.profile.id);
                  onClose();
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px minmax(0, 1fr) auto",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 16,
                  border: `1px solid ${chatTheme.border}`,
                  background: chatTheme.panelAlt,
                  color: chatTheme.text,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Avatar
                  name={friend.profile.display_name || friend.profile.username}
                  avatarUrl={friend.profile.avatar_url || null}
                  size={48}
                />

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {friend.profile.display_name || friend.profile.username}
                  </div>
                  <div
                    style={{
                      color: chatTheme.textMuted,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    @{friend.profile.username}
                  </div>
                </div>

                <span style={chatUi.pill}>Start DM</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}