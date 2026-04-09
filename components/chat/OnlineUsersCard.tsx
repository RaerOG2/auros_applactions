"use client";

import { chatTheme, chatUi } from "../../lib/chat-theme";
import Avatar from "./Avatar";

type OnlineUserItem = {
  profileId: string;
  username: string;
  displayName: string | null;
  onlineAt: string;
};

type OnlineUsersCardProps = {
  title?: string;
  users: OnlineUserItem[];
};

export default function OnlineUsersCard({
  title = "Online Users",
  users,
}: OnlineUsersCardProps) {
  return (
    <aside
      style={{
        ...chatUi.shellCard,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span style={chatUi.pill}>{users.length} online</span>
      </div>

      {users.length === 0 ? (
        <div style={{ color: chatTheme.textMuted }}>No users currently online.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {users.map((user) => (
            <div
              key={user.profileId}
              style={{
                padding: "10px 12px",
                borderRadius: "14px",
                border: `1px solid ${chatTheme.border}`,
                background: chatTheme.panelAlt,
                display: "grid",
                gridTemplateColumns: "40px minmax(0, 1fr)",
                gap: 10,
                alignItems: "center",
              }}
            >
              <Avatar
                name={user.displayName || user.username}
                size={40}
              />

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: chatTheme.text,
                    fontWeight: 700,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.displayName || user.username}
                </div>
                <div
                  style={{
                    color: chatTheme.textMuted,
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  @{user.username}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}