"use client";

import { useEffect, useState } from "react";
import type { ApplicationItem, StatusHistoryItem } from "../types/admin";
import { supabase } from "../lib/supabase";
import {
  getAdminAccess,
  getApplicationById,
  updateApplicationNotesById,
  updateApplicationRatingById,
  updateApplicationReviewLabelById,
  updateApplicationScoreById,
  updateApplicationStatusById,
} from "../services/admin-service";

export function useAdminApplication(applicationId: string) {
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [notes, setNotes] = useState("");

  async function checkAccess() {
    try {
      const access = await getAdminAccess();
      setIsAdmin(access.isAdmin);
    } catch (error) {
      console.error("[AdminDetail] checkAccess failed:", error);
      setIsAdmin(false);
    } finally {
      setCheckingAccess(false);
    }
  }

  async function loadApplication() {
    if (!applicationId) {
      setApplication(null);
      setHistory([]);
      setNotes("");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getApplicationById(applicationId);

      setApplication(data.application);
      setHistory(data.history);
      setNotes(data.application?.notes || "");
    } catch (error) {
      console.error("[AdminDetail] loadApplication failed:", error);
      setApplication(null);
      setHistory([]);
      setNotes("");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status: string) {
    if (!application) return;

    try {
      await updateApplicationStatusById(application.id, status, application);
      await loadApplication();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Status update failed.";
      alert(message);
    }
  }

  async function updateRating(rating: number) {
    if (!application) return;

    try {
      await updateApplicationRatingById(application.id, rating);
      setApplication((prev) => (prev ? { ...prev, rating } : prev));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rating update failed.";
      alert(message);
    }
  }

  async function updateScore(score: number) {
    if (!application) return;

    try {
      await updateApplicationScoreById(application.id, score);
      setApplication((prev) => (prev ? { ...prev, score } : prev));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Score update failed.";
      alert(message);
    }
  }

  async function updateLabel(label: string) {
    if (!application) return;

    try {
      await updateApplicationReviewLabelById(application.id, label);
      setApplication((prev) =>
        prev ? { ...prev, review_label: label } : prev
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Review label update failed.";
      alert(message);
    }
  }

  async function saveNotes() {
    if (!application) return;

    try {
      await updateApplicationNotesById(application.id, notes);
      setApplication((prev) => (prev ? { ...prev, notes } : prev));
    } catch (error) {
      alert("Notes could not be saved.");
      console.error(error);
    }
  }

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (!checkingAccess && isAdmin) {
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

  return {
    loading,
    checkingAccess,
    isAdmin,
    application,
    history,
    notes,
    setNotes,
    updateStatus,
    updateRating,
    updateScore,
    updateLabel,
    saveNotes,
    reload: loadApplication,
  };
}