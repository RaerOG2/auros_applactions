"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminPageGuard from "../../../components/admin/AdminPageGuard";

import {
  deleteGalleryItem,
  getAdminGallery,
  setGalleryFeatured,
  setGalleryPublished,
} from "../../../services/gallery-admin.service";

import type {
  GalleryItem,
} from "../../../types/community";

export default function AdminGalleryPage() {
  return (
    <AdminPageGuard>
      <GalleryManagement />
    </AdminPageGuard>
  );
}

function GalleryManagement() {
  const [
    items,
    setItems,
  ] =
    useState<GalleryItem[]>(
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
    category,
    setCategory,
  ] =
    useState("all");

  const [
    status,
    setStatus,
  ] =
    useState<
      | "all"
      | "published"
      | "draft"
      | "featured"
    >("all");

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
        await getAdminGallery();

      setItems(data);
    } catch (
      err: any
    ) {
      console.error(
        err
      );

      setError(
        err?.message ||
          "Could not load gallery."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categories =
    useMemo(() => {
      return [
        "all",

        ...Array.from(
          new Set(
            items
              .map(
                (item) =>
                  item.category
              )
              .filter(
                Boolean
              ) as string[]
          )
        ),
      ];
    }, [
      items,
    ]);

  const shown =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return items.filter(
        (item) => {
          if (
            category !==
              "all" &&
            item.category !==
              category
          ) {
            return false;
          }

          if (
            status ===
              "published" &&
            !item.published
          ) {
            return false;
          }

          if (
            status ===
              "draft" &&
            item.published
          ) {
            return false;
          }

          if (
            status ===
              "featured" &&
            !item.featured
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
            item.description
              ?.toLowerCase()
              .includes(
                query
              ) ||
            item.category
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
      category,
      status,
    ]);

  async function togglePublish(
    item: GalleryItem
  ) {
    try {
      await setGalleryPublished(
        item.id,
        !item.published
      );

      await load();
    } catch (
      err: any
    ) {
      setError(
        err?.message ||
          "Could not update gallery item."
      );
    }
  }

  async function toggleFeatured(
    item: GalleryItem
  ) {
    try {
      await setGalleryFeatured(
        item.id,
        !item.featured
      );

      await load();
    } catch (
      err: any
    ) {
      setError(
        err?.message ||
          "Could not update gallery item."
      );
    }
  }

  async function remove(
    item: GalleryItem
  ) {
    const ok =
      window.confirm(
        `Delete "${item.title}" permanently?`
      );

    if (!ok) {
      return;
    }

    try {
      await deleteGalleryItem(
        item.id
      );

      await load();
    } catch (
      err: any
    ) {
      setError(
        err?.message ||
          "Could not delete gallery item."
      );
    }
  }

  return (
    <>
      <div className="galleryAdminPage">
        <header className="galleryAdminHeader">
          <div>
            <Link
              href="/admin"
              className="galleryBack"
            >
              ← Admin Dashboard
            </Link>

            <div className="galleryEyebrow">
              CONTENT MANAGEMENT
            </div>

            <h1>
              Gallery
            </h1>

            <p>
              Manage screenshots, locations,
              artwork and promotional media.
            </p>
          </div>

          <Link
            href="/admin/gallery/new"
            className="galleryCreateButton"
          >
            + Add Image
          </Link>
        </header>

        <div className="galleryStats">
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
            label="FEATURED"
            value={
              items.filter(
                (item) =>
                  item.featured
              ).length
            }
          />
        </div>

        <section className="galleryManagementPanel">
          <div className="galleryToolbar">
            <input
              placeholder="Search gallery..."
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
                category
              }
              onChange={(
                event
              ) =>
                setCategory(
                  event
                    .target
                    .value
                )
              }
            >
              {categories.map(
                (
                  value
                ) => (
                  <option
                    key={
                      value
                    }
                    value={
                      value
                    }
                  >
                    {value ===
                    "all"
                      ? "All categories"
                      : value}
                  </option>
                )
              )}
            </select>

            <select
              value={
                status
              }
              onChange={(
                event
              ) =>
                setStatus(
                  event
                    .target
                    .value as typeof status
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

              <option value="featured">
                Featured
              </option>
            </select>
          </div>

          {error && (
            <div className="galleryError">
              {error}
            </div>
          )}

          {loading ? (
            <div className="galleryEmpty">
              Loading gallery...
            </div>
          ) : shown.length ===
            0 ? (
            <div className="galleryEmpty">
              No images found.
            </div>
          ) : (
            <div className="galleryAdminGrid">
              {shown.map(
                (item) => (
                  <article
                    className="galleryAdminCard"
                    key={
                      item.id
                    }
                  >
                    <div className="galleryAdminImage">
                      <img
                        src={
                          item.image_url
                        }
                        alt={
                          item.title
                        }
                      />

                      <div className="galleryBadges">
                        {item.featured && (
                          <span className="featuredBadge">
                            FEATURED
                          </span>
                        )}

                        <span
                          className={
                            item.published
                              ? "galleryPublishBadge published"
                              : "galleryPublishBadge draft"
                          }
                        >
                          {item.published
                            ? "PUBLISHED"
                            : "DRAFT"}
                        </span>
                      </div>
                    </div>

                    <div className="galleryAdminContent">
                      <div className="galleryCategory">
                        {item.category ||
                          "UNCATEGORIZED"}
                      </div>

                      <h2>
                        {item.title}
                      </h2>

                      <p>
                        {item.description ||
                          "No description added."}
                      </p>

                      <div className="galleryAdminActions">
                        <Link
                          href={`/admin/gallery/${item.id}/edit`}
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            toggleFeatured(
                              item
                            )
                          }
                        >
                          {item.featured
                            ? "Unfeature"
                            : "Feature"}
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
                          className="galleryDelete"
                          onClick={() =>
                            remove(
                              item
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        .galleryAdminPage {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .galleryAdminHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .galleryBack {
          display: inline-block;
          margin-bottom: 18px;
          color: #8198ba;
          font-size: 12px;
          text-decoration: none;
        }

        .galleryEyebrow {
          color: #63ddff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .galleryAdminHeader h1 {
          margin: 7px 0;
          font-size: clamp(
            40px,
            6vw,
            60px
          );
          letter-spacing: -0.045em;
        }

        .galleryAdminHeader p {
          margin: 0;
          color: #879bb9;
        }

        .galleryCreateButton {
          padding: 12px 17px;
          border-radius: 12px;
          background: linear-gradient(
            95deg,
            #63ddff,
            #8b81ff
          );
          color: #04101a;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
        }

        .galleryStats {
          display: grid;
          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );
          gap: 11px;
          margin-bottom: 16px;
        }

        .galleryStat {
          padding: 15px;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );
          border-radius: 15px;
          background: rgba(
            8,
            17,
            34,
            0.9
          );
        }

        .galleryStat span {
          display: block;
          color: #667d9e;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .galleryStat strong {
          display: block;
          margin-top: 5px;
          font-size: 25px;
        }

        .galleryManagementPanel {
          padding: 17px;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );
          border-radius: 20px;
          background: rgba(
            8,
            17,
            34,
            0.92
          );
        }

        .galleryToolbar {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            190px
            160px;
          gap: 9px;
          margin-bottom: 15px;
        }

        .galleryToolbar input,
        .galleryToolbar select {
          width: 100%;
          min-height: 43px;
          padding: 0 12px;
          outline: none;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );
          border-radius: 11px;
          background: rgba(
            4,
            12,
            26,
            0.88
          );
          color: white;
        }

        .galleryAdminGrid {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 12px;
        }

        .galleryAdminCard {
          min-width: 0;
          overflow: hidden;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.11
            );
          border-radius: 15px;
          background: rgba(
            4,
            12,
            26,
            0.7
          );
        }

        .galleryAdminImage {
          position: relative;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #030812;
        }

        .galleryAdminImage img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .galleryBadges {
          position: absolute;
          top: 9px;
          left: 9px;
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .featuredBadge,
        .galleryPublishBadge {
          padding: 5px 7px;
          border-radius: 999px;
          font-size: 7px;
          font-weight: 900;
          backdrop-filter: blur(8px);
        }

        .featuredBadge {
          color: #ffd978;
          background: rgba(
            20,
            17,
            5,
            0.78
          );
        }

        .galleryPublishBadge.published {
          color: #9ef3cb;
          background: rgba(
            5,
            24,
            18,
            0.78
          );
        }

        .galleryPublishBadge.draft {
          color: #d0bee2;
          background: rgba(
            18,
            10,
            28,
            0.78
          );
        }

        .galleryAdminContent {
          padding: 14px;
        }

        .galleryCategory {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .galleryAdminContent h2 {
          margin: 6px 0;
          font-size: 16px;
        }

        .galleryAdminContent p {
          min-height: 34px;
          margin: 0 0 12px;
          color: #8498b8;
          font-size: 10px;
          line-height: 1.55;
        }

        .galleryAdminActions {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .galleryAdminActions a,
        .galleryAdminActions button {
          min-height: 33px;
          display: inline-flex;
          align-items: center;
          padding: 0 9px;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );
          border-radius: 8px;
          background: rgba(
            9,
            20,
            39,
            0.82
          );
          color: #cfddf1;
          font-size: 8px;
          text-decoration: none;
          cursor: pointer;
        }

        .galleryAdminActions
          .galleryDelete {
          color: #ffadb8;
        }

        .galleryError {
          margin-bottom: 12px;
          padding: 11px;
          border-radius: 10px;
          color: #ffb3be;
          background: rgba(
            255,
            70,
            90,
            0.06
          );
        }

        .galleryEmpty {
          padding: 45px;
          text-align: center;
          color: #7187a8;
        }

        @media (max-width: 1050px) {
          .galleryAdminGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        @media (max-width: 720px) {
          .galleryStats,
          .galleryToolbar,
          .galleryAdminGrid {
            grid-template-columns:
              1fr;
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
    <div className="galleryStat">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}