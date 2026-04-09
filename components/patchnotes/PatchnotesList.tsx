"use client";

import type { PatchnoteItem } from "../../types/patchnotes";
import PatchnoteEntryCard from "./PatchnoteEntryCard";

type PatchnotesListProps = {
  patchnotes: PatchnoteItem[];
  loading: boolean;
  entryCardStyle: React.CSSProperties;
  pillStyle: React.CSSProperties;
};

export default function PatchnotesList({
  patchnotes,
  loading,
  entryCardStyle,
  pillStyle,
}: PatchnotesListProps) {
  if (loading) {
    return (
      <div style={{ ...entryCardStyle, color: "#9fb0d0" }}>
        Loading patchnotes...
      </div>
    );
  }

  if (patchnotes.length === 0) {
    return (
      <div style={{ ...entryCardStyle, color: "#9fb0d0" }}>
        No patchnotes available yet.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      {patchnotes.map((note) => (
        <PatchnoteEntryCard
          key={note.id}
          note={note}
          entryCardStyle={entryCardStyle}
          pillStyle={pillStyle}
        />
      ))}
    </div>
  );
}