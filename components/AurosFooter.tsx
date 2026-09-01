"use client";

import Link from "next/link";


export default function AurosFooter() {
  return (
    <>
      <footer className="aurosFooter">
        <div className="aurosFooterGlow aurosFooterGlowOne" />
        <div className="aurosFooterGlow aurosFooterGlowTwo" />

        <div className="aurosFooterInner">
          <div className="aurosFooterTop">
            <div className="aurosFooterBrand">
              <Link
                href="/"
                className="aurosFooterLogo"
              >
                <img
                  src="/auros_royale_pfp_draft_1.png"
                  alt="Auros Royale"
                  className="aurosFooterLogoImage"
                />

                <div className="aurosFooterLogoText">
                  <strong>
                    AUROS ROYALE
                  </strong>

                  <span>
                    OFFICIAL WEBSITE
                  </span>
                </div>
              </Link>

              <p className="aurosFooterDescription">
                The official home of Auros Royale.
                Explore the interactive map, latest
                updates, news, patchnotes and the
                Auros community.
              </p>

              <div className="aurosFooterSocials">
                <a
                  href="https://discord.gg/wYAmfDXJp6"
                  target="_blank"
                  rel="noreferrer"
                  className="aurosSocialButton"
                  aria-label="Join the Auros Discord Server"
                  title="Discord"
                >
                  <DiscordIcon />

                  <span>
                    Discord
                  </span>
                </a>

                <a
                  href="https://x.com/AurosUEFN"
                  target="_blank"
                  rel="noreferrer"
                  className="aurosSocialButton"
                  aria-label="Follow Auros Royale on X"
                  title="X / Twitter"
                >
                  <XIcon />

                  <span>
                    X
                  </span>
                </a>
              </div>
            </div>

            <FooterSection
              title="Explore"
              links={[
                {
                  label:
                    "Home",
                  href:
                    "/",
                },

                {
                  label:
                    "Interactive Map",
                  href:
                    "/map",
                },

                {
                  label:
                    "News",
                  href:
                    "/news",
                },

                {
                  label:
                    "Patchnotes",
                  href:
                    "/patchnotes",
                },

                {
                  label:
                    "Gallery",
                  href:
                    "/gallery",
                },
              ]}
            />

            <FooterSection
              title="Community"
              links={[
                {
                  label:
                    "Apply",
                  href:
                    "/apply",
                },

                {
                  label:
                    "Application Status",
                  href:
                    "/status",
                },

                {
                  label:
                    "FAQ",
                  href:
                    "/faq",
                },

                {
                  label:
                    "Contact",
                  href:
                    "/contact",
                },
              ]}
            />

            <div className="aurosFooterStatusColumn">
              <span className="aurosFooterSectionEyebrow">
                AUROS
              </span>

              <h3>
                Stay connected
              </h3>

              <p>
                Follow development, new updates,
                map changes and announcements
                across the Auros community.
              </p>

              <div className="aurosFooterStatus">
                <span className="aurosFooterStatusDot" />

                <div>
                  <strong>
                    Auros Royale
                  </strong>

                  <small>
                    Official Website
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="aurosFooterDivider" />

          <div className="aurosFooterBottom">
            <div className="aurosFooterCopyright">
              © 2026 Auros. All rights reserved.
            </div>

            <div className="aurosFooterBottomBrand">
              <span className="aurosFooterBottomDot" />

              Auros Royale

              <span className="aurosFooterBottomSeparator">
                •
              </span>

              Official Website
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .aurosFooter {
          position: relative;
          overflow: hidden;

          margin-top: 56px;

          border-top:
            1px solid
            rgba(
              104,
              143,
              197,
              0.13
            );

          background:
            linear-gradient(
              180deg,
              rgba(
                7,
                15,
                30,
                0.9
              )
                0%,
              rgba(
                4,
                10,
                22,
                0.97
              )
                100%
            );

          backdrop-filter:
            blur(
              18px
            );
        }


        .aurosFooterGlow {
          position: absolute;

          border-radius: 999px;

          pointer-events: none;

          filter:
            blur(
              90px
            );
        }


        .aurosFooterGlowOne {
          width: 420px;
          height: 420px;

          left: -190px;
          top: -230px;

          background:
            rgba(
              58,
              195,
              255,
              0.08
            );
        }


        .aurosFooterGlowTwo {
          width: 380px;
          height: 380px;

          right: -150px;
          bottom: -240px;

          background:
            rgba(
              126,
              81,
              255,
              0.08
            );
        }


        .aurosFooterInner {
          position: relative;

          z-index: 2;

          width: min(
            1320px,
            calc(
              100% - 40px
            )
          );

          margin:
            0 auto;

          padding:
            44px
            0
            24px;
        }


        .aurosFooterTop {
          display: grid;

          grid-template-columns:
            minmax(
              280px,
              1.4fr
            )
            minmax(
              150px,
              0.7fr
            )
            minmax(
              160px,
              0.75fr
            )
            minmax(
              220px,
              1fr
            );

          gap:
            42px;
        }


        .aurosFooterBrand {
          max-width:
            390px;
        }


        .aurosFooterLogo {
          width:
            fit-content;

          display:
            inline-flex;

          align-items:
            center;

          gap:
            12px;

          color:
            white;

          text-decoration:
            none;
        }


        .aurosFooterLogoImage {
          width:
            52px;

          height:
            52px;

          display:
            block;

          flex:
            0
            0
            auto;

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

          object-fit:
            cover;

          box-shadow:
            0
            10px
            30px
            rgba(
              0,
              0,
              0,
              0.22
            ),
            0
            0
            24px
            rgba(
              99,
              221,
              255,
              0.05
            );
        }


        .aurosFooterLogoText {
          display:
            flex;

          flex-direction:
            column;
        }


        .aurosFooterLogoText strong {
          color:
            #f4f8ff;

          font-size:
            16px;

          font-weight:
            950;

          letter-spacing:
            0.08em;

          line-height:
            1;
        }


        .aurosFooterLogoText span {
          margin-top:
            5px;

          color:
            #63ddff;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.23em;

          line-height:
            1;
        }


        .aurosFooterDescription {
          max-width:
            360px;

          margin:
            18px
            0
            0;

          color:
            #8196b4;

          font-size:
            13px;

          line-height:
            1.75;
        }


        .aurosFooterSocials {
          display:
            flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap:
            9px;

          margin-top:
            21px;
        }


        .aurosSocialButton {
          min-height:
            39px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            8px;

          padding:
            0
            13px;

          border:
            1px solid
            rgba(
              108,
              146,
              198,
              0.14
            );

          border-radius:
            10px;

          background:
            rgba(
              255,
              255,
              255,
              0.022
            );

          color:
            #9eafc6;

          font-size:
            9px;

          font-weight:
            850;

          text-decoration:
            none;

          transition:
            transform
              150ms
              ease,
            border-color
              150ms
              ease,
            background
              150ms
              ease,
            color
              150ms
              ease,
            box-shadow
              150ms
              ease;
        }


        .aurosSocialButton:hover {
          border-color:
            rgba(
              99,
              221,
              255,
              0.29
            );

          background:
            rgba(
              99,
              221,
              255,
              0.055
            );

          color:
            #d9f7ff;

          box-shadow:
            0
            8px
            26px
            rgba(
              46,
              181,
              233,
              0.06
            );

          transform:
            translateY(
              -2px
            );
        }


        .aurosSocialButton
          svg {
          width:
            15px;

          height:
            15px;

          flex:
            0
            0
            auto;
        }


        .aurosFooterSection {
          display:
            flex;

          flex-direction:
            column;
        }


        .aurosFooterSectionEyebrow {
          color:
            #63ddff;

          font-size:
            7px;

          font-weight:
            950;

          letter-spacing:
            0.15em;
        }


        .aurosFooterSection h3,
        .aurosFooterStatusColumn h3 {
          margin:
            5px
            0
            0;

          color:
            #dce7f8;

          font-size:
            13px;

          font-weight:
            900;
        }


        .aurosFooterLinks {
          display:
            grid;

          gap:
            10px;

          margin-top:
            16px;
        }


        .aurosFooterLink {
          position:
            relative;

          width:
            fit-content;

          color:
            #8da0bc;

          font-size:
            11px;

          font-weight:
            700;

          text-decoration:
            none;

          transition:
            color
              140ms
              ease,
            transform
              140ms
              ease;
        }


        .aurosFooterLink::before {
          content:
            "";

          position:
            absolute;

          left:
            -10px;

          top:
            50%;

          width:
            4px;

          height:
            4px;

          border-radius:
            50%;

          background:
            #63ddff;

          opacity:
            0;

          transform:
            translateY(
              -50%
            );

          transition:
            opacity
              140ms
              ease;
        }


        .aurosFooterLink:hover {
          color:
            #d9f6ff;

          transform:
            translateX(
              4px
            );
        }


        .aurosFooterLink:hover::before {
          opacity:
            1;
        }


        .aurosFooterStatusColumn {
          min-width:
            0;
        }


        .aurosFooterStatusColumn p {
          max-width:
            270px;

          margin:
            13px
            0
            0;

          color:
            #7f93af;

          font-size:
            11px;

          line-height:
            1.65;
        }


        .aurosFooterStatus {
          display:
            flex;

          align-items:
            center;

          gap:
            10px;

          margin-top:
            18px;

          padding:
            11px
            12px;

          border:
            1px solid
            rgba(
              104,
              143,
              197,
              0.1
            );

          border-radius:
            11px;

          background:
            rgba(
              255,
              255,
              255,
              0.018
            );
        }


        .aurosFooterStatusDot {
          width:
            8px;

          height:
            8px;

          flex:
            0
            0
            auto;

          border-radius:
            50%;

          background:
            #4fdfa4;

          box-shadow:
            0
            0
            14px
            rgba(
              79,
              223,
              164,
              0.55
            );
        }


        .aurosFooterStatus div {
          display:
            flex;

          min-width:
            0;

          flex-direction:
            column;
        }


        .aurosFooterStatus strong {
          color:
            #bfcee1;

          font-size:
            9px;
        }


        .aurosFooterStatus small {
          margin-top:
            2px;

          color:
            #637997;

          font-size:
            7px;

          font-weight:
            700;
        }


        .aurosFooterDivider {
          height:
            1px;

          margin:
            34px
            0
            18px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(
                104,
                143,
                197,
                0.17
              )
                12%,
              rgba(
                104,
                143,
                197,
                0.17
              )
                88%,
              transparent
            );
        }


        .aurosFooterBottom {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            18px;

          flex-wrap:
            wrap;
        }


        .aurosFooterCopyright {
          color:
            #667b99;

          font-size:
            9px;

          font-weight:
            650;
        }


        .aurosFooterBottomBrand {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            7px;

          color:
            #6e839f;

          font-size:
            8px;

          font-weight:
            750;
        }


        .aurosFooterBottomDot {
          width:
            5px;

          height:
            5px;

          border-radius:
            50%;

          background:
            #63ddff;

          box-shadow:
            0
            0
            10px
            rgba(
              99,
              221,
              255,
              0.65
            );
        }


        .aurosFooterBottomSeparator {
          color:
            #3c516d;
        }


        @media (
          max-width:
            1050px
        ) {
          .aurosFooterTop {
            grid-template-columns:
              minmax(
                280px,
                1.3fr
              )
              1fr
              1fr;

            gap:
              34px;
          }


          .aurosFooterStatusColumn {
            grid-column:
              1
              /
              -1;

            display:
              grid;

            grid-template-columns:
              minmax(
                0,
                1fr
              )
              auto;

            column-gap:
              30px;

            align-items:
              end;
          }


          .aurosFooterStatusColumn
            > .aurosFooterSectionEyebrow,
          .aurosFooterStatusColumn
            > h3,
          .aurosFooterStatusColumn
            > p {
            grid-column:
              1;
          }


          .aurosFooterStatus {
            grid-column:
              2;

            grid-row:
              1
              /
              span
              3;

            min-width:
              210px;

            margin-top:
              0;
          }
        }


        @media (
          max-width:
            760px
        ) {
          .aurosFooter {
            margin-top:
              40px;
          }


          .aurosFooterInner {
            width:
              min(
                100% - 28px,
                1320px
              );

            padding-top:
              34px;
          }


          .aurosFooterTop {
            grid-template-columns:
              1fr
              1fr;

            gap:
              32px
              24px;
          }


          .aurosFooterBrand {
            grid-column:
              1
              /
              -1;

            max-width:
              none;
          }


          .aurosFooterDescription {
            max-width:
              500px;
          }


          .aurosFooterStatusColumn {
            grid-column:
              1
              /
              -1;

            display:
              block;
          }


          .aurosFooterStatus {
            width:
              fit-content;

            min-width:
              210px;

            margin-top:
              16px;
          }
        }


        @media (
          max-width:
            520px
        ) {
          .aurosFooterTop {
            grid-template-columns:
              1fr;
          }


          .aurosFooterBrand,
          .aurosFooterStatusColumn {
            grid-column:
              auto;
          }


          .aurosFooterLogoImage {
            width:
              46px;

            height:
              46px;

            border-radius:
              13px;
          }


          .aurosFooterLogoText strong {
            font-size:
              14px;
          }


          .aurosFooterLogoText span {
            font-size:
              7px;
          }


          .aurosFooterBottom {
            align-items:
              flex-start;

            flex-direction:
              column;
          }


          .aurosFooterSocials {
            width:
              100%;
          }


          .aurosSocialButton {
            flex:
              1;
          }


          .aurosFooterStatus {
            width:
              100%;

            box-sizing:
              border-box;
          }
        }


        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .aurosSocialButton,
          .aurosFooterLink,
          .aurosFooterLink::before {
            transition:
              none;
          }


          .aurosSocialButton:hover,
          .aurosFooterLink:hover {
            transform:
              none;
          }
        }
      `}</style>
    </>
  );
}


function FooterSection({
  title,
  links,
}: {
  title: string;

  links: Array<{
    label: string;
    href: string;
  }>;
}) {
  return (
    <div className="aurosFooterSection">
      <span className="aurosFooterSectionEyebrow">
        NAVIGATION
      </span>

      <h3>
        {
          title
        }
      </h3>

      <div className="aurosFooterLinks">
        {links.map(
          (
            link
          ) => (
            <Link
              key={
                link.href
              }
              href={
                link.href
              }
              className="aurosFooterLink"
            >
              {
                link.label
              }
            </Link>
          )
        )}
      </div>
    </div>
  );
}


function DiscordIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.54 5.34A17.06 17.06 0 0 0 15.34 4l-.2.41a15.17 15.17 0 0 1 3.74 1.45 12.84 12.84 0 0 0-13.76 0A15.17 15.17 0 0 1 8.86 4.4L8.66 4a17.1 17.1 0 0 0-4.2 1.35C1.8 9.33 1.08 13.2 1.44 17.02a17.02 17.02 0 0 0 5.16 2.61l1.25-1.7a11.1 11.1 0 0 1-1.97-.94l.48-.36a12.3 12.3 0 0 0 11.28 0l.48.36c-.63.37-1.29.68-1.97.94l1.25 1.7a17 17 0 0 0 5.16-2.61c.43-4.43-.73-8.27-3.02-11.68ZM8.42 14.7c-1.03 0-1.87-.95-1.87-2.12 0-1.17.82-2.12 1.87-2.12 1.05 0 1.89.96 1.87 2.12 0 1.17-.82 2.12-1.87 2.12Zm7.16 0c-1.03 0-1.87-.95-1.87-2.12 0-1.17.82-2.12 1.87-2.12 1.05 0 1.89.96 1.87 2.12 0 1.17-.82 2.12-1.87 2.12Z" />
    </svg>
  );
}


function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.25-8.29L2.96 2H9.36l4.42 5.84L18.9 2Zm-1.09 17.84h1.72L8.42 4.05H6.58l11.23 15.79Z" />
    </svg>
  );
}