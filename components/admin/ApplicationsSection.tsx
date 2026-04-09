"use client";

import type React from "react";
import type { ApplicationItem } from "../../types/admin";
import {
  dangerButtonStyle,
  ghostButtonStyle,
  glassCardStyle,
  inputStyle,
  panelStyle,
  successButtonStyle,
  warningButtonStyle,
} from "../../lib/admin-styles";
import ApplicationCard from "./ApplicationCard";

type ApplicationsSectionProps = {
  applicationsOpen: boolean;
  setApplicationsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  searchName: string;
  setSearchName: React.Dispatch<React.SetStateAction<string>>;
  roleFilter: string;
  setRoleFilter: React.Dispatch<React.SetStateAction<string>>;
  roleOptions: string[];
  filteredApplications: ApplicationItem[];
  expandedApplications: string[];
  toggleApplication: (id: string) => void;
  updateApplicationStatus: (id: string, status: string) => void;
  updateApplicationNotes: (id: string, notes: string) => void;
  updateApplicationRating: (id: string, rating: number) => void;
  updateApplicationScore: (id: string, score: number) => void;
  updateApplicationReviewLabel: (id: string, reviewLabel: string) => void;
  recalculateApplicationScore: (id: string) => void;
  setManualApplicationScore: (id: string, value: number | null) => void;
  deleteApplication: (id: string) => void;
};

export default function ApplicationsSection({
  applicationsOpen,
  setApplicationsOpen,
  statusFilter,
  setStatusFilter,
  searchName,
  setSearchName,
  roleFilter,
  setRoleFilter,
  roleOptions,
  filteredApplications,
  expandedApplications,
  toggleApplication,
  updateApplicationStatus,
  updateApplicationNotes,
  updateApplicationRating,
  updateApplicationScore,
  updateApplicationReviewLabel,
  recalculateApplicationScore,
  setManualApplicationScore,
  deleteApplication,
}: ApplicationsSectionProps) {
  return (
    <section style={{ ...glassCardStyle, marginTop: 18, padding: "20px" }}>
      <div
        className="sectionHeaderRow"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: applicationsOpen ? 16 : 0,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Applications</h2>
          <p style={{ color: "#9fb0d0", margin: "6px 0 0 0", fontSize: 14 }}>
            Review candidates, scores and history.
          </p>
        </div>

        <button
          onClick={() => setApplicationsOpen((prev) => !prev)}
          style={{ ...ghostButtonStyle, padding: "10px 14px" }}
        >
          {applicationsOpen ? "Collapse" : "Expand"}
        </button>
      </div>

      {applicationsOpen && (
        <>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "10px",
              flexWrap: "wrap",
            }}
          >
            <button onClick={() => setStatusFilter("New")} style={{ ...ghostButtonStyle, padding: "8px 12px" }}>
              New
            </button>
            <button onClick={() => setStatusFilter("In Review")} style={{ ...warningButtonStyle, padding: "8px 12px" }}>
              In Review
            </button>
            <button onClick={() => setStatusFilter("Accepted")} style={{ ...successButtonStyle, padding: "8px 12px" }}>
              Accepted
            </button>
            <button onClick={() => setStatusFilter("Rejected")} style={{ ...dangerButtonStyle, padding: "8px 12px" }}>
              Rejected
            </button>
            <button onClick={() => setStatusFilter("All")} style={{ ...ghostButtonStyle, padding: "8px 12px" }}>
              All
            </button>
          </div>

          <div className="filtersGrid">
            <input
              placeholder="Search by name, email, discord or tracking code"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ ...inputStyle, padding: "11px 12px", fontSize: 14 }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, padding: "11px 12px", fontSize: 14 }}
            >
              <option style={{ background: "#0b152b" }} value="All">
                All Statuses
              </option>
              <option style={{ background: "#0b152b" }} value="New">
                New
              </option>
              <option style={{ background: "#0b152b" }} value="Accepted">
                Accepted
              </option>
              <option style={{ background: "#0b152b" }} value="Rejected">
                Rejected
              </option>
              <option style={{ background: "#0b152b" }} value="In Review">
                In Review
              </option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ ...inputStyle, padding: "11px 12px", fontSize: 14 }}
            >
              <option style={{ background: "#0b152b" }} value="All">
                All Roles
              </option>
              {roleOptions.map((role) => (
                <option key={role} style={{ background: "#0b152b" }} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                isOpen={expandedApplications.includes(app.id)}
                onToggle={toggleApplication}
                onUpdateStatus={updateApplicationStatus}
                onUpdateNotes={updateApplicationNotes}
                onUpdateRating={updateApplicationRating}
                onUpdateScore={updateApplicationScore}
                onUpdateReviewLabel={updateApplicationReviewLabel}
                onRecalculateScore={recalculateApplicationScore}
                onSetManualScore={setManualApplicationScore}
                onDelete={deleteApplication}
              />
            ))}

            {filteredApplications.length === 0 && (
              <div style={{ ...panelStyle, color: "#9fb0d0", padding: 14 }}>
                No applications found with the current filters.
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}