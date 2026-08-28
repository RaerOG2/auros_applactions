"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminPageGuard from "../../../components/admin/AdminPageGuard";

import {
  deleteNewsItem,
  getAdminNews,
  setNewsPinned,
  setNewsPublished,
} from "../../../services/news-admin.service";

import type {
  NewsItem,
} from "../../../types/community";

export default function AdminNewsPage() {
  return (
    <AdminPageGuard>
      <NewsManagement />
    </AdminPageGuard>
  );
}

function NewsManagement() {
  const [
    items,
    setItems,
  ] =
    useState<NewsItem[]>(
      []
    );

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
      | "pinned"
    >("all");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getAdminNews();

      setItems(data);
    } catch (
      err: any
    ) {
      console.error(
        err
      );

      setError(
        err?.message ||
          "Could not load news."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const shown =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return items.filter(
        (item) => {
          if (
            filter ===
              "published" &&
            !item.published
          ) {
            return false;
          }

          if (
            filter ===
              "draft" &&
            item.published
          ) {
            return false;
          }

          if (
            filter ===
              "pinned" &&
            !item.pinned
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return (
            item.title
              .toLowerCase()
              .includes(
                query
              ) ||
            item.slug
              .toLowerCase()
              .includes(
                query
              ) ||
            item.summary
              ?.toLowerCase()
              .includes(
                query
              )
          );
        }
      );
    }, [
      items,
      search,
      filter,
    ]);

  async function togglePublish(
    item: NewsItem
  ) {
    try {
      await setNewsPublished(
        item.id,
        !item.published
      );

      await load();
    } catch (
      err: any
    ) {
      setError(
        err?.message ||
          "Could not update news."
      );
    }
  }

  async function togglePin(
    item: NewsItem
  ) {
    try {
      await setNewsPinned(
        item.id,
        !item.pinned
      );

      await load();
    } catch (
      err: any
    ) {
      setError(
        err?.message ||
          "Could not update news."
      );
    }
  }

  async function remove(
    item: NewsItem
  ) {
    const ok =
      window.confirm(
        `Delete "${item.title}" permanently?`
      );

    if (!ok) {
      return;
    }

    try {
      await deleteNewsItem(
        item.id
      );

      await load();
    } catch (
      err: any
    ) {
      setError(
        err?.message ||
          "Could not delete news."
      );
    }
  }

  return (
    <>
      <div className="contentAdminPage">
        <header className="contentAdminHeader">
          <div>
            <Link
              href="/admin"
              className="adminBackLink"
            >
              ← Admin Dashboard
            </Link>

            <div className="adminEyebrow">
              CONTENT MANAGEMENT
            </div>

            <h1>
              News
            </h1>

            <p>
              Manage announcements,
              reveals and smaller
              Auros updates.
            </p>
          </div>

          <Link
            href="/admin/news/new"
            className="adminCreateButton"
          >
            + New Announcement
          </Link>
        </header>

        {/* STATS */}

        <div className="contentStats">
          <Stat
            label="TOTAL"
            value={
              items.length
            }
          />

          <Stat
            label="PUBLISHED"
            value={
              items.filter(
                (item) =>
                  item.published
              ).length
            }
          />

          <Stat
            label="DRAFTS"
            value={
              items.filter(
                (item) =>
                  !item.published
              ).length
            }
          />

          <Stat
            label="PINNED"
            value={
              items.filter(
                (item) =>
                  item.pinned
              ).length
            }
          />
        </div>

        {/* PANEL */}

        <section className="contentManagementPanel">
          <div className="contentToolbar">
            <input
              placeholder="Search news..."
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

              <option value="pinned">
                Pinned
              </option>
            </select>
          </div>

          {error && (
            <div className="adminError">
              {error}
            </div>
          )}

          {loading ? (
            <div className="contentEmpty">
              Loading news...
            </div>
          ) : shown.length ===
            0 ? (
            <div className="contentEmpty">
              No news found.
            </div>
          ) : (
            <div className="newsAdminList">
              {shown.map(
                (item) => (
                  <article
                    className="newsAdminRow"
                    key={
                      item.id
                    }
                  >
                    <div className="newsAdminImage">
                      {item.image_url ? (
                        <img
                          src={
                            item.image_url
                          }
                          alt=""
                        />
                      ) : (
                        <span>
                          NEWS
                        </span>
                      )}
                    </div>

                    <div className="newsAdminInfo">
                      <div className="newsAdminMeta">
                        {item.pinned && (
                          <span className="pinnedBadge">
                            PINNED
                          </span>
                        )}

                        <span
                          className={
                            item.published
                              ? "publishBadge published"
                              : "publishBadge draft"
                          }
                        >
                          {item.published
                            ? "PUBLISHED"
                            : "DRAFT"}
                        </span>
                      </div>

                      <h2>
                        {item.title}
                      </h2>

                      <p>
                        {item.summary ||
                          "No summary added."}
                      </p>

                      <small>
                        /news/
                        {
                          item.slug
                        }
                      </small>
                    </div>

                    <div className="newsAdminActions">
                      <Link
                        href={`/admin/news/${item.id}/edit`}
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          togglePin(
                            item
                          )
                        }
                      >
                        {item.pinned
                          ? "Unpin"
                          : "Pin"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          togglePublish(
                            item
                          )
                        }
                      >
                        {item.published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        className="deleteAction"
                        onClick={() =>
                          remove(
                            item
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
        .contentAdminPage {
          width: 100%;
          max-width: 1350px;
          margin: 0 auto;
        }

        .contentAdminHeader {
          display: flex;
          justify-content:
            space-between;
          align-items: flex-end;
          gap: 20px;
          flex-wrap: wrap;

          margin-bottom:
            22px;
        }

        .adminBackLink {
          display:
            inline-block;

          margin-bottom:
            18px;

          color: #7f96b8;

          font-size: 12px;

          text-decoration:
            none;
        }

        .adminEyebrow {
          color: #63ddff;

          font-size: 10px;
          font-weight: 900;

          letter-spacing:
            0.15em;
        }

        .contentAdminHeader h1 {
          margin:
            7px 0 7px;

          font-size:
            clamp(
              40px,
              6vw,
              60px
            );

          letter-spacing:
            -0.045em;
        }

        .contentAdminHeader p {
          margin: 0;

          color: #889dbd;
        }

        .adminCreateButton {
          padding:
            12px 17px;

          border-radius:
            12px;

          background:
            linear-gradient(
              95deg,
              #63ddff,
              #8a80ff
            );

          color: #04101a;

          text-decoration:
            none;

          font-size: 12px;
          font-weight: 900;
        }

        .contentStats {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 11px;

          margin-bottom:
            16px;
        }

        .contentStat {
          padding: 15px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );

          border-radius:
            15px;

          background:
            rgba(
              8,
              17,
              34,
              0.9
            );
        }

        .contentStat span {
          display: block;

          color: #667d9e;

          font-size: 8px;
          font-weight: 900;

          letter-spacing:
            0.1em;
        }

        .contentStat strong {
          display: block;

          margin-top: 5px;

          font-size: 25px;
        }

        .contentManagementPanel {
          padding: 17px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );

          border-radius:
            20px;

          background:
            rgba(
              8,
              17,
              34,
              0.92
            );
        }

        .contentToolbar {
          display: grid;

          grid-template-columns:
            minmax(
              0,
              1fr
            )
            180px;

          gap: 9px;

          margin-bottom:
            14px;
        }

        .contentToolbar input,
        .contentToolbar select {
          width: 100%;
          min-height: 43px;

          padding:
            0 12px;

          outline: none;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );

          border-radius:
            11px;

          background:
            rgba(
              4,
              12,
              26,
              0.88
            );

          color: white;
        }

        .newsAdminList {
          display: grid;
          gap: 9px;
        }

        .newsAdminRow {
          display: grid;

          grid-template-columns:
            145px
            minmax(
              0,
              1fr
            )
            auto;

          gap: 15px;

          align-items:
            center;

          padding: 12px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.1
            );

          border-radius:
            14px;

          background:
            rgba(
              4,
              12,
              26,
              0.66
            );
        }

        .newsAdminImage {
          overflow: hidden;

          aspect-ratio:
            16 / 9;

          display: grid;
          place-items: center;

          border-radius:
            10px;

          background:
            #071223;

          color: #536b8d;

          font-size: 9px;
          font-weight: 900;

          letter-spacing:
            0.1em;
        }

        .newsAdminImage img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;
        }

        .newsAdminMeta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .pinnedBadge,
        .publishBadge {
          padding:
            4px 6px;

          border-radius:
            999px;

          font-size: 7px;
          font-weight: 900;
        }

        .pinnedBadge {
          color: #ffd97c;

          background:
            rgba(
              255,
              205,
              95,
              0.09
            );
        }

        .publishBadge.published {
          color: #9ef3cb;

          background:
            rgba(
              60,
              215,
              150,
              0.09
            );
        }

        .publishBadge.draft {
          color: #cab7df;

          background:
            rgba(
              160,
              120,
              210,
              0.09
            );
        }

        .newsAdminInfo h2 {
          margin:
            6px 0;

          font-size: 17px;
        }

        .newsAdminInfo p {
          margin:
            0 0 5px;

          color: #879bb9;

          font-size: 11px;

          line-height: 1.5;
        }

        .newsAdminInfo small {
          color: #536986;

          font-size: 9px;
        }

        .newsAdminActions {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          justify-content:
            flex-end;
        }

        .newsAdminActions a,
        .newsAdminActions button {
          min-height: 34px;

          display:
            inline-flex;
          align-items:
            center;

          padding:
            0 9px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );

          border-radius:
            8px;

          background:
            rgba(
              9,
              20,
              39,
              0.82
            );

          color: #cfddf1;

          text-decoration:
            none;

          font-size: 9px;

          cursor: pointer;
        }

        .newsAdminActions
          .deleteAction {
          color: #ffadb8;
        }

        .contentEmpty {
          padding: 40px;

          text-align: center;

          color: #7187a8;
        }

        .adminError {
          margin-bottom:
            12px;

          padding:
            11px;

          border:
            1px solid
            rgba(
              255,
              80,
              105,
              0.16
            );

          border-radius:
            10px;

          background:
            rgba(
              255,
              70,
              90,
              0.06
            );

          color: #ffb3be;

          font-size: 11px;
        }

        @media (
          max-width:
            900px
        ) {
          .newsAdminRow {
            grid-template-columns:
              110px
              minmax(
                0,
                1fr
              );
          }

          .newsAdminActions {
            grid-column:
              1 / -1;

            justify-content:
              flex-start;
          }
        }

        @media (
          max-width:
            620px
        ) {
          .contentStats,
          .contentToolbar,
          .newsAdminRow {
            grid-template-columns:
              1fr;
          }

          .newsAdminImage {
            max-width:
              300px;
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
    <div className="contentStat">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}