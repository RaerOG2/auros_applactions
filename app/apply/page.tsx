"use client";

import { useApplyForm } from "../../hooks/useApplyForm";
import ApplyHero from "../../components/apply/ApplyHero";
import OpenRolesPanel from "../../components/apply/OpenRolesPanel";
import ApplicationFormPanel from "../../components/apply/ApplicationFormPanel";
import SubmissionSuccess from "../../components/apply/SubmissionSuccess";

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "14px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.92)",
  color: "white",
  outline: "none",
  fontSize: "15px",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "120px",
  resize: "vertical",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#dbe7ff",
  marginBottom: "8px",
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px 18px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(76, 201, 240, 0.18)",
};

const ghostButtonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.9)",
  color: "white",
  textDecoration: "none",
  fontWeight: 600,
  textAlign: "center",
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

export default function ApplyPage() {
  const apply = useApplyForm();

  if (apply.submittedCode) {
    return (
      <SubmissionSuccess
        submittedCode={apply.submittedCode}
        submittedRole={apply.submittedRole}
        copiedTrackingCode={apply.copiedTrackingCode}
        copyTrackingCode={apply.copyTrackingCode}
        resetSubmission={apply.resetSubmission}
        glassCardStyle={glassCardStyle}
        ghostButtonStyle={ghostButtonStyle}
        primaryButtonStyle={primaryButtonStyle}
      />
    );
  }

  return (
    <>
      <style jsx>{`
        .topRow {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .topActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .heroGrid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 24px;
          align-items: center;
        }

        .contentGrid {
          display: grid;
          grid-template-columns: 0.92fr 1.08fr;
          gap: 22px;
          align-items: start;
        }

        @media (max-width: 980px) {
          .heroGrid,
          .contentGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .heroCard {
            padding: 24px !important;
          }

          .heroTitle {
            font-size: 36px !important;
          }

          .topActions a {
            width: 100%;
          }
        }
      `}</style>

      <ApplyHero
        glassCardStyle={glassCardStyle}
        ghostButtonStyle={ghostButtonStyle}
        pillStyle={pillStyle}
      />

      <div className="contentGrid">
        <OpenRolesPanel
          jobs={apply.jobs}
          jobId={apply.jobId}
          setJobId={apply.setJobId}
          glassCardStyle={glassCardStyle}
          pillStyle={pillStyle}
        />

        <ApplicationFormPanel
          jobs={apply.jobs}
          jobId={apply.jobId}
          setJobId={apply.setJobId}
          selectedJob={apply.selectedJob}
          selectedCategory={apply.selectedCategory}
          values={apply.values}
          setValue={apply.setValue}
          commonFields={apply.commonFields}
          roleFields={apply.roleFields}
          attachmentFile={apply.attachmentFile}
          setAttachmentFile={apply.setAttachmentFile}
          submitApplication={apply.submitApplication}
          loading={apply.loading}
          glassCardStyle={glassCardStyle}
          inputStyle={inputStyle}
          textareaStyle={textareaStyle}
          labelStyle={labelStyle}
          pillStyle={pillStyle}
          primaryButtonStyle={primaryButtonStyle}
        />
      </div>
    </>
  );
}