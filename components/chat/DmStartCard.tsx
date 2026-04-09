"use client";

import type { ProfileItem } from "../../types/profile";

type DmStartCardProps = {
  searchValue: string;
  setSearchValue: (value: string) => void;
  onSearch: () => void;
  searchingUsers: boolean;
  userResults: ProfileItem[];
  onStartDm: (profile: ProfileItem) => void;
};

const panelStyle: React.CSSProperties = {
  background: "rgba(11, 21, 43, 0.88)",
  border: "1px solid #22304d",
  borderRadius: "20px",
  padding: "18px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  borderRadius: "12px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.92)",
  color: "white",
  outline: "none",
  fontSize: "14px",
};

const ghostButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.9)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

export default function DmStartCard({
  searchValue,
  setSearchValue,
  onSearch,
  searchingUsers,
  userResults,
  onStartDm,
}: DmStartCardProps) {
  return (
    <section style={panelStyle}>
      <h3 style={{ marginTop: 0 }}>Start New DM</h3>

      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={inputStyle}
            placeholder="Search username or display name"
          />
          <button onClick={onSearch} style={ghostButtonStyle}>
            {searchingUsers ? "..." : "Search"}
          </button>
        </div>

        {userResults.length > 0 ? (
          <div style={{ display: "grid", gap: 8 }}>
            {userResults.map((user) => (
              <button
                key={user.id}
                onClick={() => onStartDm(user)}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid #22304d",
                  background: "rgba(15, 27, 52, 0.9)",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <strong>@{user.username}</strong>
                {user.display_name ? (
                  <span style={{ color: "#9fb0d0", marginLeft: 8 }}>
                    {user.display_name}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ color: "#9fb0d0", fontSize: 14 }}>
            Search for a user to start a direct message.
          </div>
        )}
      </div>
    </section>
  );
}