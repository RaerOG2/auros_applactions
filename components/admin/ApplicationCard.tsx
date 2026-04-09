"use client";

import Link from "next/link";
import type { ApplicationItem } from "../../types/admin";
import {
  dangerButtonStyle,
  ghostButtonStyle,
  panelStyle,
  pillStyle,
  successButtonStyle,
  warningButtonStyle,
} from "../../lib/admin-styles";
import {
  formatDate,
  reviewLabelStyle,
  scoreBar,
  scorePillStyle,
  statusPillStyle,
} from "../../lib/admin-utils";
import ApplicationHistory from "./applications/ApplicationHistory";
import ApplicationReviewPanel from "./applications/ApplicationReviewPanel";
import ApplicationAnswers from "./applications/ApplicationAnswers";
import ApplicationNotesBox from "./applications/ApplicationNotesBox";
import ScoreBreakdownCard from "./scoring/ScoreBreakdownCard";
import ScoreControls from "./scoring/ScoreControls";

type ApplicationCardProps = {
  app: ApplicationItem;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateRating: (id: string, rating: number) => void;
  onUpdateScore: (id: string, score: number) => void;
  onUpdateReviewLabel: (id: string, reviewLabel: string) => void;
  onRecalculateScore: (id: string) => void;
  onSetManualScore: (id: string, value: number | null) => void;
  onDelete: (id: string) => void;
};

export default function ApplicationCard({
  app,
  isOpen,
  onToggle,
  onUpdateStatus,
  onUpdateNotes,
  onUpdateRating,
  onUpdateScore,
  onUpdateReviewLabel,
  onRecalculateScore,
  onSetManualScore,
  onDelete,
}: ApplicationCardProps) {
  const history = app.status_history ?? [];
  const score = app.final_score ?? app.score ?? 0;

  return (
    <div style={panelStyle}>
      <div
        className="appHeaderRow"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: "0 0 8px 0" }}>{app.name || "No name"}</h3>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span style={statusPillStyle(app.status)}>{app.status || "-"}</span>
            <span style={pillStyle}>{app.jobs?.title || "-"}</span>
            <span style={pillStyle}>{app.jobs?.role_category || "Other"}</span>
            <span style={scorePillStyle(score)}>Score {score}</span>

            {app.review_label ? (
              <span style={reviewLabelStyle(app.review_label)}>{app.review_label}</span>
            ) : null}

            {app.rating ? <span style={pillStyle}>{"★".repeat(app.rating)}</span> : null}

            <span style={pillStyle}>
              {history.length} History Event{history.length === 1 ? "" : "s"}
            </span>
          </div>

          <p style={{ margin: "10px 0 0 0", color: "#9fb0d0" }}>
            {app.email || "-"} • {app.discord || "-"} • {app.tracking_code || "-"}
          </p>

          <div
            style={{
              marginTop: 10,
              width: "100%",
              maxWidth: 280,
              height: 10,
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid #22304d",
              overflow: "hidden",
            }}
          >
            <div style={scoreBar(score)} />
          </div>

          <button
            onClick={() => navigator.clipboard.writeText(app.tracking_code || "")}
            style={{
              marginTop: 10,
              padding: "6px 10px",
              borderRadius: "10px",
              border: "1px solid #22304d",
              background: "rgba(11, 21, 43, 0.9)",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Copy Tracking Code
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href={`/admin/applications/${app.id}`} style={ghostButtonStyle}>
            Open Card
          </Link>
          <button onClick={() => onToggle(app.id)} style={ghostButtonStyle}>
            {isOpen ? "Hide Details" : "Show Details"}
          </button>
          <button
            onClick={() => onUpdateStatus(app.id, "In Review")}
            style={warningButtonStyle}
          >
            In Review
          </button>
          <button
            onClick={() => onUpdateStatus(app.id, "Accepted")}
            style={successButtonStyle}
          >
            Accept
          </button>
          <button
            onClick={() => onUpdateStatus(app.id, "Rejected")}
            style={dangerButtonStyle}
          >
            Reject
          </button>
        </div>
      </div>

      {isOpen && (
        <div style={{ marginTop: 18 }}>
          <div className="applicationGrid">
            <div>
              <div style={{ display: "grid", gap: "6px", color: "#9fb0d0" }}>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#dbe7ff" }}>Role:</strong> {app.jobs?.title || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#dbe7ff" }}>Category:</strong>{" "}
                  {app.jobs?.role_category || "Other"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#dbe7ff" }}>Tracking Code:</strong>{" "}
                  {app.tracking_code || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#dbe7ff" }}>Discord Username:</strong>{" "}
                  {app.discord || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#dbe7ff" }}>Email:</strong> {app.email || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#dbe7ff" }}>Age:</strong> {app.age || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#dbe7ff" }}>Timezone:</strong>{" "}
                  {app.timezone || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#dbe7ff" }}>Availability:</strong>{" "}
                  {app.availability || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#dbe7ff" }}>Submitted:</strong>{" "}
                  {formatDate(app.created_at)}
                </p>
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#081225",
                  border: "1px solid #22304d",
                }}
              >
                <strong>Experience</strong>
                <p style={{ marginBottom: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {app.experience || "-"}
                </p>
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#081225",
                  border: "1px solid #22304d",
                }}
              >
                <strong>Motivation</strong>
                <p style={{ marginBottom: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {app.motivation || "-"}
                </p>
              </div>

              <ApplicationHistory history={history} />
            </div>

            <div>
              <ScoreControls
                autoScore={app.auto_score ?? 0}
                manualScore={app.manual_score ?? null}
                finalScore={app.final_score ?? app.score ?? 0}
                onSetManualScore={(value) => onSetManualScore(app.id, value)}
                onRecalculate={() => onRecalculateScore(app.id)}
              />

              <div style={{ marginTop: 14 }}>
                <ScoreBreakdownCard breakdown={app.score_breakdown as any} />
              </div>

              <div style={{ marginTop: 14 }}>
                <ApplicationReviewPanel
                  rating={app.rating}
                  score={app.final_score ?? app.score}
                  reviewLabel={app.review_label}
                  onUpdateRating={(rating) => onUpdateRating(app.id, rating)}
                  onUpdateScore={(nextScore) => onUpdateScore(app.id, nextScore)}
                  onUpdateReviewLabel={(label) => onUpdateReviewLabel(app.id, label)}
                />
              </div>

              <ApplicationAnswers
                developer_skills={app.developer_skills}
                developer_projects={app.developer_projects}
                support_cases={app.support_cases}
                support_communication={app.support_communication}
                competitive_knowledge={app.competitive_knowledge}
                competitive_plans={app.competitive_plans}
                manager_leadership={app.manager_leadership}
                manager_organization={app.manager_organization}
                director_vision={app.director_vision}
                director_responsibility={app.director_responsibility}
                other_strengths={app.other_strengths}
              />

              <ApplicationNotesBox
                value={app.notes || ""}
                onBlurSave={(nextNotes) => onUpdateNotes(app.id, nextNotes)}
              />

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "14px",
                  flexWrap: "wrap",
                }}
              >
                <button onClick={() => onUpdateStatus(app.id, "New")} style={ghostButtonStyle}>
                  New
                </button>
                <button
                  onClick={() => onUpdateStatus(app.id, "Accepted")}
                  style={successButtonStyle}
                >
                  Accepted
                </button>
                <button
                  onClick={() => onUpdateStatus(app.id, "Rejected")}
                  style={dangerButtonStyle}
                >
                  Rejected
                </button>
                <button
                  onClick={() => onUpdateStatus(app.id, "In Review")}
                  style={warningButtonStyle}
                >
                  In Review
                </button>
                <Link href={`/admin/applications/${app.id}`} style={ghostButtonStyle}>
                  Open Card
                </Link>
                <button onClick={() => onDelete(app.id)} style={dangerButtonStyle}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}