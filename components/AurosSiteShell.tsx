"use client";

import { usePathname } from "next/navigation";

import AurosBackground from "./AurosBackground";
import AurosTopbar from "./AurosTopbar";
import AurosFooter from "./AurosFooter";

type PageKey =
  | "home"
  | "map"
  | "news"
  | "gallery"
  | "patchnotes"
  | "apply"
  | "status"
  | "faq"
  | "contact"
  | "admin"
  | "dev"
  | "login";

export default function AurosSiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname =
    usePathname();

  const current:
    | PageKey
    | undefined =
    pathname === "/"
      ? "home"
      : pathname.startsWith(
          "/map"
        )
      ? "map"
      : pathname.startsWith(
          "/news"
        )
      ? "news"
      : pathname.startsWith(
          "/gallery"
        )
      ? "gallery"
      : pathname.startsWith(
          "/patchnotes"
        )
      ? "patchnotes"
      : pathname.startsWith(
          "/apply"
        )
      ? "apply"
      : pathname.startsWith(
          "/status"
        )
      ? "status"
      : pathname.startsWith(
          "/faq"
        )
      ? "faq"
      : pathname.startsWith(
          "/contact"
        )
      ? "contact"
      : pathname.startsWith(
          "/dev"
        )
      ? "dev"
      : pathname.startsWith(
          "/admin"
        )
      ? "admin"
      : pathname.startsWith(
          "/login"
        )
      ? "login"
      : undefined;

  return (
    <>
      <AurosBackground />

      <main className="aurosSiteMain">
        <div className="aurosSiteContainer">
          <AurosTopbar
            current={current}
          />

          <div
            key={pathname}
            className="aurosPageTransition"
          >
            {children}
          </div>
        </div>

        <AurosFooter />
      </main>

      <style jsx global>{`
        .aurosSiteMain {
          position:
            relative;

          z-index:
            1;

          min-height:
            100vh;

          display:
            flex;

          flex-direction:
            column;

          padding:
            24px
            20px
            56px;
        }

        .aurosSiteContainer {
          width:
            100%;

          max-width:
            1280px;

          flex:
            1;

          margin:
            0
            auto;
        }

        .aurosPageTransition {
          animation:
            aurosPageEnter
            190ms
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            )
            both;
        }

        @keyframes aurosPageEnter {
          from {
            opacity:
              0.72;

            transform:
              translate3d(
                12px,
                0,
                0
              );
          }

          to {
            opacity:
              1;

            transform:
              translate3d(
                0,
                0,
                0
              );
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .aurosPageTransition {
            animation:
              none;
          }
        }

        @media (
          max-width:
            700px
        ) {
          .aurosSiteMain {
            padding:
              16px
              12px
              40px;
          }
        }
      `}</style>
    </>
  );
}