import {
  NextResponse,
} from "next/server";

import {
  AUROS_RELEASE_TIME,
  RELOADSTAR_ENABLED,
  RELOADSTAR_EVENT_START,
} from "../../../event/reloadstar/config";

import type {
  AurosReleaseState,
  PublicReleaseInfo,
} from "../../../event/reloadstar/types";


export const dynamic =
  "force-dynamic";

export const revalidate =
  0;


function getReleaseState(
  now: Date
): AurosReleaseState {
  const nowMs =
    now.getTime();

  const eventStartMs =
    new Date(
      RELOADSTAR_EVENT_START
    ).getTime();

  const releaseMs =
    new Date(
      AUROS_RELEASE_TIME
    ).getTime();


  if (
    nowMs >=
    releaseMs
  ) {
    return "released";
  }


  if (
    RELOADSTAR_ENABLED &&
    nowMs >=
      eventStartMs
  ) {
    return "live_event";
  }


  return "pre_release";
}


function getReleasedIslandCode() {
  const code =
    process.env.AUROS_ISLAND_CODE?.trim();

  return code || null;
}


export async function GET() {
  const now =
    new Date();

  const state =
    getReleaseState(
      now
    );


  /*
   * SECURITY:
   *
   * AUROS_ISLAND_CODE is a server-only environment variable.
   * It is never included in the response before 20:00.
   */
  const islandCode =
    state === "released"
      ? getReleasedIslandCode()
      : null;


  const response:
    PublicReleaseInfo =
  {
    state,

    releaseAt:
      AUROS_RELEASE_TIME,

    eventStartsAt:
      RELOADSTAR_EVENT_START,

    serverTime:
      now.toISOString(),

    islandCode,

    event: {
      devName:
        "reloadstar",

      enabled:
        RELOADSTAR_ENABLED,
    },
  };


  return NextResponse.json(
    response,
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",

        Pragma:
          "no-cache",

        Expires:
          "0",
      },
    }
  );
}
