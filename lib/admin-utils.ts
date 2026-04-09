import type React from "react";
import { pillStyle } from "./admin-styles";

export function statusPillStyle(status: string | null): React.CSSProperties {
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

  return {
    ...pillStyle,
    background: "rgba(76, 201, 240, 0.12)",
    color: "#aaf3ff",
    border: "1px solid rgba(76, 201, 240, 0.18)",
  };
}

export function reviewLabelStyle(label: string | null): React.CSSProperties {
  if (label === "interessant") {
    return {
      ...pillStyle,
      background: "rgba(76, 201, 240, 0.12)",
      color: "#aaf3ff",
      border: "1px solid rgba(76, 201, 240, 0.18)",
    };
  }

  if (label === "später") {
    return {
      ...pillStyle,
      background: "rgba(245, 158, 11, 0.12)",
      color: "#ffd58f",
      border: "1px solid rgba(245, 158, 11, 0.18)",
    };
  }

  if (label === "abgelehnt") {
    return {
      ...pillStyle,
      background: "rgba(239, 68, 68, 0.12)",
      color: "#ffb0b0",
      border: "1px solid rgba(239, 68, 68, 0.16)",
    };
  }

  return pillStyle;
}

export function scorePillStyle(score: number | null | undefined): React.CSSProperties {
  const value = score ?? 0;

  if (value >= 80) {
    return {
      ...pillStyle,
      background: "rgba(34, 197, 94, 0.12)",
      color: "#9ef1b5",
      border: "1px solid rgba(34, 197, 94, 0.16)",
    };
  }

  if (value >= 50) {
    return {
      ...pillStyle,
      background: "rgba(245, 158, 11, 0.12)",
      color: "#ffd58f",
      border: "1px solid rgba(245, 158, 11, 0.18)",
    };
  }

  return {
    ...pillStyle,
    background: "rgba(239, 68, 68, 0.12)",
    color: "#ffb0b0",
    border: "1px solid rgba(239, 68, 68, 0.16)",
  };
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function scoreBar(value: number | null | undefined): React.CSSProperties {
  const score = Math.max(0, Math.min(100, value ?? 0));

  return {
    width: `${score}%`,
    height: "100%",
    borderRadius: "999px",
    background:
      score >= 80
        ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"
        : score >= 50
        ? "linear-gradient(90deg, #f59e0b 0%, #f97316 100%)"
        : "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
  };
}