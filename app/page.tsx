"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getPublishedGallery,
  getPublishedNews,
  getPublishedPatchnotes,
} from "../services/community.service";

import type {
  CommunityPatchnote,
  GalleryItem,
  NewsItem,
} from "../types/community";

export default function HomePage() {
  const [patches, setPatches] = useState<CommunityPatchnote[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    Promise.all([
      getPublishedPatchnotes(1),
      getPublishedNews(3),
      getPublishedGallery(4),
    ])
      .then(([patchData, newsData, galleryData]) => {
        setPatches(patchData);
        setNews(newsData);
        setGallery(galleryData);
      })
      .catch(console.error);
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gap: 26,
      }}
    >
      {/* HERO */}

      <section
        className="auros-card"
        style={{
          minHeight: 520,
          padding: "clamp(28px, 5vw, 64px)",
          display: "grid",
          alignItems: "end",
          position: "relative",
          overflow: "hidden",

          background:
            "linear-gradient(105deg, rgba(8,15,31,.98), rgba(8,15,31,.74)), radial-gradient(circle at 78% 30%, rgba(99,221,255,.16), transparent 38%)",
        }}
      >
        <div
          style={{
            maxWidth: 760,
          }}
        >
          <div
            style={{
              color: "#68e1ff",
              fontWeight: 900,
              letterSpacing: ".14em",
              fontSize: 12,
            }}
          >
            AUROS ROYALE • COMMUNITY UPDATE 1.2.0
          </div>

          <h1
            style={{
              fontSize: "clamp(48px, 8vw, 92px)",
              lineHeight: 0.92,
              margin: "18px 0",
              letterSpacing: "-.05em",
            }}
          >
            A new world
            <br />
            is almost here.
          </h1>

          <p
            style={{
              color: "#afbed7",
              lineHeight: 1.75,
              fontSize: 18,
              maxWidth: 650,
            }}
          >
            The official home for Auros Royale. Discover updates, map
            screenshots, announcements and everything around the launch.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 28,
            }}
          >
            <Primary href="/patchnotes">
              Explore Updates
            </Primary>

            <Secondary href="/gallery">
              View Gallery
            </Secondary>
          </div>
        </div>
      </section>

      {/* NEWS */}

      <SectionTitle
        eyebrow="LATEST"
        title="What's new in Auros"
        href="/news"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(240px,1fr))",
          gap: 16,
        }}
      >
        {news.length ? (
          news.map((item) => (
            <Link
              key={item.id}
              href="/news"
              className="auros-card auros-card-hover"
              style={{
                padding: 20,
                textDecoration: "none",
                color: "white",
              }}
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt=""
                  style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    objectFit: "cover",
                    borderRadius: 16,
                    marginBottom: 16,
                  }}
                />
              )}

              <small
                style={{
                  color: "#63ddff",
                }}
              >
                NEWS
              </small>

              <h3
                style={{
                  fontSize: 21,
                  margin: "8px 0",
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  color: "#9eb0cf",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {item.summary}
              </p>
            </Link>
          ))
        ) : (
          <Empty text="News will appear here." />
        )}
      </div>

      {/* PATCHNOTES */}

      {patches[0] && (
        <>
          <SectionTitle
            eyebrow="UPDATE"
            title="Latest Patchnotes"
            href="/patchnotes"
          />

          <Link
            href={`/patchnotes/${patches[0].slug}`}
            className="auros-card auros-card-hover"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0,1.2fr) minmax(280px,.8fr)",
              overflow: "hidden",
              textDecoration: "none",
              color: "white",
            }}
          >
            <div
              style={{
                padding: 32,
              }}
            >
              <div
                style={{
                  color: "#63ddff",
                  fontWeight: 850,
                }}
              >
                VERSION {patches[0].version}
              </div>

              <h2
                style={{
                  fontSize: 38,
                  margin: "10px 0",
                }}
              >
                {patches[0].title}
              </h2>

              <p
                style={{
                  color: "#a8b7d0",
                  fontSize: 17,
                  lineHeight: 1.7,
                }}
              >
                {patches[0].summary ||
                  patches[0].content?.slice(0, 220)}
              </p>
            </div>

            {patches[0].cover_url && (
              <img
                src={patches[0].cover_url}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 280,
                  objectFit: "cover",
                }}
              />
            )}
          </Link>
        </>
      )}

      {/* GALLERY */}

      <SectionTitle
        eyebrow="GALLERY"
        title="From the world of Auros"
        href="/gallery"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 14,
        }}
      >
        {gallery.length ? (
          gallery.map((item) => (
            <Link
              href="/gallery"
              key={item.id}
              className="auros-card auros-card-hover"
              style={{
                overflow: "hidden",
                color: "white",
                textDecoration: "none",
              }}
            >
              <img
                src={item.image_url}
                alt={item.title}
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div
                style={{
                  padding: 14,
                }}
              >
                <strong>{item.title}</strong>
              </div>
            </Link>
          ))
        ) : (
          <Empty text="Gallery images will appear here." />
        )}
      </div>

      {/* APPLICATIONS */}

      <section
        className="auros-card"
        style={{
          padding: 26,
          display: "flex",
          justifyContent: "space-between",
          gap: 18,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <small
            style={{
              color: "#8ea1c1",
            }}
          >
            WANT TO HELP BUILD AUROS?
          </small>

          <h3
            style={{
              margin: "5px 0 0",
              fontSize: 25,
            }}
          >
            Applications are still available.
          </h3>
        </div>

        <Secondary href="/apply">
          Applications
        </Secondary>
      </section>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "end",
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            color: "#63ddff",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: ".14em",
          }}
        >
          {eyebrow}
        </div>

        <h2
          style={{
            fontSize: 32,
            margin: "6px 0 0",
          }}
        >
          {title}
        </h2>
      </div>

      <Link
        href={href}
        style={{
          color: "#a9bbd9",
          textDecoration: "none",
        }}
      >
        View all →
      </Link>
    </div>
  );
}

function Primary({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "13px 18px",
        borderRadius: 13,
        color: "#05101c",
        background:
          "linear-gradient(90deg,#68e1ff,#8f82ff)",
        fontWeight: 900,
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

function Secondary({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "12px 17px",
        borderRadius: 13,
        color: "white",
        border:
          "1px solid rgba(130,160,210,.25)",
        background: "rgba(12,23,44,.8)",
        fontWeight: 800,
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div
      className="auros-card"
      style={{
        padding: 24,
        color: "#90a4c4",
      }}
    >
      {text}
    </div>
  );
}