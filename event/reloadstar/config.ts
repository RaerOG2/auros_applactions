import type {
  ReloadstarPhase,
  ReloadstarTimelineEntry,
} from "./types";

export const RELOADSTAR_DEV_NAME = "reloadstar";

export const RELOADSTAR_EVENT_START = "2026-10-10T19:55:00+02:00";

export const AUROS_RELEASE_TIME = "2026-10-10T20:00:00+02:00";

export const RELOADSTAR_DURATION = 300;

export const RELOADSTAR_ENABLED = true;

export const RELOADSTAR_TIMELINE: ReloadstarTimelineEntry[] = [
  { phase: "nexus_arrival", start: 0, label: "Nexus Arrival" },
  { phase: "destabilizing", start: 35, label: "Destabilizing" },
  { phase: "explosion", start: 60, label: "Explosion" },
  { phase: "blackout", start: 66, label: "Blackout" },
  { phase: "recovery", start: 75, label: "Recovery" },
  { phase: "release_video", start: 155, label: "Release Video" },
  { phase: "world_return", start: 215, label: "World Return" },

  // Website reconstruction sequence
  { phase: "reconstruction", start: 235, label: "Reconstruction" },

  // Final release countdown
  { phase: "unlocking", start: 270, label: "Unlocking" },

  { phase: "released", start: 300, label: "Released" },
];

export function getReloadstarPhase(
  eventTime: number
): ReloadstarPhase {
  if (eventTime < 0) {
    return "inactive";
  }

  let phase: ReloadstarPhase =
    "nexus_arrival";

  for (const entry of RELOADSTAR_TIMELINE) {
    if (eventTime >= entry.start) {
      phase = entry.phase;
    }
  }

  return phase;
}

export function getReloadstarPhaseStart(
  phase: ReloadstarPhase
) {
  if (phase === "inactive") {
    return 0;
  }

  return (
    RELOADSTAR_TIMELINE.find(
      (entry) => entry.phase === phase
    )?.start ?? 0
  );
}

export function getReloadstarPhaseLabel(
  phase: ReloadstarPhase
) {
  if (phase === "inactive") {
    return "Inactive";
  }

  return (
    RELOADSTAR_TIMELINE.find(
      (entry) => entry.phase === phase
    )?.label ?? phase
  );
}