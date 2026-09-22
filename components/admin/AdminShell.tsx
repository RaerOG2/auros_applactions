"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  PatchnoteItem,
} from "../../types/admin";

import AdminSidebar from "./AdminSidebar";
import AdminOverviewSection from "./AdminOverviewSection";
import AdminLogsSection from "./AdminLogsSection";
import PatchnotesSection from "./PatchnotesSection";
import AdminOperationsSection from "./AdminOperationsSection";
import AdminFeatureFlagsSection from "./AdminFeatureFlagsSection";


type AdminSectionKey =
  | "overview"
  | "patchnotes"
  | "operations"
  | "feature-flags"
  | "logs";


type AdminShellProps = {
  patchnotes:
    PatchnoteItem[];

  patchnotesOpen:
    boolean;

  setPatchnotesOpen:
    React.Dispatch<
      React.SetStateAction<boolean>
    >;

  patchVersion:
    string;

  setPatchVersion:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  patchTitle:
    string;

  setPatchTitle:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  patchContent:
    string;

  setPatchContent:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  editingPatchId:
    string | null;

  expandedPatchnotes:
    string[];

  savePatchnote:
    () => void;

  cancelEditPatchnote:
    () => void;

  startEditPatchnote:
    (
      note:
        PatchnoteItem
    ) => void;

  togglePatchnote:
    (
      id:
        string
    ) => void;

  deletePatchnote:
    (
      id:
        string
    ) => void;
};


const ADMIN_SECTION_STORAGE_KEY =
  "auros_admin_active_section";


function isValidAdminSection(
  value:
    string
): value is AdminSectionKey {
  return (
    value ===
      "overview" ||
    value ===
      "patchnotes" ||
    value ===
      "operations" ||
    value ===
      "feature-flags" ||
    value ===
      "logs"
  );
}


export default function AdminShell(
  props:
    AdminShellProps
) {
  const [
    activeSection,
    setActiveSection,
  ] =
    useState<AdminSectionKey>(
      "overview"
    );

  const [
    hasLoadedStoredSection,
    setHasLoadedStoredSection,
  ] =
    useState(
      false
    );


  useEffect(() => {
    try {
      const storedValue =
        window.localStorage.getItem(
          ADMIN_SECTION_STORAGE_KEY
        );


      if (
        storedValue &&
        isValidAdminSection(
          storedValue
        )
      ) {
        setActiveSection(
          storedValue
        );
      } else if (
        storedValue
      ) {
        window.localStorage.removeItem(
          ADMIN_SECTION_STORAGE_KEY
        );

        setActiveSection(
          "overview"
        );
      }
    } catch (
      error
    ) {
      console.error(
        "[AdminShell] Failed to read stored section:",
        error
      );
    } finally {
      setHasLoadedStoredSection(
        true
      );
    }
  }, []);


  useEffect(() => {
    if (
      !hasLoadedStoredSection
    ) {
      return;
    }


    try {
      window.localStorage.setItem(
        ADMIN_SECTION_STORAGE_KEY,
        activeSection
      );
    } catch (
      error
    ) {
      console.error(
        "[AdminShell] Failed to store section:",
        error
      );
    }
  }, [
    activeSection,
    hasLoadedStoredSection,
  ]);


  return (
    <div className="adminShellGrid">
      <AdminSidebar
        activeSection={
          activeSection
        }
        setActiveSection={
          setActiveSection
        }
      />


      <div
        style={{
          minWidth:
            0,
        }}
      >
        {activeSection ===
          "overview" && (
          <AdminOverviewSection
            patchnotes={
              props.patchnotes
            }
          />
        )}


        {activeSection ===
          "patchnotes" && (
          <section
            style={{
              background:
                "rgba(15, 27, 52, 0.74)",

              border:
                "1px solid rgba(34, 48, 77, 0.95)",

              borderRadius:
                "24px",

              padding:
                "20px",

              backdropFilter:
                "blur(12px)",

              boxShadow:
                "0 20px 50px rgba(0,0,0,0.22)",
            }}
          >
            <PatchnotesSection
              patchnotesOpen={
                props.patchnotesOpen
              }
              setPatchnotesOpen={
                props.setPatchnotesOpen
              }
              patchVersion={
                props.patchVersion
              }
              setPatchVersion={
                props.setPatchVersion
              }
              patchTitle={
                props.patchTitle
              }
              setPatchTitle={
                props.setPatchTitle
              }
              patchContent={
                props.patchContent
              }
              setPatchContent={
                props.setPatchContent
              }
              editingPatchId={
                props.editingPatchId
              }
              expandedPatchnotes={
                props.expandedPatchnotes
              }
              patchnotes={
                props.patchnotes
              }
              savePatchnote={
                props.savePatchnote
              }
              cancelEditPatchnote={
                props.cancelEditPatchnote
              }
              startEditPatchnote={
                props.startEditPatchnote
              }
              togglePatchnote={
                props.togglePatchnote
              }
              deletePatchnote={
                props.deletePatchnote
              }
            />
          </section>
        )}


        {activeSection ===
          "operations" && (
          <AdminOperationsSection />
        )}


        {activeSection ===
          "feature-flags" && (
          <AdminFeatureFlagsSection />
        )}


        {activeSection ===
          "logs" && (
          <AdminLogsSection />
        )}
      </div>
    </div>
  );
}