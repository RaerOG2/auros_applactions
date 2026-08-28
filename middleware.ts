import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

export function middleware(
  request: NextRequest
) {
  const url =
    request.nextUrl;

  /*
   * Beta protection only applies
   * to beta.auros-uefn.com
   */
  if (
    !url.hostname.includes(
      "beta.auros-uefn.com"
    )
  ) {
    return NextResponse.next();
  }

  /*
   * Paths that must stay accessible
   * without beta authentication.
   */
  const allowedPaths = [
    "/beta-login",
    "/api/beta-login",
  ];

  const isAllowedPath =
    allowedPaths.some(
      (path) =>
        url.pathname.startsWith(
          path
        )
    );

  /*
   * Next.js assets
   */
  const isNextAsset =
    url.pathname.startsWith(
      "/_next"
    );

  /*
   * Public files:
   * images, icons, fonts, etc.
   */
  const isPublicFile =
    url.pathname.includes(".");

  if (
    isAllowedPath ||
    isNextAsset ||
    isPublicFile
  ) {
    return NextResponse.next();
  }

  const betaAuth =
    request.cookies.get(
      "beta-auth"
    )?.value;

  const secret =
    process.env.BETA_COOKIE_SECRET;

  /*
   * No secret configured or
   * invalid/missing cookie
   */
  if (
    !secret ||
    betaAuth !== secret
  ) {
    const loginUrl =
      new URL(
        "/beta-login",
        request.url
      );

    return NextResponse.redirect(
      loginUrl
    );
  }

  return NextResponse.next();
}