"use client";

import { useEffect, useState } from "react";
import type { ChatUserProfile } from "../../types/chat";
import type { ChatUserXp } from "../../services/chat-xp.service";
import { getUserChatXp } from "../../services/chat-xp.service";

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

function getNextLevelXp(level: number) {
  return Math.max(100, level * level * 100);
}

export default function ChatMentionProfileModal({
  user,
  onClose,
}: ChatMentionProfileModalProps) {
  const [xpData, setXpData] = useState<ChatUserXp | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setXpData(null);
      return;
    }

    getUserChatXp(user.id)
      .then(setXpData)
      .catch(() => setXpData(null));
  }, [user?.id]);

  if (!user) return null;

  const name = user.displayName || user.username || "User";
  const initial = name.slice(0, 1).toUpperCase();

  const level = xpData?.level ?? 1;
  const xp = xpData?.xp ?? 0;
  const nextLevelXp = getNextLevelXp(level);
  const progress = Math.min(100, Math.round((xp / nextLevelXp) * 100));

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

          <span className="aurosRoleBadge">Level {level}</span>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 16,
            border: "1px solid rgba(212, 175, 55, 0.16)",
            background: "rgba(31, 31, 31, 0.72)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 8,
              color: "#fff2c0",
              fontWeight: 900,
            }}
          >
            <span>Chat XP</span>
            <span>
              {xp} / {nextLevelXp} XP
            </span>
          </div>

          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, rgba(212,175,55,0.95), rgba(76,201,240,0.9))",
              }}
            />
          </div>
        </div>

        <div className="aurosMentionProfileMeta">
          Last seen: {formatLastSeen(user.lastSeen)}
        </div>
      </div>
    </div>
  );
}