"use client";

import {
  usePathname,
} from "next/navigation";

import AurosBackground from "./AurosBackground";
import AurosTopbar from "./AurosTopbar";
import AurosFooter from "./AurosFooter";


type PageKey =
  | "home"
  | "map"
  | "news"
  | "gallery"
  | "patchnotes"
  | "status"
  | "faq"
  | "contact"
  | "admin"
  | "dev"
  | "login";


export default function AurosSiteShell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const pathname =
    usePathname();


  /* =========================================================
     APP ROUTES

     AurosChannel is not rendered inside the normal website
     shell.

     This means:
     - no website background
     - no website topbar
     - no max-width container
     - no footer
     - no normal page transition wrapper

     /chat and all future /chat/... routes use their own
     fullscreen application layout.
  ========================================================= */

  const isChatRoute =
    pathname === "/chat" ||
    pathname.startsWith(
      "/chat/"
    );


  if (
    isChatRoute
  ) {
    return (
      <main className="aurosStandaloneApp">
        {children}

        <style jsx global>{`
          html,
          body {
            width:
              100%;

            min-width:
              100%;

            height:
              100%;

            min-height:
              100%;

            margin:
              0;

            padding:
              0;

            overflow:
              hidden;
          }


          body {
            background:
              #070910;
          }


          .aurosStandaloneApp {
            width:
              100vw;

            height:
              100dvh;

            min-width:
              0;

            min-height:
              0;

            margin:
              0;

            padding:
              0;

            overflow:
              hidden;

            background:
              #070910;
          }


          .aurosStandaloneApp
            > * {
            min-width:
              0;
          }
        `}</style>
      </main>
    );
  }


  /* =========================================================
     NORMAL WEBSITE ROUTES
  ========================================================= */

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
            current={
              current
            }
          />


          <div
            key={
              pathname
            }
            className="aurosPageTransition"
          >
            {
              children
            }
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