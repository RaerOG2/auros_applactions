"use client";

import type { PatchnoteItem } from "../../types/patchnotes";

type PatchnoteEntryCardProps = {
  note: PatchnoteItem;
  entryCardStyle: React.CSSProperties;
  pillStyle: React.CSSProperties;
};

export default function PatchnoteEntryCard({
  note,
  entryCardStyle,
  pillStyle,
}: PatchnoteEntryCardProps) {
  return (
    <article style={entryCardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "14px",
          alignItems: "start",
          flexWrap: "wrap",
          marginBottom: "14px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                ...pillStyle,
                background: "rgba(76, 201, 240, 0.12)",
                color: "#aaf3ff",
              }}
            >
              {note.version || "No Version"}
            </span>
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: "26px",
              lineHeight: 1.2,
            }}
          >
            {note.title || "Untitled Patchnote"}
          </h3>
        </div>

        <span
          style={{
            color: "#9fb0d0",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          {note.created_at ? new Date(note.created_at).toLocaleDateString() : "-"}
        </span>
      </div>

      <div
        style={{
          padding: "16px",
          borderRadius: "16px",
          background: "#081225",
          border: "1px solid #22304d",
        }}
      >
        <div
          style={{
            color: "#dbe7ff",
            lineHeight: 1.85,
            whiteSpace: "pre-wrap",
            fontSize: "15px",
          }}
        >
          {note.content || "-"}
        </div>
      </div>
    </article>
  );
}