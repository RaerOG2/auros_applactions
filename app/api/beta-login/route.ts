import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  const validUsername = process.env.BETA_USERNAME;
  const validPassword = process.env.BETA_PASSWORD;
  const cookieSecret = process.env.BETA_COOKIE_SECRET;

  if (
    !validUsername ||
    !validPassword ||
    !cookieSecret ||
    username !== validUsername ||
    password !== validPassword
  ) {
    return NextResponse.redirect(new URL("/beta-login?error=1", request.url));
  }

  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set("beta-auth", cookieSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}