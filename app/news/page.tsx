"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getPublishedNews } from "../../services/community.service";
import type { NewsItem } from "../../types/community";

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedNews()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pinned = useMemo(() => {
    return items.filter((item) => item.pinned);
  }, [items]);

  const normalNews = useMemo(() => {
    return items.filter((item) => !item.pinned);
  }, [items]);

  const featured = pinned[0] ?? items[0] ?? null;

  const remaining = useMemo(() => {
    if (!featured) {
      return [];
    }

    return items.filter((item) => item.id !== featured.id);
  }, [items, featured]);

  function formatDate(value?: string | null) {
    if (!value) {
      return "";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <>
      <div className="newsPage">
        <header className="newsHeader">
          <div className="newsEyebrow">
            COMMUNITY
          </div>

          <h1>News</h1>

          <p>
            Announcements, reveals and smaller updates from the world of Auros
            Royale.
          </p>
        </header>

        {loading ? (
          <div className="newsEmpty">
            Loading news...
          </div>
        ) : items.length === 0 ? (
          <div className="newsEmpty">
            No news has been published yet.
          </div>
        ) : (
          <>
            {featured && (
              <section className="featuredNewsSection">
                <div className="sectionHeader">
                  <div>
                    <span>
                      {featured.pinned ? "PINNED" : "LATEST"}
                    </span>

                    <h2>
                      Latest from Auros
                    </h2>
                  </div>
                </div>

                <Link
                  href={`/news/${featured.slug}`}
                  className="featuredNewsCard"
                >
                  {featured.image_url && (
                    <div className="featuredImageWrap">
                      <img
                        src={featured.image_url}
                        alt={featured.title}
                      />

                      <div className="featuredImageShade" />
                    </div>
                  )}

                  <div className="featuredNewsContent">
                    <div className="newsMeta">
                      <span
                        className={
                          featured.pinned
                            ? "newsBadge pinned"
                            : "newsBadge"
                        }
                      >
                        {featured.pinned
                          ? "PINNED NEWS"
                          : "NEWS"}
                      </span>

                      {featured.created_at && (
                        <span className="newsDate">
                          {formatDate(featured.created_at)}
                        </span>
                      )}
                    </div>

                    <h2>
                      {featured.title}
                    </h2>

                    <p>
                      {featured.summary ||
                        featured.content}
                    </p>

                    <div className="readMore">
                      Read article
                      <span>→</span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {remaining.length > 0 && (
              <section className="allNewsSection">
                <div className="sectionHeader sectionHeaderRow">
                  <div>
                    <span>
                      COMMUNITY FEED
                    </span>

                    <h2>
                      More News
                    </h2>
                  </div>

                  <small>
                    {remaining.length}{" "}
                    {remaining.length === 1
                      ? "article"
                      : "articles"}
                  </small>
                </div>

                <div className="newsGrid">
                  {remaining.map((item) => (
                    <Link
                      href={`/news/${item.slug}`}
                      key={item.id}
                      className="newsCard"
                    >
                      {item.image_url && (
                        <div className="newsCardImage">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="newsCardContent">
                        <div className="newsMeta">
                          <span
                            className={
                              item.pinned
                                ? "newsBadge pinned"
                                : "newsBadge"
                            }
                          >
                            {item.pinned
                              ? "PINNED"
                              : "NEWS"}
                          </span>

                          {item.created_at && (
                            <span className="newsDate">
                              {formatDate(item.created_at)}
                            </span>
                          )}
                        </div>

                        <h3>
                          {item.title}
                        </h3>

                        <p>
                          {item.summary ||
                            item.content}
                        </p>

                        <div className="readMore small">
                          Read more
                          <span>→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <style jsx global>{`
        .newsPage {
          width: 100%;
          max-width: 1350px;
          margin: 0 auto;
          padding-bottom: 70px;
        }

        .newsHeader {
          padding: 45px 0 32px;
        }

        .newsEyebrow {
          color: #63ddff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .newsHeader h1 {
          margin: 8px 0 12px;
          font-size: clamp(44px, 7vw, 72px);
          line-height: 1;
          letter-spacing: -0.045em;
        }

        .newsHeader p {
          max-width: 700px;
          margin: 0;
          color: #91a4c2;
          font-size: 16px;
          line-height: 1.7;
        }

        .sectionHeader {
          margin-bottom: 14px;
        }

        .sectionHeaderRow {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
        }

        .sectionHeader span {
          color: #63ddff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.13em;
        }

        .sectionHeader h2 {
          margin: 4px 0 0;
          font-size: 24px;
        }

        .sectionHeader small {
          color: #667d9d;
          font-size: 10px;
        }

        .featuredNewsSection {
          margin-bottom: 42px;
        }

        .featuredNewsCard {
          position: relative;
          min-height: 460px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          border: 1px solid rgba(118, 153, 214, 0.14);
          border-radius: 22px;
          background: #06101f;
          color: white;
          text-decoration: none;
        }

        .featuredImageWrap {
          position: absolute;
          inset: 0;
        }

        .featuredImageWrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .featuredNewsCard:hover
          .featuredImageWrap img {
          transform: scale(1.02);
        }

        .featuredImageShade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              to top,
              rgba(3, 8, 18, 0.98) 0%,
              rgba(3, 8, 18, 0.72) 35%,
              rgba(3, 8, 18, 0.18) 75%
            );
        }

        .featuredNewsContent {
          position: relative;
          z-index: 2;
          max-width: 780px;
          padding: 34px;
        }

        .featuredNewsContent h2 {
          margin: 10px 0;
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1.05;
        }

        .featuredNewsContent p {
          max-width: 700px;
          margin: 0;
          color: #b1bfd4;
          font-size: 14px;
          line-height: 1.7;
        }

        .newsMeta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .newsBadge {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .newsBadge.pinned {
          color: #ffd66b;
        }

        .newsDate {
          color: #7086a6;
          font-size: 9px;
        }

        .readMore {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 18px;
          color: white;
          font-size: 11px;
          font-weight: 800;
        }

        .readMore.small {
          margin-top: 14px;
          color: #b7c9df;
          font-size: 9px;
        }

        .readMore span {
          color: #63ddff;
        }

        .allNewsSection {
          margin-top: 20px;
        }

        .newsGrid {
          display: grid;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          );
          gap: 14px;
        }

        .newsCard {
          min-width: 0;
          overflow: hidden;
          border: 1px solid rgba(118, 153, 214, 0.12);
          border-radius: 18px;
          background: rgba(7, 16, 32, 0.82);
          color: white;
          text-decoration: none;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease;
        }

        .newsCard:hover {
          transform: translateY(-3px);
          border-color: rgba(99, 221, 255, 0.27);
          background: rgba(9, 20, 39, 0.92);
        }

        .newsCardImage {
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #030812;
        }

        .newsCardImage img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.22s ease;
        }

        .newsCard:hover
          .newsCardImage img {
          transform: scale(1.025);
        }

        .newsCardContent {
          padding: 16px;
        }

        .newsCardContent h3 {
          margin: 8px 0 6px;
          font-size: 18px;
          line-height: 1.25;
        }

        .newsCardContent p {
          display: -webkit-box;
          overflow: hidden;
          margin: 0;
          color: #8da0bd;
          font-size: 10px;
          line-height: 1.6;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .newsEmpty {
          padding: 55px 20px;
          text-align: center;
          border: 1px dashed rgba(118, 153, 214, 0.13);
          border-radius: 17px;
          color: #6e84a5;
          background: rgba(6, 14, 28, 0.5);
        }

        @media (max-width: 950px) {
          .newsGrid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .featuredNewsCard {
            min-height: 400px;
          }
        }

        @media (max-width: 650px) {
          .newsHeader {
            padding-top: 28px;
          }

          .featuredNewsCard {
            min-height: 400px;
          }

          .featuredNewsContent {
            padding: 22px;
          }

          .newsGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (
          prefers-reduced-motion: reduce
        ) {
          .newsCard,
          .newsCard img,
          .featuredNewsCard img {
            transition: none;
          }

          .newsCard:hover {
            transform: none;
          }

          .newsCard:hover img,
          .featuredNewsCard:hover img {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}