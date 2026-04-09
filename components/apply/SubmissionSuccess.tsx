"use client";

type SubmissionSuccessProps = {
  submittedCode: string;
  submittedRole: string;
  copiedTrackingCode: boolean;
  copyTrackingCode: () => void;
  resetSubmission: () => void;
  glassCardStyle: React.CSSProperties;
  ghostButtonStyle: React.CSSProperties;
  primaryButtonStyle: React.CSSProperties;
};

export default function SubmissionSuccess({
  submittedCode,
  submittedRole,
  copiedTrackingCode,
  copyTrackingCode,
  resetSubmission,
  glassCardStyle,
  ghostButtonStyle,
  primaryButtonStyle,
}: SubmissionSuccessProps) {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <a href="/" style={ghostButtonStyle}>
          ← Back to Home
        </a>
      </div>

      <section style={{ ...glassCardStyle, padding: "34px" }}>
        <h1 style={{ margin: 0, fontSize: "44px", marginBottom: 16 }}>
          Application submitted successfully
        </h1>

        <p style={{ color: "#9fb0d0", lineHeight: 1.75, marginTop: 0 }}>
          Your application for <strong>{submittedRole}</strong> has been received.
          Save your tracking code to check your status later.
        </p>

        <div
          style={{
            marginTop: 22,
            padding: "22px",
            borderRadius: "20px",
            background: "rgba(11, 21, 43, 0.88)",
            border: "1px solid #22304d",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#9fb0d0" }}>
            Your Tracking Code
          </p>
          <h2 style={{ margin: 0, fontSize: "34px", wordBreak: "break-word" }}>
            {submittedCode}
          </h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "16px",
              alignItems: "center",
            }}
          >
            <button
              onClick={copyTrackingCode}
              style={{
                ...ghostButtonStyle,
                cursor: "pointer",
              }}
            >
              {copiedTrackingCode ? "Copied!" : "Copy Code"}
            </button>

            <span style={{ color: "#9fb0d0", fontSize: "14px" }}>
              Save this code somewhere safe.
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "22px",
          }}
        >
          <a href="/status" style={ghostButtonStyle}>
            Check Application Status
          </a>
          <button
            onClick={resetSubmission}
            style={{ ...primaryButtonStyle, width: "auto" }}
          >
            Send Another Application
          </button>
        </div>
      </section>
    </div>
  );
}