"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AUROS_RELEASE_TIME,
  RELOADSTAR_DURATION,
  RELOADSTAR_ENABLED,
  RELOADSTAR_EVENT_START,
  getReloadstarPhase,
  getReloadstarPhaseStart,
} from "./config";

import type {
  PublicReleaseInfo,
  ReloadstarPhase,
  ReloadstarRuntimeMode,
  ReloadstarSpeed,
} from "./types";

type ReloadstarContextValue = {
  mode:
    ReloadstarRuntimeMode;

  phase:
    ReloadstarPhase;

  eventTime:
    number;

  duration:
    number;

  progress:
    number;

  speed:
    ReloadstarSpeed;

  running:
    boolean;

  devMode:
    boolean;

  start: () => void;
  pause: () => void;
  reset: () => void;

  setSpeed: (
    speed: ReloadstarSpeed
  ) => void;

  jumpToPhase: (
    phase: ReloadstarPhase
  ) => void;

  jumpToTime: (
    seconds: number
  ) => void;

  useRealtime: () => void;
  useDevelopment: () => void;
};

const ReloadstarContext =
  createContext<
    ReloadstarContextValue |
    null
  >(null);

export default function ReloadstarProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const [
    mode,
    setMode,
  ] =
    useState<
      ReloadstarRuntimeMode
    >("realtime");

  const [
    devMode,
    setDevMode,
  ] =
    useState(false);

  const [
    eventTime,
    setEventTime,
  ] =
    useState(-1);

  const [
    running,
    setRunning,
  ] =
    useState(false);

  const [
    speed,
    setSpeedState,
  ] =
    useState<
      ReloadstarSpeed
    >(1);

  const lastFrameRef =
    useRef<number | null>(
      null
    );

  /*
   * =========================================================
   * URL / DEVELOPMENT MODE
   * =========================================================
   *
   * The old Reloadstar dev URL is supported again:
   *
   * ?reloadstar-dev=1
   *
   * The dedicated event-dev URL also remains available:
   *
   * ?reloadstar-event-dev=1
   *
   * In either mode the automatic clock is disabled and the
   * existing ReloadstarDevPanel controls the event manually.
   */
  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const eventDevEnabled =
      params.get(
        "reloadstar-dev"
      ) === "1" ||
      params.get(
        "reloadstar-event-dev"
      ) === "1";

    setDevMode(
      eventDevEnabled
    );

    if (
      eventDevEnabled
    ) {
      /*
       * Manual Event Mode:
       * - no release clock
       * - no automatic start
       * - old Dev Panel has full control
       */
      setMode(
        "development"
      );

      setRunning(
        false
      );

      setSpeedState(
        1
      );

      setEventTime(
        -1
      );

      return;
    }

    /*
     * Normal production mode:
     * the real event follows /api/release + release time.
     */
    setRunning(
      false
    );

    setSpeedState(
      1
    );

    setMode(
      "realtime"
    );
  }, []);

  /*
   * =========================================================
   * REALTIME EVENT CLOCK
   * =========================================================
   *
   * /api/release is the source of truth.
   *
   * This prevents:
   *
   * Release API = live_event
   * Event Provider = inactive
   *
   * from ever happening again.
   */
  useEffect(() => {
    if (
      mode !==
      "realtime"
    ) {
      return;
    }

    let active =
      true;

    /*
     * Difference between browser clock
     * and server clock.
     */
    let serverOffsetMs =
      0;

    let synced =
      false;

    /*
     * Local fallbacks.
     *
     * After the first API sync these are
     * replaced by the API values.
     */
    let eventStartMs =
      new Date(
        RELOADSTAR_EVENT_START
      ).getTime();

    let releaseMs =
      new Date(
        AUROS_RELEASE_TIME
      ).getTime();

    /*
     * Runs the event clock locally.
     *
     * This allows smooth eventTime updates
     * without constantly calling the API.
     */
    function applyRealtime() {
      if (
        !active
      ) {
        return;
      }

      if (
        !RELOADSTAR_ENABLED
      ) {
        setEventTime(
          -1
        );

        return;
      }

      const now =
        Date.now() +
        (
          synced
            ? serverOffsetMs
            : 0
        );

      /*
       * Before DESTINY.
       */
      if (
        now <
        eventStartMs
      ) {
        setEventTime(
          -1
        );

        return;
      }

      /*
       * AUROS has released.
       */
      if (
        now >=
        releaseMs
      ) {
        setEventTime(
          RELOADSTAR_DURATION
        );

        return;
      }

      /*
       * DESTINY is currently running.
       */
      const seconds =
        (
          now -
          eventStartMs
        ) /
        1000;

      setEventTime(
        Math.max(
          0,
          Math.min(
            seconds,
            RELOADSTAR_DURATION
          )
        )
      );
    }

    /*
     * Synchronize with the same API
     * used by the release card.
     */
    async function syncWithReleaseApi() {
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

        if (
          !active
        ) {
          return;
        }

        /*
         * Synchronize client clock
         * against Vercel/server clock.
         */
        const serverTimeMs =
          new Date(
            data.serverTime
          ).getTime();

        if (
          Number.isFinite(
            serverTimeMs
          )
        ) {
          serverOffsetMs =
            serverTimeMs -
            Date.now();

          synced =
            true;
        }

        /*
         * Take event times directly
         * from the server response.
         */
        const apiEventStartMs =
          new Date(
            data.eventStartsAt
          ).getTime();

        const apiReleaseMs =
          new Date(
            data.releaseAt
          ).getTime();

        if (
          Number.isFinite(
            apiEventStartMs
          )
        ) {
          eventStartMs =
            apiEventStartMs;
        }

        if (
          Number.isFinite(
            apiReleaseMs
          )
        ) {
          releaseMs =
            apiReleaseMs;
        }

        /*
         * IMPORTANT:
         *
         * Trust the API state immediately.
         */

        if (
          data.state ===
          "pre_release"
        ) {
          setEventTime(
            -1
          );

          return;
        }

        if (
          data.state ===
          "released"
        ) {
          setEventTime(
            RELOADSTAR_DURATION
          );

          return;
        }

        /*
         * state === live_event
         *
         * Calculate the exact position
         * in the DESTINY timeline.
         */
        applyRealtime();
      } catch (
        error
      ) {
        console.error(
          "[DESTINY Runtime] Failed to sync release clock:",
          error
        );

        /*
         * If the API is temporarily unavailable,
         * fall back to config + browser time.
         */
        applyRealtime();
      }
    }

    /*
     * Initial sync immediately when
     * the website loads.
     */
    void syncWithReleaseApi();

    /*
     * Smooth event clock.
     *
     * We do NOT request the server
     * every 100ms.
     */
    const clockInterval =
      window.setInterval(
        applyRealtime,
        100
      );

    /*
     * Correct clock drift and make
     * sure API/Event state stay synced.
     */
    const serverSyncInterval =
      window.setInterval(
        () => {
          void syncWithReleaseApi();
        },
        5_000
      );

    /*
     * Immediately sync again when a
     * user returns to the browser tab.
     */
    function handleVisibility() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        void syncWithReleaseApi();
      }
    }

    function handleFocus() {
      void syncWithReleaseApi();
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      active =
        false;

      window.clearInterval(
        clockInterval
      );

      window.clearInterval(
        serverSyncInterval
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [
    mode,
  ]);

  /*
   * =========================================================
   * DEVELOPMENT TIMELINE
   * =========================================================
   */
  useEffect(() => {
    if (
      mode !==
        "development" ||
      !running
    ) {
      lastFrameRef.current =
        null;

      return;
    }

    let animationFrame =
      0;

    const tick = (
      timestamp: number
    ) => {
      if (
        lastFrameRef.current ===
        null
      ) {
        lastFrameRef.current =
          timestamp;
      }

      const delta =
        (
          timestamp -
          lastFrameRef.current
        ) /
        1000;

      lastFrameRef.current =
        timestamp;

      setEventTime(
        (current) => {
          const base =
            current < 0
              ? 0
              : current;

          const next =
            base +
            delta *
              speed;

          if (
            next >=
            RELOADSTAR_DURATION
          ) {
            return RELOADSTAR_DURATION;
          }

          return next;
        }
      );

      animationFrame =
        window.requestAnimationFrame(
          tick
        );
    };

    animationFrame =
      window.requestAnimationFrame(
        tick
      );

    return () => {
      window.cancelAnimationFrame(
        animationFrame
      );

      lastFrameRef.current =
        null;
    };
  }, [
    mode,
    running,
    speed,
  ]);

  /*
   * Stop the manual timeline when
   * reaching the end.
   */
  useEffect(() => {
    if (
      mode ===
        "development" &&
      eventTime >=
        RELOADSTAR_DURATION
    ) {
      setRunning(
        false
      );
    }
  }, [
    eventTime,
    mode,
  ]);

  /*
   * =========================================================
   * CURRENT PHASE
   * =========================================================
   */
  const phase =
    useMemo(
      () =>
        getReloadstarPhase(
          eventTime
        ),
      [
        eventTime,
      ]
    );

  /*
   * =========================================================
   * EVENT PROGRESS
   * =========================================================
   */
  const progress =
    useMemo(
      () => {
        if (
          eventTime <= 0
        ) {
          return 0;
        }

        return Math.min(
          1,
          eventTime /
            RELOADSTAR_DURATION
        );
      },
      [
        eventTime,
      ]
    );

  /*
   * =========================================================
   * DEVELOPMENT CONTROLS
   * =========================================================
   */
  const start =
    useCallback(
      () => {
        setMode(
          "development"
        );

        setEventTime(
          (current) =>
            current < 0 ||
            current >=
              RELOADSTAR_DURATION
              ? 0
              : current
        );

        setRunning(
          true
        );
      },
      []
    );

  const pause =
    useCallback(
      () => {
        setRunning(
          false
        );
      },
      []
    );

  const reset =
    useCallback(
      () => {
        setMode(
          "development"
        );

        setRunning(
          false
        );

        setSpeedState(
          1
        );

        setEventTime(
          -1
        );
      },
      []
    );

  const changeSpeed =
    useCallback(
      (
        nextSpeed:
          ReloadstarSpeed
      ) => {
        setMode(
          "development"
        );

        setSpeedState(
          nextSpeed
        );
      },
      []
    );

  const jumpToTime =
    useCallback(
      (
        seconds:
          number
      ) => {
        setMode(
          "development"
        );

        setRunning(
          false
        );

        setEventTime(
          Math.max(
            -1,
            Math.min(
              seconds,
              RELOADSTAR_DURATION
            )
          )
        );
      },
      []
    );

  const jumpToPhase =
    useCallback(
      (
        nextPhase:
          ReloadstarPhase
      ) => {
        if (
          nextPhase ===
          "inactive"
        ) {
          jumpToTime(
            -1
          );

          return;
        }

        jumpToTime(
          getReloadstarPhaseStart(
            nextPhase
          )
        );
      },
      [
        jumpToTime,
      ]
    );

  const useRealtime =
    useCallback(
      () => {
        setRunning(
          false
        );

        setMode(
          "realtime"
        );
      },
      []
    );

  const useDevelopment =
    useCallback(
      () => {
        setRunning(
          false
        );

        setMode(
          "development"
        );
      },
      []
    );

  /*
   * =========================================================
   * CONTEXT VALUE
   * =========================================================
   */
  const value =
    useMemo<
      ReloadstarContextValue
    >(
      () => ({
        mode,
        phase,
        eventTime,

        duration:
          RELOADSTAR_DURATION,

        progress,

        speed,
        running,
        devMode,

        start,
        pause,
        reset,

        setSpeed:
          changeSpeed,

        jumpToPhase,
        jumpToTime,

        useRealtime,
        useDevelopment,
      }),
      [
        mode,
        phase,
        eventTime,
        progress,
        speed,
        running,
        devMode,
        start,
        pause,
        reset,
        changeSpeed,
        jumpToPhase,
        jumpToTime,
        useRealtime,
        useDevelopment,
      ]
    );

  return (
    <ReloadstarContext.Provider
      value={
        value
      }
    >
      {children}
    </ReloadstarContext.Provider>
  );
}

export function useReloadstar() {
  const context =
    useContext(
      ReloadstarContext
    );

  if (
    !context
  ) {
    throw new Error(
      "useReloadstar must be used inside ReloadstarProvider."
    );
  }

  return context;
}