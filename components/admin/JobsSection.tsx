"use client";

import type React from "react";
import type { JobFormState, JobItem } from "../../types/admin";
import {
  dangerButtonStyle,
  ghostButtonStyle,
  inputStyle,
  labelStyle,
  panelStyle,
  primaryButtonStyle,
  pillStyle,
} from "../../lib/admin-styles";

type JobsSectionProps = {
  jobsOpen: boolean;
  setJobsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingJobId: string | null;
  jobForm: JobFormState;
  setJobForm: React.Dispatch<React.SetStateAction<JobFormState>>;
  jobs: JobItem[];
  saveJob: () => void;
  cancelEditJob: () => void;
  startEditJob: (job: JobItem) => void;
  updateJobStatus: (id: string, status: string) => void;
  deleteJob: (id: string) => void;
};

export default function JobsSection({
  jobsOpen,
  setJobsOpen,
  editingJobId,
  jobForm,
  setJobForm,
  jobs,
  saveJob,
  cancelEditJob,
  startEditJob,
  updateJobStatus,
  deleteJob,
}: JobsSectionProps) {
  return (
    <section>
      <div
        className="sectionHeaderRow"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: jobsOpen ? 16 : 0,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Jobs Management</h2>
          <p style={{ color: "#9fb0d0", margin: "6px 0 0 0", fontSize: 14 }}>
            Create and manage open positions.
          </p>
        </div>

        <button
          onClick={() => setJobsOpen((prev) => !prev)}
          style={{ ...ghostButtonStyle, padding: "10px 14px" }}
        >
          {jobsOpen ? "Collapse" : "Expand"}
        </button>
      </div>

      {jobsOpen && (
        <div className="splitGrid">
          <section style={{ ...panelStyle, padding: 16, borderRadius: 18 }}>
            <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: 16 }}>
              {editingJobId ? "Edit Job" : "Create Job"}
            </h3>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={labelStyle}>Job Title</label>
                <input
                  value={jobForm.title}
                  onChange={(e) => setJobForm((prev) => ({ ...prev, title: e.target.value }))}
                  style={{ ...inputStyle, padding: "11px 12px", fontSize: 14 }}
                />
              </div>

              <div>
                <label style={labelStyle}>Department</label>
                <input
                  value={jobForm.department}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  style={{ ...inputStyle, padding: "11px 12px", fontSize: 14 }}
                />
              </div>

              <div>
                <label style={labelStyle}>Role Category</label>
                <select
                  value={jobForm.role_category}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      role_category: e.target.value,
                    }))
                  }
                  style={{ ...inputStyle, padding: "11px 12px", fontSize: 14 }}
                >
                  <option style={{ background: "#0b152b" }} value="Developer">
                    Developer
                  </option>
                  <option style={{ background: "#0b152b" }} value="Supporter">
                    Supporter
                  </option>
                  <option style={{ background: "#0b152b" }} value="Competitive Manager">
                    Competitive Manager
                  </option>
                  <option style={{ background: "#0b152b" }} value="Manager">
                    Manager
                  </option>
                  <option style={{ background: "#0b152b" }} value="Director">
                    Director
                  </option>
                  <option style={{ background: "#0b152b" }} value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="miniGrid">
                <div>
                  <label style={labelStyle}>Type</label>
                  <input
                    value={jobForm.type}
                    onChange={(e) => setJobForm((prev) => ({ ...prev, type: e.target.value }))}
                    style={{ ...inputStyle, padding: "11px 12px", fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Location</label>
                  <input
                    value={jobForm.location}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    style={{ ...inputStyle, padding: "11px 12px", fontSize: 14 }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  style={{
                    ...inputStyle,
                    padding: "11px 12px",
                    fontSize: 14,
                    minHeight: 110,
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>Requirements</label>
                <input
                  value={jobForm.requirements}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      requirements: e.target.value,
                    }))
                  }
                  style={{ ...inputStyle, padding: "11px 12px", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={saveJob} style={{ ...primaryButtonStyle, padding: "10px 14px" }}>
                  {editingJobId ? "Save Job" : "Create Job"}
                </button>

                {editingJobId && (
                  <button onClick={cancelEditJob} style={{ ...ghostButtonStyle, padding: "10px 14px" }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </section>

          <section style={{ ...panelStyle, padding: 16, borderRadius: 18 }}>
            <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: 16 }}>Job Listings</h3>

            <div style={{ display: "grid", gap: 12 }}>
              {jobs.map((job) => (
                <div key={job.id} style={{ ...panelStyle, padding: 14, borderRadius: 16 }}>
                  <div
                    className="jobHeaderRow"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "start",
                      flexWrap: "wrap",
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <h3 style={{ marginTop: 0, marginBottom: 6, fontSize: 15 }}>
                        {job.title || "No title"}
                      </h3>
                      <p style={{ color: "#9fb0d0", margin: "3px 0", fontSize: 13 }}>
                        {job.department || "-"} • {job.type || "-"} • {job.location || "-"}
                      </p>
                      <p style={{ color: "#9fb0d0", margin: "3px 0", fontSize: 13 }}>
                        Category: {job.role_category || "Other"}
                      </p>
                    </div>

                    <span style={{ ...pillStyle, padding: "6px 10px", fontSize: 12 }}>
                      {job.status || "-"}
                    </span>
                  </div>

                  <p style={{ color: "#dbe7ff", lineHeight: 1.55, fontSize: 13, marginBottom: 10 }}>
                    {job.description || "-"}
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => startEditJob(job)} style={{ ...ghostButtonStyle, padding: "8px 12px" }}>
                      Edit
                    </button>
                    <button onClick={() => updateJobStatus(job.id, "Open")} style={{ ...primaryButtonStyle, padding: "8px 12px" }}>
                      Open
                    </button>
                    <button onClick={() => updateJobStatus(job.id, "Filled")} style={{ ...ghostButtonStyle, padding: "8px 12px" }}>
                      Filled
                    </button>
                    <button onClick={() => deleteJob(job.id)} style={{ ...dangerButtonStyle, padding: "8px 12px" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {jobs.length === 0 && (
                <div style={{ ...panelStyle, color: "#9fb0d0", padding: 14 }}>
                  No jobs created yet.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}