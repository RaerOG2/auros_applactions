"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <>
      <section className="notFoundPage">
        <div className="notFoundGlow glowOne" />
        <div className="notFoundGlow glowTwo" />
        <div className="notFoundGrid" />

        <div className="notFoundCard">
          <div className="notFoundCode">
            ERROR 404
          </div>

          <div className="notFoundNumber">
            404
          </div>

          <h1>
            Lost in the Nexus.
          </h1>

          <p>
            This part of Auros doesn&apos;t exist anymore,
            was moved, or was never meant to be found.
          </p>

          <div className="notFoundActions">
            <Link
              href="/"
              className="notFoundPrimary"
            >
              Return Home
            </Link>

            <Link
              href="/map"
              className="notFoundSecondary"
            >
              Explore the Map
            </Link>

            <Link
              href="/news"
              className="notFoundSecondary"
            >
              View News
            </Link>
          </div>

          <div className="notFoundFooter">
            <span>AUROS ROYALE</span>
            <span>THE NEXUS COULD NOT LOCATE THIS PAGE</span>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .notFoundPage {
          position: relative;
          min-height: calc(100vh - 100px);
          display: grid;
          place-items: center;
          overflow: hidden;
          padding: 40px 20px;
        }

        .notFoundGrid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(
              rgba(99, 221, 255, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(99, 221, 255, 0.035) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 18%,
            black 82%,
            transparent
          );
        }

        .notFoundGlow {
          position: absolute;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          opacity: 0.23;
        }

        .glowOne {
          top: 5%;
          left: 5%;
          background: #22d3ee;
        }

        .glowTwo {
          right: 4%;
          bottom: 2%;
          background: #7c3aed;
        }

        .notFoundCard {
          position: relative;
          z-index: 2;
          width: min(100%, 920px);
          padding: 60px 34px 28px;
          text-align: center;
          border: 1px solid rgba(115, 150, 210, 0.16);
          border-radius: 26px;
          background:
            linear-gradient(
              180deg,
              rgba(8, 18, 36, 0.9),
              rgba(5, 12, 25, 0.92)
            );
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);
        }

        .notFoundCode {
          color: #63ddff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }

        .notFoundNumber {
          margin-top: 16px;
          font-size: clamp(100px, 18vw, 190px);
          line-height: 0.8;
          font-weight: 950;
          letter-spacing: -0.08em;
          background:
            linear-gradient(
              110deg,
              #ffffff 15%,
              #63ddff 46%,
              #a07cff 80%
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow:
            0 0 50px rgba(99, 221, 255, 0.08);
        }

        .notFoundCard h1 {
          margin: 26px 0 12px;
          font-size: clamp(31px, 5vw, 50px);
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .notFoundCard > p {
          max-width: 620px;
          margin: 0 auto;
          color: #92a5c3;
          font-size: 14px;
          line-height: 1.7;
        }

        .notFoundActions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 27px;
        }

        .notFoundPrimary,
        .notFoundSecondary {
          display: inline-flex;
          min-height: 42px;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          border-radius: 11px;
          font-size: 10px;
          font-weight: 850;
          text-decoration: none;
          transition:
            transform 0.16s ease,
            border-color 0.16s ease,
            background 0.16s ease;
        }

        .notFoundPrimary {
          border: 1px solid rgba(99, 221, 255, 0.35);
          color: #04101b;
          background:
            linear-gradient(
              90deg,
              #63ddff,
              #94ecff
            );
        }

        .notFoundSecondary {
          border: 1px solid rgba(115, 150, 210, 0.15);
          color: #d8e5f7;
          background: rgba(10, 22, 43, 0.72);
        }

        .notFoundPrimary:hover,
        .notFoundSecondary:hover {
          transform: translateY(-2px);
        }

        .notFoundSecondary:hover {
          border-color: rgba(99, 221, 255, 0.28);
          background: rgba(13, 29, 55, 0.9);
        }

        .notFoundFooter {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 48px;
          padding-top: 17px;
          border-top: 1px solid rgba(115, 150, 210, 0.08);
          color: #4f6688;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: 0.08em;
        }

        @media (max-width: 650px) {
          .notFoundPage {
            padding: 20px 12px;
          }

          .notFoundCard {
            padding: 44px 18px 20px;
            border-radius: 20px;
          }

          .notFoundFooter {
            flex-direction: column;
            align-items: center;
          }

          .notFoundActions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .notFoundPrimary,
          .notFoundSecondary {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .notFoundPrimary,
          .notFoundSecondary {
            transition: none;
          }

          .notFoundPrimary:hover,
          .notFoundSecondary:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}