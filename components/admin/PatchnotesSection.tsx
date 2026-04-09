"use client";

import type React from "react";
import type { PatchnoteItem } from "../../types/admin";
import {
  dangerButtonStyle,
  ghostButtonStyle,
  inputStyle,
  labelStyle,
  panelStyle,
  primaryButtonStyle,
} from "../../lib/admin-styles";
import { formatDate } from "../../lib/admin-utils";

type PatchnotesSectionProps = {
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
  patchnotes: PatchnoteItem[];
  savePatchnote: () => void;
  cancelEditPatchnote: () => void;
  startEditPatchnote: (note: PatchnoteItem) => void;
  togglePatchnote: (id: string) => void;
  deletePatchnote: (id: string) => void;
};

export default function PatchnotesSection({
  patchnotesOpen,
  setPatchnotesOpen,
  patchVersion,
  setPatchVersion,
  patchTitle,
  setPatchTitle,
  patchContent,
  setPatchContent,
  editingPatchId,
  expandedPatchnotes,
  patchnotes,
  savePatchnote,
  cancelEditPatchnote,
  startEditPatchnote,
  togglePatchnote,
  deletePatchnote,
}: PatchnotesSectionProps) {
  return (
    <section>
      <div
        className="sectionHeaderRow"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: patchnotesOpen ? 16 : 0,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Patchnotes Management</h2>
          <p style={{ color: "#9fb0d0", margin: "6px 0 0 0", fontSize: 14 }}>
            Manage website update entries.
          </p>
        </div>

        <button
          onClick={() => setPatchnotesOpen((prev) => !prev)}
          style={{ ...ghostButtonStyle, padding: "10px 14px" }}
        >
          {patchnotesOpen ? "Collapse" : "Expand"}
        </button>
      </div>

      {patchnotesOpen && (
        <div className="patchGrid">
          <div style={{ ...panelStyle, padding: 16, borderRadius: 18 }}>
            <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: 16 }}>
              {editingPatchId ? "Edit Patchnote" : "Create Patchnote"}
            </h3>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={labelStyle}>Version</label>
                <input
                  value={patchVersion}
                  onChange={(e) => setPatchVersion(e.target.value)}
                  style={{ ...inputStyle, padding: "11px 12px", fontSize: 14 }}
                />
              </div>

              <div>
                <label style={labelStyle}>Title</label>
                <input
                  value={patchTitle}
                  onChange={(e) => setPatchTitle(e.target.value)}
                  style={{ ...inputStyle, padding: "11px 12px", fontSize: 14 }}
                />
              </div>

              <div>
                <label style={labelStyle}>Content</label>
                <textarea
                  value={patchContent}
                  onChange={(e) => setPatchContent(e.target.value)}
                  style={{
                    ...inputStyle,
                    padding: "11px 12px",
                    fontSize: 14,
                    minHeight: 170,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={savePatchnote} style={{ ...primaryButtonStyle, padding: "10px 14px" }}>
                  {editingPatchId ? "Save Patchnote" : "Create Patchnote"}
                </button>

                {editingPatchId && (
                  <button onClick={cancelEditPatchnote} style={{ ...ghostButtonStyle, padding: "10px 14px" }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ ...panelStyle, padding: 16, borderRadius: 18 }}>
            <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: 16 }}>Patchnote Entries</h3>

            <div style={{ display: "grid", gap: 10 }}>
              {patchnotes.map((note) => {
                const isOpen = expandedPatchnotes.includes(note.id);

                return (
                  <div key={note.id} style={{ ...panelStyle, padding: 12, borderRadius: 16 }}>
                    <div
                      className="patchHeaderRow"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <h3 style={{ margin: 0, fontSize: 14 }}>
                          {note.version || "No Version"} — {note.title || "No Title"}
                        </h3>
                        <p style={{ margin: "6px 0 0 0", color: "#9fb0d0", fontSize: 12 }}>
                          {formatDate(note.created_at)}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={() => togglePatchnote(note.id)} style={{ ...ghostButtonStyle, padding: "8px 12px" }}>
                          {isOpen ? "Hide Details" : "Show Details"}
                        </button>
                        <button onClick={() => startEditPatchnote(note)} style={{ ...ghostButtonStyle, padding: "8px 12px" }}>
                          Edit
                        </button>
                        <button onClick={() => deletePatchnote(note.id)} style={{ ...dangerButtonStyle, padding: "8px 12px" }}>
                          Delete
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div
                        style={{
                          color: "#dbe7ff",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.65,
                          marginTop: 12,
                          padding: "12px",
                          borderRadius: "12px",
                          background: "#081225",
                          border: "1px solid #22304d",
                          fontSize: 13,
                        }}
                      >
                        {note.content || "-"}
                      </div>
                    )}
                  </div>
                );
              })}

              {patchnotes.length === 0 && (
                <div style={{ ...panelStyle, color: "#9fb0d0", padding: 14 }}>
                  No patchnotes created yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}