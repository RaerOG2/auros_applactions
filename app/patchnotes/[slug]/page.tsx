"use client";

import Link from "next/link";
import {
  useParams,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import { getPatchnoteBySlug } from "../../../services/community.service";
import type { CommunityPatchnote } from "../../../types/community";

export default function PatchnoteDetailPage() {
  const params =
    useParams<{ slug: string }>();

  const [note, setNote] =
    useState<CommunityPatchnote | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    getPatchnoteBySlug(params.slug)
      .then(setNote)
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div
        className="auros-card"
        style={{
          padding: 28,
        }}
      >
        Loading update…
      </div>
    );
  }

  if (!note) {
    return (
      <div
        className="auros-card"
        style={{
          padding: 28,
        }}
      >
        Patchnote not found.
      </div>
    );
  }

  const blocks =
    note.content_blocks ?? [];

  return (
    <article
      style={{
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      <Link
        href="/patchnotes"
        style={{
          color: "#9fb0cc",
          textDecoration: "none",
        }}
      >
        ← All patchnotes
      </Link>

      <header
        style={{
          padding: "36px 0 24px",
        }}
      >
        <div
          style={{
            color: "#63ddff",
            fontWeight: 900,
          }}
        >
          VERSION {note.version}
        </div>

        <h1
          style={{
            fontSize: "clamp(42px,7vw,72px)",
            margin: "9px 0 12px",
            lineHeight: 1,
          }}
        >
          {note.title}
        </h1>

        <p
          style={{
            color: "#a7b7d0",
            fontSize: 18,
            lineHeight: 1.7,
          }}
        >
          {note.summary}
        </p>
      </header>

      {note.cover_url && (
        <img
          src={note.cover_url}
          alt=""
          className="auros-card"
          style={{
            width: "100%",
            maxHeight: 520,
            objectFit: "cover",
            marginBottom: 28,
          }}
        />
      )}

      <section
        className="auros-card"
        style={{
          padding: "clamp(22px,5vw,48px)",
        }}
      >
        {blocks.length ? (
          blocks.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2
                  key={index}
                  style={{
                    fontSize: 30,
                    margin: "34px 0 12px",
                  }}
                >
                  {block.text}
                </h2>
              );
            }

            if (block.type === "image") {
              return (
                <figure
                  key={index}
                  style={{
                    margin: "28px 0",
                  }}
                >
                  <img
                    src={block.url}
                    alt={block.alt || ""}
                    style={{
                      width: "100%",
                      borderRadius: 18,
                    }}
                  />

                  {block.caption && (
                    <figcaption
                      style={{
                        color: "#8294b2",
                        marginTop: 8,
                      }}
                    >
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }

            return (
              <p
                key={index}
                style={{
                  fontSize: 17,
                  lineHeight: 1.85,
                  color: "#c5d2e8",
                  whiteSpace: "pre-wrap",
                }}
              >
                {block.text}
              </p>
            );
          })
        ) : (
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.85,
              color: "#c5d2e8",
              whiteSpace: "pre-wrap",
            }}
          >
            {note.content}
          </p>
        )}
      </section>
    </article>
  );
}