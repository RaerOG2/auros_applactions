"use client";

import { statusMessage, type StatusResult } from "../../types/status";

type StatusResultCardProps = {
  result: StatusResult;
  copied: boolean;
  copyTrackingCode: () => void;
  messageBoxStyle: React.CSSProperties;
  ghostButtonStyle: React.CSSProperties;
  pillStyle: React.CSSProperties;
};

function statusPill(status: string | null, pillStyle: React.CSSProperties): React.CSSProperties {
  if (status === "Accepted") {
    return {
      ...pillStyle,
      background: "rgba(34, 197, 94, 0.12)",
      color: "#9ef1b5",
      border: "1px solid rgba(34, 197, 94, 0.16)",
    };
  }

  if (status === "Rejected") {
    return {
      ...pillStyle,
      background: "rgba(239, 68, 68, 0.12)",
      color: "#ffb0b0",
      border: "1px solid rgba(239, 68, 68, 0.16)",
    };
  }

  if (status === "In Review") {
    return {
      ...pillStyle,
      background: "rgba(245, 158, 11, 0.12)",
      color: "#ffd58f",
      border: "1px solid rgba(245, 158, 11, 0.18)",
    };
  }

  return pillStyle;
}

export default function StatusResultCard({
  result,
  copied,
  copyTrackingCode,
  messageBoxStyle,
  ghostButtonStyle,
  pillStyle,
}: StatusResultCardProps) {
  return (
    <div style={messageBoxStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, color: "#ffffff" }}>{result.name || "Applicant"}</h3>
        <span style={statusPill(result.status, pillStyle)}>{result.status || "-"}</span>
      </div>

      <p style={{ lineHeight: 1.7 }}>{statusMessage(result.status)}</p>

      <p>
        <strong style={{ color: "#dbe7ff" }}>Role:</strong> {result.jobs?.title || "-"}
      </p>

      <p>
        <strong style={{ color: "#dbe7ff" }}>Tracking Code:</strong> {result.tracking_code || "-"}
      </p>

      <button onClick={copyTrackingCode} style={ghostButtonStyle}>
        {copied ? "Copied!" : "Copy Code"}
      </button>
    </div>
  );
}