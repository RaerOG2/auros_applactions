"use client";

import { getAvatarGradient, getChatInitials } from "../../lib/chat-avatar";

type AvatarProps = {
  name?: string | null;
  avatarUrl?: string | null;
  size?: number;
  fontSize?: number;
};

export default function Avatar({
  name,
  avatarUrl,
  size = 40,
  fontSize,
}: AvatarProps) {
  const [from, to] = getAvatarGradient(name);
  const initials = getChatInitials(name);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "avatar"}
        style={{
          width: size,
          height: size,
          borderRadius: "999px",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "999px",
        background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#111",
        fontWeight: 900,
        fontSize: fontSize || Math.max(12, Math.round(size * 0.32)),
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}