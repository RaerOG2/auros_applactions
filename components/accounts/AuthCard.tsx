"use client";

type AuthCardProps = {
  mode: "login" | "register";
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  username?: string;
  setUsername?: (value: string) => void;
  displayName?: string;
  setDisplayName?: (value: string) => void;
  submitting: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onSubmit: () => void;
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#dbe7ff",
  marginBottom: "8px",
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

export default function AuthCard({
  mode,
  email,
  setEmail,
  password,
  setPassword,
  username,
  setUsername,
  displayName,
  setDisplayName,
  submitting,
  errorMessage,
  successMessage,
  onSubmit,
}: AuthCardProps) {
  const isRegister = mode === "register";

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
        AUROS ACCOUNTS
      </p>

      <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: "40px" }}>
        {isRegister ? "Create Account" : "Login"}
      </h1>

      <p style={{ color: "#9fb0d0", lineHeight: 1.7, marginBottom: 24 }}>
        {isRegister
          ? "Create your Auros account to chat, interact with channels, and use future community features."
          : "Sign in to access the public chat, your profile, and future community systems."}
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        {isRegister && setUsername ? (
          <div>
            <label style={labelStyle}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              placeholder="unique username"
            />
          </div>
        ) : null}

        {isRegister && setDisplayName ? (
          <div>
            <label style={labelStyle}>Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={inputStyle}
              placeholder="display name"
            />
          </div>
        ) : null}

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="email"
          />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="password"
          />
        </div>

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

        <button onClick={onSubmit} disabled={submitting} style={primaryButtonStyle}>
          {submitting
            ? isRegister
              ? "Creating Account..."
              : "Logging in..."
            : isRegister
            ? "Create Account"
            : "Login"}
        </button>
      </div>
    </section>
  );
}