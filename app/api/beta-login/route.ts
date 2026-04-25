import { NextResponse } from "next/server";

function isValidBetaUser(username: string, password: string) {
  const users = process.env.BETA_USERS || "";

  return users.split(",").some((entry) => {
    const [envUser, envPass] = entry.split(":");
    return username === envUser && password === envPass;
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const cookieSecret = process.env.BETA_COOKIE_SECRET;

  if (!cookieSecret || !isValidBetaUser(username, password)) {
    return NextResponse.redirect(new URL("/beta-login?error=1", request.url));
  }

  const response = NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });

  response.cookies.set("beta-auth", cookieSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}