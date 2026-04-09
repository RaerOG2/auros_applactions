"use client";

type ApplicationReviewPanelProps = {
  rating: number | null;
  score: number | null | undefined;
  reviewLabel: string | null;
  onUpdateRating: (rating: number) => void;
  onUpdateScore: (score: number) => void;
  onUpdateReviewLabel: (label: string) => void;
};

export default function ApplicationReviewPanel({
  rating,
  score,
  reviewLabel,
  onUpdateRating,
  onUpdateScore,
  onUpdateReviewLabel,
}: ApplicationReviewPanelProps) {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "14px",
        background: "#081225",
        border: "1px solid #22304d",
        marginBottom: 14,
      }}
    >
      <strong>Internal Review</strong>

      <div style={{ marginTop: 12 }}>
        <p style={{ margin: "0 0 8px 0", color: "#9fb0d0" }}>Rating</p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onUpdateRating(star)}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border:
                  rating === star
                    ? "1px solid rgba(76, 201, 240, 0.4)"
                    : "1px solid #22304d",
                background:
                  rating === star
                    ? "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)"
                    : "rgba(11, 21, 43, 0.9)",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {"★".repeat(star)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <p style={{ margin: "0 0 8px 0", color: "#9fb0d0" }}>Application Score</p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[0, 25, 50, 75, 100].map((value) => (
            <button
              key={value}
              onClick={() => onUpdateScore(value)}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border:
                  (score ?? 0) === value
                    ? "1px solid rgba(76, 201, 240, 0.4)"
                    : "1px solid #22304d",
                background:
                  (score ?? 0) === value
                    ? "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)"
                    : "rgba(11, 21, 43, 0.9)",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <p style={{ margin: "0 0 8px 0", color: "#9fb0d0" }}>Review Label</p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["interessant", "später", "abgelehnt"].map((label) => (
            <button
              key={label}
              onClick={() => onUpdateReviewLabel(label)}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border:
                  reviewLabel === label
                    ? "1px solid rgba(76, 201, 240, 0.4)"
                    : "1px solid #22304d",
                background:
                  reviewLabel === label
                    ? "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)"
                    : "rgba(11, 21, 43, 0.9)",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          color: "#9fb0d0",
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#dbe7ff" }}>Current Rating:</strong>{" "}
          {rating ? `${rating}/5` : "-"}
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#dbe7ff" }}>Current Label:</strong>{" "}
          {reviewLabel || "-"}
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#dbe7ff" }}>Current Score:</strong>{" "}
          {score ?? 0}
        </p>
      </div>
    </div>
  );
}