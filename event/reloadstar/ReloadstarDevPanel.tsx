"use client";

import {
  useState,
} from "react";

import {
  getReloadstarPhaseLabel,
  RELOADSTAR_TIMELINE,
} from "./config";

import {
  useReloadstar,
} from "./ReloadstarProvider";

import type {
  ReloadstarSpeed,
} from "./types";

const SPEEDS:
  ReloadstarSpeed[] =
  [
    1,
    5,
    20,
    60,
  ];

export default function ReloadstarDevPanel() {
  const [
    open,
    setOpen,
  ] =
    useState(false);

  const {
    devMode,
    mode,
    phase,
    eventTime,
    duration,
    progress,
    speed,
    running,

    start,
    pause,
    reset,
    setSpeed,
    jumpToPhase,
    useRealtime,
    useDevelopment,
  } =
    useReloadstar();

  if (
    !devMode
  ) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="reloadstarDevTrigger"
        onClick={() =>
          setOpen(
            (value) =>
              !value
          )
        }
      >
        <span className="reloadstarDevTriggerDot" />

        RELOADSTAR DEV
      </button>

      {open && (
        <aside className="reloadstarDevPanel">
          <div className="reloadstarDevHeader">
            <div>
              <small>
                AUROS EVENT CONTROL
              </small>

              <strong>
                RELOADSTAR
              </strong>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(
                  false
                )
              }
              className="reloadstarDevClose"
            >
              ×
            </button>
          </div>

          <div className="reloadstarDevInfo">
            <Info
              label="MODE"
              value={
                mode.toUpperCase()
              }
            />

            <Info
              label="PHASE"
              value={
                getReloadstarPhaseLabel(
                  phase
                ).toUpperCase()
              }
            />

            <Info
              label="TIME"
              value={`${formatTime(
                eventTime
              )} / ${formatTime(
                duration
              )}`}
            />
          </div>

          <div className="reloadstarDevProgress">
            <span
              style={{
                width:
                  `${progress * 100}%`,
              }}
            />
          </div>

          <div className="reloadstarDevActions">
            <button
              type="button"
              onClick={
                running
                  ? pause
                  : start
              }
            >
              {running
                ? "PAUSE"
                : "START"}
            </button>

            <button
              type="button"
              onClick={
                reset
              }
            >
              RESET
            </button>
          </div>

          <DevSection
            title="SPEED"
          >
            <div className="reloadstarDevSpeedGrid">
              {SPEEDS.map(
                (
                  item
                ) => (
                  <button
                    key={
                      item
                    }
                    type="button"
                    className={
                      speed ===
                      item
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSpeed(
                        item
                      )
                    }
                  >
                    {item}×
                  </button>
                )
              )}
            </div>
          </DevSection>

          <DevSection
            title="JUMP TO"
          >
            <div className="reloadstarDevPhaseList">
              <button
                type="button"
                onClick={() =>
                  jumpToPhase(
                    "inactive"
                  )
                }
              >
                <span>
                  --:--
                </span>

                INACTIVE
              </button>

              {RELOADSTAR_TIMELINE.map(
                (
                  entry
                ) => (
                  <button
                    key={
                      entry.phase
                    }
                    type="button"
                    className={
                      phase ===
                      entry.phase
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      jumpToPhase(
                        entry.phase
                      )
                    }
                  >
                    <span>
                      {formatTime(
                        entry.start
                      )}
                    </span>

                    {entry.label}
                  </button>
                )
              )}
            </div>
          </DevSection>

          <DevSection
            title="RUNTIME"
          >
            <div className="reloadstarDevRuntime">
              <button
                type="button"
                className={
                  mode ===
                  "development"
                    ? "active"
                    : ""
                }
                onClick={
                  useDevelopment
                }
              >
                DEVELOPMENT
              </button>

              <button
                type="button"
                className={
                  mode ===
                  "realtime"
                    ? "active"
                    : ""
                }
                onClick={
                  useRealtime
                }
              >
                REAL TIME
              </button>
            </div>
          </DevSection>
        </aside>
      )}
    </>
  );
}

function Info({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div>
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function DevSection({
  title,
  children,
}: {
  title:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <section className="reloadstarDevSection">
      <h3>
        {title}
      </h3>

      {children}
    </section>
  );
}

function formatTime(
  seconds:
    number
) {
  if (
    seconds < 0
  ) {
    return "--:--";
  }

  const safe =
    Math.max(
      0,
      Math.floor(
        seconds
      )
    );

  const minutes =
    Math.floor(
      safe /
        60
    );

  const remaining =
    safe %
    60;

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    remaining
  ).padStart(
    2,
    "0"
  )}`;
}