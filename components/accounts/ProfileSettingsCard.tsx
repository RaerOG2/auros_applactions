"use client";

import type { ProfileItem } from "../../types/profile";

type ProfileSettingsCardProps = {
  profile: ProfileItem | null;
  loading: boolean;
  saving: boolean;
  username: string;
  setUsername: (value: string) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  errorMessage: string | null;
  successMessage: string | null;
  saveProfile: () => void;
  logout: () => void;
};

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "28px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "14px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.92)",
  color: "white",
  outline: "none",
  fontSize: "15px",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "120px",
  resize: "vertical",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#dbe7ff",
  marginBottom: "8px",
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
  padding: "12px 16px",
  borderRadius: "14px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.9)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

export default function ProfileSettingsCard({
  profile,
  loading,
  saving,
  username,
  setUsername,
  displayName,
  setDisplayName,
  bio,
  setBio,
  errorMessage,
  successMessage,
  saveProfile,
  logout,
}: ProfileSettingsCardProps) {
  if (loading) {
    return <section style={glassCardStyle}>Loading profile...</section>;
  }

  return (
    <section style={glassCardStyle}>
      <p
        style={{
          color: "#4cc9f0",
          fontWeight: 800,
          marginBottom: 10,
          fontSize: "13px",
          letterSpacing: "0.08em",
        }}
      >
        PROFILE SETTINGS
      </p>

      <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: "40px" }}>
        Your Profile
      </h1>

      <p style={{ color: "#9fb0d0", lineHeight: 1.7, marginBottom: 24 }}>
        Update your public chat identity and account profile information.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={labelStyle}>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            placeholder="username"
          />
        </div>

        <div>
          <label style={labelStyle}>Display Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={inputStyle}
            placeholder="display name"
          />
        </div>

        <div>
          <label style={labelStyle}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={textareaStyle}
            placeholder="tell people something about you"
          />
        </div>

        {profile ? (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "14px",
              background: "#081225",
              border: "1px solid #22304d",
              color: "#9fb0d0",
              lineHeight: 1.7,
            }}
          >
            <div>
              <strong style={{ color: "#dbe7ff" }}>Current Role:</strong> {profile.role}
            </div>
            <div>
              <strong style={{ color: "#dbe7ff" }}>Created:</strong>{" "}
              {new Date(profile.created_at).toLocaleString()}
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1px solid rgba(239, 68, 68, 0.18)",
              background: "rgba(239, 68, 68, 0.10)",
              color: "#ffb0b0",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1px solid rgba(34, 197, 94, 0.18)",
              background: "rgba(34, 197, 94, 0.10)",
              color: "#9ef1b5",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {successMessage}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={saveProfile} disabled={saving} style={primaryButtonStyle}>
            {saving ? "Saving..." : "Save Profile"}
          </button>

          <button onClick={logout} style={ghostButtonStyle}>
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}