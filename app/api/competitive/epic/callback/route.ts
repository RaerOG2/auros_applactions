import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  authenticatedAurosUser,
  competitiveAdminClient,
  epicConfiguration,
  epicRedirect,
  EPIC_STATE_COOKIE,
  EPIC_USER_COOKIE,
} from "../../../../../lib/competitive-epic.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EpicToken = {
  access_token?: string;
  account_id?: string;
  client_id?: string;
  displayName?: string;
  display_name?: string;
};

type EpicUserInfo = {
  sub?: string;
  account_id?: string;
  preferred_username?: string;
  name?: string;
};

function matchesState(expected: string, actual: string) {
  const first = Buffer.from(expected);
  const second = Buffer.from(actual);
  return first.length === second.length && timingSafeEqual(first, second);
}

export async function GET(request: NextRequest) {
  let origin = new URL(request.url).origin;
  let outcome = "failed";

  try {
    const config = epicConfiguration();
    origin = config.origin;

    const state = request.nextUrl.searchParams.get("state") ?? "";
    const code = request.nextUrl.searchParams.get("code") ?? "";
    const savedState = request.cookies.get(EPIC_STATE_COOKIE)?.value ?? "";
    const savedUserId = request.cookies.get(EPIC_USER_COOKIE)?.value ?? "";

    if (!state || !savedState || !code || !matchesState(savedState, state)) {
      outcome = "invalid_state";
      throw new Error("INVALID_OAUTH_STATE");
    }

    const user = await authenticatedAurosUser();

    if (user.id !== savedUserId) {
      outcome = "session_changed";
      throw new Error("AUROS_SESSION_CHANGED");
    }

    const credentials = Buffer.from(
      `${config.clientId}:${config.clientSecret}`,
      "utf8",
    ).toString("base64");

    const tokenResponse = await fetch(
      "https://api.epicgames.dev/epic/oauth/v2/token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          deployment_id: config.deploymentId,
          code,
          redirect_uri: config.redirectUri,
          scope: "basic_profile",
        }),
        cache: "no-store",
      },
    );

    if (!tokenResponse.ok) {
      outcome = "epic_rejected";
      throw new Error("EPIC_TOKEN_EXCHANGE_FAILED");
    }

    const token = (await tokenResponse.json()) as EpicToken;

    if (!token.access_token || !token.account_id || token.client_id !== config.clientId) {
      outcome = "invalid_identity";
      throw new Error("EPIC_TOKEN_IDENTITY_MISMATCH");
    }

    const infoResponse = await fetch(
      "https://api.epicgames.dev/epic/oauth/v2/userInfo",
      {
        headers: { Authorization: `Bearer ${token.access_token}` },
        cache: "no-store",
      },
    );

    if (!infoResponse.ok) {
      outcome = "epic_rejected";
      throw new Error("EPIC_USERINFO_FAILED");
    }

    const info = (await infoResponse.json()) as EpicUserInfo;
    const infoAccountId = info.sub ?? info.account_id;

    if (!infoAccountId || infoAccountId !== token.account_id) {
      outcome = "invalid_identity";
      throw new Error("EPIC_USERINFO_IDENTITY_MISMATCH");
    }

    const displayName = (
      info.preferred_username ??
      token.displayName ??
      token.display_name ??
      info.name ??
      ""
    ).trim().slice(0, 80);

    const admin = competitiveAdminClient();

    const { error: profileError } = await admin
      .from("competitive_profiles")
      .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });

    if (profileError) {
      outcome = "profile_error";
      throw profileError;
    }

    const { data: existing, error: existingError } = await admin
      .from("competitive_profiles")
      .select("epic_account_id")
      .eq("id", user.id)
      .single();

    if (existingError) {
      outcome = "profile_error";
      throw existingError;
    }

    if (existing.epic_account_id && existing.epic_account_id !== token.account_id) {
      outcome = "already_linked";
      throw new Error("DIFFERENT_EPIC_ALREADY_LINKED");
    }

    const { error: updateError } = await admin
      .from("competitive_profiles")
      .update({
        epic_account_id: token.account_id,
        epic_display_name: displayName || null,
        epic_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      outcome = updateError.code === "23505" ? "epic_in_use" : "profile_error";
      throw updateError;
    }

    // Tokens and authorization codes are never persisted to AUROS.
    outcome = "linked";
  } catch {
    // Deliberately do not reveal tokens, codes or raw Epic responses in a URL.
  }

  const response = NextResponse.redirect(epicRedirect(origin, outcome));
  response.cookies.set(EPIC_STATE_COOKIE, "", {
    path: "/api/competitive/epic",
    httpOnly: true,
    maxAge: 0,
  });
  response.cookies.set(EPIC_USER_COOKIE, "", {
    path: "/api/competitive/epic",
    httpOnly: true,
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
