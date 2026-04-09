"use client";

type ScoreControlsProps = {
  autoScore: number;
  manualScore: number | null | undefined;
  finalScore: number;
  onSetManualScore: (value: number | null) => void;
  onRecalculate: () => void;
};

const panelStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "14px",
  background: "#081225",
  border: "1px solid #22304d",
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

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

export default function ScoreControls({
  autoScore,
  manualScore,
  finalScore,
  onSetManualScore,
  onRecalculate,
}: ScoreControlsProps) {
  return (
    <div style={panelStyle}>
      <strong>Advanced Score</strong>

      <div style={{ marginTop: 12, color: "#9fb0d0", lineHeight: 1.7 }}>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#dbe7ff" }}>Auto Score:</strong> {autoScore}
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#dbe7ff" }}>Manual Score:</strong>{" "}
          {manualScore ?? "None"}
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#dbe7ff" }}>Final Score:</strong> {finalScore}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        {[25, 50, 75, 100].map((value) => (
          <button
            key={value}
            onClick={() => onSetManualScore(value)}
            style={manualScore === value ? primaryButtonStyle : ghostButtonStyle}
          >
            Manual {value}
          </button>
        ))}

        <button onClick={() => onSetManualScore(null)} style={ghostButtonStyle}>
          Clear Manual
        </button>

        <button onClick={onRecalculate} style={primaryButtonStyle}>
          Recalculate
        </button>
      </div>
    </div>
  );
}