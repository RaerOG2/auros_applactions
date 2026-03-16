import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeTrackingCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = normalizeEmail(String(body?.email || ""));
    const trackingCode = normalizeTrackingCode(String(body?.trackingCode || ""));

    if (!email || !trackingCode) {
      return NextResponse.json(
        { error: "Email and tracking code are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("applications")
      .select(
        `
        name,
        email,
        status,
        tracking_code,
        created_at,
        jobs (
          title
        )
      `
      )
      .ilike("tracking_code", trackingCode)
      .maybeSingle();

    if (error) {
      console.error("Status lookup error:", error);
      return NextResponse.json(
        { error: "Could not check application status." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ result: null }, { status: 200 });
    }

    const storedEmail = normalizeEmail(data.email || "");

    if (storedEmail !== email) {
      return NextResponse.json({ result: null }, { status: 200 });
    }

    return NextResponse.json({ result: data }, { status: 200 });
  } catch (error) {
    console.error("Unexpected status API error:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}