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

function getCategoryColor(category: string | null | undefined) {
  switch (category) {
    case "Developer":
      return 0x42bfff;
    case "Supporter":
      return 0x22c55e;
    case "Competitive Manager":
      return 0xf59e0b;
    case "Manager":
      return 0x7b61ff;
    case "Director":
      return 0xef4444;
    default:
      return 0x8b5cf6;
  }
}

function cut(value: unknown, max = 1000) {
  return safeText(value).slice(0, max);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      department,
      type,
      location,
      description,
      requirements,
      role_category,
    } = body;

    if (!process.env.DISCORD_JOB_WEBHOOK_URL) {
      console.log("Missing DISCORD_JOB_WEBHOOK_URL");
      return NextResponse.json({
        success: false,
        error: "Missing DISCORD_JOB_WEBHOOK_URL",
      });
    }

    const categoryIcon = getCategoryIcon(role_category);
    const color = getCategoryColor(role_category);
    const logoUrl = process.env.AUROS_LOGO_URL || undefined;
    const websiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://auros-applactions.vercel.app";
    const applyUrl = `${websiteUrl}/apply`;

    const requirementsText =
      Array.isArray(requirements) && requirements.length > 0
        ? requirements.map((item: string) => `• ${item}`).join("\n")
        : "• No specific requirements listed yet";

    const embed = {
      color,
      author: {
        name: "Auros Recruitment System",
        icon_url: logoUrl,
      },
      title: `${categoryIcon} NOW HIRING — ${safeText(title)}`,
      description:
        `A new **Auros** staff role is now open.\n\n` +
        `> Premium recruitment alert • applications are now live`,
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
          name: "⏱️ Type",
          value: safeText(type),
          inline: true,
        },
        {
          name: "📌 Status",
          value: "Open",
          inline: true,
        },
        {
          name: "📝 Role Description",
          value: cut(description, 1000),
          inline: false,
        },
        {
          name: "✅ Requirements",
          value: requirementsText.slice(0, 1000),
          inline: false,
        },
        {
          name: "🌐 Application",
          value: `[Open Application Page](${applyUrl})`,
          inline: false,
        },
      ],
      footer: {
        text: "Auros Royale • Premium Staff Recruitment",
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
    console.log("Job webhook status:", discordResponse.status);
    console.log("Job webhook response:", discordText);

    return NextResponse.json({
      success: discordResponse.ok,
      status: discordResponse.status,
    });
  } catch (error) {
    console.error("Job notify error:", error);
    return NextResponse.json(
      { success: false, error: "Job notification failed" },
      { status: 500 }
    );
  }
}