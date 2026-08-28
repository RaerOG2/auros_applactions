"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import { getPublishedPatchnotes } from "../../services/community.service";
import type { CommunityPatchnote } from "../../types/community";

export default function PatchnotesPage() {
  const [items, setItems] =
    useState<CommunityPatchnote[]>([]);

  useEffect(() => {
    getPublishedPatchnotes()
      .then(setItems)
      .catch(console.error);
  }, []);

  return (
    <div>
      <header
        style={{
          padding: "36px 0 28px",
        }}
      >
        <div
          style={{
            color: "#63ddff",
            fontWeight: 900,
            letterSpacing: ".14em",
            fontSize: 12,
          }}
        >
          AUROS UPDATES
        </div>

        <h1
          style={{
            fontSize: "clamp(42px,7vw,72px)",
            margin: "10px 0 12px",
          }}
        >
          Patchnotes
        </h1>

        <p
          style={{
            color: "#9fb0cc",
            maxWidth: 700,
            lineHeight: 1.7,
            fontSize: 17,
          }}
        >
          Major changes, gameplay updates and everything new in Auros
          Royale.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(300px,1fr))",
          gap: 18,
        }}
      >
        {items.map((note) => (
          <Link
            key={note.id}
            href={`/patchnotes/${note.slug}`}
            className="auros-card auros-card-hover"
            style={{
              overflow: "hidden",
              textDecoration: "none",
              color: "white",
            }}
          >
            {note.cover_url ? (
              <img
                src={note.cover_url}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  aspectRatio: "16/9",
                  background:
                    "linear-gradient(135deg,#102445,#181a42)",
                }}
              />
            )}

            <div
              style={{
                padding: 22,
              }}
            >
              <div
                style={{
                  color: "#63ddff",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                VERSION {note.version}
              </div>

              <h2
                style={{
                  margin: "8px 0",
                  fontSize: 25,
                }}
              >
                {note.title}
              </h2>

              <p
                style={{
                  color: "#9fb0cc",
                  lineHeight: 1.6,
                }}
              >
                {note.summary ||
                  note.content?.slice(0, 150)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}