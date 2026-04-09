"use client";

import { chatTheme, chatUi } from "../../../lib/chat-theme";
import OnlineUsersCard from "../OnlineUsersCard";

type ChatRightPanelProps = {
  mode: "friends" | "dm" | "channel";
  onlineUsers: {
    profileId: string;
    username: string;
    displayName: string | null;
    onlineAt: string;
  }[];
};

export default function ChatRightPanel({
  mode,
  onlineUsers,
}: ChatRightPanelProps) {
  return (
    <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
      <OnlineUsersCard
        title={mode === "channel" ? "Jetzt aktiv" : mode === "dm" ? "DM Presence" : "Online"}
        users={onlineUsers}
      />

      <section
        style={{
          ...chatUi.shellCard,
          padding: 18,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Quick Info</h3>
        <div style={{ display: "grid", gap: 10, color: chatTheme.textSoft }}>
          <div>Theme: Gold / Grau</div>
          <div>Layout: Discord inspired</div>
          <div>Unread badges: next step expand</div>
        </div>
      </section>
    </div>
  );
}