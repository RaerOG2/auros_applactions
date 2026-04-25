import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  if (!url.hostname.includes("beta.auros-uefn.com")) {
    return NextResponse.next();
  }

  const allowedPaths = [
    "/beta-login",
    "/api/beta-login",
  ];

  const isAllowedPath = allowedPaths.some((path) =>
    url.pathname.startsWith(path)
  );

  const isNextAsset = url.pathname.startsWith("/_next");
  const isPublicFile = url.pathname.includes(".");

  if (isAllowedPath || isNextAsset || isPublicFile) {
    return NextResponse.next();
  }

  const betaAuth = request.cookies.get("beta-auth")?.value;
  const secret = process.env.BETA_COOKIE_SECRET;

  if (!secret || betaAuth !== secret) {
    return NextResponse.redirect(new URL("/beta-login", request.url));
  }

  return NextResponse.next();
}