"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { getPublishedGallery } from "../../services/community.service";
import type { GalleryItem } from "../../types/community";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState("All");
  const [openIndex, setOpenIndex] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedGallery()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          items
            .map((item) => item.category)
            .filter(Boolean) as string[]
        )
      ),
    ];
  }, [items]);

  const shown = useMemo(() => {
    if (filter === "All") {
      return items;
    }

    return items.filter(
      (item) => item.category === filter
    );
  }, [items, filter]);

  const featured = useMemo(() => {
    return items.filter(
      (item) => item.featured
    );
  }, [items]);

  const openItem =
    openIndex !== null
      ? shown[openIndex] ?? null
      : null;

  useEffect(() => {
    if (openIndex === null) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpenIndex(null);
      }

      if (event.key === "ArrowRight") {
        setOpenIndex((current) => {
          if (current === null) {
            return null;
          }

          return (
            (current + 1) %
            shown.length
          );
        });
      }

      if (event.key === "ArrowLeft") {
        setOpenIndex((current) => {
          if (current === null) {
            return null;
          }

          return (
            (current - 1 + shown.length) %
            shown.length
          );
        });
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [openIndex, shown.length]);

  useEffect(() => {
    if (openIndex !== null) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [openIndex]);

  function nextImage() {
    if (!shown.length) {
      return;
    }

    setOpenIndex((current) => {
      if (current === null) {
        return 0;
      }

      return (
        (current + 1) %
        shown.length
      );
    });
  }

  function previousImage() {
    if (!shown.length) {
      return;
    }

    setOpenIndex((current) => {
      if (current === null) {
        return 0;
      }

      return (
        (current - 1 + shown.length) %
        shown.length
      );
    });
  }

  return (
    <>
      <div className="galleryPage">
        {/* HEADER */}

        <header className="galleryHeader">
          <div className="galleryEyebrow">
            AUROS WORLD
          </div>

          <h1>
            Gallery
          </h1>

          <p>
            Explore locations, moments,
            development screenshots and
            featured visuals from Auros
            Royale.
          </p>
        </header>

        {/* FEATURED */}

        {featured.length > 0 && (
          <section className="featuredSection">
            <div className="sectionHeader">
              <div>
                <span>
                  FEATURED
                </span>

                <h2>
                  Highlights
                </h2>
              </div>
            </div>

            <div className="featuredGrid">
              {featured
                .slice(0, 3)
                .map((item) => {
                  const index =
                    shown.findIndex(
                      (shownItem) =>
                        shownItem.id ===
                        item.id
                    );

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="featuredCard"
                      onClick={() => {
                        if (index >= 0) {
                          setOpenIndex(index);
                        }
                      }}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                      />

                      <div className="featuredOverlay">
                        <span>
                          {item.category ||
                            "AUROS"}
                        </span>

                        <h3>
                          {item.title}
                        </h3>
                      </div>
                    </button>
                  );
                })}
            </div>
          </section>
        )}

        {/* FILTER */}

        <section className="galleryControls">
          <div className="filterHeader">
            <div>
              <span>
                BROWSE
              </span>

              <h2>
                Explore Gallery
              </h2>
            </div>

            <small>
              {shown.length}{" "}
              {shown.length === 1
                ? "image"
                : "images"}
            </small>
          </div>

          <div className="galleryFilters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  filter === category
                    ? "galleryFilter active"
                    : "galleryFilter"
                }
                onClick={() => {
                  setFilter(category);
                  setOpenIndex(null);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* GALLERY */}

        {loading ? (
          <div className="galleryEmpty">
            Loading gallery...
          </div>
        ) : shown.length === 0 ? (
          <div className="galleryEmpty">
            No images found in this
            category.
          </div>
        ) : (
          <div className="galleryGrid">
            {shown.map(
              (item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className="galleryCard"
                  onClick={() =>
                    setOpenIndex(index)
                  }
                >
                  <div className="galleryImageWrap">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                    />

                    <div className="galleryImageOverlay">
                      <span>
                        View
                      </span>
                    </div>

                    {item.featured && (
                      <div className="galleryFeaturedBadge">
                        FEATURED
                      </div>
                    )}
                  </div>

                  <div className="galleryCardContent">
                    <div className="galleryCategory">
                      {item.category ||
                        "AUROS"}
                    </div>

                    <h3>
                      {item.title}
                    </h3>

                    {item.description && (
                      <p>
                        {
                          item.description
                        }
                      </p>
                    )}
                  </div>
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}

      {openItem && (
        <div
          className="galleryLightbox"
          role="dialog"
          aria-modal="true"
          aria-label={
            openItem.title
          }
          onClick={() =>
            setOpenIndex(null)
          }
        >
          <div
            className="lightboxInner"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header className="lightboxTopbar">
              <div>
                <span>
                  {openItem.category ||
                    "AUROS GALLERY"}
                </span>

                <strong>
                  {openIndex !== null
                    ? `${openIndex + 1} / ${shown.length}`
                    : ""}
                </strong>
              </div>

              <button
                type="button"
                className="lightboxClose"
                onClick={() =>
                  setOpenIndex(null)
                }
                aria-label="Close gallery"
              >
                ×
              </button>
            </header>

            <div className="lightboxImageArea">
              {shown.length > 1 && (
                <button
                  type="button"
                  className="lightboxArrow left"
                  onClick={previousImage}
                  aria-label="Previous image"
                >
                  ←
                </button>
              )}

              <img
                src={
                  openItem.image_url
                }
                alt={
                  openItem.title
                }
              />

              {shown.length > 1 && (
                <button
                  type="button"
                  className="lightboxArrow right"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  →
                </button>
              )}
            </div>

            <footer className="lightboxInfo">
              <div>
                <div className="lightboxCategory">
                  {openItem.featured
                    ? "FEATURED · "
                    : ""}
                  {openItem.category ||
                    "AUROS"}
                </div>

                <h2>
                  {openItem.title}
                </h2>

                {openItem.description && (
                  <p>
                    {
                      openItem.description
                    }
                  </p>
                )}
              </div>

              <div className="lightboxHint">
                ESC to close · ← → to
                navigate
              </div>
            </footer>
          </div>
        </div>
      )}

      <style jsx global>{`
        .galleryPage {
          width: 100%;
          max-width: 1350px;
          margin: 0 auto;
          padding-bottom: 60px;
        }

        /* HEADER */

        .galleryHeader {
          padding:
            45px
            0
            32px;
        }

        .galleryEyebrow {
          color: #63ddff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .galleryHeader h1 {
          margin:
            8px
            0
            12px;
          font-size: clamp(
            44px,
            7vw,
            72px
          );
          line-height: 1;
          letter-spacing: -0.045em;
        }

        .galleryHeader p {
          max-width: 720px;
          margin: 0;
          color: #91a4c2;
          font-size: 16px;
          line-height: 1.7;
        }

        /* SECTIONS */

        .featuredSection {
          margin-bottom: 34px;
        }

        .sectionHeader,
        .filterHeader {
          display: flex;
          align-items: flex-end;
          justify-content:
            space-between;
          gap: 15px;
          margin-bottom: 13px;
        }

        .sectionHeader span,
        .filterHeader span {
          color: #63ddff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.13em;
        }

        .sectionHeader h2,
        .filterHeader h2 {
          margin: 4px 0 0;
          font-size: 24px;
        }

        .filterHeader small {
          color: #667d9d;
          font-size: 10px;
        }

        /* FEATURED */

        .featuredGrid {
          display: grid;
          grid-template-columns:
            1.4fr
            0.8fr
            0.8fr;
          gap: 12px;
        }

        .featuredCard {
          position: relative;
          min-width: 0;
          overflow: hidden;
          min-height: 280px;
          padding: 0;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );
          border-radius: 18px;
          background: #06101f;
          color: white;
          cursor: pointer;
        }

        .featuredCard:first-child {
          min-height: 380px;
        }

        .featuredCard img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition:
            transform 0.25s ease;
        }

        .featuredCard:hover img {
          transform: scale(1.025);
        }

        .featuredOverlay {
          position: absolute;
          inset: auto 0 0;
          z-index: 2;
          padding:
            70px
            18px
            17px;
          text-align: left;
          background:
            linear-gradient(
              to top,
              rgba(
                3,
                8,
                18,
                0.95
              ),
              transparent
            );
        }

        .featuredOverlay span {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.09em;
        }

        .featuredOverlay h3 {
          margin:
            5px
            0
            0;
          font-size: 20px;
        }

        /* FILTERS */

        .galleryControls {
          margin-bottom: 18px;
        }

        .galleryFilters {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .galleryFilter {
          min-height: 37px;
          padding:
            0
            13px;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );
          border-radius: 999px;
          background: rgba(
            7,
            16,
            32,
            0.75
          );
          color: #8ea2c1;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition:
            color 0.15s ease,
            background 0.15s ease,
            border-color 0.15s ease;
        }

        .galleryFilter:hover {
          color: white;
          border-color:
            rgba(
              99,
              221,
              255,
              0.24
            );
        }

        .galleryFilter.active {
          color: #dff8ff;
          border-color:
            rgba(
              99,
              221,
              255,
              0.27
            );
          background: rgba(
            99,
            221,
            255,
            0.08
          );
        }

        /* GALLERY GRID */

        .galleryGrid {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 13px;
        }

        .galleryCard {
          min-width: 0;
          overflow: hidden;
          padding: 0;
          text-align: left;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.12
            );
          border-radius: 17px;
          background: rgba(
            7,
            16,
            32,
            0.82
          );
          color: white;
          cursor: pointer;
          transition:
            transform 0.17s ease,
            border-color 0.17s ease,
            background 0.17s ease;
        }

        .galleryCard:hover {
          transform:
            translateY(-3px);
          border-color:
            rgba(
              99,
              221,
              255,
              0.27
            );
          background: rgba(
            9,
            20,
            39,
            0.92
          );
        }

        .galleryImageWrap {
          position: relative;
          overflow: hidden;
          aspect-ratio:
            16 / 10;
          background: #030812;
        }

        .galleryImageWrap img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition:
            transform 0.22s ease;
        }

        .galleryCard:hover
          .galleryImageWrap
          img {
          transform:
            scale(1.025);
        }

        .galleryImageOverlay {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          opacity: 0;
          background: rgba(
            3,
            8,
            18,
            0.43
          );
          transition:
            opacity 0.18s ease;
        }

        .galleryImageOverlay span {
          padding:
            7px
            10px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.16
            );
          border-radius: 999px;
          background: rgba(
            4,
            11,
            24,
            0.7
          );
          font-size: 9px;
          font-weight: 800;
        }

        .galleryCard:hover
          .galleryImageOverlay {
          opacity: 1;
        }

        .galleryFeaturedBadge {
          position: absolute;
          top: 9px;
          left: 9px;
          padding:
            5px
            7px;
          border-radius: 999px;
          color: #ffd77a;
          background: rgba(
            17,
            14,
            5,
            0.78
          );
          font-size: 7px;
          font-weight: 900;
        }

        .galleryCardContent {
          padding:
            13px
            14px
            15px;
        }

        .galleryCategory {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .galleryCardContent h3 {
          margin:
            5px
            0;
          font-size: 16px;
        }

        .galleryCardContent p {
          margin:
            5px
            0
            0;
          color: #8296b5;
          font-size: 10px;
          line-height: 1.55;
        }

        .galleryEmpty {
          padding:
            50px
            20px;
          text-align: center;
          border: 1px dashed
            rgba(
              118,
              153,
              214,
              0.13
            );
          border-radius: 16px;
          color: #6e84a5;
          background: rgba(
            6,
            14,
            28,
            0.5
          );
        }

        /* LIGHTBOX */

        .galleryLightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(
            2,
            5,
            12,
            0.94
          );
          backdrop-filter:
            blur(7px);
        }

        .lightboxInner {
          width: 100%;
          max-width: 1300px;
          max-height: calc(
            100vh - 48px
          );
          display: grid;
          grid-template-rows:
            auto
            minmax(0, 1fr)
            auto;
          overflow: hidden;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.16
            );
          border-radius: 19px;
          background: #050c19;
        }

        .lightboxTopbar {
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content:
            space-between;
          gap: 15px;
          padding:
            0
            14px;
          border-bottom: 1px solid
            rgba(
              118,
              153,
              214,
              0.09
            );
        }

        .lightboxTopbar > div {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .lightboxTopbar span {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .lightboxTopbar strong {
          color: #657b9d;
          font-size: 8px;
        }

        .lightboxClose {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.13
            );
          border-radius: 9px;
          background: rgba(
            11,
            22,
            42,
            0.75
          );
          color: #d9e5f7;
          font-size: 18px;
          cursor: pointer;
        }

        .lightboxImageArea {
          position: relative;
          min-height: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: #020711;
        }

        .lightboxImageArea > img {
          display: block;
          max-width: 100%;
          max-height: calc(
            100vh - 230px
          );
          object-fit: contain;
        }

        .lightboxArrow {
          position: absolute;
          top: 50%;
          z-index: 3;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.13
            );
          border-radius: 50%;
          background: rgba(
            4,
            11,
            24,
            0.72
          );
          color: white;
          font-size: 17px;
          cursor: pointer;
          transform:
            translateY(-50%);
        }

        .lightboxArrow.left {
          left: 13px;
        }

        .lightboxArrow.right {
          right: 13px;
        }

        .lightboxArrow:hover {
          border-color:
            rgba(
              99,
              221,
              255,
              0.35
            );
          background: rgba(
            10,
            25,
            45,
            0.9
          );
        }

        .lightboxInfo {
          display: flex;
          align-items: flex-end;
          justify-content:
            space-between;
          gap: 20px;
          padding:
            16px
            18px;
          border-top: 1px solid
            rgba(
              118,
              153,
              214,
              0.09
            );
        }

        .lightboxCategory {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .lightboxInfo h2 {
          margin:
            5px
            0;
          font-size: 22px;
        }

        .lightboxInfo p {
          max-width: 760px;
          margin: 0;
          color: #899dbb;
          font-size: 10px;
          line-height: 1.6;
        }

        .lightboxHint {
          flex-shrink: 0;
          color: #506887;
          font-size: 8px;
        }

        /* RESPONSIVE */

        @media (max-width: 1000px) {
          .featuredGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .featuredCard:first-child {
            grid-column: 1 / -1;
          }

          .galleryGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        @media (max-width: 650px) {
          .galleryHeader {
            padding-top: 28px;
          }

          .featuredGrid,
          .galleryGrid {
            grid-template-columns:
              1fr;
          }

          .featuredCard:first-child {
            grid-column: auto;
          }

          .featuredCard,
          .featuredCard:first-child {
            min-height: 260px;
          }

          .galleryLightbox {
            padding: 10px;
          }

          .lightboxInner {
            max-height: calc(
              100vh - 20px
            );
            border-radius: 14px;
          }

          .lightboxInfo {
            align-items:
              flex-start;
            flex-direction:
              column;
          }

          .lightboxHint {
            display: none;
          }

          .lightboxArrow {
            width: 38px;
            height: 38px;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .galleryCard,
          .galleryCard img,
          .featuredCard img,
          .galleryImageOverlay {
            transition: none;
          }

          .galleryCard:hover {
            transform: none;
          }

          .galleryCard:hover
            .galleryImageWrap
            img,
          .featuredCard:hover
            img {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}