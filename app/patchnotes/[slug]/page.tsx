"use client";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import ShareActions from "../../../components/seo/ShareActions";

import PatchnoteContentRenderer from "../../../components/patchnotes/PatchnoteContentRenderer";

import {
  getPatchnoteBySlug,
} from "../../../services/community.service";

import type {
  CommunityPatchnote,
} from "../../../types/community";


export default function PatchnoteDetailPage() {
  const params =
    useParams<{
      slug: string;
    }>();


  const [
    note,
    setNote,
  ] =
    useState<
      CommunityPatchnote | null
    >(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  useEffect(
    () => {
      getPatchnoteBySlug(
        params.slug
      )
        .then(
          setNote
        )
        .finally(
          () =>
            setLoading(
              false
            )
        );
    },
    [
      params.slug,
    ]
  );


  if (
    loading
  ) {
    return (
      <div
        className="auros-card"
        style={{
          padding:
            28,
        }}
      >
        Loading update…
      </div>
    );
  }


  if (
    !note
  ) {
    return (
      <div
        className="auros-card"
        style={{
          padding:
            28,
        }}
      >
        Patchnote not found.
      </div>
    );
  }


  const blocks =
    note.content_blocks ??
    [];


  return (
    <article
      style={{
        maxWidth:
          1080,

        margin:
          "0 auto",
      }}
    >
      <Link
        href="/patchnotes"
        style={{
          color:
            "#9fb0cc",

          textDecoration:
            "none",
        }}
      >
        ← All patchnotes
      </Link>


      <header
        style={{
          padding:
            "36px 0 24px",
        }}
      >
        <div
          style={{
            color:
              "#63ddff",

            fontWeight:
              900,
          }}
        >
          VERSION
          {" "}
          {
            note.version
          }
        </div>


        <h1
          style={{
            fontSize:
              "clamp(42px,7vw,72px)",

            margin:
              "9px 0 12px",

            lineHeight:
              1,

            letterSpacing:
              "-0.045em",
          }}
        >
          {
            note.title
          }
        </h1>


        {note.summary ? (
          <p
            style={{
              maxWidth:
                820,

              color:
                "#a7b7d0",

              fontSize:
                18,

              lineHeight:
                1.7,
            }}
          >
            {
              note.summary
            }
          </p>
        ) : null}


        <div
          style={{
            marginTop:
              22,
          }}
        >
          <ShareActions
            title={
              note.version
                ? `${note.title ?? "Auros Patchnotes"} — ${note.version}`
                : note.title ?? "Auros Patchnotes"
            }
            text={
              note.summary
            }
          />
        </div>
      </header>


      {note.cover_url ? (
        <img
          src={
            note.cover_url
          }
          alt={
            note.title ??
            ""
          }
          className="auros-card"
          style={{
            display:
              "block",

            width:
              "100%",

            maxHeight:
              560,

            objectFit:
              "cover",

            marginBottom:
              28,
          }}
        />
      ) : null}


      <section
        className="auros-card"
        style={{
          padding:
            "clamp(22px,5vw,48px)",
        }}
      >
        <PatchnoteContentRenderer
          blocks={
            blocks
          }
          fallbackContent={
            note.content
          }
        />
      </section>
    </article>
  );
}