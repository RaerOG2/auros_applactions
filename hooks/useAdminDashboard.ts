"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  ApplicationItem,
  JobFormState,
  JobItem,
  PatchnoteItem,
} from "../types/admin";
import { emptyJobForm } from "../types/admin";
import {
  createAdminActivityLog,
  createAdminAuthLog,
} from "../services/admin-log-service";
import {
  deleteApplicationById,
  deleteJobById,
  deletePatchnoteById,
  getAdminAccess,
  getApplicationsWithHistory,
  getJobs,
  getPatchnotes,
  saveJobRecord,
  savePatchnoteRecord,
  signOutAdmin,
  updateApplicationNotesById,
  updateApplicationRatingById,
  updateApplicationReviewLabelById,
  updateApplicationScoreById,
  updateApplicationStatusById,
  updateJobStatusById,
} from "../services/admin-service";
import {
  calculateApplicationScore,
  saveCalculatedApplicationScore,
  updateManualApplicationScore,
} from "../services/admin-score-service";

export function useAdminDashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [patchnotes, setPatchnotes] = useState<PatchnoteItem[]>([]);

  const [jobForm, setJobForm] = useState<JobFormState>(emptyJobForm);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [expandedApplications, setExpandedApplications] = useState<string[]>([]);
  const [expandedPatchnotes, setExpandedPatchnotes] = useState<string[]>([]);

  const [patchVersion, setPatchVersion] = useState("");
  const [patchTitle, setPatchTitle] = useState("");
  const [patchContent, setPatchContent] = useState("");
  const [editingPatchId, setEditingPatchId] = useState<string | null>(null);

  const [jobsOpen, setJobsOpen] = useState(true);
  const [patchnotesOpen, setPatchnotesOpen] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(true);

  async function logActivity(params: {
    action: string;
    targetType: string;
    targetId?: string | null;
    targetLabel?: string | null;
    details?: Record<string, unknown> | null;
  }) {
    await createAdminActivityLog({
      adminUserId,
      adminEmail: userEmail,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId ?? null,
      targetLabel: params.targetLabel ?? null,
      details: params.details ?? null,
    });
  }

  async function loadApplications() {
    try {
      const data = await getApplicationsWithHistory();
      setApplications(data);
    } catch (error) {
      console.error("[Admin] loadApplications failed:", error);
      setApplications([]);
    }
  }

  async function loadJobsData() {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (error) {
      console.error("[Admin] loadJobs failed:", error);
      setJobs([]);
    }
  }

  async function loadPatchnotesData() {
    try {
      const data = await getPatchnotes();
      setPatchnotes(data);
    } catch (error) {
      console.error("[Admin] loadPatchnotes failed:", error);
      setPatchnotes([]);
    }
  }

  function resetAdminState() {
    setApplications([]);
    setJobs([]);
    setPatchnotes([]);
    setIsAdmin(false);
    setAdminUserId(null);
  }

  async function checkUser() {
    try {
      setLoading(true);

      const access = await getAdminAccess();

      if (!access.user) {
        setUserEmail(null);
        resetAdminState();
        return;
      }

      setUserEmail(access.userEmail);
      setAdminUserId(access.user?.id ?? null);

      if (!access.isAdmin) {
        await createAdminAuthLog({
          userId: access.user?.id ?? null,
          email: access.userEmail ?? null,
          eventType: "admin_access_denied",
          success: false,
          details: {
            reason: "User is authenticated but has no admin role",
          },
        });

        resetAdminState();
        return;
      }

      setIsAdmin(true);

      const [applicationsResult, jobsResult, patchnotesResult] =
        await Promise.allSettled([
          getApplicationsWithHistory(),
          getJobs(),
          getPatchnotes(),
        ]);

      if (applicationsResult.status === "fulfilled") {
        setApplications(applicationsResult.value);
      } else {
        console.error("[Admin] applications load failed:", applicationsResult.reason);
        setApplications([]);
      }

      if (jobsResult.status === "fulfilled") {
        setJobs(jobsResult.value);
      } else {
        console.error("[Admin] jobs load failed:", jobsResult.reason);
        setJobs([]);
      }

      if (patchnotesResult.status === "fulfilled") {
        setPatchnotes(patchnotesResult.value);
      } else {
        console.error("[Admin] patchnotes load failed:", patchnotesResult.reason);
        setPatchnotes([]);
      }
    } catch (error) {
      console.error("[Admin] checkUser fatal error:", error);
      setApplications([]);
      setJobs([]);
      setPatchnotes([]);
      setIsAdmin(false);
      setAdminUserId(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      const currentEmail = userEmail;
      const currentUserId = adminUserId;

      await signOutAdmin();

      await createAdminAuthLog({
        userId: currentUserId,
        email: currentEmail,
        eventType: "logout",
        success: true,
      });
    } catch (error) {
      console.error("[Admin] logout failed:", error);
    }

    await checkUser();
  }

  async function updateApplicationStatus(id: string, status: string) {
    const app = applications.find((item) => item.id === id) ?? null;
    const previousStatus = app?.status ?? null;

    try {
      await updateApplicationStatusById(id, status, app);

      await logActivity({
        action: "application_status_updated",
        targetType: "application",
        targetId: id,
        targetLabel: app?.name ?? app?.tracking_code ?? null,
        details: {
          previousStatus,
          newStatus: status,
          trackingCode: app?.tracking_code ?? null,
        },
      });

      await loadApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Status update failed.";
      alert(message);
    }
  }

  async function updateApplicationNotes(id: string, notes: string) {
    const app = applications.find((item) => item.id === id) ?? null;
    const previousNotes = app?.notes ?? "";

    try {
      await updateApplicationNotesById(id, notes);

      await logActivity({
        action: "application_notes_updated",
        targetType: "application",
        targetId: id,
        targetLabel: app?.name ?? app?.tracking_code ?? null,
        details: {
          previousNotes,
          newNotes: notes,
          trackingCode: app?.tracking_code ?? null,
        },
      });

      setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, notes } : app)));
    } catch (error) {
      alert("Notes could not be saved.");
      console.error(error);
    }
  }

  async function updateApplicationRating(id: string, rating: number) {
    const app = applications.find((item) => item.id === id) ?? null;
    const previousRating = app?.rating ?? null;

    try {
      await updateApplicationRatingById(id, rating);

      await logActivity({
        action: "application_rating_updated",
        targetType: "application",
        targetId: id,
        targetLabel: app?.name ?? app?.tracking_code ?? null,
        details: {
          previousRating,
          newRating: rating,
          trackingCode: app?.tracking_code ?? null,
        },
      });

      setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, rating } : app)));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rating update failed.";
      alert(message);
    }
  }

  async function updateApplicationScore(id: string, score: number) {
    const app = applications.find((item) => item.id === id) ?? null;
    const previousScore = app?.score ?? null;

    try {
      await updateApplicationScoreById(id, score);

      await logActivity({
        action: "application_score_updated",
        targetType: "application",
        targetId: id,
        targetLabel: app?.name ?? app?.tracking_code ?? null,
        details: {
          previousScore,
          newScore: score,
          trackingCode: app?.tracking_code ?? null,
        },
      });

      setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, score } : app)));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Score update failed.";
      alert(message);
    }
  }

  async function updateApplicationReviewLabel(id: string, reviewLabel: string) {
    const app = applications.find((item) => item.id === id) ?? null;
    const previousLabel = app?.review_label ?? null;

    try {
      await updateApplicationReviewLabelById(id, reviewLabel);

      await logActivity({
        action: "application_review_label_updated",
        targetType: "application",
        targetId: id,
        targetLabel: app?.name ?? app?.tracking_code ?? null,
        details: {
          previousLabel,
          newLabel: reviewLabel,
          trackingCode: app?.tracking_code ?? null,
        },
      });

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, review_label: reviewLabel } : app))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Review label update failed.";
      alert(message);
    }
  }

  async function recalculateApplicationScore(id: string) {
    const app = applications.find((item) => item.id === id) ?? null;
    if (!app) return;

    try {
      const result = await saveCalculatedApplicationScore(app);

      await logActivity({
        action: "application_auto_score_recalculated",
        targetType: "application",
        targetId: id,
        targetLabel: app.name ?? app.tracking_code ?? null,
        details: {
          autoScore: result.autoScore,
          finalScore: result.finalScore,
          breakdown: result.breakdown,
        },
      });

      await loadApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Score recalculation failed.";
      alert(message);
    }
  }

  async function setManualApplicationScore(id: string, manualScore: number | null) {
    const app = applications.find((item) => item.id === id) ?? null;
    if (!app) return;

    try {
      const calculated = calculateApplicationScore(app);

      const result = await updateManualApplicationScore(
        id,
        manualScore,
        calculated.autoScore
      );

      await logActivity({
        action: "application_manual_score_updated",
        targetType: "application",
        targetId: id,
        targetLabel: app.name ?? app.tracking_code ?? null,
        details: {
          previousManualScore: app.manual_score ?? null,
          newManualScore: manualScore,
          autoScore: calculated.autoScore,
          finalScore: result.finalScore,
        },
      });

      await loadApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Manual score update failed.";
      alert(message);
    }
  }

  async function deleteApplication(id: string) {
    const app = applications.find((item) => item.id === id) ?? null;
    const confirmed = window.confirm("Do you really want to delete this application?");
    if (!confirmed) return;

    try {
      await deleteApplicationById(id);

      await logActivity({
        action: "application_deleted",
        targetType: "application",
        targetId: id,
        targetLabel: app?.name ?? app?.tracking_code ?? null,
        details: {
          trackingCode: app?.tracking_code ?? null,
          status: app?.status ?? null,
          role: app?.jobs?.title ?? null,
        },
      });

      setExpandedApplications((prev) => prev.filter((item) => item !== id));
      await loadApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed.";
      alert(message);
    }
  }

  async function saveJob() {
    if (!jobForm.title || !jobForm.department || !jobForm.description) {
      alert("Please fill in title, department, and description.");
      return;
    }

    const isEditing = !!editingJobId;
    const existingJob = jobs.find((job) => job.id === editingJobId) ?? null;

    try {
      await saveJobRecord(jobForm, editingJobId);

      await logActivity({
        action: isEditing ? "job_updated" : "job_created",
        targetType: "job",
        targetId: editingJobId ?? null,
        targetLabel: jobForm.title,
        details: {
          previousTitle: existingJob?.title ?? null,
          newTitle: jobForm.title,
          department: jobForm.department,
          type: jobForm.type,
          location: jobForm.location,
          roleCategory: jobForm.role_category,
          mode: isEditing ? "edit" : "create",
        },
      });

      setJobForm(emptyJobForm);
      setEditingJobId(null);
      await loadJobsData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Job could not be saved.";
      alert(message);
    }
  }

  function startEditJob(job: JobItem) {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title || "",
      department: job.department || "",
      type: job.type || "",
      location: job.location || "",
      description: job.description || "",
      requirements: Array.isArray(job.requirements) ? job.requirements.join(", ") : "",
      role_category: job.role_category || "Other",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setJobsOpen(true);
  }

  function cancelEditJob() {
    setEditingJobId(null);
    setJobForm(emptyJobForm);
  }

  async function updateJobStatus(id: string, status: string) {
    const job = jobs.find((item) => item.id === id) ?? null;
    const previousStatus = job?.status ?? null;

    try {
      await updateJobStatusById(id, status, job);

      await logActivity({
        action: "job_status_updated",
        targetType: "job",
        targetId: id,
        targetLabel: job?.title ?? null,
        details: {
          previousStatus,
          newStatus: status,
          department: job?.department ?? null,
          roleCategory: job?.role_category ?? null,
        },
      });

      await loadJobsData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Job status update failed.";
      alert(message);
    }
  }

  async function deleteJob(id: string) {
    const job = jobs.find((item) => item.id === id) ?? null;
    const confirmed = window.confirm("Do you really want to delete this job?");
    if (!confirmed) return;

    try {
      await deleteJobById(id);

      await logActivity({
        action: "job_deleted",
        targetType: "job",
        targetId: id,
        targetLabel: job?.title ?? null,
        details: {
          department: job?.department ?? null,
          status: job?.status ?? null,
          roleCategory: job?.role_category ?? null,
        },
      });

      if (editingJobId === id) {
        cancelEditJob();
      }

      await loadJobsData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed.";
      alert(message);
    }
  }

  async function savePatchnote() {
    if (!patchVersion || !patchTitle || !patchContent) {
      alert("Please fill in version, title, and content.");
      return;
    }

    const isEditing = !!editingPatchId;
    const existingPatch = patchnotes.find((note) => note.id === editingPatchId) ?? null;

    try {
      await savePatchnoteRecord({
        version: patchVersion,
        title: patchTitle,
        content: patchContent,
        editingPatchId,
      });

      await logActivity({
        action: isEditing ? "patchnote_updated" : "patchnote_created",
        targetType: "patchnote",
        targetId: editingPatchId ?? null,
        targetLabel: patchTitle,
        details: {
          previousVersion: existingPatch?.version ?? null,
          newVersion: patchVersion,
          previousTitle: existingPatch?.title ?? null,
          newTitle: patchTitle,
          mode: isEditing ? "edit" : "create",
        },
      });

      setPatchVersion("");
      setPatchTitle("");
      setPatchContent("");
      setEditingPatchId(null);
      await loadPatchnotesData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Patchnote could not be saved.";
      alert(message);
    }
  }

  function startEditPatchnote(note: PatchnoteItem) {
    setEditingPatchId(note.id);
    setPatchVersion(note.version || "");
    setPatchTitle(note.title || "");
    setPatchContent(note.content || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setPatchnotesOpen(true);
  }

  function cancelEditPatchnote() {
    setEditingPatchId(null);
    setPatchVersion("");
    setPatchTitle("");
    setPatchContent("");
  }

  async function deletePatchnote(id: string) {
    const note = patchnotes.find((item) => item.id === id) ?? null;
    const confirmed = window.confirm("Do you really want to delete this patchnote?");
    if (!confirmed) return;

    try {
      await deletePatchnoteById(id);

      await logActivity({
        action: "patchnote_deleted",
        targetType: "patchnote",
        targetId: id,
        targetLabel: note?.title ?? null,
        details: {
          version: note?.version ?? null,
        },
      });

      if (editingPatchId === id) {
        cancelEditPatchnote();
      }

      setExpandedPatchnotes((prev) => prev.filter((item) => item !== id));
      await loadPatchnotesData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed.";
      alert(message);
    }
  }

  function toggleApplication(id: string) {
    setExpandedApplications((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function togglePatchnote(id: string) {
    setExpandedPatchnotes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const searchValue = searchName.trim().toLowerCase();

      const haystack = [
        app.name || "",
        app.email || "",
        app.discord || "",
        app.tracking_code || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !searchValue || haystack.includes(searchValue);
      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      const matchesRole = roleFilter === "All" || app.jobs?.title === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [applications, searchName, statusFilter, roleFilter]);

  const roleOptions = useMemo(() => {
    return Array.from(
      new Set(applications.map((app) => app.jobs?.title).filter(Boolean))
    ) as string[];
  }, [applications]);

  const averageScore = useMemo(() => {
    if (applications.length === 0) return 0;
    const total = applications.reduce(
      (sum, app) => sum + (app.final_score ?? app.score ?? 0),
      0
    );
    return Math.round(total / applications.length);
  }, [applications]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!mounted) return;
      await checkUser();
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (!mounted) return;
      checkUser();
    });

    const channel = supabase
      .channel("admin-live-applications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        async () => {
          try {
            const data = await getApplicationsWithHistory();
            if (mounted) setApplications(data);
          } catch (error) {
            console.error("[Admin] realtime applications reload failed:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        async () => {
          try {
            const data = await getJobs();
            if (mounted) setJobs(data);
          } catch (error) {
            console.error("[Admin] realtime jobs reload failed:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patchnotes" },
        async () => {
          try {
            const data = await getPatchnotes();
            if (mounted) setPatchnotes(data);
          } catch (error) {
            console.error("[Admin] realtime patchnotes reload failed:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "application_status_history" },
        async () => {
          try {
            const data = await getApplicationsWithHistory();
            if (mounted) setApplications(data);
          } catch (error) {
            console.error("[Admin] realtime history reload failed:", error);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    userEmail,
    isAdmin,
    loading,

    applications,
    jobs,
    patchnotes,

    jobForm,
    setJobForm,
    editingJobId,

    searchName,
    setSearchName,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    expandedApplications,
    expandedPatchnotes,

    patchVersion,
    setPatchVersion,
    patchTitle,
    setPatchTitle,
    patchContent,
    setPatchContent,
    editingPatchId,

    jobsOpen,
    setJobsOpen,
    patchnotesOpen,
    setPatchnotesOpen,
    applicationsOpen,
    setApplicationsOpen,

    filteredApplications,
    roleOptions,
    averageScore,

    checkUser,
    logout,
    saveJob,
    cancelEditJob,
    startEditJob,
    updateJobStatus,
    deleteJob,
    savePatchnote,
    cancelEditPatchnote,
    startEditPatchnote,
    togglePatchnote,
    deletePatchnote,
    toggleApplication,
    updateApplicationStatus,
    updateApplicationNotes,
    updateApplicationRating,
    updateApplicationScore,
    updateApplicationReviewLabel,
    recalculateApplicationScore,
    setManualApplicationScore,
    deleteApplication,
  };
}