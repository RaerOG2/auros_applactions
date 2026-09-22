import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";


function getSupabaseConfig() {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY;


  if (
    !supabaseUrl ||
    !supabaseAnonKey
  ) {
    return null;
  }


  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}


export async function middleware(
  request:
    NextRequest
) {
  const url =
    request.nextUrl;


  /*
   * ==================================================
   * BETA DOMAIN PROTECTION
   * ==================================================
   *
   * For now we preserve the existing
   * beta authentication system.
   *
   * The beta cookie itself will be
   * replaced with a signed session
   * later in Security 2.0.
   */

  if (
    url.hostname ===
    "beta.auros-uefn.com"
  ) {
    const allowedPaths = [
      "/beta-login",
      "/api/beta-login",
    ];


    const isAllowedPath =
      allowedPaths.some(
        (
          path
        ) =>
          url.pathname.startsWith(
            path
          )
      );


    const isNextAsset =
      url.pathname.startsWith(
        "/_next"
      );


    const isPublicFile =
      url.pathname.includes(
        "."
      );


    if (
      !isAllowedPath &&
      !isNextAsset &&
      !isPublicFile
    ) {
      const betaAuth =
        request.cookies.get(
          "beta-auth"
        )?.value;


      const secret =
        process.env
          .BETA_COOKIE_SECRET;


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
    }
  }


  /*
   * ==================================================
   * SUPABASE SESSION REFRESH
   * ==================================================
   */

  const config =
    getSupabaseConfig();


  if (!config) {
    return NextResponse.next();
  }


  let response =
    NextResponse.next({
      request,
    });


  const supabase =
    createServerClient(
      config.supabaseUrl,
      config.supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },


          setAll(
            cookiesToSet
          ) {
            cookiesToSet.forEach(
              ({
                name,
                value,
              }) => {
                request.cookies.set(
                  name,
                  value
                );
              }
            );


            response =
              NextResponse.next({
                request,
              });


            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                response.cookies.set(
                  name,
                  value,
                  options
                );
              }
            );
          },
        },
      }
    );


  /*
   * getUser() validates the session
   * with Supabase instead of trusting
   * client-side session data.
   */
  await supabase.auth.getUser();


  return response;
}


export const config = {
  matcher: [
    /*
     * Skip static Next.js resources
     * and common public image files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};