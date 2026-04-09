"use client";

type PresenceDotProps = {
  online: boolean;
};

export default function PresenceDot({ online }: PresenceDotProps) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "999px",
        background: online ? "#22c55e" : "#64748b",
        boxShadow: online ? "0 0 0 3px rgba(34, 197, 94, 0.18)" : "none",
        flexShrink: 0,
      }}
    />
  );
}