import {
  NextResponse,
} from "next/server";

import {
  AUROS_RELEASE_TIME,
  RELOADSTAR_ENABLED,
  RELOADSTAR_EVENT_START,
  //getAurosIslandCode,
  //getReleaseState,
} from "../../../event/reloadstar/config";

import type {
  PublicReleaseInfo,
} from "../../../event/reloadstar/types";


export const dynamic =
  "force-dynamic";


export async function GET() {
  const now =
    new Date();

  const //state =
    //getReleaseState(now);


  /*
   * SECURITY:
   *
   * The island code is ONLY attached once the
   * release state has actually reached "released".
   *
   * During pre_release and live_event the value
   * sent to the browser is null.
   */

  //const islandCode =
    //state === "released"
      //? //getAurosIslandCode()
      //: null;


  //const response:
    PublicReleaseInfo =
  {
    //state,

    releaseAt:
      AUROS_RELEASE_TIME,

    eventStartsAt:
      RELOADSTAR_EVENT_START,

    serverTime:
      now.toISOString(),

    //islandCode,

    event: {
      devName:
        "reloadstar",

      enabled:
        RELOADSTAR_ENABLED,
    },
  };


  return NextResponse.json(
    //response,
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    }
  );
}