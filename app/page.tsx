"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

import type {
  PublicReleaseInfo,
} from "../event/reloadstar/types";


type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};


export default function HomePage() {
  const [
    patches,
    setPatches,
  ] =
    useState<
      CommunityPatchnote[]
    >([]);

  const [
    news,
    setNews,
  ] =
    useState<
      NewsItem[]
    >([]);

  const [
    gallery,
    setGallery,
  ] =
    useState<
      GalleryItem[]
    >([]);

  const [
    release,
    setRelease,
  ] =
    useState<
      PublicReleaseInfo | null
    >(null);

  const [
    releaseLoading,
    setReleaseLoading,
  ] =
    useState(true);


  useEffect(() => {
    Promise.all([
      getPublishedPatchnotes(
        1
      ),

      getPublishedNews(
        3
      ),

      getPublishedGallery(
        4
      ),
    ])
      .then(
        ([
          patchData,
          newsData,
          galleryData,
        ]) => {
          setPatches(
            patchData
          );

          setNews(
            newsData
          );

          setGallery(
            galleryData
          );
        }
      )
      .catch(
        console.error
      );
  }, []);


  useEffect(() => {
    let active =
      true;


    async function loadRelease() {
      try {
        const response =
          await fetch(
            "/api/release",
            {
              cache:
                "no-store",
            }
          );


        if (
          !response.ok
        ) {
          throw new Error(
            `Release API returned ${response.status}`
          );
        }


        const data:
          PublicReleaseInfo =
          await response.json();


        if (active) {
          setRelease(
            data
          );
        }
      } catch (
        error
      ) {
        console.error(
          "[AUROS Release]",
          error
        );
      } finally {
        if (active) {
          setReleaseLoading(
            false
          );
        }
      }
    }


    loadRelease();


    /*
     * Keep the release state fresh.
     *
     * This means somebody who already has the
     * website open does not have to reload when
     * the event/release state changes.
     */

    const interval =
      window.setInterval(
        loadRelease,
        15_000
      );


    return () => {
      active =
        false;

      window.clearInterval(
        interval
      );
    };
  }, []);


  return (
    <>
      <div className="homePage">
        {/* ======================================
            HERO
        ======================================= */}

        <section className="auros-card homeHero">
          <div className="homeHeroContent">
            <div className="homeHeroEyebrow">
              AUROS ROYALE • THE ISLAND IS WAITING
            </div>

            <h1>
              A new world
              <br />
              is almost here.
            </h1>

            <p>
              The official home for Auros Royale.
              Discover updates, map screenshots,
              announcements and everything around
              the launch.
            </p>

            <div className="homeHeroActions">
              <Primary href="#auros-release">
                AUROS Battle Royale
              </Primary>

              <Secondary href="/patchnotes">
                Explore Updates
              </Secondary>
            </div>
          </div>
        </section>


        {/* ======================================
            AUROS RELEASE
        ======================================= */}

        <SectionTitle
          eyebrow="AUROS BATTLE ROYALE"
          title="The island is waiting"
        />

        <ReleaseCard
          release={
            release
          }
          loading={
            releaseLoading
          }
        />


        {/* ======================================
            NEWS
        ======================================= */}

        <SectionTitle
          eyebrow="LATEST"
          title="What's new in Auros"
          href="/news"
        />

        <div className="homeNewsGrid">
          {news.length ? (
            news.map(
              (item) => (
                <Link
                  key={
                    item.id
                  }
                  href="/news"
                  className="auros-card auros-card-hover homeNewsCard"
                >
                  {item.image_url && (
                    <img
                      src={
                        item.image_url
                      }
                      alt=""
                      className="homeNewsImage"
                    />
                  )}

                  <small className="homeCardEyebrow">
                    NEWS
                  </small>

                  <h3>
                    {
                      item.title
                    }
                  </h3>

                  <p>
                    {
                      item.summary
                    }
                  </p>
                </Link>
              )
            )
          ) : (
            <Empty
              text="News will appear here."
            />
          )}
        </div>


        {/* ======================================
            PATCHNOTES
        ======================================= */}

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
                    src={
                      patches[0]
                        .cover_url
                    }
                    alt=""
                    className="homePatchImage"
                  />
                </div>
              )}

              <div className="homePatchContent">
                <div className="homePatchVersion">
                  VERSION{" "}
                  {
                    patches[0]
                      .version
                  }
                </div>

                <h2>
                  {
                    patches[0]
                      .title
                  }
                </h2>

                <p>
                  {patches[0]
                    .summary ||
                    patches[0]
                      .content
                      ?.slice(
                        0,
                        220
                      )}
                </p>

                <div className="homePatchReadMore">
                  Read Patchnotes

                  <span>
                    →
                  </span>
                </div>
              </div>
            </Link>
          </>
        )}


        {/* ======================================
            GALLERY
        ======================================= */}

        <SectionTitle
          eyebrow="GALLERY"
          title="From the world of Auros"
          href="/gallery"
        />

        <div className="homeGalleryGrid">
          {gallery.length ? (
            gallery.map(
              (item) => (
                <Link
                  href="/gallery"
                  key={
                    item.id
                  }
                  className="auros-card auros-card-hover homeGalleryCard"
                >
                  <img
                    src={
                      item.image_url
                    }
                    alt={
                      item.title
                    }
                    className="homeGalleryImage"
                  />

                  <div className="homeGalleryContent">
                    <strong>
                      {
                        item.title
                      }
                    </strong>
                  </div>
                </Link>
              )
            )
          ) : (
            <Empty
              text="Gallery images will appear here."
            />
          )}
        </div>
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

        .homeHero::before {
          content: "";

          position: absolute;

          width: 520px;
          height: 520px;

          top: -190px;
          right: -110px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(
                104,
                225,
                255,
                0.17
              ),
              rgba(
                143,
                130,
                255,
                0.08
              )
                45%,
              transparent
                72%
            );

          filter:
            blur(
              4px
            );

          pointer-events:
            none;
        }

        .homeHeroContent {
          position: relative;

          z-index: 2;

          max-width: 760px;

          min-width: 0;
        }

        .homeHeroEyebrow {
          color: #68e1ff;

          font-weight: 900;

          letter-spacing:
            0.14em;

          font-size: 12px;
        }

        .homeHero h1 {
          margin:
            18px
            0;

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

          justify-content:
            space-between;

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

          text-decoration:
            none;

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
           RELEASE CARD
        ========================================== */

        .homeReleaseCard {
          position: relative;

          min-height: 420px;

          overflow: hidden;

          padding:
            clamp(
              26px,
              4vw,
              46px
            );

          isolation: isolate;

          background:
            linear-gradient(
              120deg,
              rgba(
                8,
                16,
                34,
                0.98
              ),
              rgba(
                11,
                23,
                48,
                0.94
              )
            );
        }

        .homeReleaseCard::before {
          content: "";

          position: absolute;

          z-index: -2;

          width: 620px;
          height: 620px;

          top: -280px;
          right: -150px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(
                100,
                225,
                255,
                0.24
              ),
              rgba(
                116,
                132,
                255,
                0.11
              )
                40%,
              transparent
                70%
            );

          filter:
            blur(
              4px
            );
        }

        .homeReleaseCard::after {
          content: "";

          position: absolute;

          z-index: -1;

          width: 380px;
          height: 380px;

          right: 7%;
          bottom: -250px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(
                143,
                130,
                255,
                0.16
              ),
              transparent
                70%
            );
        }

        .homeReleaseTop {
          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap: 16px;

          margin-bottom:
            44px;
        }

        .homeReleaseBrand {
          display: flex;

          align-items:
            center;

          gap: 10px;

          color:
            #d7e8ff;

          font-size: 12px;

          font-weight: 900;

          letter-spacing:
            0.11em;
        }

        .homeReleaseBrandOrb {
          width: 11px;
          height: 11px;

          border-radius: 50%;

          background:
            #63ddff;

          box-shadow:
            0
            0
            20px
            rgba(
              99,
              221,
              255,
              0.8
            );
        }

        .homeReleaseStatus {
          display:
            inline-flex;

          align-items:
            center;

          gap: 8px;

          padding:
            8px
            12px;

          border:
            1px solid
            rgba(
              130,
              160,
              210,
              0.18
            );

          border-radius:
            999px;

          color:
            #91a8ca;

          background:
            rgba(
              8,
              17,
              35,
              0.58
            );

          font-size: 10px;

          font-weight: 900;

          letter-spacing:
            0.1em;
        }

        .homeReleaseStatusDot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background:
            #ffbf69;

          box-shadow:
            0
            0
            12px
            rgba(
              255,
              191,
              105,
              0.65
            );
        }

        .homeReleaseStatusLive
          .homeReleaseStatusDot {
          background:
            #63ddff;

          box-shadow:
            0
            0
            14px
            rgba(
              99,
              221,
              255,
              0.85
            );
        }

        .homeReleaseStatusReleased
          .homeReleaseStatusDot {
          background:
            #61e6a6;

          box-shadow:
            0
            0
            14px
            rgba(
              97,
              230,
              166,
              0.8
            );
        }

        .homeReleaseGrid {
          display: grid;

          grid-template-columns:
            minmax(
              0,
              1fr
            )
            minmax(
              310px,
              0.72fr
            );

          gap:
            clamp(
              28px,
              5vw,
              70px
            );

          align-items:
            end;
        }

        .homeReleaseEyebrow {
          color:
            #63ddff;

          font-size: 11px;

          font-weight: 900;

          letter-spacing:
            0.14em;
        }

        .homeReleaseTitle {
          max-width: 720px;

          margin:
            12px
            0
            14px;

          color: white;

          font-size:
            clamp(
              43px,
              6vw,
              74px
            );

          line-height:
            0.94;

          letter-spacing:
            -0.05em;
        }

        .homeReleaseDescription {
          max-width: 640px;

          margin: 0;

          color:
            #a7b8d2;

          font-size: 16px;

          line-height: 1.7;
        }


        /* COUNTDOWN */

        .homeCountdown {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 8px;

          margin-top: 28px;
        }

        .homeCountdownItem {
          min-width: 0;

          padding:
            14px
            10px;

          border:
            1px solid
            rgba(
              130,
              160,
              210,
              0.16
            );

          border-radius:
            15px;

          background:
            rgba(
              10,
              21,
              42,
              0.72
            );

          text-align:
            center;
        }

        .homeCountdownItem strong {
          display: block;

          color: white;

          font-size:
            clamp(
              21px,
              4vw,
              31px
            );

          line-height: 1;

          font-variant-numeric:
            tabular-nums;
        }

        .homeCountdownItem span {
          display: block;

          margin-top: 7px;

          color:
            #7188aa;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            0.12em;
        }


        /* LOCKED PANEL */

        .homeReleasePanel {
          padding: 22px;

          border:
            1px solid
            rgba(
              130,
              160,
              210,
              0.17
            );

          border-radius: 22px;

          background:
            rgba(
              7,
              15,
              31,
              0.66
            );

          box-shadow:
            inset
            0
            1px
            0
            rgba(
              255,
              255,
              255,
              0.035
            );
        }

        .homeReleaseLock {
          width: 50px;
          height: 50px;

          display: grid;

          place-items:
            center;

          margin-bottom:
            18px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.18
            );

          border-radius:
            15px;

          color:
            #63ddff;

          background:
            rgba(
              99,
              221,
              255,
              0.07
            );

          font-size: 20px;
        }

        .homeReleasePanel small {
          color:
            #7188aa;

          font-size: 9px;

          font-weight: 900;

          letter-spacing:
            0.12em;
        }

        .homeReleasePanel h3 {
          margin:
            8px
            0;

          color: white;

          font-size: 24px;
        }

        .homeReleasePanel p {
          margin: 0;

          color:
            #8fa3c2;

          font-size: 13px;

          line-height: 1.6;
        }


        /* RELEASED */

        .homeReleaseCardReleased {
          border-color:
            rgba(
              97,
              230,
              166,
              0.28
            );
        }

        .homeReleaseCardReleased::before {
          background:
            radial-gradient(
              circle,
              rgba(
                99,
                221,
                255,
                0.25
              ),
              rgba(
                97,
                230,
                166,
                0.1
              )
                42%,
              transparent
                72%
            );
        }

        .homeReleaseLiveBadge {
          width: fit-content;

          display: flex;

          align-items:
            center;

          gap: 8px;

          margin-bottom:
            12px;

          padding:
            8px
            11px;

          border-radius:
            999px;

          color:
            #77f0b9;

          background:
            rgba(
              97,
              230,
              166,
              0.08
            );

          font-size: 10px;

          font-weight: 900;

          letter-spacing:
            0.11em;
        }

        .homeReleaseLiveBadge span {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background:
            #61e6a6;

          box-shadow:
            0
            0
            14px
            rgba(
              97,
              230,
              166,
              0.85
            );
        }

        .homeIslandCode {
          margin-top:
            20px;

          padding: 18px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.18
            );

          border-radius:
            18px;

          background:
            rgba(
              5,
              13,
              27,
              0.78
            );
        }

        .homeIslandCodeLabel {
          color:
            #7188aa;

          font-size: 9px;

          font-weight: 900;

          letter-spacing:
            0.13em;
        }

        .homeIslandCodeValue {
          margin-top: 7px;

          color: white;

          font-family:
            var(
              --font-geist-mono
            ),
            monospace;

          font-size:
            clamp(
              23px,
              4vw,
              34px
            );

          font-weight: 900;

          letter-spacing:
            0.08em;

          overflow-wrap:
            anywhere;
        }

        .homeReleaseActions {
          display: flex;

          gap: 10px;

          flex-wrap: wrap;

          margin-top: 14px;
        }

        .homeCopyButton {
          min-height: 44px;

          padding:
            11px
            16px;

          border: 0;

          border-radius: 13px;

          cursor: pointer;

          color:
            #05101c;

          background:
            linear-gradient(
              90deg,
              #68e1ff,
              #8f82ff
            );

          font-weight: 900;

          transition:
            transform
              120ms
              ease;
        }

        .homeCopyButton:active {
          transform:
            scale(
              0.98
            );
        }

        .homeReleasedPanel {
          border-color:
            rgba(
              97,
              230,
              166,
              0.18
            );
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

          text-decoration:
            none;
        }

        .homeNewsImage {
          width: 100%;

          display: block;

          aspect-ratio:
            16 / 9;

          object-fit: cover;

          margin-bottom:
            16px;

          border-radius:
            16px;
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

          overflow-wrap:
            anywhere;
        }

        .homeNewsCard p {
          margin: 0;

          color: #9eb0cf;

          line-height: 1.6;

          overflow-wrap:
            anywhere;
        }


        /* =========================================
           PATCHNOTES
        ========================================== */

        .homePatchCard {
          display: grid;

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

          text-decoration:
            none;

          min-width: 0;
        }

        .homePatchContent {
          grid-area:
            content;

          min-width: 0;

          display: flex;

          flex-direction:
            column;

          justify-content:
            center;

          padding: 32px;
        }

        .homePatchImageWrap {
          grid-area:
            image;

          min-width: 0;

          min-height:
            280px;

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

          overflow-wrap:
            anywhere;
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

          overflow-wrap:
            anywhere;
        }

        .homePatchContent p {
          margin:
            8px
            0
            0;

          color: #a8b7d0;

          font-size: 17px;

          line-height: 1.7;

          overflow-wrap:
            anywhere;
        }

        .homePatchReadMore {
          display: flex;

          align-items:
            center;

          gap: 8px;

          margin-top:
            22px;

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

          text-decoration:
            none;
        }

        .homeGalleryImage {
          width: 100%;

          display: block;

          aspect-ratio:
            4 / 3;

          object-fit: cover;
        }

        .homeGalleryContent {
          padding: 14px;
        }

        .homeGalleryContent strong {
          overflow-wrap:
            anywhere;
        }


        /* =========================================
           BUTTONS
        ========================================== */

        .homePrimaryButton,
        .homeSecondaryButton {
          min-height: 44px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          text-decoration:
            none;

          border-radius:
            13px;

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
          .homeSecondaryButton:hover,
          .homeCopyButton:hover {
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
          .homeReleaseGrid {
            grid-template-columns:
              minmax(
                0,
                1fr
              );

            gap: 26px;
          }

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
            min-height:
              410px;

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

          .homeReleaseCard {
            min-height: 0;

            padding:
              24px
              20px;
          }

          .homeReleaseTop {
            align-items:
              flex-start;

            flex-direction:
              column;

            margin-bottom:
              32px;
          }

          .homeReleaseTitle {
            font-size:
              clamp(
                39px,
                12vw,
                54px
              );
          }

          .homeReleaseDescription {
            font-size: 14px;
          }

          .homeCountdown {
            gap: 5px;
          }

          .homeCountdownItem {
            padding:
              12px
              5px;

            border-radius:
              12px;
          }

          .homeCountdownItem strong {
            font-size: 21px;
          }

          .homeCountdownItem span {
            font-size: 7px;
          }

          .homeReleasePanel {
            padding: 18px;
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
            border-radius:
              20px;
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
        }


        /* =========================================
           VERY SMALL MOBILE
        ========================================== */

        @media (
          max-width: 390px
        ) {
          .homeHero {
            min-height:
              380px;

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

          .homeCountdown {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
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
          .homeCopyButton,
          .homePatchReadMore span,
          .homeSectionViewAll {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}


function ReleaseCard({
  release,
  loading,
}: {
  release:
    PublicReleaseInfo | null;

  loading:
    boolean;
}) {
  const [
    now,
    setNow,
  ] =
    useState(
      () =>
        Date.now()
    );

  const [
    copied,
    setCopied,
  ] =
    useState(false);


  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setNow(
            Date.now()
          );
        },
        1000
      );


    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);


  const countdown =
    useMemo(
      () => {
        if (
          !release
        ) {
          return null;
        }


        return createCountdown(
          release.releaseAt,
          now
        );
      },
      [
        release,
        now,
      ]
    );


  async function copyCode() {
    if (
      !release?.islandCode
    ) {
      return;
    }


    try {
      await navigator.clipboard.writeText(
        release.islandCode
      );

      setCopied(
        true
      );


      window.setTimeout(
        () => {
          setCopied(
            false
          );
        },
        1800
      );
    } catch (
      error
    ) {
      console.error(
        "Could not copy island code:",
        error
      );
    }
  }


  if (
    loading ||
    !release
  ) {
    return (
      <section
        id="auros-release"
        className="auros-card homeReleaseCard"
      >
        <div className="homeReleaseTop">
          <div className="homeReleaseBrand">
            <span className="homeReleaseBrandOrb" />

            AUROS BATTLE ROYALE
          </div>

          <div className="homeReleaseStatus">
            <span className="homeReleaseStatusDot" />

            CHECKING RELEASE STATUS
          </div>
        </div>

        <div className="homeReleaseGrid">
          <div>
            <div className="homeReleaseEyebrow">
              PREPARING AUROS
            </div>

            <h2 className="homeReleaseTitle">
              The island is
              getting ready.
            </h2>

            <p className="homeReleaseDescription">
              Connecting to the AUROS
              release service...
            </p>
          </div>
        </div>
      </section>
    );
  }


  if (
    release.state ===
    "released"
  ) {
    return (
      <section
        id="auros-release"
        className="auros-card homeReleaseCard homeReleaseCardReleased"
      >
        <div className="homeReleaseTop">
          <div className="homeReleaseBrand">
            <span className="homeReleaseBrandOrb" />

            AUROS BATTLE ROYALE
          </div>

          <div className="homeReleaseStatus homeReleaseStatusReleased">
            <span className="homeReleaseStatusDot" />

            RELEASED
          </div>
        </div>

        <div className="homeReleaseGrid">
          <div>
            <div className="homeReleaseLiveBadge">
              <span />

              AUROS BR IS NOW LIVE
            </div>

            <h2 className="homeReleaseTitle">
              PLAY AUROS NOW!
            </h2>

            <p className="homeReleaseDescription">
              The wait is over.
              Drop onto the island,
              explore AUROS and fight
              for the Victory Royale.
            </p>

            {release.islandCode ? (
              <div className="homeIslandCode">
                <div className="homeIslandCodeLabel">
                  FORTNITE ISLAND CODE
                </div>

                <div className="homeIslandCodeValue">
                  {
                    release.islandCode
                  }
                </div>

                <div className="homeReleaseActions">
                  <button
                    type="button"
                    className="homeCopyButton"
                    onClick={
                      copyCode
                    }
                  >
                    {copied
                      ? "COPIED!"
                      : "COPY ISLAND CODE"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="homeIslandCode">
                <div className="homeIslandCodeLabel">
                  ISLAND CODE
                </div>

                <div className="homeIslandCodeValue">
                  COMING ONLINE
                </div>
              </div>
            )}
          </div>

          <div className="homeReleasePanel homeReleasedPanel">
            <div className="homeReleaseLock">
              ✓
            </div>

            <small>
              RELEASE STATUS
            </small>

            <h3>
              The island is open.
            </h3>

            <p>
              AUROS Battle Royale
              has officially launched.
              Copy the island code
              and enter it inside
              Fortnite.
            </p>
          </div>
        </div>
      </section>
    );
  }


  if (
    release.state ===
    "live_event"
  ) {
    return (
      <section
        id="auros-release"
        className="auros-card homeReleaseCard"
      >
        <div className="homeReleaseTop">
          <div className="homeReleaseBrand">
            <span className="homeReleaseBrandOrb" />

            AUROS BATTLE ROYALE
          </div>

          <div className="homeReleaseStatus homeReleaseStatusLive">
            <span className="homeReleaseStatusDot" />

            LIVE EVENT
          </div>
        </div>

        <div className="homeReleaseGrid">
          <div>
            <div className="homeReleaseEyebrow">
              RELOADSTAR
            </div>

            <h2 className="homeReleaseTitle">
              Something is
              happening...
            </h2>

            <p className="homeReleaseDescription">
              The AUROS release
              sequence has begun.
              Stay here.
            </p>
          </div>

          <div className="homeReleasePanel">
            <div className="homeReleaseLock">
              ✦
            </div>

            <small>
              RELEASE SEQUENCE
            </small>

            <h3>
              Event in progress.
            </h3>

            <p>
              AUROS Battle Royale
              remains locked until
              the release sequence
              is complete.
            </p>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section
      id="auros-release"
      className="auros-card homeReleaseCard"
    >
      <div className="homeReleaseTop">
        <div className="homeReleaseBrand">
          <span className="homeReleaseBrandOrb" />

          AUROS BATTLE ROYALE
        </div>

        <div className="homeReleaseStatus">
          <span className="homeReleaseStatusDot" />

          COMING SOON
        </div>
      </div>

      <div className="homeReleaseGrid">
        <div>
          <div className="homeReleaseEyebrow">
            RELEASE COUNTDOWN
          </div>

          <h2 className="homeReleaseTitle">
            The island is
            almost ready.
          </h2>

          <p className="homeReleaseDescription">
            AUROS Battle Royale
            is approaching.
            When the release
            sequence begins,
            stay on this page.
          </p>

          {countdown && (
            <Countdown
              value={
                countdown
              }
            />
          )}
        </div>

        <div className="homeReleasePanel">
          <div className="homeReleaseLock">
            ◇
          </div>

          <small>
            RELEASE STATUS
          </small>

          <h3>
            AUROS is locked.
          </h3>

          <p>
            The island code and
            PLAY AUROS NOW will
            unlock during the
            official AUROS release.
          </p>
        </div>
      </div>
    </section>
  );
}


function Countdown({
  value,
}: {
  value:
    CountdownValue;
}) {
  return (
    <div className="homeCountdown">
      <CountdownItem
        value={
          value.days
        }
        label="DAYS"
      />

      <CountdownItem
        value={
          value.hours
        }
        label="HOURS"
      />

      <CountdownItem
        value={
          value.minutes
        }
        label="MINUTES"
      />

      <CountdownItem
        value={
          value.seconds
        }
        label="SECONDS"
      />
    </div>
  );
}


function CountdownItem({
  value,
  label,
}: {
  value:
    number;

  label:
    string;
}) {
  return (
    <div className="homeCountdownItem">
      <strong>
        {String(
          value
        ).padStart(
          2,
          "0"
        )}
      </strong>

      <span>
        {label}
      </span>
    </div>
  );
}


function createCountdown(
  target:
    string,

  now:
    number
): CountdownValue {
  const targetTime =
    new Date(
      target
    ).getTime();

  const difference =
    Math.max(
      0,
      targetTime -
        now
    );

  const totalSeconds =
    Math.floor(
      difference /
        1000
    );


  return {
    days:
      Math.floor(
        totalSeconds /
          86400
      ),

    hours:
      Math.floor(
        (
          totalSeconds %
          86400
        ) /
          3600
      ),

    minutes:
      Math.floor(
        (
          totalSeconds %
          3600
        ) /
          60
      ),

    seconds:
      totalSeconds %
      60,
  };
}


function SectionTitle({
  eyebrow,
  title,
  href,
}: {
  eyebrow:
    string;

  title:
    string;

  href?:
    string;
}) {
  return (
    <div className="homeSectionTitle">
      <div className="homeSectionTitleText">
        <div className="homeSectionEyebrow">
          {
            eyebrow
          }
        </div>

        <h2>
          {
            title
          }
        </h2>
      </div>

      {href && (
        <Link
          href={
            href
          }
          className="homeSectionViewAll"
        >
          View all →
        </Link>
      )}
    </div>
  );
}


function Primary({
  href,
  children,
}: {
  href:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <Link
      href={
        href
      }
      className="homePrimaryButton"
    >
      {
        children
      }
    </Link>
  );
}


function Secondary({
  href,
  children,
}: {
  href:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <Link
      href={
        href
      }
      className="homeSecondaryButton"
    >
      {
        children
      }
    </Link>
  );
}


function Empty({
  text,
}: {
  text:
    string;
}) {
  return (
    <div
      className="auros-card"
      style={{
        padding:
          24,

        color:
          "#90a4c4",
      }}
    >
      {
        text
      }
    </div>
  );
}