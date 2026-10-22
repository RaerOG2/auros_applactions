"use client";

import {
  useEffect,
  useRef,
} from "react";

import ReloadstarAudioController from "./ReloadstarAudioController";
import ReloadstarDevPanel from "./ReloadstarDevPanel";
import ReloadstarOverlay from "./ReloadstarOverlay";

import ReloadstarProvider, {
  useReloadstar,
} from "./ReloadstarProvider";

import type {
  PublicReleaseInfo,
} from "./types";


export default function ReloadstarRoot({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <ReloadstarProvider>
      <ReloadstarExperience>
        {children}
      </ReloadstarExperience>
    </ReloadstarProvider>
  );
}


function ReloadstarExperience({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const {
    phase,
    eventTime,
  } =
    useReloadstar();


  const arrivalShake =
    phase ===
      "nexus_arrival" &&
    eventTime >= 2 &&
    eventTime <= 13;


  const launchShake =
    phase ===
      "nexus_arrival" &&
    eventTime >= 6 &&
    eventTime <= 11.5;


  const destabilizing =
    phase ===
    "destabilizing";


  const explosion =
    phase ===
    "explosion";


  return (
    <>
      {/*
       * Automatically connects the public
       * release API to the actual DESTINY
       * event runtime.
       */}
      <ReloadstarAutoStart />


      <div
        className={[
          "reloadstarWebsite",

          arrivalShake
            ? "reloadstarWebsiteArrivalShake"
            : "",

          launchShake
            ? "reloadstarWebsiteLaunchShake"
            : "",

          destabilizing
            ? "reloadstarWebsiteUnstable"
            : "",

          explosion
            ? "reloadstarWebsiteExplosion"
            : "",
        ]
          .filter(
            Boolean
          )
          .join(" ")}
      >
        {children}
      </div>


      <ReloadstarOverlay />

      <ReloadstarAudioController />

      <ReloadstarDevPanel />
    </>
  );
}


/* =========================================================
   AUTOMATIC DESTINY START
========================================================= */

function ReloadstarAutoStart() {
  const {
    eventTime,
    duration,

    start,
    pause,

    jumpToTime,
  } =
    useReloadstar();


  /*
   * Always keep the latest eventTime available
   * without restarting the synchronization effect.
   */
  const eventTimeRef =
    useRef(
      eventTime
    );


  useEffect(() => {
    eventTimeRef.current =
      eventTime;
  }, [
    eventTime,
  ]);


  useEffect(() => {
    /*
     * Manual Event Dev mode must remain fully manual.
     *
     * Old / familiar dev URL:
     * ?reloadstar-dev=1
     *
     * Dedicated event-dev URL:
     * ?reloadstar-event-dev=1
     *
     * Both disable the automatic release bridge so the
     * ReloadstarDevPanel has full control over the event.
     */
    const params =
      new URLSearchParams(
        window.location.search
      );


    const manualEventDev =
      params.get(
        "reloadstar-dev"
      ) === "1" ||
      params.get(
        "reloadstar-event-dev"
      ) === "1";


    if (
      manualEventDev
    ) {
      return;
    }


    let active =
      true;


    let timeout:
      number | null =
      null;


    /*
     * Whether this bridge has already
     * started the current live event.
     */
    let eventStarted =
      false;


    function schedule(
      delay: number
    ) {
      if (
        !active
      ) {
        return;
      }


      if (
        timeout !==
        null
      ) {
        window.clearTimeout(
          timeout
        );
      }


      timeout =
        window.setTimeout(
          syncReleaseState,
          delay
        );
    }


    async function syncReleaseState() {
      if (
        !active
      ) {
        return;
      }


      let nextCheck =
        5_000;


      try {
        const response =
          await fetch(
            `/api/release?t=${Date.now()}`,
            {
              cache:
                "no-store",

              headers: {
                "Cache-Control":
                  "no-cache",
              },
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


        if (
          !active
        ) {
          return;
        }


        const serverNow =
          new Date(
            data.serverTime
          ).getTime();


        const eventStart =
          new Date(
            data.eventStartsAt
          ).getTime();


        const releaseAt =
          new Date(
            data.releaseAt
          ).getTime();


        /*
         * =======================================
         * BEFORE DESTINY
         * =======================================
         */

        if (
          data.state ===
          "pre_release"
        ) {
          eventStarted =
            false;


          /*
           * Only reset when an old Event state
           * is actually still active.
           */
          if (
            eventTimeRef.current >=
              0 &&
            eventTimeRef.current <
              duration
          ) {
            pause();

            jumpToTime(
              -1
            );
          }


          const untilEvent =
            eventStart -
            serverNow;


          /*
           * Normal polling.
           */
          nextCheck =
            10_000;


          /*
           * Final minute.
           */
          if (
            untilEvent <=
            60_000
          ) {
            nextCheck =
              1_000;
          }


          /*
           * Final 10 seconds.
           *
           * We check four times a second
           * so DESTINY starts nearly exactly
           * on the configured timestamp.
           */
          if (
            untilEvent <=
            10_000
          ) {
            nextCheck =
              250;
          }


          return;
        }


        /*
         * =======================================
         * DESTINY IS LIVE
         * =======================================
         */

        if (
          data.state ===
          "live_event"
        ) {
          const elapsed =
            Math.max(
              0,
              Math.min(
                (
                  serverNow -
                  eventStart
                ) /
                  1000,

                duration -
                  0.001
              )
            );


          const current =
            eventTimeRef.current;


          /*
           * Start immediately when the API says
           * LIVE EVENT.
           *
           * This uses the already existing and
           * tested manual Event Runtime.
           */
          if (
            !eventStarted ||
            current < 0
          ) {
            jumpToTime(
              elapsed
            );

            start();

            eventStarted =
              true;
          }


          /*
           * Re-sync meaningful clock drift.
           *
           * Normal animation continues locally
           * between these checks.
           */
          else if (
            Math.abs(
              current -
              elapsed
            ) >
            2
          ) {
            jumpToTime(
              elapsed
            );

            start();
          }


          /*
           * Once DESTINY is running we only need
           * occasional server synchronization.
           */
          nextCheck =
            2_000;


          return;
        }


        /*
         * =======================================
         * AUROS 1.3 RELEASED
         * =======================================
         */

        if (
          data.state ===
          "released"
        ) {
          eventStarted =
            false;


          /*
           * End the event and force phase:
           *
           * released
           */
          pause();


          if (
            eventTimeRef.current !==
            duration
          ) {
            jumpToTime(
              duration
            );
          }


          nextCheck =
            30_000;


          return;
        }


        /*
         * Unknown API state.
         */
        console.warn(
          "[DESTINY Auto Start] Unknown release state:",
          data.state
        );


        nextCheck =
          2_000;
      } catch (
        error
      ) {
        console.error(
          "[DESTINY Auto Start]",
          error
        );


        /*
         * Temporary API/network problem:
         * try again shortly.
         */
        nextCheck =
          2_000;
      } finally {
        schedule(
          nextCheck
        );
      }
    }


    /*
     * First check happens immediately.
     */
    void syncReleaseState();


    /*
     * If somebody switches back to the
     * website during the event, sync
     * immediately instead of waiting.
     */
    function handleVisibility() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        void syncReleaseState();
      }
    }


    function handleFocus() {
      void syncReleaseState();
    }


    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );


    window.addEventListener(
      "focus",
      handleFocus
    );


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


      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );


      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [
    duration,
    jumpToTime,
    pause,
    start,
  ]);


  return null;
}