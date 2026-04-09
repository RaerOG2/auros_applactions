"use client";

import DynamicFormSection from "./DynamicFormSection";
import type { ApplyFieldConfig, ApplyFormValues, Job } from "../../types/apply";

type ApplicationFormPanelProps = {
  jobs: Job[];
  jobId: string;
  setJobId: (id: string) => void;
  selectedJob: Job | null;
  selectedCategory: string;
  values: ApplyFormValues;
  setValue: (key: string, value: string) => void;
  commonFields: ApplyFieldConfig[];
  roleFields: ApplyFieldConfig[];
  attachmentFile: File | null;
  setAttachmentFile: (file: File | null) => void;
  submitApplication: () => void;
  loading: boolean;
  glassCardStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
  textareaStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  pillStyle: React.CSSProperties;
  primaryButtonStyle: React.CSSProperties;
};

export default function ApplicationFormPanel({
  jobs,
  jobId,
  setJobId,
  selectedJob,
  selectedCategory,
  values,
  setValue,
  commonFields,
  roleFields,
  attachmentFile,
  setAttachmentFile,
  submitApplication,
  loading,
  glassCardStyle,
  inputStyle,
  textareaStyle,
  labelStyle,
  pillStyle,
  primaryButtonStyle,
}: ApplicationFormPanelProps) {
  return (
    <section style={glassCardStyle}>
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>Application Form</h2>
      <p
        style={{
          color: "#9fb0d0",
          marginTop: 0,
          marginBottom: "18px",
          lineHeight: 1.6,
        }}
      >
        Fill in your details and answer the required questions for your selected role.
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
          Applications are currently unavailable because there are no open roles.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "18px" }}>
          <div
            style={{
              padding: "16px",
              borderRadius: "18px",
              background: "rgba(11, 21, 43, 0.88)",
              border: "1px solid #22304d",
            }}
          >
            <label style={labelStyle}>Selected Role</label>

            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              style={inputStyle}
            >
              {jobs.map((job) => (
                <option
                  key={job.id}
                  value={job.id}
                  style={{ background: "#0b152b", color: "white" }}
                >
                  {job.title} {job.department ? `- ${job.department}` : ""}
                </option>
              ))}
            </select>

            {selectedJob && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#081225",
                  border: "1px solid #22304d",
                }}
              >
                <p style={{ margin: "0 0 8px 0", color: "#dbe7ff" }}>
                  <strong>{selectedJob.title || "Selected Role"}</strong>
                </p>
                <p style={{ margin: "0 0 8px 0", color: "#9fb0d0" }}>
                  {selectedJob.department || "-"} • {selectedJob.location || "-"}
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.6 }}>
                  {selectedJob.description || "-"}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginTop: "12px",
                  }}
                >
                  <span style={pillStyle}>{selectedCategory}</span>

                  {selectedJob.requirements?.map((req) => (
                    <span key={req} style={pillStyle}>
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DynamicFormSection
            fields={commonFields}
            values={values}
            setValue={setValue}
            inputStyle={inputStyle}
            textareaStyle={textareaStyle}
            labelStyle={labelStyle}
          />

          <div>
            <label style={labelStyle}>Attachment</label>
            <input
              type="file"
              style={inputStyle}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setAttachmentFile(file);
              }}
            />
          </div>

          {attachmentFile && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#081225",
                border: "1px solid #22304d",
                color: "#dbe7ff",
              }}
            >
              Selected file: <strong>{attachmentFile.name}</strong>
            </div>
          )}

          <DynamicFormSection
            fields={roleFields}
            values={values}
            setValue={setValue}
            inputStyle={inputStyle}
            textareaStyle={textareaStyle}
            labelStyle={labelStyle}
          />

          <button
            onClick={submitApplication}
            disabled={loading}
            style={{
              ...primaryButtonStyle,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      )}
    </section>
  );
}