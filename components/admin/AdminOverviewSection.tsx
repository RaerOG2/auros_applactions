"use client";

import type { ApplicationItem, JobItem, PatchnoteItem } from "../../types/admin";

type AdminOverviewSectionProps = {
  applications: ApplicationItem[];
  jobs: JobItem[];
  patchnotes: PatchnoteItem[];
  averageScore: number;
};

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const panelStyle: React.CSSProperties = {
  background: "rgba(11, 21, 43, 0.88)",
  border: "1px solid #22304d",
  borderRadius: "20px",
  padding: "18px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(76, 201, 240, 0.18)",
  background: "rgba(76, 201, 240, 0.10)",
  color: "#95ecff",
  fontSize: "13px",
  fontWeight: 700,
};

export default function AdminOverviewSection({
  applications,
  jobs,
  patchnotes,
  averageScore,
}: AdminOverviewSectionProps) {
  const accepted = applications.filter((app) => app.status === "Accepted").length;
  const inReview = applications.filter((app) => app.status === "In Review").length;
  const openJobs = jobs.filter((job) => job.status === "Open").length;

  const latestApplications = applications.slice(0, 5);
  const latestPatchnotes = patchnotes.slice(0, 5);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={glassCardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Overview</h2>
            <p style={{ color: "#9fb0d0", margin: "8px 0 0 0" }}>
              Quick admin summary for applications, jobs, patchnotes and review state.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={pillStyle}>{applications.length} Applications</span>
            <span style={pillStyle}>{openJobs} Open Jobs</span>
            <span style={pillStyle}>{patchnotes.length} Patchnotes</span>
          </div>
        </div>

        <div className="statsGrid">
          <div style={panelStyle}>
            <p style={{ margin: 0, color: "#9fb0d0" }}>Applications</p>
            <h3 style={{ margin: "10px 0 0 0", fontSize: "30px" }}>{applications.length}</h3>
          </div>

          <div style={panelStyle}>
            <p style={{ margin: 0, color: "#9fb0d0" }}>Accepted</p>
            <h3 style={{ margin: "10px 0 0 0", fontSize: "30px" }}>{accepted}</h3>
          </div>

          <div style={panelStyle}>
            <p style={{ margin: 0, color: "#9fb0d0" }}>In Review</p>
            <h3 style={{ margin: "10px 0 0 0", fontSize: "30px" }}>{inReview}</h3>
          </div>

          <div style={panelStyle}>
            <p style={{ margin: 0, color: "#9fb0d0" }}>Average Score</p>
            <h3 style={{ margin: "10px 0 0 0", fontSize: "30px" }}>{averageScore}</h3>
          </div>
        </div>
      </section>

      <div className="splitGrid">
        <section style={glassCardStyle}>
          <h3 style={{ marginTop: 0 }}>Latest Applications</h3>

          <div style={{ display: "grid", gap: 12 }}>
            {latestApplications.length === 0 ? (
              <div style={{ ...panelStyle, color: "#9fb0d0" }}>No applications available.</div>
            ) : (
              latestApplications.map((app) => (
                <div key={app.id} style={panelStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{app.name || "No name"}</strong>
                      <p style={{ margin: "6px 0 0 0", color: "#9fb0d0" }}>
                        {app.jobs?.title || "-"} • {app.tracking_code || "-"}
                      </p>
                    </div>

                    <span style={pillStyle}>{app.status || "-"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section style={glassCardStyle}>
          <h3 style={{ marginTop: 0 }}>Latest Patchnotes</h3>

          <div style={{ display: "grid", gap: 12 }}>
            {latestPatchnotes.length === 0 ? (
              <div style={{ ...panelStyle, color: "#9fb0d0" }}>No patchnotes available.</div>
            ) : (
              latestPatchnotes.map((note) => (
                <div key={note.id} style={panelStyle}>
                  <strong>
                    {note.version || "No Version"} — {note.title || "Untitled"}
                  </strong>
                  <p style={{ margin: "6px 0 0 0", color: "#9fb0d0" }}>
                    {note.created_at ? new Date(note.created_at).toLocaleDateString() : "-"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}