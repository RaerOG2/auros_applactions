import { NextResponse } from "next/server";

function safeText(value: unknown, fallback = "-") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function getCategoryIcon(category: string | null | undefined) {
  switch (category) {
    case "Developer":
      return "💻";
    case "Supporter":
      return "🛡️";
    case "Competitive Manager":
      return "🏆";
    case "Manager":
      return "📋";
    case "Director":
      return "👑";
    default:
      return "✨";
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, department, location, role_category, status } = body;

    if (!process.env.DISCORD_JOB_WEBHOOK_URL) {
      return NextResponse.json({
        success: false,
        error: "Missing DISCORD_JOB_WEBHOOK_URL",
      });
    }

    const logoUrl = process.env.AUROS_LOGO_URL || undefined;
    const categoryIcon = getCategoryIcon(role_category);
    const isFilled = status === "Filled";
    const websiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const embed = isFilled
      ? {
          color: 0xef4444,
          author: {
            name: "Auros Recruitment System",
            icon_url: logoUrl,
          },
          title: `🔒 POSITION FILLED — ${safeText(title)}`,
          description:
            `The role **${safeText(title)}** is no longer available.\n\n` +
            `> Applications for this position are now closed.`,
          thumbnail: logoUrl ? { url: logoUrl } : undefined,
          fields: [
            {
              name: "🏷️ Role",
              value: safeText(title),
              inline: true,
            },
            {
              name: "🧬 Category",
              value: `${categoryIcon} ${safeText(role_category, "Other")}`,
              inline: true,
            },
            {
              name: "🏢 Department",
              value: safeText(department),
              inline: true,
            },
            {
              name: "📍 Location",
              value: safeText(location),
              inline: true,
            },
            {
              name: "📌 Status",
              value: "Filled",
              inline: true,
            },
            {
              name: "ℹ️ Update",
              value:
                "This job listing has been closed. No new applications can be submitted.",
              inline: false,
            },
          ],
          footer: {
            text: "Auros Royale • Job Status Update",
            icon_url: logoUrl,
          },
          timestamp: new Date().toISOString(),
        }
      : {
          color: 0x22c55e,
          author: {
            name: "Auros Recruitment System",
            icon_url: logoUrl,
          },
          title: `🟢 POSITION REOPENED — ${safeText(title)}`,
          description:
            `The role **${safeText(title)}** is open again.\n\n` +
            `> Applications are now being accepted again.`,
          thumbnail: logoUrl ? { url: logoUrl } : undefined,
          fields: [
            {
              name: "🏷️ Role",
              value: safeText(title),
              inline: true,
            },
            {
              name: "🧬 Category",
              value: `${categoryIcon} ${safeText(role_category, "Other")}`,
              inline: true,
            },
            {
              name: "🏢 Department",
              value: safeText(department),
              inline: true,
            },
            {
              name: "📍 Location",
              value: safeText(location),
              inline: true,
            },
            {
              name: "📌 Status",
              value: "Open",
              inline: true,
            },
            {
              name: "🌐 Application",
              value: `[Open Application Page](${websiteUrl}/apply)`,
              inline: false,
            },
            {
              name: "ℹ️ Update",
              value:
                "This job listing has been reopened. Applications are now available again.",
              inline: false,
            },
          ],
          footer: {
            text: "Auros Royale • Job Status Update",
            icon_url: logoUrl,
          },
          timestamp: new Date().toISOString(),
        };

    const discordResponse = await fetch(process.env.DISCORD_JOB_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Auros Jobs",
        avatar_url: logoUrl,
        embeds: [embed],
      }),
    });

    const discordText = await discordResponse.text();
    console.log("Job status webhook:", discordResponse.status, discordText);

    return NextResponse.json({
      success: discordResponse.ok,
      status: discordResponse.status,
    });
  } catch (error) {
    console.error("Job status notify error:", error);
    return NextResponse.json(
      { success: false, error: "Job status notification failed" },
      { status: 500 }
    );
  }
}