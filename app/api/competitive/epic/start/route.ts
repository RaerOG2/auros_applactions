import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  authenticatedAurosUser,
  epicConfiguration,
  epicRedirect,
  EPIC_STATE_COOKIE,
  EPIC_USER_COOKIE,
} from "../../../../../lib/competitive-epic.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const safeOrigin = new URL(request.url).origin;

  try {
    const config = epicConfiguration();
    const user = await authenticatedAurosUser();
    const state = randomBytes(32).toString("hex");

    const authorize = new URL("https://www.epicgames.com/id/authorize");
    authorize.searchParams.set("client_id", config.clientId);
    authorize.searchParams.set("response_type", "code");
    authorize.searchParams.set("scope", "basic_profile");
    authorize.searchParams.set("redirect_uri", config.redirectUri);
    authorize.searchParams.set("state", state);

    const response = NextResponse.redirect(authorize);
    const cookieOptions = {
      httpOnly: true,
      secure: config.redirectUri.startsWith("https://"),
      sameSite: "lax" as const,
      path: "/api/competitive/epic",
      maxAge: 600,
    };

    response.cookies.set(EPIC_STATE_COOKIE, state, cookieOptions);
    response.cookies.set(EPIC_USER_COOKIE, user.id, cookieOptions);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    const reason = error instanceof Error && error.message === "AUROS_LOGIN_REQUIRED"
      ? "login_required"
      : "not_configured";

    return NextResponse.redirect(epicRedirect(safeOrigin, reason));
  }
}
