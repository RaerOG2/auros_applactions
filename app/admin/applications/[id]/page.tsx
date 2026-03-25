"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

type StatusHistoryItem = {
  id: string;
  application_id: string;
  status: string;
  changed_at: string;
  changed_by?: string | null;
  note?: string | null;
};

type ApplicationItem = {
  id: string;
  name: string | null;
  discord: string | null;
  age: string | null;
  email: string | null;
  timezone: string | null;
  experience: string | null;
  motivation: string | null;
  availability: string | null;
  developer_skills: string | null;
  developer_projects: string | null;
  support_cases: string | null;
  support_communication: string | null;
  competitive_knowledge: string | null;
  competitive_plans: string | null;
  manager_leadership: string | null;
  manager_organization: string | null;
  director_vision: string | null;
  director_responsibility: string | null;
  other_strengths: string | null;
  tracking_code: string | null;
  status: string | null;
  notes: string | null;
  rating: number | null;
  review_label: string | null;
  created_at: string | null;
  jobs?: {
    title?: string | null;
    role_category?: string | null;
  } | null;
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

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "14px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.92)",
  color: "white",
  outline: "none",
  fontSize: "15px",
  minHeight: "140px",
  resize: "vertical",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(76, 201, 240, 0.18)",
  textDecoration: "none",
};

const successButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const ghostButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.9)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "1px solid #5b2333",
  background: "#1d1220",
  color: "white",
  fontWeight: 700,
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

function statusPillStyle(status: string | null): React.CSSProperties {
  if (status === "Accepted") {
    return {
      ...pillStyle,
      background: "rgba(34, 197, 94, 0.12)",
      color: "#9ef1b5",
      border: "1px solid rgba(34, 197, 94, 0.16)",
    };
  }

  if (status === "Rejected") {
    return {
      ...pillStyle,
      background: "rgba(239, 68, 68, 0.12)",
      color: "#ffb0b0",
      border: "1px solid rgba(239, 68, 68, 0.16)",
    };
  }

  if (status === "In Review") {
    return {
      ...pillStyle,
      background: "rgba(245, 158, 11, 0.12)",
      color: "#ffd58f",
      border: "1px solid rgba(245, 158, 11, 0.18)",
    };
  }

  return {
    ...pillStyle,
    background: "rgba(76, 201, 240, 0.12)",
    color: "#aaf3ff",
    border: "1px solid rgba(76, 201, 240, 0.18)",
  };
}

function reviewLabelStyle(label: string | null): React.CSSProperties {
  if (label === "interessant") {
    return {
      ...pillStyle,
      background: "rgba(76, 201, 240, 0.12)",
      color: "#aaf3ff",
      border: "1px solid rgba(76, 201, 240, 0.18)",
    };
  }

  if (label === "später") {
    return {
      ...pillStyle,
      background: "rgba(245, 158, 11, 0.12)",
      color: "#ffd58f",
      border: "1px solid rgba(245, 158, 11, 0.18)",
    };
  }

  if (label === "abgelehnt") {
    return {
      ...pillStyle,
      background: "rgba(239, 68, 68, 0.12)",
      color: "#ffb0b0",
      border: "1px solid rgba(239, 68, 68, 0.16)",
    };
  }

  return pillStyle;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const applicationId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [notes, setNotes] = useState("");

  async function checkAccess() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsAdmin(false);
      setCheckingAccess(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile || profile.role !== "admin") {
      setIsAdmin(false);
      setCheckingAccess(false);
      return;
    }

    setIsAdmin(true);
    setCheckingAccess(false);
  }

  async function loadApplication() {
    if (!applicationId) {
      setApplication(null);
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        name,
        discord,
        age,
        email,
        timezone,
        experience,
        motivation,
        availability,
        developer_skills,
        developer_projects,
        support_cases,
        support_communication,
        competitive_knowledge,
        competitive_plans,
        manager_leadership,
        manager_organization,
        director_vision,
        director_responsibility,
        other_strengths,
        tracking_code,
        status,
        notes,
        rating,
        review_label,
        created_at,
        jobs (
          title,
          role_category
        )
      `)
      .eq("id", applicationId)
      .single();

    if (error) {
      console.log(error);
      setApplication(null);
      setHistory([]);
      setLoading(false);
      return;
    }

    const { data: historyData, error: historyError } = await supabase
      .from("application_status_history")
      .select("id, application_id, status, changed_at, changed_by, note")
      .eq("application_id", applicationId)
      .order("changed_at", { ascending: false });

    if (historyError) {
      console.log(historyError);
    }

    setApplication(data as ApplicationItem);
    setNotes(data?.notes || "");
    setHistory((historyData as StatusHistoryItem[]) ?? []);
    setLoading(false);
  }

  async function updateApplicationStatus(status: string) {
    if (!application) return;

    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", application.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadApplication();
  }

  async function updateApplicationRating(rating: number) {
    if (!application) return;

    const { error } = await supabase
      .from("applications")
      .update({ rating })
      .eq("id", application.id);

    if (error) {
      alert(error.message);
      return;
    }

    setApplication((prev) => (prev ? { ...prev, rating } : prev));
  }

  async function updateApplicationReviewLabel(review_label: string) {
    if (!application) return;

    const { error } = await supabase
      .from("applications")
      .update({ review_label })
      .eq("id", application.id);

    if (error) {
      alert(error.message);
      return;
    }

    setApplication((prev) => (prev ? { ...prev, review_label } : prev));
  }

  async function saveNotes() {
    if (!application) return;

    const { error } = await supabase
      .from("applications")
      .update({ notes })
      .eq("id", application.id);

    if (error) {
      alert("Notes could not be saved.");
      console.log(error);
      return;
    }

    setApplication((prev) => (prev ? { ...prev, notes } : prev));
  }

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (!checkingAccess && isAdmin && applicationId) {
      loadApplication();
    }
  }, [checkingAccess, isAdmin, applicationId]);

  useEffect(() => {
    if (!isAdmin || !applicationId) return;

    const channel = supabase
      .channel(`admin-application-${applicationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
          filter: `id=eq.${applicationId}`,
        },
        async () => {
          await loadApplication();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "application_status_history",
          filter: `application_id=eq.${applicationId}`,
        },
        async () => {
          await loadApplication();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, applicationId]);

  if (checkingAccess) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={glassCardStyle}>Checking access...</div>
      </div>
    );
  }

  if (!isAdmin) {
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

  if (loading) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={glassCardStyle}>Loading application card...</div>
      </div>
    );
  }

  if (!application) {
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
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 16,
            }}
          >
            <button
              onClick={() =>
                navigator.clipboard.writeText(application.tracking_code || "")
              }
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

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <button
              onClick={() => updateApplicationStatus("New")}
              style={ghostButtonStyle}
            >
              New
            </button>
            <button
              onClick={() => updateApplicationStatus("In Review")}
              style={ghostButtonStyle}
            >
              In Review
            </button>
            <button
              onClick={() => updateApplicationStatus("Accepted")}
              style={successButtonStyle}
            >
              Accept
            </button>
            <button
              onClick={() => updateApplicationStatus("Rejected")}
              style={dangerButtonStyle}
            >
              Reject
            </button>
          </div>

          <div style={panelStyle}>
            <strong>Rating</strong>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: 12,
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => updateApplicationRating(star)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border:
                      application.rating === star
                        ? "1px solid rgba(76, 201, 240, 0.4)"
                        : "1px solid #22304d",
                    background:
                      application.rating === star
                        ? "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)"
                        : "rgba(11, 21, 43, 0.9)",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {"★".repeat(star)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...panelStyle, marginTop: 14 }}>
            <strong>Review Label</strong>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: 12,
              }}
            >
              {["interessant", "später", "abgelehnt"].map((label) => (
                <button
                  key={label}
                  onClick={() => updateApplicationReviewLabel(label)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border:
                      application.review_label === label
                        ? "1px solid rgba(76, 201, 240, 0.4)"
                        : "1px solid #22304d",
                    background:
                      application.review_label === label
                        ? "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)"
                        : "rgba(11, 21, 43, 0.9)",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
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

          <div style={panelStyle}>
            <strong>Category Answers</strong>

            <div
              style={{
                display: "grid",
                gap: "10px",
                marginTop: 12,
              }}
            >
              <div>
                <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
                  <strong style={{ color: "#dbe7ff" }}>Developer Skills</strong>
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {application.developer_skills || "-"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
                  <strong style={{ color: "#dbe7ff" }}>Developer Projects</strong>
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {application.developer_projects || "-"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
                  <strong style={{ color: "#dbe7ff" }}>Support Cases</strong>
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {application.support_cases || "-"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
                  <strong style={{ color: "#dbe7ff" }}>Support Communication</strong>
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {application.support_communication || "-"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
                  <strong style={{ color: "#dbe7ff" }}>Competitive Knowledge</strong>
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {application.competitive_knowledge || "-"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
                  <strong style={{ color: "#dbe7ff" }}>Competitive Plans</strong>
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {application.competitive_plans || "-"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
                  <strong style={{ color: "#dbe7ff" }}>Manager Leadership</strong>
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {application.manager_leadership || "-"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
                  <strong style={{ color: "#dbe7ff" }}>Manager Organization</strong>
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {application.manager_organization || "-"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
                  <strong style={{ color: "#dbe7ff" }}>Director Vision</strong>
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {application.director_vision || "-"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
                  <strong style={{ color: "#dbe7ff" }}>Director Responsibility</strong>
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {application.director_responsibility || "-"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
                  <strong style={{ color: "#dbe7ff" }}>Other Strengths</strong>
                </p>
                <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
                  {application.other_strengths || "-"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={glassCardStyle}>
          <h2 style={{ marginTop: 0 }}>Internal Review</h2>

          <div style={{ ...panelStyle, marginBottom: 14 }}>
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
                        background:
                          "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
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

          <div style={panelStyle}>
            <strong>Internal Admin Notes</strong>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes for this application..."
              style={{
                ...textareaStyle,
                marginTop: 10,
              }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button onClick={saveNotes} style={primaryButtonStyle}>
                Save Notes
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}