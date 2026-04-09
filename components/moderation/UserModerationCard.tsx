"use client";

import type { ProfileItem } from "../../types/profile";

type UserModerationCardProps = {
  userSearch: string;
  setUserSearch: (value: string) => void;
  onSearch: () => void;
  userResults: ProfileItem[];
  selectedUser: ProfileItem | null;
  setSelectedUser: (profile: ProfileItem | null) => void;
  actionType: string;
  setActionType: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  expiresAt: string;
  setExpiresAt: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "#9fb0d0",
  marginBottom: 8,
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
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

export default function UserModerationCard({
  userSearch,
  setUserSearch,
  onSearch,
  userResults,
  selectedUser,
  setSelectedUser,
  actionType,
  setActionType,
  reason,
  setReason,
  expiresAt,
  setExpiresAt,
  onSubmit,
  submitting,
}: UserModerationCardProps) {
  return (
    <section style={panelStyle}>
      <h3 style={{ marginTop: 0 }}>User Moderation</h3>

      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={labelStyle}>Search User</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={inputStyle}
              placeholder="username or display name"
            />
            <button onClick={onSearch} style={ghostButtonStyle}>
              Search
            </button>
          </div>
        </div>

        {userResults.length > 0 && (
          <div style={{ display: "grid", gap: 8 }}>
            {userResults.map((user) => {
              const active = selectedUser?.id === user.id;

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    border: active
                      ? "1px solid rgba(76, 201, 240, 0.35)"
                      : "1px solid #22304d",
                    background: active
                      ? "rgba(76, 201, 240, 0.12)"
                      : "rgba(15, 27, 52, 0.9)",
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
              );
            })}
          </div>
        )}

        {selectedUser && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "14px",
              background: "#081225",
              border: "1px solid #22304d",
              color: "#dbe7ff",
            }}
          >
            Selected User: <strong>@{selectedUser.username}</strong>
            {selectedUser.display_name ? ` (${selectedUser.display_name})` : ""}
          </div>
        )}

        <div>
          <label style={labelStyle}>Action Type</label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            style={inputStyle}
          >
            <option value="mute" style={{ background: "#0b152b" }}>
              Mute
            </option>
            <option value="timeout" style={{ background: "#0b152b" }}>
              Timeout
            </option>
            <option value="ban" style={{ background: "#0b152b" }}>
              Ban
            </option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Reason</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={inputStyle}
            placeholder="reason"
          />
        </div>

        <div>
          <label style={labelStyle}>Expires At (optional)</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button onClick={onSubmit} disabled={submitting} style={primaryButtonStyle}>
          {submitting ? "Saving..." : "Apply Moderation Action"}
        </button>
      </div>
    </section>
  );
}