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
    ReloadstarContextValue
    | null
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

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const enabled =
      params.get(
        "reloadstar-dev"
      ) === "1";

    setDevMode(
      enabled
    );

    if (enabled) {
      setMode(
        "development"
      );

      setEventTime(
        -1
      );
    }
  }, []);

  useEffect(() => {
    if (
      mode !==
      "realtime"
    ) {
      return;
    }

    function syncRealtime() {
      if (
        !RELOADSTAR_ENABLED
      ) {
        setEventTime(
          -1
        );

        return;
      }

      const now =
        Date.now();

      const eventStart =
        new Date(
          RELOADSTAR_EVENT_START
        ).getTime();

      const release =
        new Date(
          AUROS_RELEASE_TIME
        ).getTime();

      if (
        now <
        eventStart
      ) {
        setEventTime(
          -1
        );

        return;
      }

      if (
        now >=
        release
      ) {
        setEventTime(
          RELOADSTAR_DURATION
        );

        return;
      }

      const seconds =
        (
          now -
          eventStart
        ) /
        1000;

      setEventTime(
        Math.min(
          seconds,
          RELOADSTAR_DURATION
        )
      );
    }

    syncRealtime();

    const interval =
      window.setInterval(
        syncRealtime,
        250
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    mode,
  ]);

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