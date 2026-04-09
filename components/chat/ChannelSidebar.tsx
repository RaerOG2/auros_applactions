"use client";

import Link from "next/link";
import type { ChatChannelItem } from "../../types/chat";

type ChannelSidebarProps = {
  channels: ChatChannelItem[];
  currentChannelSlug: string;
};

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "18px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

export default function ChannelSidebar({
  channels,
  currentChannelSlug,
}: ChannelSidebarProps) {
  return (
    <aside style={glassCardStyle}>
      <p
        style={{
          color: "#4cc9f0",
          fontWeight: 800,
          marginTop: 0,
          marginBottom: 14,
          fontSize: "12px",
          letterSpacing: "0.08em",
        }}
      >
        CHANNELS
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {channels.length === 0 ? (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1px solid #22304d",
              background: "rgba(11, 21, 43, 0.9)",
              color: "#9fb0d0",
            }}
          >
            No channels available.
          </div>
        ) : (
          channels.map((channel) => {
            const active = currentChannelSlug === channel.slug;

            return (
              <Link
                key={channel.id}
                href={`/chat?channel=${encodeURIComponent(channel.slug)}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  border: active
                    ? "1px solid rgba(76, 201, 240, 0.35)"
                    : "1px solid #22304d",
                  background: active
                    ? "linear-gradient(90deg, rgba(76, 201, 240, 0.16) 0%, rgba(123, 97, 255, 0.14) 100%)"
                    : "rgba(11, 21, 43, 0.9)",
                  color: "white",
                }}
              >
                <div style={{ fontWeight: active ? 800 : 700 }}>
                  {channel.is_public ? "# " : "🔒 "}
                  {channel.name}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    color: "#9fb0d0",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {channel.description || "No description"}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}