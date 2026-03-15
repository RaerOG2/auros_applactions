"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AurosBackground from "../../components/AurosBackground";
import AurosTopbar from "../../components/AurosTopbar";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "transparent",
  color: "white",
  padding: "32px 20px 60px",
  position: "relative",
  zIndex: 1,
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
};

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
  const [patchnotes, setPatchnotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPatchnotes() {
    const { data, error } = await supabase
      .from("patchnotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setPatchnotes(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadPatchnotes();
  }, []);

  return (
    <>
      <AurosBackground />

      <main style={pageStyle}>
        <div style={containerStyle}>
          <AurosTopbar current="patchnotes" />

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

          <section
            className="heroCard"
            style={{
              ...glassCardStyle,
              padding: "34px",
              marginBottom: "22px",
            }}
          >
            <div className="heroGrid">
              <div>
                <p
                  style={{
                    color: "#4cc9f0",
                    fontWeight: 800,
                    marginBottom: 10,
                    fontSize: "13px",
                    letterSpacing: "0.08em",
                  }}
                >
                  WEBSITE / APP CHANGELOG
                </p>

                <h1
                  className="heroTitle"
                  style={{
                    margin: 0,
                    fontSize: "46px",
                    lineHeight: 1.05,
                    marginBottom: 12,
                  }}
                >
                  Patchnotes
                </h1>

                <p
                  style={{
                    color: "#9fb0d0",
                    lineHeight: 1.7,
                    marginTop: 0,
                    marginBottom: 0,
                    fontSize: "17px",
                    maxWidth: "720px",
                  }}
                >
                  Here you can find all updates, fixes, design changes, admin
                  improvements, and feature releases for the Auros application
                  website.
                </p>
              </div>

              <div
                style={{
                  background: "rgba(11, 21, 43, 0.84)",
                  border: "1px solid #22304d",
                  borderRadius: "20px",
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    marginTop: 0,
                    marginBottom: "10px",
                    color: "#4cc9f0",
                    fontWeight: 800,
                    fontSize: "13px",
                    letterSpacing: "0.08em",
                  }}
                >
                  PATCHNOTE SYSTEM
                </p>

                <div style={{ display: "grid", gap: "12px" }}>
                  {[
                    "Written directly from the admin dashboard",
                    "Loaded live from Supabase",
                    "Sorted automatically by newest entry",
                    "Publicly visible on this page",
                  ].map((item, index) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "start",
                        padding: "12px 14px",
                        borderRadius: "14px",
                        background: "#081225",
                        border: "1px solid #22304d",
                      }}
                    >
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "999px",
                          background:
                            "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "13px",
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ color: "#dbe7ff", lineHeight: 1.5 }}>
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section style={glassCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2 style={{ marginTop: 0, marginBottom: 8 }}>Latest Changes</h2>
                <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.6 }}>
                  All website and application system updates in one place.
                </p>
              </div>

              <span
                style={{
                  ...pillStyle,
                  background: "rgba(123, 97, 255, 0.12)",
                  color: "#d7ccff",
                  border: "1px solid rgba(123, 97, 255, 0.18)",
                }}
              >
                {loading
                  ? "Loading..."
                  : `${patchnotes.length} Patchnote${patchnotes.length === 1 ? "" : "s"}`}
              </span>
            </div>

            {loading ? (
              <div style={{ ...entryCardStyle, color: "#9fb0d0" }}>
                Loading patchnotes...
              </div>
            ) : patchnotes.length === 0 ? (
              <div style={{ ...entryCardStyle, color: "#9fb0d0" }}>
                No patchnotes available yet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {patchnotes.map((note) => (
                  <article key={note.id} style={entryCardStyle}>
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
                        {note.created_at
                          ? new Date(note.created_at).toLocaleDateString()
                          : "-"}
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
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
