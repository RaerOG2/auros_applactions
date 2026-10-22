import { NextRequest, NextResponse } from "next/server";

import {
  authenticatedAurosUser,
  competitiveAdminClient,
} from "../../../../../lib/competitive-epic.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Only accept a browser POST originating from this AUROS host.
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  }

  try {
    const user = await authenticatedAurosUser();
    const admin = competitiveAdminClient();

    const { error } = await admin
      .from("competitive_profiles")
      .update({
        epic_account_id: null,
        epic_display_name: null,
        epic_verified_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ unlinked: true }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "EPIC_UNLINK_FAILED" }, { status: 401 });
  }
}
