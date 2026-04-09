"use client";

import type { Job } from "../../types/apply";

type OpenRolesPanelProps = {
  jobs: Job[];
  jobId: string;
  setJobId: (id: string) => void;
  glassCardStyle: React.CSSProperties;
  pillStyle: React.CSSProperties;
};

export default function OpenRolesPanel({
  jobs,
  jobId,
  setJobId,
  glassCardStyle,
  pillStyle,
}: OpenRolesPanelProps) {
  return (
    <section style={glassCardStyle}>
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>Open Roles</h2>
      <p
        style={{
          color: "#9fb0d0",
          marginTop: 0,
          marginBottom: "18px",
          lineHeight: 1.6,
        }}
      >
        Review currently open staff positions and choose the one that fits you best.
      </p>

      {jobs.length === 0 ? (
        <div
          style={{
            border: "1px solid #22304d",
            borderRadius: "16px",
            padding: "18px",
            background: "#0b152b",
            color: "#9fb0d0",
          }}
        >
          No open jobs are available right now.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {jobs.map((job) => {
            const active = job.id === jobId;

            return (
              <button
                key={job.id}
                onClick={() => setJobId(job.id)}
                style={{
                  textAlign: "left",
                  width: "100%",
                  borderRadius: "18px",
                  padding: "18px",
                  cursor: "pointer",
                  border: active
                    ? "1px solid rgba(76, 201, 240, 0.38)"
                    : "1px solid #22304d",
                  background: active
                    ? "linear-gradient(180deg, rgba(76, 201, 240, 0.12) 0%, rgba(123, 97, 255, 0.10) 100%)"
                    : "rgba(11, 21, 43, 0.88)",
                  color: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h3 style={{ margin: 0 }}>{job.title || "Untitled Role"}</h3>
                  <span style={pillStyle}>{job.role_category || "Other"}</span>
                </div>

                <p
                  style={{
                    margin: "0 0 8px 0",
                    color: "#9fb0d0",
                    lineHeight: 1.5,
                  }}
                >
                  {job.department || "-"} • {job.location || "-"}
                </p>

                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.6 }}>
                  {job.description || "No description available."}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}