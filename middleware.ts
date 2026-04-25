import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Nur für deine Dev Domain aktiv
  if (url.hostname.includes("beta.auros-uefn.com")) {
    const authHeader = request.headers.get("authorization");

    const username = "alpha-Neo";
    const password = "AlphaChatNeo"; // kannst du ändern
    
    const basicAuth = authHeader?.split(" ")[1];
    const decoded = basicAuth ? atob(basicAuth) : "";

    const [user, pass] = decoded.split(":");

    if (user !== username || pass !== password) {
      return new Response("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      });
    }
  }

  return NextResponse.next();
}