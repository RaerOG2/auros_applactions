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
    <>
      <div className="homePage">
        {/* HERO */}

        <section className="auros-card homeHero">
          <div className="homeHeroContent">
            <div className="homeHeroEyebrow">
              AUROS ROYALE • COMMUNITY UPDATE 1.2.0
            </div>

            <h1>
              A new world
              <br />
              is almost here.
            </h1>

            <p>
              The official home for Auros Royale. Discover updates, map
              screenshots, announcements and everything around the launch.
            </p>

            <div className="homeHeroActions">
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

        <div className="homeNewsGrid">
          {news.length ? (
            news.map((item) => (
              <Link
                key={item.id}
                href="/news"
                className="auros-card auros-card-hover homeNewsCard"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    className="homeNewsImage"
                  />
                )}

                <small className="homeCardEyebrow">
                  NEWS
                </small>

                <h3>
                  {item.title}
                </h3>

                <p>
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
              className="auros-card auros-card-hover homePatchCard"
            >
              {patches[0].cover_url && (
                <div className="homePatchImageWrap">
                  <img
                    src={patches[0].cover_url}
                    alt=""
                    className="homePatchImage"
                  />
                </div>
              )}

              <div className="homePatchContent">
                <div className="homePatchVersion">
                  VERSION {patches[0].version}
                </div>

                <h2>
                  {patches[0].title}
                </h2>

                <p>
                  {patches[0].summary ||
                    patches[0].content?.slice(0, 220)}
                </p>

                <div className="homePatchReadMore">
                  Read Patchnotes
                  <span>→</span>
                </div>
              </div>
            </Link>
          </>
        )}

        {/* GALLERY */}

        <SectionTitle
          eyebrow="GALLERY"
          title="From the world of Auros"
          href="/gallery"
        />

        <div className="homeGalleryGrid">
          {gallery.length ? (
            gallery.map((item) => (
              <Link
                href="/gallery"
                key={item.id}
                className="auros-card auros-card-hover homeGalleryCard"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="homeGalleryImage"
                />

                <div className="homeGalleryContent">
                  <strong>
                    {item.title}
                  </strong>
                </div>
              </Link>
            ))
          ) : (
            <Empty text="Gallery images will appear here." />
          )}
        </div>

        {/* APPLICATIONS */}

        <section className="auros-card homeApplications">
          <div>
            <small>
              WANT TO HELP BUILD AUROS?
            </small>

            <h3>
              Applications are still available.
            </h3>
          </div>

          <Secondary href="/apply">
            Applications
          </Secondary>
        </section>
      </div>

      <style jsx global>{`
        /* =========================================
           PAGE
        ========================================== */

        .homePage {
          display: grid;
          gap: 26px;
          width: 100%;
          min-width: 0;
        }

        /* =========================================
           HERO
        ========================================== */

        .homeHero {
          min-height: 520px;

          display: grid;
          align-items: end;

          position: relative;

          overflow: hidden;

          padding:
            clamp(
              28px,
              5vw,
              64px
            );

          background:
            linear-gradient(
              105deg,
              rgba(
                8,
                15,
                31,
                0.98
              ),
              rgba(
                8,
                15,
                31,
                0.74
              )
            ),
            radial-gradient(
              circle at 78% 30%,
              rgba(
                99,
                221,
                255,
                0.16
              ),
              transparent 38%
            );
        }

        .homeHeroContent {
          max-width: 760px;
          min-width: 0;
        }

        .homeHeroEyebrow {
          color: #68e1ff;

          font-weight: 900;
          letter-spacing: 0.14em;

          font-size: 12px;
        }

        .homeHero h1 {
          margin: 18px 0;

          color: white;

          font-size:
            clamp(
              48px,
              8vw,
              92px
            );

          line-height: 0.92;

          letter-spacing:
            -0.05em;
        }

        .homeHero p {
          max-width: 650px;

          margin: 0;

          color: #afbed7;

          line-height: 1.75;

          font-size: 18px;
        }

        .homeHeroActions {
          display: flex;

          gap: 12px;

          flex-wrap: wrap;

          margin-top: 28px;
        }

        /* =========================================
           SECTION TITLE
        ========================================== */

        .homeSectionTitle {
          display: flex;

          align-items: end;
          justify-content: space-between;

          gap: 16px;

          min-width: 0;
        }

        .homeSectionTitleText {
          min-width: 0;
        }

        .homeSectionEyebrow {
          color: #63ddff;

          font-size: 11px;
          font-weight: 900;

          letter-spacing:
            0.14em;
        }

        .homeSectionTitle h2 {
          margin:
            6px
            0
            0;

          color: white;

          font-size:
            clamp(
              25px,
              4vw,
              32px
            );

          line-height: 1.1;
        }

        .homeSectionViewAll {
          flex-shrink: 0;

          color: #a9bbd9;

          text-decoration: none;

          font-size: 14px;

          transition:
            color
              140ms
              ease;
        }

        @media (
          hover: hover
        ) and (
          pointer: fine
        ) {
          .homeSectionViewAll:hover {
            color: white;
          }
        }

        /* =========================================
           NEWS
        ========================================== */

        .homeNewsGrid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(
                min(
                  240px,
                  100%
                ),
                1fr
              )
            );

          gap: 16px;
        }

        .homeNewsCard {
          display: block;

          min-width: 0;

          padding: 20px;

          color: white;

          text-decoration: none;
        }

        .homeNewsImage {
          width: 100%;

          display: block;

          aspect-ratio: 16 / 9;

          object-fit: cover;

          margin-bottom: 16px;

          border-radius: 16px;
        }

        .homeCardEyebrow {
          color: #63ddff;
        }

        .homeNewsCard h3 {
          margin:
            8px
            0;

          color: white;

          font-size: 21px;

          overflow-wrap: anywhere;
        }

        .homeNewsCard p {
          margin: 0;

          color: #9eb0cf;

          line-height: 1.6;

          overflow-wrap: anywhere;
        }

        /* =========================================
           PATCHNOTES
        ========================================== */

        .homePatchCard {
          display: grid;

          /*
            Desktop:
            Text links / Bild rechts.
          */

          grid-template-columns:
            minmax(
              0,
              1.2fr
            )
            minmax(
              280px,
              0.8fr
            );

          grid-template-areas:
            "content image";

          overflow: hidden;

          color: white;

          text-decoration: none;

          min-width: 0;
        }

        .homePatchContent {
          grid-area: content;

          min-width: 0;

          display: flex;

          flex-direction: column;

          justify-content: center;

          padding: 32px;
        }

        .homePatchImageWrap {
          grid-area: image;

          min-width: 0;

          min-height: 280px;

          overflow: hidden;
        }

        .homePatchImage {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;
        }

        .homePatchVersion {
          color: #63ddff;

          font-weight: 850;

          font-size: 15px;

          overflow-wrap: anywhere;
        }

        .homePatchContent h2 {
          margin:
            10px
            0;

          color: white;

          font-size:
            clamp(
              29px,
              4vw,
              38px
            );

          line-height: 1.08;

          letter-spacing:
            -0.025em;

          overflow-wrap: anywhere;
        }

        .homePatchContent p {
          margin:
            8px
            0
            0;

          color: #a8b7d0;

          font-size: 17px;

          line-height: 1.7;

          overflow-wrap: anywhere;
        }

        .homePatchReadMore {
          display: flex;

          align-items: center;

          gap: 8px;

          margin-top: 22px;

          color: #63ddff;

          font-size: 13px;

          font-weight: 800;
        }

        .homePatchReadMore span {
          transition:
            transform
              150ms
              ease;
        }

        @media (
          hover: hover
        ) and (
          pointer: fine
        ) {
          .homePatchCard:hover
            .homePatchReadMore
            span {
            transform:
              translateX(
                3px
              );
          }
        }

        /* =========================================
           GALLERY
        ========================================== */

        .homeGalleryGrid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(
                min(
                  220px,
                  100%
                ),
                1fr
              )
            );

          gap: 14px;
        }

        .homeGalleryCard {
          min-width: 0;

          overflow: hidden;

          color: white;

          text-decoration: none;
        }

        .homeGalleryImage {
          width: 100%;

          display: block;

          aspect-ratio: 4 / 3;

          object-fit: cover;
        }

        .homeGalleryContent {
          padding: 14px;
        }

        .homeGalleryContent strong {
          overflow-wrap: anywhere;
        }

        /* =========================================
           APPLICATIONS
        ========================================== */

        .homeApplications {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 18px;

          flex-wrap: wrap;

          padding: 26px;
        }

        .homeApplications > div {
          min-width: 0;
        }

        .homeApplications small {
          color: #8ea1c1;
        }

        .homeApplications h3 {
          margin:
            5px
            0
            0;

          color: white;

          font-size: 25px;

          overflow-wrap: anywhere;
        }

        /* =========================================
           BUTTONS
        ========================================== */

        .homePrimaryButton,
        .homeSecondaryButton {
          min-height: 44px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          text-decoration: none;

          border-radius: 13px;

          transition:
            transform
              120ms
              ease,
            border-color
              120ms
              ease;
        }

        .homePrimaryButton {
          padding:
            13px
            18px;

          color: #05101c;

          background:
            linear-gradient(
              90deg,
              #68e1ff,
              #8f82ff
            );

          font-weight: 900;
        }

        .homeSecondaryButton {
          padding:
            12px
            17px;

          color: white;

          border:
            1px solid
            rgba(
              130,
              160,
              210,
              0.25
            );

          background:
            rgba(
              12,
              23,
              44,
              0.8
            );

          font-weight: 800;
        }

        @media (
          hover: hover
        ) and (
          pointer: fine
        ) {
          .homePrimaryButton:hover,
          .homeSecondaryButton:hover {
            transform:
              translateY(
                -1px
              );
          }
        }

        .homePrimaryButton:active,
        .homeSecondaryButton:active {
          transform:
            scale(
              0.98
            );
        }

        /* =========================================
           TABLET
        ========================================== */

        @media (
          max-width: 820px
        ) {
          /*
            Der wichtigste Fix:

            Patchnotes wechseln auf
            EINE Spalte.

            Cover oben,
            Text darunter.
          */

          .homePatchCard {
            grid-template-columns:
              minmax(
                0,
                1fr
              );

            grid-template-areas:
              "image"
              "content";
          }

          .homePatchImageWrap {
            width: 100%;

            min-height: 0;

            aspect-ratio:
              16 / 9;
          }

          .homePatchContent {
            padding: 24px;
          }

          .homePatchContent h2 {
            font-size:
              clamp(
                28px,
                7vw,
                36px
              );
          }
        }

        /* =========================================
           MOBILE
        ========================================== */

        @media (
          max-width: 600px
        ) {
          .homePage {
            gap: 22px;
          }

          .homeHero {
            min-height: 410px;

            padding:
              28px
              22px;
          }

          .homeHeroEyebrow {
            font-size: 10px;

            line-height: 1.5;
          }

          .homeHero h1 {
            margin:
              16px
              0;

            font-size:
              clamp(
                44px,
                13vw,
                62px
              );

            line-height: 0.94;
          }

          .homeHero p {
            font-size: 15px;

            line-height: 1.65;
          }

          .homeHeroActions {
            margin-top: 22px;
          }

          .homeSectionTitle {
            align-items:
              center;
          }

          .homeSectionEyebrow {
            font-size: 9px;
          }

          .homeSectionTitle h2 {
            font-size: 25px;
          }

          .homeSectionViewAll {
            font-size: 12px;
          }

          .homeNewsGrid {
            grid-template-columns:
              minmax(
                0,
                1fr
              );
          }

          .homeNewsCard {
            padding: 16px;
          }

          .homeNewsCard h3 {
            font-size: 20px;
          }

          .homeNewsCard p {
            font-size: 14px;
          }

          .homePatchCard {
            border-radius: 20px;
          }

          .homePatchImageWrap {
            aspect-ratio:
              16 / 10;
          }

          .homePatchContent {
            padding:
              22px
              20px
              24px;
          }

          .homePatchVersion {
            font-size: 13px;
          }

          .homePatchContent h2 {
            margin:
              9px
              0;

            font-size: 29px;

            line-height: 1.08;
          }

          .homePatchContent p {
            font-size: 15px;

            line-height: 1.65;
          }

          .homePatchReadMore {
            margin-top: 18px;
          }

          .homeGalleryGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            gap: 10px;
          }

          .homeGalleryContent {
            padding: 11px;
          }

          .homeGalleryContent strong {
            font-size: 13px;
          }

          .homeApplications {
            align-items:
              flex-start;

            flex-direction:
              column;

            padding: 20px;
          }

          .homeApplications h3 {
            font-size: 21px;
          }

          .homeApplications
            .homeSecondaryButton {
            width: 100%;
          }
        }

        /* =========================================
           VERY SMALL MOBILE
        ========================================== */

        @media (
          max-width: 390px
        ) {
          .homeHero {
            min-height: 380px;

            padding:
              24px
              18px;
          }

          .homeHero h1 {
            font-size: 42px;
          }

          .homeHeroActions {
            display: grid;

            grid-template-columns:
              1fr;
          }

          .homePrimaryButton,
          .homeSecondaryButton {
            width: 100%;
          }

          .homeSectionTitle {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap: 8px;
          }

          .homeGalleryGrid {
            grid-template-columns:
              1fr;
          }

          .homePatchContent {
            padding:
              20px
              18px;
          }

          .homePatchContent h2 {
            font-size: 26px;
          }
        }

        /* =========================================
           REDUCED MOTION
        ========================================== */

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .homePrimaryButton,
          .homeSecondaryButton,
          .homePatchReadMore span,
          .homeSectionViewAll {
            transition: none;
          }
        }
      `}</style>
    </>
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
    <div className="homeSectionTitle">
      <div className="homeSectionTitleText">
        <div className="homeSectionEyebrow">
          {eyebrow}
        </div>

        <h2>
          {title}
        </h2>
      </div>

      <Link
        href={href}
        className="homeSectionViewAll"
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
      className="homePrimaryButton"
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
      className="homeSecondaryButton"
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