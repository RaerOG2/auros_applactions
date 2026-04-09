"use client";

import { useApplicationStatus } from "../../hooks/useApplicationStatus";
import StatusLookupForm from "../../components/status/StatusLookupForm";
import StatusResultCard from "../../components/status/StatusResultCard";
import StatusEmptyState from "../../components/status/StatusEmptyState";

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

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px 18px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const ghostButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.9)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
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

const messageBoxStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(11, 21, 43, 0.88)",
  border: "1px solid #22304d",
  color: "#9fb0d0",
};

export default function StatusPage() {
  const status = useApplicationStatus();

  return (
    <>
      <StatusLookupForm
        trackingCode={status.trackingCode}
        setTrackingCode={status.setTrackingCode}
        checkStatus={status.checkStatus}
        loading={status.loading}
        glassCardStyle={glassCardStyle}
        inputStyle={inputStyle}
        primaryButtonStyle={primaryButtonStyle}
      />

      <section style={glassCardStyle}>
        {!status.result ? (
          <StatusEmptyState
            searched={status.searched}
            loading={status.loading}
            messageBoxStyle={messageBoxStyle}
          />
        ) : (
          <StatusResultCard
            result={status.result}
            copied={status.copied}
            copyTrackingCode={status.copyTrackingCode}
            messageBoxStyle={messageBoxStyle}
            ghostButtonStyle={ghostButtonStyle}
            pillStyle={pillStyle}
          />
        )}
      </section>
    </>
  );
}