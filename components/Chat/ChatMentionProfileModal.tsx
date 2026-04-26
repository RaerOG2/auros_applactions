"use client";

import type { ChatUserProfile } from "../../types/chat";

type ChatMentionProfileModalProps = {
  user: ChatUserProfile | null;
  onClose: () => void;
};

function getStatusColor(status?: string | null) {
  if (status === "online") return "#4ade80";
  if (status === "idle") return "#facc15";
  if (status === "dnd") return "#f87171";
  return "#9ca3af";
}

function formatLastSeen(lastSeen?: string | null) {
  if (!lastSeen) return "Unknown";

  try {
    return new Date(lastSeen).toLocaleString();
  } catch {
    return lastSeen;
  }
}

export default function ChatMentionProfileModal({
  user,
  onClose,
}: ChatMentionProfileModalProps) {
  if (!user) return null;

  const name = user.displayName || user.username || "User";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <div className="aurosModalOverlay" onClick={onClose}>
      <div className="aurosMentionProfileCard" onClick={(e) => e.stopPropagation()}>
        {user.bannerUrl && (
          <div className="aurosMentionProfileBanner">
            <img src={user.bannerUrl} alt={`${name} banner`} />
          </div>
        )}

        <button type="button" className="aurosModalClose" onClick={onClose}>
          ×
        </button>

        <div className="aurosMentionProfileHero">
          <div className="aurosMentionProfileAvatar">
            {user.avatarUrl ? <img src={user.avatarUrl} alt={name} /> : initial}
          </div>

          <div>
            <p className="aurosPanelOverline">USER PROFILE</p>
            <h3 className="aurosMentionProfileName">{name}</h3>
            <p className="aurosProfileTag">@{user.username || "user"}</p>
          </div>
        </div>

        <p className="aurosProfileBio">
          {user.bio ?? "No bio has been added yet."}
        </p>

        <div className="aurosRoleList">
          <span className="aurosRoleBadge">{user.isAdmin ? "Admin" : "Member"}</span>

          <span className="aurosRoleBadge">
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: 999,
                background: getStatusColor(user.status),
                marginRight: 8,
              }}
            />
            {user.status ?? "offline"}
          </span>
        </div>

        <div className="aurosMentionProfileMeta">
          Last seen: {formatLastSeen(user.lastSeen)}
        </div>
      </div>
    </div>
  );
}