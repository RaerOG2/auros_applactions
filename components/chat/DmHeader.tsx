"use client";

import type { DirectConversationItem } from "../../types/chat";
import type { ProfileItem } from "../../types/profile";

type DmHeaderProps = {
  conversation: DirectConversationItem | null;
  profile: ProfileItem | null;
  title?: string;
  description?: string;
};

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "20px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(76, 201, 240, 0.18)",
  background: "rgba(76, 201, 240, 0.10)",
  color: "#95ecff",
  fontSize: "13px",
  fontWeight: 700,
};

export default function DmHeader({
  conversation,
  profile,
  title,
  description,
}: DmHeaderProps) {
  return (
    <section style={glassCardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              color: "#4cc9f0",
              fontWeight: 800,
              marginBottom: 8,
              fontSize: "12px",
              letterSpacing: "0.08em",
            }}
          >
            AUROS DIRECT MESSAGES
          </p>

          <h1 style={{ margin: 0, fontSize: "34px", lineHeight: 1.05 }}>
            {title || (conversation?.is_applicant_thread ? "Applicant Thread" : "Direct Messages")}
          </h1>

          <p style={{ margin: "8px 0 0 0", color: "#9fb0d0", lineHeight: 1.6 }}>
            {description ||
              (conversation?.is_applicant_thread
                ? "Private communication thread for an application."
                : "Private one-to-one or private direct conversation.")}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {conversation?.is_applicant_thread ? (
            <span style={pillStyle}>Applicant Thread</span>
          ) : (
            <span style={pillStyle}>Private DM</span>
          )}

          <span style={pillStyle}>
            {profile ? `Logged in as ${profile.display_name || profile.username}` : "Guest"}
          </span>
        </div>
      </div>
    </section>
  );
}