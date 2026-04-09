"use client";

import PatchnotesHero from "../../components/patchnotes/PatchnotesHero";
import PatchnotesHeader from "../../components/patchnotes/PatchnotesHeader";
import PatchnotesList from "../../components/patchnotes/PatchnotesList";
import { usePatchnotes } from "../../hooks/usePatchnotes";

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(76, 201, 240, 0.18)",
  background: "rgba(76, 201, 240, 0.10)",
  color: "#95ecff",
  fontSize: "13px",
  fontWeight: 700,
};

const entryCardStyle: React.CSSProperties = {
  background: "rgba(11, 21, 43, 0.88)",
  border: "1px solid #22304d",
  borderRadius: "20px",
  padding: "22px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
};

export default function PatchnotesPage() {
  const { patchnotes, loading } = usePatchnotes();

  return (
    <>
      <style jsx>{`
        .heroGrid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 24px;
          align-items: center;
        }

        @media (max-width: 980px) {
          .heroGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .heroCard {
            padding: 24px !important;
          }

          .heroTitle {
            font-size: 36px !important;
          }
        }
      `}</style>

      <PatchnotesHero glassCardStyle={glassCardStyle} />

      <section style={glassCardStyle}>
        <PatchnotesHeader
          loading={loading}
          count={patchnotes.length}
          pillStyle={pillStyle}
        />

        <PatchnotesList
          patchnotes={patchnotes}
          loading={loading}
          entryCardStyle={entryCardStyle}
          pillStyle={pillStyle}
        />
      </section>
    </>
  );
}