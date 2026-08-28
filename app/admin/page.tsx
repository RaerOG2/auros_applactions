"use client";

import AdminLogin from "../../components/AdminLogin";
import AdminShell from "../../components/admin/AdminShell";

import {
  ghostButtonStyle,
  glassCardStyle,
  pillStyle,
} from "../../lib/admin-styles";

import { useAdminDashboard } from "../../hooks/useAdminDashboard";

export default function AdminPage() {
  const admin = useAdminDashboard();

  if (admin.loading) {
    return (
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={glassCardStyle}>
            Loading admin dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (!admin.userEmail) {
    return (
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
        }}
      >
        <section
          style={{
            ...glassCardStyle,
            padding: "34px",
          }}
        >
          <p
            style={{
              color: "#4cc9f0",
              fontWeight: 800,
              marginBottom: 10,
              fontSize: "13px",
              letterSpacing: "0.08em",
            }}
          >
            AUROS ADMIN
          </p>

          <h1
            style={{
              marginTop: 0,
              marginBottom: 10,
              fontSize: "40px",
            }}
          >
            Admin Login
          </h1>

          <p
            style={{
              color: "#9fb0d0",
              marginBottom: 24,
              lineHeight: 1.7,
            }}
          >
            Sign in to access applications, jobs, internal notes,
            patchnotes, and logs.
          </p>

          <AdminLogin onSuccess={admin.checkUser} />
        </section>
      </div>
    );
  }

  if (!admin.isAdmin) {
    return (
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        <section style={glassCardStyle}>
          <h1>No admin access</h1>

          <p
            style={{
              color: "#9fb0d0",
            }}
          >
            Logged in as: {admin.userEmail}
          </p>

          <p
            style={{
              color: "#9fb0d0",
              lineHeight: 1.7,
            }}
          >
            Your account is logged in, but no admin role was found
            in the profile.
          </p>

          <button
            onClick={admin.logout}
            style={ghostButtonStyle}
          >
            Logout
          </button>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="adminPageWrap">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="adminHeader">
          <div>
            <p className="adminEyebrow">
              AUROS ADMIN DASHBOARD
            </p>

            <h1>
              Control Center
            </h1>

            <p className="adminLoggedIn">
              Logged in as: {admin.userEmail}
            </p>
          </div>

          <div className="adminBadges">
            <span style={pillStyle}>
              🟢 Live
            </span>

            <span style={pillStyle}>
              {admin.jobs.length} Jobs
            </span>

            <span style={pillStyle}>
              {admin.applications.length} Applications
            </span>

            <span style={pillStyle}>
              {admin.patchnotes.length} Patchnotes
            </span>

            <button
              onClick={admin.logout}
              style={ghostButtonStyle}
            >
              Logout
            </button>
          </div>
        </header>

        {/* =====================================================
            ADMIN SHELL
        ===================================================== */}

        <div className="adminShellOuter">
          <AdminShell
            applications={admin.applications}
            jobs={admin.jobs}
            patchnotes={admin.patchnotes}
            averageScore={admin.averageScore}
            jobsOpen={admin.jobsOpen}
            setJobsOpen={admin.setJobsOpen}
            editingJobId={admin.editingJobId}
            jobForm={admin.jobForm}
            setJobForm={admin.setJobForm}
            saveJob={admin.saveJob}
            cancelEditJob={admin.cancelEditJob}
            startEditJob={admin.startEditJob}
            updateJobStatus={admin.updateJobStatus}
            deleteJob={admin.deleteJob}
            patchnotesOpen={admin.patchnotesOpen}
            setPatchnotesOpen={admin.setPatchnotesOpen}
            patchVersion={admin.patchVersion}
            setPatchVersion={admin.setPatchVersion}
            patchTitle={admin.patchTitle}
            setPatchTitle={admin.setPatchTitle}
            patchContent={admin.patchContent}
            setPatchContent={admin.setPatchContent}
            editingPatchId={admin.editingPatchId}
            expandedPatchnotes={admin.expandedPatchnotes}
            savePatchnote={admin.savePatchnote}
            cancelEditPatchnote={admin.cancelEditPatchnote}
            startEditPatchnote={admin.startEditPatchnote}
            togglePatchnote={admin.togglePatchnote}
            deletePatchnote={admin.deletePatchnote}
            applicationsOpen={admin.applicationsOpen}
            setApplicationsOpen={admin.setApplicationsOpen}
            statusFilter={admin.statusFilter}
            setStatusFilter={admin.setStatusFilter}
            searchName={admin.searchName}
            setSearchName={admin.setSearchName}
            roleFilter={admin.roleFilter}
            setRoleFilter={admin.setRoleFilter}
            roleOptions={admin.roleOptions}
            filteredApplications={admin.filteredApplications}
            expandedApplications={admin.expandedApplications}
            toggleApplication={admin.toggleApplication}
            updateApplicationStatus={admin.updateApplicationStatus}
            updateApplicationNotes={admin.updateApplicationNotes}
            updateApplicationRating={admin.updateApplicationRating}
            updateApplicationScore={admin.updateApplicationScore}
            updateApplicationReviewLabel={
              admin.updateApplicationReviewLabel
            }
            recalculateApplicationScore={
              admin.recalculateApplicationScore
            }
            setManualApplicationScore={
              admin.setManualApplicationScore
            }
            deleteApplication={admin.deleteApplication}
          />
        </div>
      </div>

      <style jsx global>{`
        /* =====================================================
           PAGE
        ===================================================== */

        .adminPageWrap {
          width: 100%;
          max-width: 1500px;

          margin: 0 auto;

          padding-bottom: 70px;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .adminHeader {
          display: flex;

          justify-content: space-between;
          align-items: flex-end;

          gap: 20px;

          margin-bottom: 22px;

          flex-wrap: wrap;
        }

        .adminEyebrow {
          margin: 0 0 6px;

          color: #63ddff;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.14em;
        }

        .adminHeader h1 {
          margin: 0;

          font-size: clamp(
            38px,
            5vw,
            52px
          );

          line-height: 1;

          letter-spacing: -0.045em;
        }

        .adminLoggedIn {
          margin: 7px 0 0;

          color: #7186a6;

          font-size: 11px;
        }

        .adminBadges {
          display: flex;

          align-items: center;

          gap: 8px;

          flex-wrap: wrap;
        }

        /* =====================================================
           SHELL
        ===================================================== */

        .adminShellOuter {
          width: 100%;
          min-width: 0;
        }

        /*
          VERY IMPORTANT:
          AdminShell currently contains Sidebar + Content.
          We force its top-level wrapper into a two-column layout.
        */

        .adminShellOuter > div {
          width: 100%;

          display: grid !important;

          grid-template-columns:
            245px
            minmax(0, 1fr) !important;

          gap: 20px !important;

          align-items: start !important;
        }

        /*
          Sidebar
        */

        .adminShellOuter .adminSidebar {
          width: 245px !important;
          max-width: 245px !important;

          min-width: 0 !important;
        }

        /*
          Everything after Sidebar becomes the content column.
        */

        .adminShellOuter .adminSidebar + * {
          min-width: 0;
          width: 100%;
        }

        /* =====================================================
           EXISTING ADMIN GRIDS
        ===================================================== */

        .statsGrid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 18px;
        }

        .splitGrid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 18px;

          align-items: start;
        }

        .patchGrid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 18px;

          align-items: start;
        }

        .filtersGrid {
          display: grid;

          grid-template-columns:
            1.2fr
            0.8fr
            0.8fr;

          gap: 10px;

          margin-bottom: 18px;
        }

        .applicationGrid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 16px;

          align-items: start;
        }

        .miniGrid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 12px;
        }

        .historyGrid {
          display: grid;

          gap: 10px;

          margin-top: 12px;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1150px) {
          .statsGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        @media (max-width: 980px) {
          .adminShellOuter > div {
            grid-template-columns:
              1fr !important;
          }

          .adminShellOuter .adminSidebar {
            width: 100% !important;
            max-width: none !important;

            position: static !important;
          }

          .splitGrid,
          .patchGrid,
          .filtersGrid,
          .applicationGrid,
          .miniGrid {
            grid-template-columns:
              1fr;
          }
        }

        @media (max-width: 640px) {
          .statsGrid {
            grid-template-columns:
              1fr;
          }

          .adminHeader {
            align-items: flex-start;
          }

          .appHeaderRow,
          .jobHeaderRow,
          .patchHeaderRow,
          .sectionHeaderRow {
            flex-direction: column;

            align-items:
              flex-start !important;
          }
        }
      `}</style>
    </>
  );
}