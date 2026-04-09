"use client";

type StatusLookupFormProps = {
  trackingCode: string;
  setTrackingCode: (value: string) => void;
  checkStatus: () => void;
  loading: boolean;
  glassCardStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
  primaryButtonStyle: React.CSSProperties;
};

export default function StatusLookupForm({
  trackingCode,
  setTrackingCode,
  checkStatus,
  loading,
  glassCardStyle,
  inputStyle,
  primaryButtonStyle,
}: StatusLookupFormProps) {
  return (
    <section style={{ ...glassCardStyle, marginBottom: 22 }}>
      <h1 style={{ marginTop: 0 }}>Check Application Status</h1>

      <p style={{ color: "#9fb0d0", lineHeight: 1.7, marginTop: 10 }}>
        Enter your AU tracking code to view the current status of your application.
      </p>

      <div style={{ display: "grid", gap: "14px", marginTop: 18 }}>
        <input
          style={inputStyle}
          placeholder="Tracking Code (e.g. AU-XXXX-123456)"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
        />

        <button onClick={checkStatus} style={primaryButtonStyle}>
          {loading ? "Checking..." : "Check Status"}
        </button>
      </div>
    </section>
  );
}