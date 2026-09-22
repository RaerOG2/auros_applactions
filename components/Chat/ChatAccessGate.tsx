"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import ChatShell from "./ChatShell";

import {
  getSiteAccess,
} from "../../services/access.service";

import {
  getFeatureFlagByKey,
} from "../../services/feature-flag.service";

import {
  canAccessFeature,
} from "../../lib/feature-access";


const AUROS_CHANNEL_FLAG =
  "AUROS_CHANNEL";


type AccessState =
  | "loading"
  | "allowed"
  | "login-required"
  | "restricted"
  | "disabled";


export default function ChatAccessGate() {
  const router =
    useRouter();

  const [
    accessState,
    setAccessState,
  ] =
    useState<AccessState>(
      "loading"
    );


  useEffect(() => {
    let mounted =
      true;


    async function checkAccess() {
      try {
        const [
          access,
          flag,
        ] =
          await Promise.all([
            getSiteAccess(),

            getFeatureFlagByKey(
              AUROS_CHANNEL_FLAG
            ),
          ]);


        if (
          !mounted
        ) {
          return;
        }


        /*
         * Missing flag = disabled.
         *
         * This keeps experimental features closed if their
         * configuration has not been created yet.
         */
        if (
          !flag ||
          !flag.enabled
        ) {
          setAccessState(
            "disabled"
          );

          return;
        }


        /*
         * Everyone flags may also be accessed without an
         * authenticated account.
         *
         * AurosChannel currently still requires an account
         * because ChatShell works with authenticated users.
         */
        if (
          !access.user
        ) {
          setAccessState(
            "login-required"
          );

          return;
        }


        const allowed =
          canAccessFeature(
            flag,
            {
              isLoggedIn:
                true,

              isBeta:
                access.isBeta,

              isDev:
                access.isDev,

              isAdmin:
                access.isAdmin,
            }
          );


        setAccessState(
          allowed
            ? "allowed"
            : "restricted"
        );
      } catch (
        error
      ) {
        console.error(
          "[AurosChannel] Feature access check failed:",
          error
        );


        if (
          mounted
        ) {
          setAccessState(
            "disabled"
          );
        }
      }
    }


    void checkAccess();


    return () => {
      mounted =
        false;
    };
  }, []);


  function goToLogin() {
    router.push(
      "/login?redirect=/chat"
    );
  }


  function goToWebsite() {
    router.push(
      "/"
    );
  }


  if (
    accessState ===
    "allowed"
  ) {
    return (
      <ChatShell />
    );
  }


  if (
    accessState ===
    "loading"
  ) {
    return (
      <AccessPage>
        <p className="aurosWelcomeOverline">
          AUROSCHANNEL ACCESS
        </p>

        <h2 className="aurosWelcomeTitle">
          Checking access...
        </h2>

        <p className="aurosWelcomeText">
          Verifying your Auros
          account and feature
          access.
        </p>
      </AccessPage>
    );
  }


  if (
    accessState ===
    "login-required"
  ) {
    return (
      <AccessPage>
        <p className="aurosWelcomeOverline">
          AUROSCHANNEL
        </p>

        <div className="aurosChannelBetaBadge">
          BETA
        </div>

        <h2 className="aurosWelcomeTitle">
          Login required
        </h2>

        <p className="aurosWelcomeText">
          Sign in with your Auros
          account to check whether
          you currently have access
          to AurosChannel.
        </p>

        <div className="aurosAccessActions">
          <button
            className="aurosAccessPrimary"
            type="button"
            onClick={
              goToLogin
            }
          >
            Login
          </button>

          <button
            className="aurosAccessButton"
            type="button"
            onClick={
              goToWebsite
            }
          >
            Back to Website
          </button>
        </div>
      </AccessPage>
    );
  }


  if (
    accessState ===
    "restricted"
  ) {
    return (
      <AccessPage>
        <p className="aurosWelcomeOverline">
          AUROSCHANNEL
        </p>

        <div className="aurosChannelBetaBadge">
          LIMITED ACCESS
        </div>

        <h2 className="aurosWelcomeTitle">
          AurosChannel is currently
          in Beta
        </h2>

        <p className="aurosWelcomeText">
          Your account does not
          currently have access to
          this feature. AurosChannel
          is being tested with
          selected Beta users,
          developers and
          administrators.
        </p>

        <div className="aurosAccessActions">
          <button
            className="aurosAccessPrimary"
            type="button"
            onClick={
              goToWebsite
            }
          >
            Back to Website
          </button>
        </div>
      </AccessPage>
    );
  }


  return (
    <AccessPage>
      <p className="aurosWelcomeOverline">
        AUROSCHANNEL
      </p>

      <div className="aurosChannelOfflineBadge">
        UNAVAILABLE
      </div>

      <h2 className="aurosWelcomeTitle">
        AurosChannel is currently
        unavailable
      </h2>

      <p className="aurosWelcomeText">
        This feature is currently
        disabled. Check back later
        for updates.
      </p>

      <div className="aurosAccessActions">
        <button
          className="aurosAccessPrimary"
          type="button"
          onClick={
            goToWebsite
          }
        >
          Back to Website
        </button>
      </div>
    </AccessPage>
  );
}


function AccessPage({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <section className="aurosFeatureAccessPage">
      <div className="aurosFeatureAccessGlow aurosFeatureAccessGlowOne" />

      <div className="aurosFeatureAccessGlow aurosFeatureAccessGlowTwo" />


      <div className="aurosAccessCard">
        {children}
      </div>


      <style jsx global>{`
        .aurosFeatureAccessPage {
          position:
            relative;

          width:
            100%;

          min-height:
            100dvh;

          display:
            grid;

          place-items:
            center;

          overflow:
            hidden;

          padding:
            24px;

          background:
            radial-gradient(
              circle
              at
              50%
              -10%,
              rgba(
                99,
                221,
                255,
                0.1
              ),
              transparent
              34%
            ),
            #070910;
        }


        .aurosFeatureAccessGlow {
          position:
            absolute;

          border-radius:
            50%;

          pointer-events:
            none;

          filter:
            blur(
              80px
            );
        }


        .aurosFeatureAccessGlowOne {
          top:
            15%;

          left:
            15%;

          width:
            280px;

          height:
            280px;

          background:
            rgba(
              99,
              221,
              255,
              0.08
            );
        }


        .aurosFeatureAccessGlowTwo {
          right:
            12%;

          bottom:
            12%;

          width:
            320px;

          height:
            320px;

          background:
            rgba(
              139,
              114,
              255,
              0.08
            );
        }


        .aurosAccessCard {
          position:
            relative;

          z-index:
            1;

          width:
            min(
              520px,
              100%
            );

          padding:
            30px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.16
            );

          border-radius:
            24px;

          background:
            rgba(
              8,
              17,
              34,
              0.92
            );

          box-shadow:
            0
            30px
            90px
            rgba(
              0,
              0,
              0,
              0.4
            );

          backdrop-filter:
            blur(
              18px
            );

          text-align:
            center;
        }


        .aurosWelcomeOverline {
          margin:
            0;

          color:
            #63ddff;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.16em;
        }


        .aurosWelcomeTitle {
          margin:
            10px
            0
            10px;

          color:
            #f4f8ff;

          font-size:
            clamp(
              25px,
              5vw,
              38px
            );

          line-height:
            1.08;

          letter-spacing:
            -0.04em;
        }


        .aurosWelcomeText {
          max-width:
            430px;

          margin:
            0
            auto;

          color:
            #7d91b0;

          font-size:
            11px;

          line-height:
            1.7;
        }


        .aurosChannelBetaBadge,
        .aurosChannelOfflineBadge {
          width:
            fit-content;

          margin:
            15px
            auto
            0;

          padding:
            6px
            9px;

          border-radius:
            999px;

          font-size:
            7px;

          font-weight:
            950;

          letter-spacing:
            0.1em;
        }


        .aurosChannelBetaBadge {
          border:
            1px solid
            rgba(
              139,
              114,
              255,
              0.25
            );

          background:
            rgba(
              139,
              114,
              255,
              0.09
            );

          color:
            #b6aaff;
        }


        .aurosChannelOfflineBadge {
          border:
            1px solid
            rgba(
              255,
              112,
              132,
              0.22
            );

          background:
            rgba(
              255,
              112,
              132,
              0.08
            );

          color:
            #ff91a4;
        }


        .aurosAccessActions {
          display:
            flex;

          justify-content:
            center;

          flex-wrap:
            wrap;

          gap:
            9px;

          margin-top:
            22px;
        }


        .aurosAccessPrimary,
        .aurosAccessButton {
          min-height:
            42px;

          padding:
            0
            15px;

          border-radius:
            10px;

          font-family:
            inherit;

          font-size:
            9px;

          font-weight:
            900;

          cursor:
            pointer;
        }


        .aurosAccessPrimary {
          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.32
            );

          background:
            linear-gradient(
              135deg,
              rgba(
                99,
                221,
                255,
                0.17
              ),
              rgba(
                139,
                114,
                255,
                0.13
              )
            );

          color:
            #eafaff;
        }


        .aurosAccessButton {
          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );

          background:
            rgba(
              15,
              29,
              54,
              0.62
            );

          color:
            #94a8c6;
        }


        .aurosAccessPrimary:hover,
        .aurosAccessButton:hover {
          border-color:
            rgba(
              99,
              221,
              255,
              0.4
            );

          color:
            white;
        }


        @media (
          max-width:
            520px
        ) {
          .aurosFeatureAccessPage {
            padding:
              14px;
          }


          .aurosAccessCard {
            padding:
              24px
              18px;
          }


          .aurosAccessActions {
            flex-direction:
              column;
          }


          .aurosAccessActions
            button {
            width:
              100%;
          }
        }


        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .aurosAccessPrimary,
          .aurosAccessButton {
            transition:
              none;
          }
        }
      `}</style>
    </section>
  );
}