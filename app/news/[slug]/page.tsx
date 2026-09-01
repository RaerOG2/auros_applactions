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

import {
  getNewsBySlug,
} from "../../../services/community.service";

import type {
  NewsItem,
} from "../../../types/community";


export default function NewsDetailPage() {
  const params =
    useParams();


  const slug =
    typeof params.slug ===
    "string"
      ? params.slug
      : "";


  const [
    item,
    setItem,
  ] =
    useState<
      NewsItem | null
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


  const [
    notFound,
    setNotFound,
  ] =
    useState(
      false
    );


  useEffect(
    () => {
      if (!slug) {
        return;
      }


      getNewsBySlug(
        slug
      )
        .then(
          (
            data
          ) => {
            if (
              !data
            ) {
              setNotFound(
                true
              );

              return;
            }


            setItem(
              data
            );
          }
        )
        .catch(
          (
            error
          ) => {
            console.error(
              error
            );

            setNotFound(
              true
            );
          }
        )
        .finally(
          () => {
            setLoading(
              false
            );
          }
        );
    },
    [
      slug,
    ]
  );


  function formatDate(
    value?:
      string | null
  ) {
    if (!value) {
      return "";
    }


    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day:
          "2-digit",

        month:
          "long",

        year:
          "numeric",
      }
    ).format(
      new Date(
        value
      )
    );
  }


  if (
    loading
  ) {
    return (
      <div className="newsDetailState">
        Loading article...
      </div>
    );
  }


  if (
    notFound ||
    !item
  ) {
    return (
      <>
        <div className="newsDetailState">
          <div>
            <span>
              AUROS NEWS
            </span>


            <h1>
              Article not found
            </h1>


            <p>
              This news article does not exist or is no longer published.
            </p>


            <Link href="/news">
              ← Back to News
            </Link>
          </div>
        </div>


        <style jsx global>{`
          .newsDetailState {
            min-height: 60vh;
            display: grid;
            place-items: center;
            text-align: center;
          }


          .newsDetailState span {
            color: #63ddff;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.12em;
          }


          .newsDetailState h1 {
            margin: 10px 0;
          }


          .newsDetailState p {
            color: #8ea2c1;
          }


          .newsDetailState a {
            display: inline-block;
            margin-top: 15px;
            color: #63ddff;
            text-decoration: none;
          }
        `}</style>
      </>
    );
  }


  return (
    <>
      <article className="newsDetailPage">
        <Link
          href="/news"
          className="newsBack"
        >
          ← Back to News
        </Link>


        <header className="newsDetailHeader">
          <div className="newsDetailMeta">
            <span
              className={
                item.pinned
                  ? "detailBadge pinned"
                  : "detailBadge"
              }
            >
              {item.pinned
                ? "PINNED NEWS"
                : "AUROS NEWS"}
            </span>


            {item.created_at && (
              <span className="detailDate">
                {formatDate(
                  item.created_at
                )}
              </span>
            )}
          </div>


          <h1>
            {
              item.title
            }
          </h1>


          {item.summary && (
            <p className="newsLead">
              {
                item.summary
              }
            </p>
          )}


          <div className="newsShareActions">
            <ShareActions
              title={
                item.title
              }
              text={
                item.summary
              }
            />
          </div>
        </header>


        {item.image_url && (
          <div className="newsHeroImage">
            <img
              src={
                item.image_url
              }
              alt={
                item.title
              }
            />
          </div>
        )}


        <div className="newsArticleLayout">
          <main className="newsArticleBody">
            {(item.content ??
              "")
              .split(
                "\n"
              )
              .map(
                (
                  paragraph,
                  index
                ) => {
                  const clean =
                    paragraph.trim();


                  if (
                    !clean
                  ) {
                    return (
                      <div
                        key={
                          index
                        }
                        className="articleSpacer"
                      />
                    );
                  }


                  return (
                    <p
                      key={
                        index
                      }
                    >
                      {
                        clean
                      }
                    </p>
                  );
                }
              )}
          </main>


          <aside className="newsArticleSidebar">
            <div className="sidebarCard">
              <span>
                ARTICLE
              </span>


              <strong>
                Auros Royale
              </strong>


              {item.created_at && (
                <small>
                  Published{" "}
                  {formatDate(
                    item.created_at
                  )}
                </small>
              )}
            </div>


            <Link
              href="/news"
              className="sidebarBack"
            >
              More Auros News
              <span>
                →
              </span>
            </Link>
          </aside>
        </div>
      </article>


      <style jsx global>{`
        .newsDetailPage {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
          padding: 32px 0 75px;
        }


        .newsBack {
          display: inline-flex;
          margin-bottom: 30px;
          color: #7f95b5;
          font-size: 10px;
          font-weight: 800;
          text-decoration: none;
          transition: color 0.15s ease;
        }


        .newsBack:hover {
          color: #63ddff;
        }


        .newsDetailHeader {
          max-width: 960px;
          margin-bottom: 28px;
        }


        .newsDetailMeta {
          display: flex;
          align-items: center;
          gap: 11px;
          flex-wrap: wrap;
          margin-bottom: 13px;
        }


        .detailBadge {
          color: #63ddff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.11em;
        }


        .detailBadge.pinned {
          color: #ffd66b;
        }


        .detailDate {
          color: #7086a6;
          font-size: 9px;
        }


        .newsDetailHeader h1 {
          margin: 0;
          font-size: clamp(
            40px,
            7vw,
            74px
          );
          line-height: 1.02;
          letter-spacing: -0.045em;
        }


        .newsLead {
          max-width: 850px;
          margin: 18px 0 0;
          color: #a9b9cf;
          font-size: 18px;
          line-height: 1.65;
        }


        .newsShareActions {
          margin-top: 21px;
        }


        .newsHeroImage {
          overflow: hidden;
          width: 100%;
          margin-bottom: 36px;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.13
            );
          border-radius: 22px;
          background: #030812;
        }


        .newsHeroImage img {
          display: block;
          width: 100%;
          max-height: 680px;
          object-fit: cover;
        }


        .newsArticleLayout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            250px;
          gap: 60px;
          align-items: start;
        }


        .newsArticleBody {
          max-width: 820px;
        }


        .newsArticleBody p {
          margin:
            0
            0
            20px;
          color: #b0bdd0;
          font-size: 15px;
          line-height: 1.85;
        }


        .articleSpacer {
          height: 8px;
        }


        .newsArticleSidebar {
          position: sticky;
          top: 95px;
        }


        .sidebarCard {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 17px;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.12
            );
          border-radius: 15px;
          background: rgba(
            7,
            16,
            32,
            0.74
          );
        }


        .sidebarCard span {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }


        .sidebarCard strong {
          font-size: 13px;
        }


        .sidebarCard small {
          color: #7187a7;
          font-size: 9px;
        }


        .sidebarBack {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          padding: 13px 15px;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.12
            );
          border-radius: 13px;
          color: #a9b9cf;
          background: rgba(
            7,
            16,
            32,
            0.6
          );
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
        }


        .sidebarBack span {
          color: #63ddff;
        }


        .sidebarBack:hover {
          color: white;
          border-color:
            rgba(
              99,
              221,
              255,
              0.25
            );
        }


        @media (
          max-width: 850px
        ) {
          .newsArticleLayout {
            grid-template-columns: 1fr;
            gap: 25px;
          }


          .newsArticleSidebar {
            position: static;
          }
        }


        @media (
          max-width: 650px
        ) {
          .newsDetailPage {
            padding-top: 22px;
          }


          .newsLead {
            font-size: 15px;
          }


          .newsHeroImage {
            border-radius: 15px;
          }


          .newsArticleBody p {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}