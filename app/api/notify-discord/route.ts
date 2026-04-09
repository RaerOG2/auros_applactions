import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { discordId, status, trackingCode } = await req.json();

    if (!discordId) {
      return NextResponse.json({ error: "No Discord ID" }, { status: 400 });
    }

    const message =
      status === "Accepted"
        ? `🎉 Your application has been ACCEPTED!

Please check your application on the website.

🔑 Your AU Number: ${trackingCode}

We’re excited to have you!`
        : `❌ Your application has been REJECTED.

Please check your application on the website.

🔑 Your AU Number: ${trackingCode}`;

    // Step 1: Create DM channel
    const dm = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: discordId,
      }),
    });

    const dmData = await dm.json();

    // Step 2: Send message
    await fetch(`https://discord.com/api/v10/channels/${dmData.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}