"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AdminActivityLog,
  AdminAuthFilter,
  AdminAuthLog,
  AdminLogTab,
} from "../../types/admin-logs";
import {
  getAdminActivityLogs,
  getAdminAuthLogs,
} from "../../services/admin-log-service";

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

const ghostButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.9)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  borderRadius: "12px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.92)",
  color: "white",
  outline: "none",
  fontSize: "14px",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function prettyJson(value: Record<string, unknown> | null | undefined) {
  if (!value) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function successPill(success: boolean): React.CSSProperties {
  return success
    ? {
        ...pillStyle,
        background: "rgba(34, 197, 94, 0.12)",
        color: "#9ef1b5",
        border: "1px solid rgba(34, 197, 94, 0.16)",
      }
    : {
        ...pillStyle,
        background: "rgba(239, 68, 68, 0.12)",
        color: "#ffb0b0",
        border: "1px solid rgba(239, 68, 68, 0.16)",
      };
}

type CombinedLogItem =
  | {
      id: string;
      kind: "activity";
      created_at: string;
      title: string;
      subtitle: string;
      badge: string;
      badgeStyle: React.CSSProperties;
      details: Record<string, unknown> | null;
      raw: AdminActivityLog;
    }
  | {
      id: string;
      kind: "auth";
      created_at: string;
      title: string;
      subtitle: string;
      badge: string;
      badgeStyle: React.CSSProperties;
      details: Record<string, unknown> | null;
      raw: AdminAuthLog;
    };

export default function AdminLogsSection() {
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [authLogs, setAuthLogs] = useState<AdminAuthLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<AdminLogTab>("all");
  const [authFilter, setAuthFilter] = useState<AdminAuthFilter>("all");
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  async function loadLogs() {
    try {
      setLoading(true);

      const [activity, auth] = await Promise.all([
        getAdminActivityLogs(100),
        getAdminAuthLogs(100),
      ]);

      setActivityLogs(activity);
      setAuthLogs(auth);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  function toggleExpanded(id: string) {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const filteredActivityLogs = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return activityLogs.filter((log) => {
      const haystack = [
        log.action,
        log.target_type,
        log.target_label || "",
        log.admin_email || "",
        JSON.stringify(log.details || {}),
      ]
        .join(" ")
        .toLowerCase();

      return !searchValue || haystack.includes(searchValue);
    });
  }, [activityLogs, search]);

  const filteredAuthLogs = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return authLogs.filter((log) => {
      const matchesSuccess =
        authFilter === "all" ||
        (authFilter === "success" && log.success) ||
        (authFilter === "failed" && !log.success);

      const haystack = [
        log.event_type,
        log.email || "",
        JSON.stringify(log.details || {}),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !searchValue || haystack.includes(searchValue);

      return matchesSuccess && matchesSearch;
    });
  }, [authLogs, authFilter, search]);

  const combinedLogs = useMemo(() => {
    const activityMapped: CombinedLogItem[] = filteredActivityLogs.map((log) => ({
      id: `activity-${log.id}`,
      kind: "activity",
      created_at: log.created_at,
      title: log.action,
      subtitle: `${log.target_type}${log.target_label ? ` • ${log.target_label}` : ""} • ${
        log.admin_email || "Unknown admin"
      }`,
      badge: "Activity",
      badgeStyle: pillStyle,
      details: log.details,
      raw: log,
    }));

    const authMapped: CombinedLogItem[] = filteredAuthLogs.map((log) => ({
      id: `auth-${log.id}`,
      kind: "auth",
      created_at: log.created_at,
      title: log.event_type,
      subtitle: `${log.email || "-"} • ${log.success ? "Success" : "Failed"}`,
      badge: log.success ? "Auth Success" : "Auth Failed",
      badgeStyle: successPill(log.success),
      details: log.details,
      raw: log,
    }));

    return [...activityMapped, ...authMapped].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filteredActivityLogs, filteredAuthLogs]);

  const visibleLogs = useMemo(() => {
    if (activeTab === "activity") return combinedLogs.filter((item) => item.kind === "activity");
    if (activeTab === "auth") return combinedLogs.filter((item) => item.kind === "auth");
    return combinedLogs;
  }, [activeTab, combinedLogs]);

  const activityCount = activityLogs.length;
  const authCount = authLogs.length;
  const authSuccessCount = authLogs.filter((log) => log.success).length;
  const authFailedCount = authLogs.filter((log) => !log.success).length;

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
            <h2 style={{ margin: 0 }}>Logs</h2>
            <p style={{ color: "#9fb0d0", margin: "8px 0 0 0" }}>
              Activity and authentication logs for admin actions.
            </p>
          </div>

          <button onClick={loadLogs} style={ghostButtonStyle}>
            {loading ? "Refreshing..." : "Refresh Logs"}
          </button>
        </div>

        <div className="statsGrid" style={{ marginBottom: 18 }}>
          <div style={panelStyle}>
            <p style={{ margin: 0, color: "#9fb0d0" }}>Activity Logs</p>
            <h3 style={{ margin: "10px 0 0 0", fontSize: "28px" }}>{activityCount}</h3>
          </div>

          <div style={panelStyle}>
            <p style={{ margin: 0, color: "#9fb0d0" }}>Auth Logs</p>
            <h3 style={{ margin: "10px 0 0 0", fontSize: "28px" }}>{authCount}</h3>
          </div>

          <div style={panelStyle}>
            <p style={{ margin: 0, color: "#9fb0d0" }}>Auth Success</p>
            <h3 style={{ margin: "10px 0 0 0", fontSize: "28px" }}>{authSuccessCount}</h3>
          </div>

          <div style={panelStyle}>
            <p style={{ margin: 0, color: "#9fb0d0" }}>Auth Failed</p>
            <h3 style={{ margin: "10px 0 0 0", fontSize: "28px" }}>{authFailedCount}</h3>
          </div>
        </div>

        <div style={{ ...panelStyle, marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <button
              onClick={() => setActiveTab("all")}
              style={activeTab === "all" ? primaryButtonStyle : ghostButtonStyle}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              style={activeTab === "activity" ? primaryButtonStyle : ghostButtonStyle}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab("auth")}
              style={activeTab === "auth" ? primaryButtonStyle : ghostButtonStyle}
            >
              Auth
            </button>
          </div>

          <div className="splitGrid">
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#9fb0d0",
                  marginBottom: 8,
                }}
              >
                Search
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search action, email, target, details..."
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#9fb0d0",
                  marginBottom: 8,
                }}
              >
                Auth Filter
              </label>
              <select
                value={authFilter}
                onChange={(e) => setAuthFilter(e.target.value as AdminAuthFilter)}
                style={inputStyle}
              >
                <option value="all" style={{ background: "#0b152b" }}>
                  All Auth
                </option>
                <option value="success" style={{ background: "#0b152b" }}>
                  Success Only
                </option>
                <option value="failed" style={{ background: "#0b152b" }}>
                  Failed Only
                </option>
              </select>
            </div>
          </div>
        </div>

        <section style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>
            {activeTab === "all"
              ? "All Logs"
              : activeTab === "activity"
              ? "Activity Logs"
              : "Auth Logs"}
          </h3>

          <div style={{ display: "grid", gap: 12 }}>
            {loading ? (
              <div style={{ color: "#9fb0d0" }}>Loading logs...</div>
            ) : visibleLogs.length === 0 ? (
              <div style={{ color: "#9fb0d0" }}>No logs found for the current filters.</div>
            ) : (
              visibleLogs.map((item) => {
                const isExpanded = expandedIds.includes(item.id);
                const detailsText = prettyJson(item.details);

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "14px",
                      borderRadius: "14px",
                      background: "#081225",
                      border: "1px solid #22304d",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "start",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <span style={item.badgeStyle}>{item.badge}</span>
                          <span style={pillStyle}>{item.title}</span>
                        </div>

                        <p
                          style={{
                            margin: 0,
                            color: "#dbe7ff",
                            lineHeight: 1.6,
                            wordBreak: "break-word",
                          }}
                        >
                          {item.subtitle}
                        </p>

                        <p
                          style={{
                            margin: "6px 0 0 0",
                            color: "#9fb0d0",
                            fontSize: 13,
                          }}
                        >
                          {formatDateTime(item.created_at)}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleExpanded(item.id)}
                        style={ghostButtonStyle}
                      >
                        {isExpanded ? "Hide Details" : "Show Details"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 12 }}>
                        <div
                          style={{
                            padding: "12px",
                            borderRadius: "12px",
                            background: "rgba(11, 21, 43, 0.7)",
                            border: "1px solid #22304d",
                          }}
                        >
                          {detailsText ? (
                            <pre
                              style={{
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                color: "#dbe7ff",
                                lineHeight: 1.6,
                                fontSize: 13,
                                fontFamily:
                                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                              }}
                            >
                              {detailsText}
                            </pre>
                          ) : (
                            <p style={{ margin: 0, color: "#9fb0d0" }}>
                              No details available.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </section>
    </div>
  );
}