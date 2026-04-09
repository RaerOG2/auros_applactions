"use client";

import type { ScoreBreakdown } from "../../../types/admin-score";

type ScoreBreakdownCardProps = {
  breakdown: ScoreBreakdown | null | undefined;
};

const panelStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "14px",
  background: "#081225",
  border: "1px solid #22304d",
};

export default function ScoreBreakdownCard({ breakdown }: ScoreBreakdownCardProps) {
  if (!breakdown) {
    return (
      <div style={panelStyle}>
        <strong>Score Breakdown</strong>
        <p style={{ margin: "10px 0 0 0", color: "#9fb0d0" }}>
          No score breakdown available yet.
        </p>
      </div>
    );
  }

  const rows = [
    ["Discord", breakdown.hasDiscord],
    ["Portfolio", breakdown.hasPortfolio],
    ["Attachment", breakdown.hasAttachment],
    ["Experience", breakdown.experienceLength],
    ["Motivation", breakdown.motivationLength],
    ["Availability", breakdown.availabilityFilled],
    ["Role Answers", breakdown.roleSpecificAnswered],
  ];

  return (
    <div style={panelStyle}>
      <strong>Score Breakdown</strong>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {rows.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              color: "#dbe7ff",
            }}
          >
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}