"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminPageGuard from "../../../components/admin/AdminPageGuard";

import {
  deleteAdminPatchnote,
  getAdminPatchnotes,
  setPatchnotePublished,
} from "../../../services/patchnotes-admin.service";

import type {
  PatchnoteItem,
} from "../../../types/admin";

export default function AdminPatchnotesPage() {
  return (
    <AdminPageGuard>
      <PatchnotesManagement />
    </AdminPageGuard>
  );
}

function PatchnotesManagement() {
  const [
    patchnotes,
    setPatchnotes,
  ] =
    useState<PatchnoteItem[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<
      | "all"
      | "published"
      | "draft"
    >("all");

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  async function load() {
    try {
      setLoading(
        true
      );

      setError(null);

      const data =
        await getAdminPatchnotes();

      setPatchnotes(
        data
      );
    } catch (
      err: any
    ) {
      console.error(
        err
      );

      setError(
        err?.message ||
          "Could not load patchnotes."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  const shown =
    useMemo(() => {
      return patchnotes.filter(
        (note) => {
          if (
            filter ===
              "published" &&
            !note.published
          ) {
            return false;
          }

          if (
            filter ===
              "draft" &&
            note.published
          ) {
            return false;
          }

          const query =
            search
              .trim()
              .toLowerCase();

          if (!query) {
            return true;
          }

          return (
            note.title
              ?.toLowerCase()
              .includes(
                query
              ) ||
            note.version
              ?.toLowerCase()
              .includes(
                query
              ) ||
            note.slug
              ?.toLowerCase()
              .includes(
                query
              )
          );
        }
      );
    }, [
      patchnotes,
      filter,
      search,
    ]);

  async function togglePublished(
    note: PatchnoteItem
  ) {
    try {
      await setPatchnotePublished(
        note.id,
        !note.published
      );

      await load();
    } catch (
      err: any
    ) {
      setError(
        err?.message ||
          "Could not update patchnote."
      );
    }
  }

  async function remove(
    note: PatchnoteItem
  ) {
    const confirmed =
      window.confirm(
        `Delete "${note.title}" permanently?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      await deleteAdminPatchnote(
        note.id
      );

      await load();
    } catch (
      err: any
    ) {
      setError(
        err?.message ||
          "Could not delete patchnote."
      );
    }
  }

  return (
    <>
      <div className="patchAdminPage">
        <header className="patchAdminHeader">
          <div>
            <Link
              href="/admin"
              className="backLink"
            >
              ← Admin Dashboard
            </Link>

            <div className="eyebrow">
              AUROS CONTENT
            </div>

            <h1>
              Patchnotes
            </h1>

            <p>
              Create, edit and
              publish Auros
              updates.
            </p>
          </div>

          <Link
            href="/admin/patchnotes/new"
            className="createButton"
          >
            + New Patchnote
          </Link>
        </header>

        <div className="statsRow">
          <Stat
            label="Total"
            value={
              patchnotes.length
            }
          />

          <Stat
            label="Published"
            value={
              patchnotes.filter(
                (item) =>
                  item.published
              ).length
            }
          />

          <Stat
            label="Drafts"
            value={
              patchnotes.filter(
                (item) =>
                  !item.published
              ).length
            }
          />
        </div>

        <section className="managementPanel">
          <div className="toolbar">
            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
              placeholder="Search patchnotes..."
            />

            <select
              value={
                filter
              }
              onChange={(
                event
              ) =>
                setFilter(
                  event
                    .target
                    .value as typeof filter
                )
              }
            >
              <option value="all">
                All
              </option>

              <option value="published">
                Published
              </option>

              <option value="draft">
                Drafts
              </option>
            </select>
          </div>

          {error && (
            <div className="errorMessage">
              {error}
            </div>
          )}

          {loading ? (
            <div className="emptyState">
              Loading
              patchnotes...
            </div>
          ) : shown.length ===
            0 ? (
            <div className="emptyState">
              No patchnotes
              found.
            </div>
          ) : (
            <div className="patchList">
              {shown.map(
                (note) => (
                  <article
                    key={
                      note.id
                    }
                    className="patchRow"
                  >
                    <div className="patchCover">
                      {note.cover_url ? (
                        <img
                          src={
                            note.cover_url
                          }
                          alt=""
                        />
                      ) : (
                        <div className="coverPlaceholder">
                          AUROS
                        </div>
                      )}
                    </div>

                    <div className="patchInfo">
                      <div className="patchMeta">
                        <span className="version">
                          VERSION{" "}
                          {note.version ||
                            "-"}
                        </span>

                        <span
                          className={
                            note.published
                              ? "status published"
                              : "status draft"
                          }
                        >
                          {note.published
                            ? "Published"
                            : "Draft"}
                        </span>
                      </div>

                      <h2>
                        {note.title ||
                          "Untitled Patchnote"}
                      </h2>

                      <p>
                        {note.summary ||
                          "No summary added."}
                      </p>

                      <small>
                        /patchnotes/
                        {note.slug ||
                          "no-slug"}
                      </small>
                    </div>

                    <div className="patchActions">
                      <Link
                        href={`/admin/patchnotes/${note.id}/edit`}
                      >
                        Edit
                      </Link>

                      {note.slug && (
                        <Link
                          href={`/patchnotes/${note.slug}`}
                          target="_blank"
                        >
                          View
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          togglePublished(
                            note
                          )
                        }
                      >
                        {note.published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        className="deleteButton"
                        onClick={() =>
                          remove(
                            note
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        .patchAdminPage {
          max-width: 1320px;
          margin: 0 auto;
        }

        .patchAdminHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .backLink {
          display: inline-block;
          margin-bottom: 19px;
          color: #8198ba;
          text-decoration: none;
          font-size: 13px;
        }

        .eyebrow {
          color: #63ddff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .patchAdminHeader h1 {
          margin: 7px 0;
          font-size: clamp(40px, 6vw, 58px);
          letter-spacing: -0.04em;
        }

        .patchAdminHeader p {
          margin: 0;
          color: #91a4c3;
        }

        .createButton {
          padding: 13px 17px;
          color: #04101b;
          border-radius: 13px;
          background: linear-gradient(95deg, #63ddff, #8b79ff);
          text-decoration: none;
          font-weight: 900;
        }

        .statsRow {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 18px;
        }

        .statCard {
          padding: 17px;
          border: 1px solid rgba(118, 153, 214, 0.15);
          border-radius: 17px;
          background: rgba(9, 18, 36, 0.9);
        }

        .statCard span {
          display: block;
          color: #7e93b4;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.09em;
        }

        .statCard strong {
          display: block;
          margin-top: 5px;
          font-size: 27px;
        }

        .managementPanel {
          padding: 18px;
          border: 1px solid rgba(118, 153, 214, 0.16);
          border-radius: 22px;
          background: rgba(8, 16, 32, 0.92);
        }

        .toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 180px;
          gap: 10px;
          margin-bottom: 15px;
        }

        .toolbar input,
        .toolbar select {
          width: 100%;
          min-height: 44px;
          padding: 0 13px;
          outline: none;
          color: white;
          border: 1px solid rgba(118, 153, 214, 0.16);
          border-radius: 11px;
          background: rgba(5, 13, 27, 0.9);
        }

        .patchList {
          display: grid;
          gap: 10px;
        }

        .patchRow {
          display: grid;
          grid-template-columns: 150px minmax(0, 1fr) auto;
          gap: 17px;
          align-items: center;
          padding: 13px;
          border: 1px solid rgba(118, 153, 214, 0.11);
          border-radius: 16px;
          background: rgba(6, 14, 28, 0.7);
        }

        .patchCover {
          overflow: hidden;
          border-radius: 12px;
          aspect-ratio: 16 / 9;
          background: #071121;
        }

        .patchCover img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .coverPlaceholder {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          color: #486180;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .patchMeta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .version {
          color: #63ddff;
          font-size: 9px;
          font-weight: 900;
        }

        .status {
          padding: 4px 7px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
        }

        .status.published {
          color: #9cf2cb;
          background: rgba(60, 215, 150, 0.1);
        }

        .status.draft {
          color: #d0bddf;
          background: rgba(160, 125, 200, 0.1);
        }

        .patchInfo h2 {
          margin: 6px 0;
          font-size: 18px;
        }

        .patchInfo p {
          margin: 0 0 6px;
          color: #8ea1bf;
          font-size: 12px;
          line-height: 1.5;
        }

        .patchInfo small {
          color: #536b8c;
        }

        .patchActions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .patchActions a,
        .patchActions button {
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          padding: 0 10px;
          border: 1px solid rgba(118, 153, 214, 0.16);
          border-radius: 9px;
          background: rgba(10, 20, 39, 0.9);
          color: #d6e3f6;
          text-decoration: none;
          font-size: 11px;
          cursor: pointer;
        }

        .patchActions .deleteButton {
          color: #ffadb8;
        }

        .emptyState {
          padding: 45px;
          text-align: center;
          color: #748bad;
        }

        .errorMessage {
          margin-bottom: 13px;
          padding: 12px;
          color: #ffb2bd;
          border: 1px solid rgba(255, 80, 105, 0.18);
          border-radius: 11px;
          background: rgba(255, 70, 95, 0.07);
        }

        @media (max-width: 850px) {
          .patchRow {
            grid-template-columns: 110px minmax(0, 1fr);
          }

          .patchActions {
            grid-column: 1 / -1;
            justify-content: flex-start;
          }
        }

        @media (max-width: 600px) {
          .statsRow,
          .toolbar {
            grid-template-columns: 1fr;
          }

          .patchRow {
            grid-template-columns: 1fr;
          }

          .patchCover {
            max-width: 280px;
          }
        }
      `}</style>
    </>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="statCard">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}