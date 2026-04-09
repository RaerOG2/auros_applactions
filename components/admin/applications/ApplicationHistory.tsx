"use client";

import type { StatusHistoryItem } from "../../../types/admin";
import { formatDateTime } from "../../../lib/admin-utils";

type ApplicationHistoryProps = {
  history: StatusHistoryItem[];
};

export default function ApplicationHistory({ history }: ApplicationHistoryProps) {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "14px",
        borderRadius: "14px",
        background: "#081225",
        border: "1px solid #22304d",
      }}
    >
      <strong>Status History</strong>

      {history.length === 0 ? (
        <p
          style={{
            margin: "12px 0 0 0",
            color: "#9fb0d0",
            lineHeight: 1.7,
          }}
        >
          No history entries available yet.
        </p>
      ) : (
        <div className="historyGrid">
          {history.map((entry, index) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(11, 21, 43, 0.75)",
                border: "1px solid #22304d",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {history.length - index}
              </div>

              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    color: "#dbe7ff",
                    fontWeight: 700,
                  }}
                >
                  {entry.status}
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#9fb0d0",
                    fontSize: 14,
                  }}
                >
                  {formatDateTime(entry.changed_at)}
                </p>
                {entry.note ? (
                  <p
                    style={{
                      margin: "6px 0 0 0",
                      color: "#cfdcff",
                      lineHeight: 1.6,
                    }}
                  >
                    {entry.note}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}