"use client";

import type { ProfileItem } from "../../types/profile";
import { chatTheme, chatUi } from "../../lib/chat-theme";
import Avatar from "./Avatar";

type ProfileMiniCardProps = {
  profile: ProfileItem | null;
  fallbackName?: string | null;
  fallbackRole?: string | null;
};

export default function ProfileMiniCard({
  profile,
  fallbackName,
  fallbackRole,
}: ProfileMiniCardProps) {
  const displayName =
    profile?.display_name || fallbackName || profile?.username || "Unknown User";

  const role = profile?.role || fallbackRole || null;

  return (
    <div
      style={{
        ...chatUi.panelCard,
        padding: 14,
        minWidth: 220,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "52px minmax(0, 1fr)",
          gap: 12,
          alignItems: "center",
        }}
      >
        <Avatar
          name={displayName}
          avatarUrl={profile?.avatar_url || null}
          size={52}
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
            {displayName}
          </div>

          <div
            style={{
              color: chatTheme.textMuted,
              fontSize: 13,
              marginTop: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {profile?.username ? `@${profile.username}` : "no-username"}
          </div>
        </div>
      </div>

      {role ? (
        <div style={{ marginTop: 12 }}>
          <span style={chatUi.pill}>{role}</span>
        </div>
      ) : null}

      {profile?.bio ? (
        <div
          style={{
            marginTop: 12,
            color: chatTheme.textSoft,
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          {profile.bio}
        </div>
      ) : null}
    </div>
  );
}