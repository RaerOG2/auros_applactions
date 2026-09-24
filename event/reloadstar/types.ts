export type AurosReleaseState =
  | "pre_release"
  | "live_event"
  | "released";

export type PublicReleaseInfo = {
  state: AurosReleaseState;

  releaseAt: string;
  eventStartsAt: string;
  serverTime: string;

  islandCode: string | null;

  event: {
    devName: "reloadstar";
    enabled: boolean;
  };
};

export type ReloadstarPhase =
  | "inactive"
  | "nexus_arrival"
  | "destabilizing"
  | "explosion"
  | "blackout"
  | "recovery"
  | "release_video"
  | "world_return"
  | "reconstruction"
  | "unlocking"
  | "released";

export type ReloadstarSpeed =
  | 1
  | 5
  | 20
  | 60;

export type ReloadstarTimelineEntry = {
  phase: ReloadstarPhase;
  start: number;
  label: string;
};

export type ReloadstarRuntimeMode =
  | "realtime"
  | "development";