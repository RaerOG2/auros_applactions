import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const redirectUri = encodeURIComponent(
    process.env.DISCORD_REDIRECT_URI!
  );

  const scope = encodeURIComponent("identify");
  const discordAuthUrl =
    `https://discord.com/oauth2/authorize?client_id=1489262864064708649` +
    `&response_type=code` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scope}` +
    `&prompt=consent`;

  return NextResponse.redirect(discordAuthUrl);
}