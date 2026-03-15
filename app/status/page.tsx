"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import AurosBackground from "../../components/AurosBackground";
import AurosTopbar from "../../components/AurosTopbar";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "transparent",
  color: "white",
  padding: "32px 20px 60px",
  position: "relative",
  zIndex: 1,
};

const containerStyle: React.CSSProperties = {
  maxWidth: "900px",
  margin: "0 auto",
};

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

const statusBadge = (status: string | null) => {
  if (status === "Accepted") {
    return {
      background: "rgba(34, 197, 94, 0.12)",
      border: "1px solid rgba(34, 197, 94, 0.18)",
      color: "#9ef1b5",
    };
  }

  if (status === "Rejected") {
    return {
      background: "rgba(239, 68, 68, 0.12)",
      border: "1px solid rgba(239, 68, 68, 0.18)",
      color: "#ffb0b0",
    };
  }

  return {
    background: "rgba(76, 201, 240, 0.12)",
    border: "1px solid rgba(76, 201, 240, 0.18)",
    color: "#aaf3ff",
  };
};

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function checkStatus() {
    if (!email || !trackingCode) {
      alert("Please enter your email and tracking code.");
      return;
    }

    setLoading(true);
    setSearched(true);

    const { data, error } = await supabase
      .from("applications")
      .select(`
        name,
        email,
        status,
        tracking_code,
        created_at,
        jobs (
          title
        )
      `)
      .eq("email", email)
      .eq("tracking_code", trackingCode)
      .maybeSingle();

    setLoading(false);

    if (error) {
      console.log(error);
      alert("Could not check status.");
      return;
    }

    setResult(data || null);
  }

  const badge = statusBadge(result?.status || null);

  return (
    <>
      <AurosBackground />

      <main style={pageStyle}>
        <div style={containerStyle}>
          <AurosTopbar current="status" />

          <section
            style={{
              ...glassCardStyle,
              padding: "34px",
              marginBottom: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "14px",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#4cc9f0",
                    fontWeight: 800,
                    marginBottom: 10,
                    fontSize: "13px",
                    letterSpacing: "0.08em",
                  }}
                >
                  AUROS APPLICATION TRACKING
                </p>

                <h1
                  style={{
                    marginTop: 0,
                    fontSize: "42px",
                    marginBottom: "14px",
                    lineHeight: 1.05,
                  }}
                >
                  Check Application Status
                </h1>

                <p
                  style={{
                    color: "#9fb0d0",
                    lineHeight: 1.75,
                    fontSize: "17px",
                    marginTop: 0,
                    marginBottom: 0,
                    maxWidth: "680px",
                  }}
                >
                  Enter the email used for your application and your tracking code
                  to see the current review status.
                </p>
              </div>

              <span style={pillStyle}>Tracking Portal</span>
            </div>

            <div style={{ display: "grid", gap: "14px", marginTop: 18 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 700,
                    color: "#dbe7ff",
                  }}
                >
                  Email
                </label>
                <input
                  style={inputStyle}
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 700,
                    color: "#dbe7ff",
                  }}
                >
                  Tracking Code
                </label>
                <input
                  style={inputStyle}
                  placeholder="e.g. AU-ABCD-123456"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                />
              </div>

              <button
                onClick={checkStatus}
                style={primaryButtonStyle}
                disabled={loading}
              >
                {loading ? "Checking..." : "Check Status"}
              </button>
            </div>
          </section>

          <section style={glassCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              <h2 style={{ margin: 0 }}>Result</h2>
              {result?.status ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    fontSize: "13px",
                    ...badge,
                  }}
                >
                  {result.status}
                </span>
              ) : null}
            </div>

            {!searched && (
              <div
                style={{
                  padding: "18px",
                  borderRadius: "18px",
                  background: "rgba(11, 21, 43, 0.88)",
                  border: "1px solid #22304d",
                  color: "#9fb0d0",
                }}
              >
                No status loaded yet.
              </div>
            )}

            {searched && !loading && !result && (
              <div
                style={{
                  padding: "18px",
                  borderRadius: "18px",
                  background: "rgba(11, 21, 43, 0.88)",
                  border: "1px solid #22304d",
                  color: "#9fb0d0",
                }}
              >
                No application was found with that email and tracking code.
              </div>
            )}

            {result && (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "20px",
                  background: "rgba(11, 21, 43, 0.88)",
                  border: "1px solid #22304d",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: "14px",
                  }}
                >
                  <h3 style={{ margin: 0 }}>{result.name || "-"}</h3>

                  <span style={pillStyle}>{result.jobs?.title || "-"}</span>
                </div>

                <div style={{ display: "grid", gap: "10px", color: "#dbe7ff" }}>
                  <p style={{ margin: 0 }}>
                    <strong>Role:</strong> {result.jobs?.title || "-"}
                  </p>
                  <p style={{ margin: 0, wordBreak: "break-word" }}>
                    <strong>Email:</strong> {result.email || "-"}
                  </p>
                  <p style={{ margin: 0, wordBreak: "break-word" }}>
                    <strong>Tracking Code:</strong> {result.tracking_code || "-"}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Status:</strong> {result.status || "-"}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Submitted:</strong>{" "}
                    {result.created_at
                      ? new Date(result.created_at).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
