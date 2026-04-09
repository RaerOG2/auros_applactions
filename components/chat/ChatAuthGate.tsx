"use client";

import type { ProfileItem } from "../../types/profile";

type ChatAuthGateProps = {
  profile: ProfileItem | null;
};

export default function ChatAuthGate({ profile }: ChatAuthGateProps) {
  if (profile) return null;

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "16px",
        border: "1px solid rgba(245, 158, 11, 0.20)",
        background: "rgba(245, 158, 11, 0.10)",
        color: "#ffd58f",
        fontWeight: 600,
        marginBottom: 14,
      }}
    >
      You can read the public chat, but you need an account and must be logged in to send messages.
    </div>
  );
}