"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();

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

    let timeout:
      number | null =
      null;


    function scheduleNextCheck(
      data:
        PublicReleaseInfo | null
    ) {
      if (
        !active
      ) {
        return;
      }


      let delay =
        10_000;


      if (
        data?.state ===
        "live_event"
      ) {
        /*
         * During DESTINY we check very frequently so the
         * Island Code / v1.3.0 switch happens almost
         * immediately at 20:00.
         */
        delay =
          500;
      } else if (
        data?.state ===
        "released"
      ) {
        delay =
          30_000;
      } else if (
        data
      ) {
        const serverNow =
          new Date(
            data.serverTime
          ).getTime();

        const eventStart =
          new Date(
            data.eventStartsAt
          ).getTime();

        const untilEvent =
          eventStart -
          serverNow;


        if (
          untilEvent <=
          60_000
        ) {
          delay =
            1_000;
        }
      }


      timeout =
        window.setTimeout(
          loadRelease,
          delay
        );
    }


    async function loadRelease() {
      let nextData:
        PublicReleaseInfo | null =
        null;


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

        nextData =
          data;


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

          scheduleNextCheck(
            nextData
          );
        }
      }
    }


    loadRelease();


    return () => {
      active =
        false;

      if (
        timeout !==
        null
      ) {
        window.clearTimeout(
          timeout
        );
      }
    };
  }, []);


  const isDevPreview =
    searchParams.get("reloadstar-dev") === "1";

  const showV130 =
    release?.state === "released" ||
    isDevPreview;

  if (showV130) {
    return (
      <V130Home
        release={release}
        releaseLoading={releaseLoading}
        news={news}
        patches={patches}
        gallery={gallery}
        isDevPreview={isDevPreview}
      />
    );
  }

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


function V130Home({
  release,
  releaseLoading,
  news,
  patches,
  gallery,
  isDevPreview,
}: {
  release: PublicReleaseInfo | null;
  releaseLoading: boolean;
  news: NewsItem[];
  patches: CommunityPatchnote[];
  gallery: GalleryItem[];
  isDevPreview: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const actuallyReleased = release?.state === "released";
  const islandCode = actuallyReleased ? release?.islandCode : null;

  async function copyCode() {
    if (!islandCode) return;

    try {
      await navigator.clipboard.writeText(islandCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Could not copy island code:", error);
    }
  }

  return (
    <>
      <main className="homeV130">
        <section className="homeV130Hero">
          <div className="homeV130HeroGrid" />
          <div className="homeV130HeroGlow" />

          <div className="homeV130HeroCopy">
            <div className="homeV130Kicker">
              <span className="homeV130LiveDot" />
              REALITY STATUS
              <b>STABLE</b>
              <i />
              AUROS 1.3.0
            </div>

            <h1>
              AUROS
              <span>BATTLE ROYALE</span>
            </h1>

            <p>
              The island is live. Enter AUROS, explore the reconstructed
              reality and fight for the Victory Royale.
            </p>

            <div className="homeV130Access">
              <div className="homeV130AccessHead">
                <div>
                  <small>ISLAND ACCESS</small>
                  <strong>AUROS BATTLE ROYALE</strong>
                </div>
                <span className={actuallyReleased ? "isOnline" : "isPreview"}>
                  <i />
                  {actuallyReleased ? "ONLINE" : "DEV PREVIEW"}
                </span>
              </div>

              <div className="homeV130CodeRow">
                <div>
                  <small>FORTNITE ISLAND CODE</small>
                  <strong>
                    {releaseLoading
                      ? "CHECKING..."
                      : islandCode || "████-████-████"}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={copyCode}
                  disabled={!islandCode}
                >
                  {islandCode ? (copied ? "COPIED" : "COPY CODE") : "LOCKED"}
                </button>
              </div>

              <div className="homeV130AccessBottom">
                <span><i /> NEXUS ONLINE</span>
                <span><i /> REALITY STABLE</span>
                <span>RELEASE 10.10.2026</span>
              </div>
            </div>

            <div className="homeV130Actions">
              <a
                className={islandCode ? "homeV130Play" : "homeV130Play isDisabled"}
                href={islandCode ? "https://www.fortnite.com/" : undefined}
                target={islandCode ? "_blank" : undefined}
                rel={islandCode ? "noreferrer" : undefined}
                aria-disabled={!islandCode}
              >
                <span>{islandCode ? "PLAY AUROS NOW" : "PLAY ACCESS LOCKED"}</span>
                <b>↗</b>
              </a>

              <Link href="/patchnotes" className="homeV130Secondary">
                EXPLORE UPDATE <span>→</span>
              </Link>
            </div>
          </div>

          <div className="homeV130Telemetry" aria-hidden="true">
            <span>NEXUS // CONNECTED</span>
            <span>REALITY // 01</span>
            <span>BUILD // 1.3.0</span>
          </div>
        </section>

        <section className="homeV130Reality">
          <div className="homeV130SectionHead">
            <div>
              <span>CURRENT REALITY</span>
              <h2>The world after Destiny.</h2>
            </div>
            <p>
              AUROS has entered a new state. The Nexuspoint is stable and the
              island is ready for deployment.
            </p>
          </div>

          <div className="homeV130RealityGrid">
            <Link href="/gallery" className="homeV130FeatureCard">
              {gallery[0]?.image_url ? (
                <img src={gallery[0].image_url} alt={gallery[0].title || "AUROS"} />
              ) : (
                <div className="homeV130FeatureFallback" />
              )}
              <div className="homeV130FeatureShade" />
              <div className="homeV130FeatureCopy">
                <small>EXPLORE THE ISLAND</small>
                <h3>{gallery[0]?.title || "The AUROS Reality"}</h3>
                <span>OPEN GALLERY →</span>
              </div>
            </Link>

            <div className="homeV130StatusCard">
              <div className="homeV130StatusTop">
                <span>AUROS SYSTEM</span>
                <b><i /> ONLINE</b>
              </div>
              <StatusLine label="NEXUSPOINT" value="STABLE" />
              <StatusLine label="REALITY SYNC" value="100%" />
              <StatusLine label="VERSION" value="1.3.0" />
              <StatusLine label="RELEASE" value="10 OCT 2026" />
              <div className="homeV130StatusPulse"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </div>
          </div>
        </section>

        <section className="homeV130ContentSection">
          <V130SectionHeading eyebrow="LATEST TRANSMISSIONS" title="What's new in AUROS" href="/news" />
          <div className="homeV130NewsGrid">
            {news.length ? news.map((item, index) => (
              <Link href="/news" className="homeV130NewsCard" key={item.id}>
                {item.image_url && <img src={item.image_url} alt="" />}
                <div className="homeV130NewsBody">
                  <div className="homeV130CardMeta"><span>NEWS</span><b>0{index + 1}</b></div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <strong>READ TRANSMISSION →</strong>
                </div>
              </Link>
            )) : <Empty text="News will appear here." />}
          </div>
        </section>

        {patches[0] && (
          <section className="homeV130ContentSection">
            <V130SectionHeading eyebrow="CURRENT BUILD" title="Latest Patchnotes" href="/patchnotes" />
            <Link href={`/patchnotes/${patches[0].slug}`} className="homeV130Patch">
              <div className="homeV130PatchCopy">
                <span>VERSION {patches[0].version}</span>
                <h2>{patches[0].title}</h2>
                <p>{patches[0].summary || patches[0].content?.slice(0, 220)}</p>
                <strong>READ PATCHNOTES →</strong>
              </div>
              {patches[0].cover_url && <img src={patches[0].cover_url} alt="" />}
            </Link>
          </section>
        )}

        <section className="homeV130ContentSection">
          <V130SectionHeading eyebrow="WORLD ARCHIVE" title="From the world of AUROS" href="/gallery" />
          <div className="homeV130GalleryGrid">
            {gallery.length ? gallery.map((item) => (
              <Link href="/gallery" className="homeV130GalleryCard" key={item.id}>
                <img src={item.image_url} alt={item.title} />
                <div><strong>{item.title}</strong><span>VIEW ↗</span></div>
              </Link>
            )) : <Empty text="Gallery images will appear here." />}
          </div>
        </section>

        {isDevPreview && !actuallyReleased && (
          <div className="homeV130DevFlag">DEV PREVIEW // RELEASE DATA REMAINS LOCKED</div>
        )}
      </main>

      <style jsx global>{`
        .homeV130 { display:grid; gap:42px; width:100%; min-width:0; }
        .homeV130Hero { min-height:min(760px, calc(100vh - 150px)); position:relative; overflow:hidden; display:flex; align-items:center; padding:clamp(34px,6vw,78px); border:1px solid rgba(115,174,231,.18); border-radius:30px; background:linear-gradient(112deg,rgba(4,10,22,.93) 0%,rgba(7,17,35,.76) 52%,rgba(8,19,38,.28) 100%); box-shadow:inset 0 1px rgba(255,255,255,.035),0 30px 90px rgba(0,0,0,.2); isolation:isolate; }
        .homeV130HeroGrid { position:absolute; inset:0; z-index:-2; opacity:.32; background-image:linear-gradient(rgba(99,221,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(99,221,255,.055) 1px,transparent 1px); background-size:42px 42px; mask-image:linear-gradient(90deg,#000 0%,rgba(0,0,0,.78) 50%,transparent 95%); }
        .homeV130HeroGlow { position:absolute; z-index:-1; left:-15%; bottom:-60%; width:70%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,rgba(64,196,255,.12),rgba(102,80,255,.055) 36%,transparent 69%); filter:blur(18px); }
        .homeV130HeroCopy { width:min(720px,61%); position:relative; z-index:2; }
        .homeV130Kicker { display:flex; align-items:center; gap:10px; color:#8da4c4; font-size:10px; font-weight:900; letter-spacing:.14em; }
        .homeV130Kicker b { color:#70efb5; } .homeV130Kicker>i { width:42px; height:1px; background:linear-gradient(90deg,rgba(99,221,255,.55),transparent); }
        .homeV130LiveDot { width:7px; height:7px; border-radius:50%; background:#65e7aa; box-shadow:0 0 14px rgba(101,231,170,.9); }
        .homeV130Hero h1 { margin:22px 0 20px; color:#fff; font-size:clamp(64px,8.5vw,118px); line-height:.77; letter-spacing:-.075em; font-weight:950; }
        .homeV130Hero h1 span { display:block; margin-top:20px; color:transparent; font-size:.52em; letter-spacing:-.045em; -webkit-text-stroke:1px rgba(197,224,255,.72); text-shadow:0 0 38px rgba(99,221,255,.09); }
        .homeV130HeroCopy>p { max-width:610px; margin:0; color:#a7b9d4; font-size:17px; line-height:1.72; }
        .homeV130Access { margin-top:30px; padding:18px; border:1px solid rgba(111,185,235,.2); border-radius:20px; background:linear-gradient(135deg,rgba(9,22,43,.78),rgba(8,17,35,.54)); backdrop-filter:blur(22px); box-shadow:inset 0 1px rgba(255,255,255,.04),0 20px 50px rgba(0,0,0,.16); }
        .homeV130AccessHead,.homeV130CodeRow,.homeV130AccessBottom { display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .homeV130AccessHead small,.homeV130CodeRow small { display:block; color:#7189aa; font-size:8px; font-weight:900; letter-spacing:.14em; }
        .homeV130AccessHead strong { display:block; margin-top:5px; color:#dceaff; font-size:12px; letter-spacing:.06em; }
        .homeV130AccessHead>span { display:inline-flex; align-items:center; gap:7px; padding:7px 10px; border:1px solid rgba(97,230,166,.15); border-radius:999px; color:#70efb5; background:rgba(97,230,166,.055); font-size:8px; font-weight:900; letter-spacing:.12em; }
        .homeV130AccessHead>span.isPreview { color:#70dfff; border-color:rgba(99,221,255,.16); background:rgba(99,221,255,.055); }
        .homeV130AccessHead>span i { width:6px; height:6px; border-radius:50%; background:currentColor; box-shadow:0 0 10px currentColor; }
        .homeV130CodeRow { margin-top:14px; padding:15px 16px; border:1px solid rgba(122,172,221,.14); border-radius:15px; background:rgba(3,10,22,.55); }
        .homeV130CodeRow strong { display:block; margin-top:5px; color:#fff; font-family:var(--font-geist-mono),monospace; font-size:clamp(20px,2.5vw,28px); letter-spacing:.09em; }
        .homeV130CodeRow button { min-width:112px; min-height:42px; padding:10px 14px; border:0; border-radius:11px; color:#06111e; background:linear-gradient(90deg,#68e1ff,#8f82ff); font-size:9px; font-weight:950; letter-spacing:.08em; cursor:pointer; }
        .homeV130CodeRow button:disabled { cursor:not-allowed; color:#6f85a5; background:rgba(100,132,174,.1); border:1px solid rgba(120,160,210,.12); }
        .homeV130AccessBottom { justify-content:flex-start; margin-top:13px; color:#7288a8; font-size:8px; font-weight:850; letter-spacing:.09em; flex-wrap:wrap; }
        .homeV130AccessBottom span { display:flex; align-items:center; gap:6px; } .homeV130AccessBottom i { width:5px; height:5px; border-radius:50%; background:#63ddff; box-shadow:0 0 8px rgba(99,221,255,.8); }
        .homeV130Actions { display:flex; gap:10px; margin-top:18px; flex-wrap:wrap; }
        .homeV130Play,.homeV130Secondary { min-height:47px; display:inline-flex; align-items:center; justify-content:center; gap:24px; padding:12px 18px; border-radius:13px; text-decoration:none; font-size:10px; font-weight:950; letter-spacing:.1em; }
        .homeV130Play { color:#06111e; background:linear-gradient(90deg,#68e1ff,#8f82ff); box-shadow:0 10px 32px rgba(89,202,255,.14); }
        .homeV130Play.isDisabled { pointer-events:none; color:#7389a8; border:1px solid rgba(120,160,210,.15); background:rgba(12,24,45,.62); box-shadow:none; }
        .homeV130Secondary { color:#c8d8ee; border:1px solid rgba(120,160,210,.19); background:rgba(10,21,42,.5); }
        .homeV130Telemetry { position:absolute; right:24px; bottom:22px; display:flex; gap:16px; color:rgba(135,167,203,.45); font-size:7px; font-weight:900; letter-spacing:.13em; }
        .homeV130SectionHead { display:grid; grid-template-columns:minmax(0,1fr) minmax(260px,.7fr); gap:28px; align-items:end; }
        .homeV130SectionHead span,.homeV130SectionHead>div>span { color:#63ddff; font-size:9px; font-weight:950; letter-spacing:.16em; }
        .homeV130SectionHead h2 { margin:8px 0 0; color:#fff; font-size:clamp(30px,4vw,46px); letter-spacing:-.04em; }
        .homeV130SectionHead p { margin:0; color:#8ea4c3; line-height:1.65; font-size:13px; }
        .homeV130RealityGrid { display:grid; grid-template-columns:minmax(0,1.65fr) minmax(280px,.55fr); gap:16px; margin-top:18px; }
        .homeV130FeatureCard,.homeV130StatusCard { position:relative; min-height:360px; overflow:hidden; border:1px solid rgba(120,166,215,.17); border-radius:24px; background:rgba(7,16,32,.68); }
        .homeV130FeatureCard { display:block; color:#fff; text-decoration:none; } .homeV130FeatureCard img,.homeV130FeatureFallback { width:100%; height:100%; position:absolute; inset:0; object-fit:cover; }
        .homeV130FeatureFallback { background:radial-gradient(circle at 70% 35%,rgba(99,221,255,.16),transparent 32%),linear-gradient(135deg,#081328,#050b16); }
        .homeV130FeatureShade { position:absolute; inset:0; background:linear-gradient(180deg,rgba(3,8,18,.05),rgba(3,8,18,.18) 40%,rgba(3,8,18,.93)); }
        .homeV130FeatureCopy { position:absolute; left:26px; right:26px; bottom:24px; } .homeV130FeatureCopy small { color:#68e1ff; font-size:9px; font-weight:950; letter-spacing:.14em; }
        .homeV130FeatureCopy h3 { margin:7px 0 14px; font-size:clamp(26px,4vw,40px); letter-spacing:-.035em; } .homeV130FeatureCopy span { color:#c4d7ef; font-size:9px; font-weight:900; letter-spacing:.11em; }
        .homeV130StatusCard { padding:24px; min-height:360px; background:linear-gradient(145deg,rgba(9,22,43,.84),rgba(5,12,25,.78)); }
        .homeV130StatusTop { display:flex; align-items:center; justify-content:space-between; padding-bottom:18px; margin-bottom:5px; border-bottom:1px solid rgba(120,160,210,.12); color:#7790b0; font-size:8px; font-weight:950; letter-spacing:.13em; }
        .homeV130StatusTop b { display:flex; align-items:center; gap:6px; color:#70efb5; } .homeV130StatusTop i { width:6px;height:6px;border-radius:50%;background:#70efb5;box-shadow:0 0 10px rgba(112,239,181,.8); }
        .homeV130StatusLine { display:flex; justify-content:space-between; gap:15px; padding:15px 0; border-bottom:1px solid rgba(120,160,210,.09); } .homeV130StatusLine span { color:#7187a6; font-size:8px; font-weight:900; letter-spacing:.1em; } .homeV130StatusLine strong { color:#d7e7fa; font-size:9px; letter-spacing:.08em; }
        .homeV130StatusPulse { height:52px; display:flex; align-items:end; gap:5px; margin-top:20px; opacity:.6; } .homeV130StatusPulse i { flex:1; border-radius:3px 3px 0 0; background:linear-gradient(#63ddff,rgba(99,221,255,.08)); animation:homeV130Bar 2.2s ease-in-out infinite; } .homeV130StatusPulse i:nth-child(1){height:22%}.homeV130StatusPulse i:nth-child(2){height:55%;animation-delay:-.3s}.homeV130StatusPulse i:nth-child(3){height:36%;animation-delay:-.7s}.homeV130StatusPulse i:nth-child(4){height:82%;animation-delay:-1.1s}.homeV130StatusPulse i:nth-child(5){height:48%;animation-delay:-.5s}.homeV130StatusPulse i:nth-child(6){height:68%;animation-delay:-1.5s}.homeV130StatusPulse i:nth-child(7){height:30%;animation-delay:-.9s}.homeV130StatusPulse i:nth-child(8){height:58%;animation-delay:-1.8s}
        @keyframes homeV130Bar { 0%,100%{transform:scaleY(.7);opacity:.45}50%{transform:scaleY(1);opacity:1} }
        .homeV130ContentSection { display:grid; gap:18px; }
        .homeV130Heading { display:flex; align-items:end; justify-content:space-between; gap:20px; } .homeV130Heading small { color:#63ddff; font-size:9px;font-weight:950;letter-spacing:.15em; } .homeV130Heading h2 { margin:6px 0 0;color:#fff;font-size:clamp(27px,3.5vw,36px);letter-spacing:-.035em; } .homeV130Heading>a { color:#91a8c8;text-decoration:none;font-size:10px;font-weight:900;letter-spacing:.08em; }
        .homeV130NewsGrid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; } .homeV130NewsCard { min-width:0; overflow:hidden; color:#fff;text-decoration:none;border:1px solid rgba(120,160,210,.15);border-radius:21px;background:rgba(7,16,32,.72);backdrop-filter:blur(14px);transition:transform .16s ease,border-color .16s ease; } .homeV130NewsCard:hover { transform:translateY(-3px);border-color:rgba(99,221,255,.28); } .homeV130NewsCard>img { width:100%;aspect-ratio:16/9;object-fit:cover;display:block; } .homeV130NewsBody { padding:18px; } .homeV130CardMeta { display:flex;justify-content:space-between;color:#63ddff;font-size:8px;font-weight:950;letter-spacing:.12em; } .homeV130CardMeta b{color:#536b8c}.homeV130NewsBody h3{margin:10px 0 8px;font-size:20px}.homeV130NewsBody p{margin:0;color:#91a5c3;line-height:1.55;font-size:13px}.homeV130NewsBody>strong{display:block;margin-top:18px;color:#bcd2ea;font-size:8px;letter-spacing:.1em}
        .homeV130Patch { display:grid;grid-template-columns:minmax(0,.85fr) minmax(340px,1.15fr);min-height:330px;overflow:hidden;color:#fff;text-decoration:none;border:1px solid rgba(120,160,210,.16);border-radius:24px;background:rgba(7,16,32,.72); } .homeV130PatchCopy{padding:clamp(25px,4vw,42px);display:flex;flex-direction:column;justify-content:center}.homeV130PatchCopy>span{color:#63ddff;font-size:9px;font-weight:950;letter-spacing:.14em}.homeV130PatchCopy h2{margin:10px 0;font-size:clamp(30px,4vw,44px);letter-spacing:-.04em}.homeV130PatchCopy p{margin:0;color:#98abc6;line-height:1.65}.homeV130PatchCopy strong{margin-top:22px;color:#c4d8ee;font-size:9px;letter-spacing:.1em}.homeV130Patch>img{width:100%;height:100%;object-fit:cover;min-height:330px}
        .homeV130GalleryGrid { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.homeV130GalleryCard{position:relative;min-height:230px;overflow:hidden;color:#fff;text-decoration:none;border:1px solid rgba(120,160,210,.14);border-radius:19px;background:#071020}.homeV130GalleryCard img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover;transition:transform .3s ease}.homeV130GalleryCard::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 45%,rgba(3,8,18,.9))}.homeV130GalleryCard>div{position:absolute;z-index:2;left:15px;right:15px;bottom:14px;display:flex;justify-content:space-between;gap:12px;align-items:end}.homeV130GalleryCard strong{font-size:13px}.homeV130GalleryCard span{color:#9fb5d0;font-size:8px;font-weight:900}.homeV130GalleryCard:hover img{transform:scale(1.035)}
        .homeV130DevFlag { position:fixed;z-index:80;right:18px;bottom:18px;padding:9px 12px;border:1px solid rgba(99,221,255,.18);border-radius:10px;color:#63ddff;background:rgba(5,13,27,.88);backdrop-filter:blur(14px);font-size:7px;font-weight:950;letter-spacing:.12em;pointer-events:none; }
        @media(max-width:900px){.homeV130Hero{min-height:680px;align-items:end}.homeV130HeroCopy{width:100%;max-width:680px}.homeV130Telemetry{display:none}.homeV130RealityGrid{grid-template-columns:1fr}.homeV130NewsGrid{grid-template-columns:1fr 1fr}.homeV130GalleryGrid{grid-template-columns:1fr 1fr}.homeV130Patch{grid-template-columns:1fr}.homeV130Patch>img{order:-1;min-height:240px;max-height:360px}.homeV130SectionHead{grid-template-columns:1fr}}
        @media(max-width:600px){.homeV130{gap:32px}.homeV130Hero{min-height:650px;padding:28px 20px;border-radius:22px}.homeV130Hero h1{font-size:clamp(54px,18vw,78px)}.homeV130Hero h1 span{margin-top:14px}.homeV130HeroCopy>p{font-size:14px}.homeV130Kicker{font-size:8px;flex-wrap:wrap}.homeV130Access{padding:14px}.homeV130AccessHead,.homeV130CodeRow{align-items:flex-start;flex-direction:column}.homeV130CodeRow button{width:100%}.homeV130Actions{display:grid;grid-template-columns:1fr}.homeV130Play,.homeV130Secondary{width:100%}.homeV130NewsGrid,.homeV130GalleryGrid{grid-template-columns:1fr}.homeV130FeatureCard,.homeV130StatusCard{min-height:310px}.homeV130Heading{align-items:flex-start;flex-direction:column;gap:8px}.homeV130PatchCopy{padding:24px 20px}}
        @media(prefers-reduced-motion:reduce){.homeV130StatusPulse i,.homeV130NewsCard,.homeV130GalleryCard img{animation:none!important;transition:none!important}}
      `}</style>
    </>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return <div className="homeV130StatusLine"><span>{label}</span><strong>{value}</strong></div>;
}

function V130SectionHeading({ eyebrow, title, href }: { eyebrow: string; title: string; href: string }) {
  return <div className="homeV130Heading"><div><small>{eyebrow}</small><h2>{title}</h2></div><Link href={href}>VIEW ALL →</Link></div>;
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
              DESTINY
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