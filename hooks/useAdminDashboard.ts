"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

import type {
  PatchnoteItem,
} from "../types/admin";

import {
  createAdminActivityLog,
  createAdminAuthLog,
} from "../services/admin-log-service";

import {
  deletePatchnoteById,
  getAdminAccess,
  getPatchnotes,
  savePatchnoteRecord,
  signOutAdmin,
} from "../services/admin-service";

export function useAdminDashboard() {
  const [
    userEmail,
    setUserEmail,
  ] = useState<string | null>(
    null
  );

  const [
    adminUserId,
    setAdminUserId,
  ] = useState<string | null>(
    null
  );

  const [
    isAdmin,
    setIsAdmin,
  ] = useState(
    false
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const [
    patchnotes,
    setPatchnotes,
  ] = useState<PatchnoteItem[]>(
    []
  );

  const [
    expandedPatchnotes,
    setExpandedPatchnotes,
  ] = useState<string[]>(
    []
  );

  const [
    patchVersion,
    setPatchVersion,
  ] = useState(
    ""
  );

  const [
    patchTitle,
    setPatchTitle,
  ] = useState(
    ""
  );

  const [
    patchContent,
    setPatchContent,
  ] = useState(
    ""
  );

  const [
    editingPatchId,
    setEditingPatchId,
  ] = useState<string | null>(
    null
  );

  const [
    patchnotesOpen,
    setPatchnotesOpen,
  ] = useState(
    false
  );

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
      targetId:
        params.targetId ??
        null,
      targetLabel:
        params.targetLabel ??
        null,
      details:
        params.details ??
        null,
    });
  }

  async function loadPatchnotesData() {
    try {
      const data =
        await getPatchnotes();

      setPatchnotes(
        data
      );
    } catch (error) {
      console.error(
        "[Admin] loadPatchnotes failed:",
        error
      );

      setPatchnotes(
        []
      );
    }
  }

  function resetAdminState() {
    setPatchnotes(
      []
    );

    setExpandedPatchnotes(
      []
    );

    setPatchVersion(
      ""
    );

    setPatchTitle(
      ""
    );

    setPatchContent(
      ""
    );

    setEditingPatchId(
      null
    );

    setPatchnotesOpen(
      false
    );

    setIsAdmin(
      false
    );

    setAdminUserId(
      null
    );
  }

  async function checkUser() {
    try {
      setLoading(
        true
      );

      const access =
        await getAdminAccess();

      if (
        !access.user
      ) {
        setUserEmail(
          null
        );

        resetAdminState();

        return;
      }

      setUserEmail(
        access.userEmail
      );

      setAdminUserId(
        access.user?.id ??
          null
      );

      if (
        !access.isAdmin
      ) {
        await createAdminAuthLog({
          userId:
            access.user?.id ??
            null,

          email:
            access.userEmail ??
            null,

          eventType:
            "admin_access_denied",

          success:
            false,

          details: {
            reason:
              "User is authenticated but has no admin role",
          },
        });

        resetAdminState();

        return;
      }

      setIsAdmin(
        true
      );

      try {
        const patchnoteData =
          await getPatchnotes();

        setPatchnotes(
          patchnoteData
        );
      } catch (error) {
        console.error(
          "[Admin] patchnotes load failed:",
          error
        );

        setPatchnotes(
          []
        );
      }
    } catch (error) {
      console.error(
        "[Admin] checkUser fatal error:",
        error
      );

      setPatchnotes(
        []
      );

      setIsAdmin(
        false
      );

      setAdminUserId(
        null
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  async function logout() {
    try {
      const currentEmail =
        userEmail;

      const currentUserId =
        adminUserId;

      await signOutAdmin();

      await createAdminAuthLog({
        userId:
          currentUserId,

        email:
          currentEmail,

        eventType:
          "logout",

        success:
          true,
      });
    } catch (error) {
      console.error(
        "[Admin] logout failed:",
        error
      );
    }

    await checkUser();
  }

  async function savePatchnote() {
    if (
      !patchVersion ||
      !patchTitle ||
      !patchContent
    ) {
      alert(
        "Please fill in version, title, and content."
      );

      return;
    }

    const isEditing =
      !!editingPatchId;

    const existingPatch =
      patchnotes.find(
        (
          note
        ) =>
          note.id ===
          editingPatchId
      ) ??
      null;

    try {
      await savePatchnoteRecord({
        version:
          patchVersion,

        title:
          patchTitle,

        content:
          patchContent,

        editingPatchId,
      });

      await logActivity({
        action:
          isEditing
            ? "patchnote_updated"
            : "patchnote_created",

        targetType:
          "patchnote",

        targetId:
          editingPatchId ??
          null,

        targetLabel:
          patchTitle,

        details: {
          previousVersion:
            existingPatch?.version ??
            null,

          newVersion:
            patchVersion,

          previousTitle:
            existingPatch?.title ??
            null,

          newTitle:
            patchTitle,

          mode:
            isEditing
              ? "edit"
              : "create",
        },
      });

      setPatchVersion(
        ""
      );

      setPatchTitle(
        ""
      );

      setPatchContent(
        ""
      );

      setEditingPatchId(
        null
      );

      await loadPatchnotesData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Patchnote could not be saved.";

      alert(
        message
      );
    }
  }

  function startEditPatchnote(
    note: PatchnoteItem
  ) {
    setEditingPatchId(
      note.id
    );

    setPatchVersion(
      note.version ||
        ""
    );

    setPatchTitle(
      note.title ||
        ""
    );

    setPatchContent(
      note.content ||
        ""
    );

    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });

    setPatchnotesOpen(
      true
    );
  }

  function cancelEditPatchnote() {
    setEditingPatchId(
      null
    );

    setPatchVersion(
      ""
    );

    setPatchTitle(
      ""
    );

    setPatchContent(
      ""
    );
  }

  async function deletePatchnote(
    id: string
  ) {
    const note =
      patchnotes.find(
        (
          item
        ) =>
          item.id === id
      ) ??
      null;

    const confirmed =
      window.confirm(
        "Do you really want to delete this patchnote?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      await deletePatchnoteById(
        id
      );

      await logActivity({
        action:
          "patchnote_deleted",

        targetType:
          "patchnote",

        targetId:
          id,

        targetLabel:
          note?.title ??
          null,

        details: {
          version:
            note?.version ??
            null,
        },
      });

      if (
        editingPatchId ===
        id
      ) {
        cancelEditPatchnote();
      }

      setExpandedPatchnotes(
        (
          prev
        ) =>
          prev.filter(
            (
              item
            ) =>
              item !== id
          )
      );

      await loadPatchnotesData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Delete failed.";

      alert(
        message
      );
    }
  }

  function togglePatchnote(
    id: string
  ) {
    setExpandedPatchnotes(
      (
        prev
      ) =>
        prev.includes(
          id
        )
          ? prev.filter(
              (
                item
              ) =>
                item !== id
            )
          : [
              ...prev,
              id,
            ]
    );
  }

  useEffect(() => {
    let mounted =
      true;

    async function init() {
      if (
        !mounted
      ) {
        return;
      }

      await checkUser();
    }

    init();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        () => {
          if (
            !mounted
          ) {
            return;
          }

          checkUser();
        }
      );

    const channel =
      supabase
        .channel(
          "admin-live-content"
        )
        .on(
          "postgres_changes",
          {
            event:
              "*",

            schema:
              "public",

            table:
              "patchnotes",
          },
          async () => {
            try {
              const data =
                await getPatchnotes();

              if (
                mounted
              ) {
                setPatchnotes(
                  data
                );
              }
            } catch (error) {
              console.error(
                "[Admin] realtime patchnotes reload failed:",
                error
              );
            }
          }
        )
        .subscribe();

    return () => {
      mounted =
        false;

      subscription.unsubscribe();

      supabase.removeChannel(
        channel
      );
    };
  }, []);

  return {
    userEmail,
    isAdmin,
    loading,

    patchnotes,

    expandedPatchnotes,

    patchVersion,
    setPatchVersion,

    patchTitle,
    setPatchTitle,

    patchContent,
    setPatchContent,

    editingPatchId,

    patchnotesOpen,
    setPatchnotesOpen,

    checkUser,
    logout,

    savePatchnote,
    cancelEditPatchnote,
    startEditPatchnote,
    togglePatchnote,
    deletePatchnote,
  };
}