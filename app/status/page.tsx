"use client";

import { useState } from "react";

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "24px",
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

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px 18px",
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

const messageBoxStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(11, 21, 43, 0.88)",
  border: "1px solid #22304d",
  color: "#9fb0d0",
};

type StatusResult = {
  name: string | null;
  email: string | null;
  status: string | null;
  tracking_code: string | null;
  created_at: string | null;
  jobs?: {
    title?: string | null;
  } | null;
};

function statusMessage(status: string | null) {
  if (status === "Accepted") return "Congratulations! Your application has been accepted.";
  if (status === "Rejected") return "Your application was not selected this time.";
  if (status === "In Review") return "Your application is currently being reviewed.";
  if (status === "New") return "Your application was received.";
  return "Status information unavailable.";
}

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  async function checkStatus() {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedTrackingCode = trackingCode.trim().toUpperCase();

    if (!normalizedEmail || !normalizedTrackingCode) {
      alert("Please enter your email and tracking code.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setResult(null);

    try {
      const response = await fetch("/api/check-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          trackingCode: normalizedTrackingCode,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        alert(payload?.error || "Error");
        return;
      }

      setResult(payload?.result ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function copyTrackingCode() {
    if (!result?.tracking_code) return;

    await navigator.clipboard.writeText(result.tracking_code);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <section style={{ ...glassCardStyle, marginBottom: 22 }}>
        <h1 style={{ marginTop: 0 }}>Check Application Status</h1>

        <div style={{ display: "grid", gap: "14px", marginTop: 18 }}>
          <input
            style={inputStyle}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Tracking Code"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />

          <button onClick={checkStatus} style={primaryButtonStyle}>
            {loading ? "Checking..." : "Check Status"}
          </button>
        </div>
      </section>

      <section style={glassCardStyle}>
        {!searched && <div style={messageBoxStyle}>No status loaded yet.</div>}

        {searched && !result && !loading && (
          <div style={messageBoxStyle}>No result found.</div>
        )}

        {result && (
          <div style={messageBoxStyle}>
            <h3>{result.name}</h3>

            <p>{statusMessage(result.status)}</p>

            <p>
              <strong>Role:</strong> {result.jobs?.title}
            </p>

            <p>
              <strong>Status:</strong> {result.status}
            </p>

            <p>
              <strong>Tracking Code:</strong> {result.tracking_code}
            </p>

            <button onClick={copyTrackingCode} style={ghostButtonStyle}>
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
        )}
      </section>
    </>
  );
}