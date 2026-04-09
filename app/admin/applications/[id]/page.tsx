"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdminApplication } from "../../../../hooks/useAdminApplication";

import {
  dangerButtonStyle,
  ghostButtonStyle,
  glassCardStyle,
  panelStyle,
  pillStyle,
  successButtonStyle,
  textareaStyle,
  warningButtonStyle,
} from "../../../../lib/admin-styles";

import {
  formatDate,
  reviewLabelStyle,
  scoreBar,
  scorePillStyle,
  statusPillStyle,
} from "../../../../lib/admin-utils";

import ApplicationHistory from "../../../../components/admin/applications/ApplicationHistory";
import ApplicationReviewPanel from "../../../../components/admin/applications/ApplicationReviewPanel";
import ApplicationAnswers from "../../../../components/admin/applications/ApplicationAnswers";
import ApplicationNotesBox from "../../../../components/admin/applications/ApplicationNotesBox";

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const applicationId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const admin = useAdminApplication(applicationId);

  if (admin.checkingAccess) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={glassCardStyle}>Checking access...</div>
      </div>
    );
  }

  if (!admin.isAdmin) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={glassCardStyle}>
          <h1 style={{ marginTop: 0 }}>No admin access</h1>
          <p style={{ color: "#9fb0d0" }}>
            You do not have permission to open this application card.
          </p>
          <Link href="/admin" style={ghostButtonStyle}>
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  if (admin.loading) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={glassCardStyle}>Loading application card...</div>
      </div>
    );
  }

  if (!admin.application) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={glassCardStyle}>
          <h1 style={{ marginTop: 0 }}>Application not found</h1>
          <p style={{ color: "#9fb0d0" }}>
            This application does not exist or could not be loaded.
          </p>
          <Link href="/admin" style={ghostButtonStyle}>
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  const application = admin.application;

  return (
    <>
      <style jsx>{`
        .topGrid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 22px;
        }

        .detailGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
          align-items: start;
        }

        .historyGrid {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        @media (max-width: 980px) {
          .topGrid,
          .detailGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 22,
        }}
      >
        <div>
          <p
            style={{
              color: "#4cc9f0",
              fontWeight: 800,
              marginBottom: 8,
              fontSize: "13px",
              letterSpacing: "0.08em",
            }}
          >
            APPLICATION CARD
          </p>
          <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>
            {application.name || "Unnamed Applicant"}
          </h1>
          <p style={{ color: "#9fb0d0", marginTop: 8 }}>
            {application.jobs?.title || "-"} • {application.tracking_code || "-"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={statusPillStyle(application.status)}>
            {application.status || "-"}
          </span>

          <span style={scorePillStyle(application.score)}>
            Score {application.score ?? 0}
          </span>

          {application.review_label ? (
            <span style={reviewLabelStyle(application.review_label)}>
              {application.review_label}
            </span>
          ) : null}

          {application.rating ? (
            <span style={pillStyle}>{"★".repeat(application.rating)}</span>
          ) : null}

          <Link href="/admin" style={ghostButtonStyle}>
            Back to Admin
          </Link>
        </div>
      </div>

      <div className="topGrid">
        <section style={glassCardStyle}>
          <h2 style={{ marginTop: 0 }}>Applicant Information</h2>

          <div
            style={{
              display: "grid",
              gap: "8px",
              color: "#9fb0d0",
            }}
          >
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#dbe7ff" }}>Role:</strong>{" "}
              {application.jobs?.title || "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#dbe7ff" }}>Category:</strong>{" "}
              {application.jobs?.role_category || "Other"}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#dbe7ff" }}>Email:</strong>{" "}
              {application.email || "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#dbe7ff" }}>Discord:</strong>{" "}
              {application.discord || "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#dbe7ff" }}>Age:</strong>{" "}
              {application.age || "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#dbe7ff" }}>Timezone:</strong>{" "}
              {application.timezone || "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#dbe7ff" }}>Availability:</strong>{" "}
              {application.availability || "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#dbe7ff" }}>Tracking Code:</strong>{" "}
              {application.tracking_code || "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#dbe7ff" }}>Submitted:</strong>{" "}
              {formatDate(application.created_at)}
            </p>
          </div>

          <div
            style={{
              marginTop: 18,
              width: "100%",
              height: 12,
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid #22304d",
              overflow: "hidden",
            }}
          >
            <div style={scoreBar(application.score)} />
          </div>

          <p style={{ margin: "10px 0 0 0", color: "#9fb0d0" }}>
            Current application score:{" "}
            <strong style={{ color: "#dbe7ff" }}>{application.score ?? 0}</strong>/100
          </p>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 16,
            }}
          >
            <button
              onClick={() => navigator.clipboard.writeText(application.tracking_code || "")}
              style={ghostButtonStyle}
            >
              Copy Tracking Code
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(application.email || "")}
              style={ghostButtonStyle}
            >
              Copy Email
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(application.discord || "")}
              style={ghostButtonStyle}
            >
              Copy Discord
            </button>
          </div>
        </section>

        <section style={glassCardStyle}>
          <h2 style={{ marginTop: 0 }}>Quick Actions</h2>

          <div
            style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
          >
            <button
              onClick={() => admin.updateStatus("New")}
              style={ghostButtonStyle}
            >
              New
            </button>
            <button
              onClick={() => admin.updateStatus("In Review")}
              style={warningButtonStyle}
            >
              In Review
            </button>
            <button
              onClick={() => admin.updateStatus("Accepted")}
              style={successButtonStyle}
            >
              Accept
            </button>
            <button
              onClick={() => admin.updateStatus("Rejected")}
              style={dangerButtonStyle}
            >
              Reject
            </button>
          </div>

          <ApplicationReviewPanel
            rating={application.rating}
            score={application.score}
            reviewLabel={application.review_label}
            onUpdateRating={admin.updateRating}
            onUpdateScore={admin.updateScore}
            onUpdateReviewLabel={admin.updateLabel}
          />
        </section>
      </div>

      <div className="detailGrid" style={{ marginTop: 22 }}>
        <section style={glassCardStyle}>
          <h2 style={{ marginTop: 0 }}>Application Answers</h2>

          <div style={{ ...panelStyle, marginBottom: 14 }}>
            <strong>Experience</strong>
            <p style={{ marginBottom: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
              {application.experience || "-"}
            </p>
          </div>

          <div style={{ ...panelStyle, marginBottom: 14 }}>
            <strong>Motivation</strong>
            <p style={{ marginBottom: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
              {application.motivation || "-"}
            </p>
          </div>

          <ApplicationAnswers
            developer_skills={application.developer_skills}
            developer_projects={application.developer_projects}
            support_cases={application.support_cases}
            support_communication={application.support_communication}
            competitive_knowledge={application.competitive_knowledge}
            competitive_plans={application.competitive_plans}
            manager_leadership={application.manager_leadership}
            manager_organization={application.manager_organization}
            director_vision={application.director_vision}
            director_responsibility={application.director_responsibility}
            other_strengths={application.other_strengths}
          />
        </section>

        <section style={glassCardStyle}>
          <h2 style={{ marginTop: 0 }}>Internal Review</h2>

          <ApplicationHistory history={admin.history} />

          <div style={{ marginTop: 14 }}>
            <ApplicationNotesBox
              value={admin.notes}
              controlled
              onChange={admin.setNotes}
              onSaveClick={admin.saveNotes}
            />
          </div>
        </section>
      </div>
    </>
  );
}