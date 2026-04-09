"use client";

import type { ModerationLogItem } from "../../types/moderation";

type ModerationLogListProps = {
  logs: ModerationLogItem[];
};

const panelStyle: React.CSSProperties = {
  background: "rgba(11, 21, 43, 0.88)",
  border: "1px solid #22304d",
  borderRadius: "20px",
  padding: "18px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
};

export default function ModerationLogList({ logs }: ModerationLogListProps) {
  return (
    <section style={panelStyle}>
      <h3 style={{ marginTop: 0 }}>Moderation Logs</h3>

      {logs.length === 0 ? (
        <div style={{ color: "#9fb0d0" }}>No moderation logs available.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: "14px",
                borderRadius: "14px",
                border: "1px solid #22304d",
                background: "#081225",
              }}
            >
              <div style={{ color: "#dbe7ff", fontWeight: 700 }}>{log.action}</div>
              <div style={{ color: "#9fb0d0", fontSize: 13, marginTop: 4 }}>
                {new Date(log.created_at).toLocaleString()}
              </div>

              {log.details ? (
                <pre
                  style={{
                    marginTop: 10,
                    color: "#dbe7ff",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: 12,
                    lineHeight: 1.6,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  }}
                >
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}