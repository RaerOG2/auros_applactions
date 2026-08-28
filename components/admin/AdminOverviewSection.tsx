"use client";

import { useEffect, useState } from "react";
import type { ApplicationItem, JobItem, PatchnoteItem } from "../../types/admin";
import {
  getChatSystemStatus,
  updateChatSystemStatus,
} from "../../services/chat-status.service";
import {
  getSiteAnnouncement,
  updateSiteAnnouncement,
} from "../../services/site-announcement.service";

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
  const [chatDowntime, setChatDowntime] = useState(false);
  const [downtimeMessage, setDowntimeMessage] = useState("");
  const [savingDowntime, setSavingDowntime] = useState(false);
  const [downtimeModalOpen, setDowntimeModalOpen] = useState(false);
  const [downtimeDraft, setDowntimeDraft] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  useEffect(() => {
    getChatSystemStatus()
      .then((status) => {
        setChatDowntime(status.chatDisabled);
        setDowntimeMessage(status.downtimeMessage ?? "");
      })
      .catch(console.error);
    
    getSiteAnnouncement()
    .then((data) => {
      setAnnouncementEnabled(data.enabled);
      setAnnouncementTitle(data.title ?? "");
      setAnnouncementMessage(data.message ?? "");
    })
    .catch(console.error);
  }, []);

  async function handleToggleDowntime() {
    if (savingDowntime) return;

    if (!chatDowntime) {
      setDowntimeDraft(downtimeMessage || "");
      setDowntimeModalOpen(true);
      return;
    }

    try {
      setSavingDowntime(true);

      await updateChatSystemStatus({
        chatDisabled: false,
        downtimeMessage: null,
      });

      setChatDowntime(false);
      setDowntimeMessage("");
    } finally {
      setSavingDowntime(false);
    }
  }

  async function activateDowntime() {
    const message = downtimeDraft.trim();
    if (!message || savingDowntime) return;

    try {
      setSavingDowntime(true);

      await updateChatSystemStatus({
        chatDisabled: true,
        downtimeMessage: message,
      });

      setChatDowntime(true);
      setDowntimeMessage(message);
      setDowntimeModalOpen(false);
    } finally {
      setSavingDowntime(false);
    }
  }

  async function saveAnnouncement() {
    try {
      setSavingAnnouncement(true);

      await updateSiteAnnouncement({
        enabled: announcementEnabled,
        title: announcementTitle.trim() || null,
        message: announcementMessage.trim() || null,
      });
    } finally {
      setSavingAnnouncement(false);
    }
  }

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
            <h3 style={{ margin: "10px 0 0 0", fontSize: "30px" }}>
              {applications.length}
            </h3>
          </div>

          <div style={panelStyle}>
            <p style={{ margin: 0, color: "#9fb0d0" }}>Accepted</p>
            <h3 style={{ margin: "10px 0 0 0", fontSize: "30px" }}>
              {accepted}
            </h3>
          </div>

          <div style={panelStyle}>
            <p style={{ margin: 0, color: "#9fb0d0" }}>In Review</p>
            <h3 style={{ margin: "10px 0 0 0", fontSize: "30px" }}>
              {inReview}
            </h3>
          </div>

          <div style={panelStyle}>
            <p style={{ margin: 0, color: "#9fb0d0" }}>Average Score</p>
            <h3 style={{ margin: "10px 0 0 0", fontSize: "30px" }}>
              {averageScore}
            </h3>
          </div>
        </div>
      </section>

      <section style={glassCardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Chat System Downtime</h3>
            <p style={{ color: "#9fb0d0", margin: "8px 0 0 0" }}>
              Temporarily disable AUROSCHANNEL and show a downtime message on the
              website.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleDowntime}
            disabled={savingDowntime}
            style={{
              minHeight: 44,
              padding: "0 16px",
              borderRadius: 14,
              border: chatDowntime
                ? "1px solid rgba(255,107,107,0.35)"
                : "1px solid rgba(76,201,240,0.22)",
              background: chatDowntime
                ? "rgba(255,107,107,0.14)"
                : "rgba(76,201,240,0.12)",
              color: chatDowntime ? "#ffb7b7" : "#95ecff",
              fontWeight: 900,
              cursor: savingDowntime ? "not-allowed" : "pointer",
            }}
          >
            {savingDowntime
              ? "Saving..."
              : chatDowntime
              ? "Disable Downtime"
              : "Enable Downtime"}
          </button>
        </div>

        <div style={{ ...panelStyle, marginTop: 16 }}>
          <p style={{ margin: 0, color: "#9fb0d0" }}>Current Status</p>

          <h3
            style={{
              margin: "8px 0 0 0",
              color: chatDowntime ? "#ffb7b7" : "#95ecff",
            }}
          >
            {chatDowntime ? "Chat is currently disabled" : "Chat is online"}
          </h3>

          {chatDowntime && (
            <p style={{ margin: "10px 0 0 0", color: "#d7e4ff" }}>
              {downtimeMessage || "No downtime message set."}
            </p>
          )}
        </div>
      </section>

      <div className="splitGrid">
        <section style={glassCardStyle}>
          <h3 style={{ marginTop: 0 }}>Latest Applications</h3>

          <div style={{ display: "grid", gap: 12 }}>
            {latestApplications.length === 0 ? (
              <div style={{ ...panelStyle, color: "#9fb0d0" }}>
                No applications available.
              </div>
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
              <div style={{ ...panelStyle, color: "#9fb0d0" }}>
                No patchnotes available.
              </div>
            ) : (
              latestPatchnotes.map((note) => (
                <div key={note.id} style={panelStyle}>
                  <strong>
                    {note.version || "No Version"} — {note.title || "Untitled"}
                  </strong>
                  <p style={{ margin: "6px 0 0 0", color: "#9fb0d0" }}>
                    {note.created_at
                      ? new Date(note.created_at).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section style={glassCardStyle}>
        <div>
          <h3 style={{ margin: 0 }}>Homepage Announcement Board</h3>
          <p style={{ color: "#9fb0d0", margin: "8px 0 0 0" }}>
            Publish an announcement on the homepage, for example upcoming maintenance or patch information.
          </p>
        </div>

        <div style={{ ...panelStyle, marginTop: 16, display: "grid", gap: 12 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "center", color: "#d7e4ff", fontWeight: 800 }}>
            <input
              type="checkbox"
              checked={announcementEnabled}
              onChange={(e) => setAnnouncementEnabled(e.target.checked)}
            />
            Enable homepage announcement
          </label>

          <input
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            placeholder="Announcement title"
            style={{
              width: "100%",
              minHeight: 44,
              borderRadius: 14,
              border: "1px solid rgba(76, 201, 240, 0.18)",
              background: "rgba(4, 10, 24, 0.86)",
              color: "#f6f8ff",
              padding: "0 14px",
              outline: "none",
              fontWeight: 700,
            }}
          />

          <textarea
            value={announcementMessage}
            onChange={(e) => setAnnouncementMessage(e.target.value)}
            placeholder="Announcement message"
            style={{
              width: "100%",
              minHeight: 110,
              resize: "vertical",
              borderRadius: 16,
              border: "1px solid rgba(76, 201, 240, 0.18)",
              background: "rgba(4, 10, 24, 0.86)",
              color: "#f6f8ff",
              padding: "14px 16px",
              outline: "none",
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={saveAnnouncement}
              disabled={savingAnnouncement}
              style={{
                minHeight: 44,
                padding: "0 18px",
                borderRadius: 14,
                border: "1px solid rgba(212, 175, 55, 0.28)",
                background:
                  "linear-gradient(180deg, rgba(212,175,55,0.28), rgba(142,105,19,0.22))",
                color: "#fff2c0",
                fontWeight: 900,
                cursor: savingAnnouncement ? "not-allowed" : "pointer",
                opacity: savingAnnouncement ? 0.6 : 1,
              }}
            >
              {savingAnnouncement ? "Saving..." : "Save Announcement"}
            </button>
          </div>
        </div>
      </section>

      {downtimeModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(2, 8, 20, 0.76)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "min(100%, 560px)",
              borderRadius: 24,
              border: "1px solid rgba(76, 201, 240, 0.18)",
              background:
                "linear-gradient(180deg, rgba(15, 27, 52, 0.98), rgba(7, 14, 30, 0.98))",
              boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
              padding: 24,
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                color: "#95ecff",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Chat System Downtime
            </p>

            <h3 style={{ margin: "0 0 10px", color: "white", fontSize: 26 }}>
              Downtime Message
            </h3>

            <p style={{ margin: "0 0 16px", color: "#9fb0d0", lineHeight: 1.6 }}>
              This message will be shown on the website while AUROSCHANNEL is
              disabled.
            </p>

            <textarea
              value={downtimeDraft}
              onChange={(e) => setDowntimeDraft(e.target.value)}
              placeholder="Example: AUROSCHANNEL is currently unavailable due to maintenance."
              autoFocus
              style={{
                width: "100%",
                minHeight: 120,
                resize: "vertical",
                borderRadius: 16,
                border: "1px solid rgba(76, 201, 240, 0.18)",
                background: "rgba(4, 10, 24, 0.86)",
                color: "#f6f8ff",
                padding: "14px 16px",
                outline: "none",
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 18,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setDowntimeModalOpen(false)}
                style={{
                  minHeight: 44,
                  padding: "0 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(76, 201, 240, 0.14)",
                  background: "rgba(15, 27, 52, 0.86)",
                  color: "#d7e4ff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={savingDowntime || !downtimeDraft.trim()}
                onClick={activateDowntime}
                style={{
                  minHeight: 44,
                  padding: "0 18px",
                  borderRadius: 14,
                  border: "1px solid rgba(212, 175, 55, 0.28)",
                  background:
                    "linear-gradient(180deg, rgba(212,175,55,0.28), rgba(142,105,19,0.22))",
                  color: "#fff2c0",
                  fontWeight: 900,
                  cursor:
                    savingDowntime || !downtimeDraft.trim()
                      ? "not-allowed"
                      : "pointer",
                  opacity: savingDowntime || !downtimeDraft.trim() ? 0.6 : 1,
                }}
              >
                {savingDowntime ? "Saving..." : "Activate Downtime"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}