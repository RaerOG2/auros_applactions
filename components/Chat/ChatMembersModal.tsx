"use client";

import type { ChatUserProfile } from "../../types/chat";

type ChatMembersModalProps = {
  open: boolean;
  members: ChatUserProfile[];
  onClose: () => void;
  onOpenProfile?: (user: ChatUserProfile) => void;
};

function isOnline(user: ChatUserProfile) {
  if (!user.lastSeen) return false;

  const lastSeenTime = new Date(user.lastSeen).getTime();

  if (Number.isNaN(lastSeenTime)) return false;

  const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

  return (
    lastSeenTime > twoMinutesAgo &&
    (user.status === "online" || user.status === "idle" || user.status === "dnd")
  );
}

export default function ChatMembersModal({
  open,
  members,
  onClose,
  onOpenProfile,
}: ChatMembersModalProps) {
  if (!open) return null;

  const onlineMembers = members.filter(isOnline);
  const offlineMembers = members.filter((user) => !isOnline(user));

  function renderMember(user: ChatUserProfile) {
    const name = user.displayName || user.username || "Unknown User";
    const highestRole = user.serverRoles?.[0] ?? null;

    <strong style={{ color: highestRole?.color ?? undefined }}>
      {name}
    </strong>

    return (
      <button
        key={user.id}
        type="button"
        className="aurosMemberRow"
        onClick={() => onOpenProfile?.(user)}
      >
        <span className="aurosMemberAvatar">
          {user.avatarUrl ? <img src={user.avatarUrl} alt={name} /> : name.slice(0, 1)}
        </span>

        <span>
          <strong>{name}</strong>
          <small>@{user.username ?? "unknown"} · {user.status ?? "offline"}</small>
        </span>

        {highestRole && (
          <small style={{ color: highestRole.color }}>
            {highestRole.icon ?? "⭐"} {highestRole.name}
          </small>
        )}
      </button>
    );
  }

  return (
    <div className="aurosModalOverlay">
      <div className="aurosModalCard">
        <div className="aurosModalHeader">
          <div>
            <p className="aurosPanelOverline">SERVER MEMBERS</p>
            <h3 className="aurosModalTitle">Members</h3>
          </div>

          <button type="button" className="aurosModalClose" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="aurosMembersList">
          <p className="aurosMentionPickerGroup">Online — {onlineMembers.length}</p>
          {onlineMembers.map(renderMember)}

          <p className="aurosMentionPickerGroup">Offline — {offlineMembers.length}</p>
          {offlineMembers.map(renderMember)}
        </div>
      </div>
    </div>
  );
}