"use client";

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

export default function ChannelAccessDenied() {
  return (
    <section style={glassCardStyle}>
      <h2 style={{ marginTop: 0 }}>Private Channel</h2>
      <p style={{ color: "#9fb0d0", lineHeight: 1.7, marginBottom: 0 }}>
        You do not have access to this channel.
      </p>
    </section>
  );
}