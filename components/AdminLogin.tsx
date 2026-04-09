"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { createAdminAuthLog } from "../services/admin-log-service";

type AdminLoginProps = {
  onSuccess?: () => void;
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
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(76, 201, 240, 0.18)",
};

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      console.error("Admin login error:", error);

      await createAdminAuthLog({
        email: normalizedEmail,
        eventType: "login_attempt",
        success: false,
        details: {
          message: error.message,
        },
      });

      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    await createAdminAuthLog({
      userId: data.user?.id ?? null,
      email: data.user?.email ?? normalizedEmail,
      eventType: "login_success",
      success: true,
      details: {
        sessionCreated: !!data.session,
      },
    });

    setEmail("");
    setPassword("");
    setSubmitting(false);
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
      <div>
        <label style={labelStyle}>Admin Email</label>
        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="email"
        />
      </div>

      <div>
        <label style={labelStyle}>Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          autoComplete="current-password"
        />
      </div>

      {errorMessage && (
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
      )}

      <button type="submit" disabled={submitting} style={primaryButtonStyle}>
        {submitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}