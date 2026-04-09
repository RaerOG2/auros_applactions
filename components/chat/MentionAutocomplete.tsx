"use client";

import type { ProfileItem } from "../../types/profile";

type MentionAutocompleteProps = {
  open: boolean;
  loading: boolean;
  results: ProfileItem[];
  onPick: (username: string) => void;
};

export default function MentionAutocomplete({
  open,
  loading,
  results,
  onPick,
}: MentionAutocompleteProps) {
  if (!open) return null;

  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "16px",
        border: "1px solid #22304d",
        background: "rgba(11, 21, 43, 0.96)",
        display: "grid",
        gap: 8,
      }}
    >
      <p style={{ margin: 0, color: "#9fb0d0", fontSize: 13 }}>Mentions</p>

      {loading ? (
        <div style={{ color: "#9fb0d0", fontSize: 13 }}>Loading users...</div>
      ) : results.length === 0 ? (
        <div style={{ color: "#9fb0d0", fontSize: 13 }}>No users found.</div>
      ) : (
        results.map((profile) => (
          <button
            key={profile.id}
            onClick={() => onPick(profile.username)}
            style={{
              textAlign: "left",
              padding: "10px 12px",
              borderRadius: "12px",
              border: "1px solid #22304d",
              background: "rgba(15, 27, 52, 0.9)",
              color: "white",
              cursor: "pointer",
            }}
          >
            <strong>@{profile.username}</strong>
            {profile.display_name ? (
              <span style={{ color: "#9fb0d0", marginLeft: 8 }}>
                {profile.display_name}
              </span>
            ) : null}
          </button>
        ))
      )}
    </div>
  );
}