"use client";

import { useEffect, useState } from "react";
import type {
  ApplicationItem,
  JobFormState,
  JobItem,
  PatchnoteItem,
} from "../../types/admin";
import AdminSidebar from "./AdminSidebar";
import AdminOverviewSection from "./AdminOverviewSection";
import AdminLogsSection from "./AdminLogsSection";
import JobsSection from "./JobsSection";
import PatchnotesSection from "./PatchnotesSection";
import ApplicationsSection from "./ApplicationsSection";

type AdminSectionKey =
  | "overview"
  | "applications"
  | "jobs"
  | "patchnotes"
  | "logs";

type AdminShellProps = {
  applications: ApplicationItem[];
  jobs: JobItem[];
  patchnotes: PatchnoteItem[];
  averageScore: number;

  jobsOpen: boolean;
  setJobsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingJobId: string | null;
  jobForm: JobFormState;
  setJobForm: React.Dispatch<React.SetStateAction<JobFormState>>;
  saveJob: () => void;
  cancelEditJob: () => void;
  startEditJob: (job: JobItem) => void;
  updateJobStatus: (id: string, status: string) => void;
  deleteJob: (id: string) => void;

  patchnotesOpen: boolean;
  setPatchnotesOpen: React.Dispatch<React.SetStateAction<boolean>>;
  patchVersion: string;
  setPatchVersion: React.Dispatch<React.SetStateAction<string>>;
  patchTitle: string;
  setPatchTitle: React.Dispatch<React.SetStateAction<string>>;
  patchContent: string;
  setPatchContent: React.Dispatch<React.SetStateAction<string>>;
  editingPatchId: string | null;
  expandedPatchnotes: string[];
  savePatchnote: () => void;
  cancelEditPatchnote: () => void;
  startEditPatchnote: (note: PatchnoteItem) => void;
  togglePatchnote: (id: string) => void;
  deletePatchnote: (id: string) => void;

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

const ADMIN_SECTION_STORAGE_KEY = "auros_admin_active_section";

function isValidAdminSection(value: string): value is AdminSectionKey {
  return (
    value === "overview" ||
    value === "applications" ||
    value === "jobs" ||
    value === "patchnotes" ||
    value === "logs"
  );
}

export default function AdminShell(props: AdminShellProps) {
  const [activeSection, setActiveSection] = useState<AdminSectionKey>("overview");
  const [hasLoadedStoredSection, setHasLoadedStoredSection] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(ADMIN_SECTION_STORAGE_KEY);

      if (storedValue && isValidAdminSection(storedValue)) {
        setActiveSection(storedValue);
      }
    } catch (error) {
      console.error("[AdminShell] Failed to read stored section:", error);
    } finally {
      setHasLoadedStoredSection(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredSection) return;

    try {
      window.localStorage.setItem(ADMIN_SECTION_STORAGE_KEY, activeSection);
    } catch (error) {
      console.error("[AdminShell] Failed to store section:", error);
    }
  }, [activeSection, hasLoadedStoredSection]);

  return (
    <div className="adminShellGrid">
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div style={{ minWidth: 0 }}>
        {activeSection === "overview" && (
          <AdminOverviewSection
            applications={props.applications}
            jobs={props.jobs}
            patchnotes={props.patchnotes}
            averageScore={props.averageScore}
          />
        )}

        {activeSection === "applications" && (
          <ApplicationsSection
            applicationsOpen={props.applicationsOpen}
            setApplicationsOpen={props.setApplicationsOpen}
            statusFilter={props.statusFilter}
            setStatusFilter={props.setStatusFilter}
            searchName={props.searchName}
            setSearchName={props.setSearchName}
            roleFilter={props.roleFilter}
            setRoleFilter={props.setRoleFilter}
            roleOptions={props.roleOptions}
            filteredApplications={props.filteredApplications}
            expandedApplications={props.expandedApplications}
            toggleApplication={props.toggleApplication}
            updateApplicationStatus={props.updateApplicationStatus}
            updateApplicationNotes={props.updateApplicationNotes}
            updateApplicationRating={props.updateApplicationRating}
            updateApplicationScore={props.updateApplicationScore}
            updateApplicationReviewLabel={props.updateApplicationReviewLabel}
            recalculateApplicationScore={props.recalculateApplicationScore}
            setManualApplicationScore={props.setManualApplicationScore}
            deleteApplication={props.deleteApplication}
          />
        )}

        {activeSection === "jobs" && (
          <section
            style={{
              background: "rgba(15, 27, 52, 0.74)",
              border: "1px solid rgba(34, 48, 77, 0.95)",
              borderRadius: "24px",
              padding: "20px",
              backdropFilter: "blur(12px)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
            }}
          >
            <JobsSection
              jobsOpen={props.jobsOpen}
              setJobsOpen={props.setJobsOpen}
              editingJobId={props.editingJobId}
              jobForm={props.jobForm}
              setJobForm={props.setJobForm}
              jobs={props.jobs}
              saveJob={props.saveJob}
              cancelEditJob={props.cancelEditJob}
              startEditJob={props.startEditJob}
              updateJobStatus={props.updateJobStatus}
              deleteJob={props.deleteJob}
            />
          </section>
        )}

        {activeSection === "patchnotes" && (
          <section
            style={{
              background: "rgba(15, 27, 52, 0.74)",
              border: "1px solid rgba(34, 48, 77, 0.95)",
              borderRadius: "24px",
              padding: "20px",
              backdropFilter: "blur(12px)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
            }}
          >
            <PatchnotesSection
              patchnotesOpen={props.patchnotesOpen}
              setPatchnotesOpen={props.setPatchnotesOpen}
              patchVersion={props.patchVersion}
              setPatchVersion={props.setPatchVersion}
              patchTitle={props.patchTitle}
              setPatchTitle={props.setPatchTitle}
              patchContent={props.patchContent}
              setPatchContent={props.setPatchContent}
              editingPatchId={props.editingPatchId}
              expandedPatchnotes={props.expandedPatchnotes}
              patchnotes={props.patchnotes}
              savePatchnote={props.savePatchnote}
              cancelEditPatchnote={props.cancelEditPatchnote}
              startEditPatchnote={props.startEditPatchnote}
              togglePatchnote={props.togglePatchnote}
              deletePatchnote={props.deletePatchnote}
            />
          </section>
        )}

        {activeSection === "logs" && <AdminLogsSection />}
      </div>
    </div>
  );
}