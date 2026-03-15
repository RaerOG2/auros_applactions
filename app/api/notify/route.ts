import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

function safeText(value: unknown, fallback = "-") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function cut(value: unknown, max = 1000) {
  return safeText(value).slice(0, max);
}

export async function POST(req: Request) {
  try {
    console.log("Notify route called");
    console.log("Webhook exists:", !!process.env.DISCORD_WEBHOOK_URL);

    const body = await req.json();

    const {
      jobTitle,
      category,
      name,
      discord,
      discordName,
      age,
      email,
      timezone,
      experience,
      motivation,
      availability,
      trackingCode,

      developerSkills,
      developerProjects,
      supportCases,
      supportCommunication,
      competitiveKnowledge,
      competitivePlans,
      managerLeadership,
      managerOrganization,
      directorVision,
      directorResponsibility,
      otherStrengths,
    } = body;

    const embedColor = getCategoryColor(category);
    const categoryIcon = getCategoryIcon(category);
    const logoUrl = process.env.AUROS_LOGO_URL || undefined;
    const adminBaseUrl = process.env.ADMIN_DASHBOARD_URL || "https://auros-applactions.vercel.app/admin";

    const encodedTrackingCode = encodeURIComponent(safeText(trackingCode));
    const reviewUrl = `${adminBaseUrl}?tracking=${encodedTrackingCode}&action=review`;
    const acceptUrl = `${adminBaseUrl}?tracking=${encodedTrackingCode}&action=accept`;
    const rejectUrl = `${adminBaseUrl}?tracking=${encodedTrackingCode}&action=reject`;

    const roleSpecificFields: Array<{ name: string; value: string; inline?: boolean }> = [];

    if (category === "Developer") {
      roleSpecificFields.push(
        {
          name: "💻 Developer Skills",
          value: cut(developerSkills),
          inline: false,
        },
        {
          name: "🧩 Developer Projects",
          value: cut(developerProjects),
          inline: false,
        }
      );
    }

    if (category === "Supporter") {
      roleSpecificFields.push(
        {
          name: "🛡️ Support Experience",
          value: cut(supportCases),
          inline: false,
        },
        {
          name: "💬 Communication Skills",
          value: cut(supportCommunication),
          inline: false,
        }
      );
    }

    if (category === "Competitive Manager") {
      roleSpecificFields.push(
        {
          name: "🏆 Competitive Knowledge",
          value: cut(competitiveKnowledge),
          inline: false,
        },
        {
          name: "📈 Competitive Plans",
          value: cut(competitivePlans),
          inline: false,
        }
      );
    }

    if (category === "Manager") {
      roleSpecificFields.push(
        {
          name: "📋 Leadership Experience",
          value: cut(managerLeadership),
          inline: false,
        },
        {
          name: "🗂️ Organization Skills",
          value: cut(managerOrganization),
          inline: false,
        }
      );
    }

    if (category === "Director") {
      roleSpecificFields.push(
        {
          name: "👑 Vision",
          value: cut(directorVision),
          inline: false,
        },
        {
          name: "⚖️ Responsibility",
          value: cut(directorResponsibility),
          inline: false,
        }
      );
    }

    if (!category || category === "Other") {
      roleSpecificFields.push({
        name: "✨ Why they fit this role",
        value: cut(otherStrengths),
        inline: false,
      });
    }

    if (process.env.DISCORD_WEBHOOK_URL) {
      const embed: Record<string, unknown> = {
        color: embedColor,
        author: {
          name: "Auros Premium Application System",
          icon_url: logoUrl,
        },
        title: `${categoryIcon} New Auros Staff Application`,
        description:
          `**${safeText(name)}** has submitted a new application for **${safeText(jobTitle)}**.\n\n` +
          `> Premium intake alert from the Auros recruitment system.`,
        thumbnail: logoUrl ? { url: logoUrl } : undefined,
        fields: [
          {
            name: "🎯 Role",
            value: safeText(jobTitle),
            inline: true,
          },
          {
            name: "🧬 Category",
            value: `${categoryIcon} ${safeText(category, "Other")}`,
            inline: true,
          },
          {
            name: "🆔 Tracking Code",
            value: `\`${safeText(trackingCode)}\``,
            inline: true,
          },
          {
            name: "👤 Applicant",
            value: safeText(name),
            inline: true,
          },
          {
            name: "💬 Discord Username",
            value: safeText(discord),
            inline: true,
          },
          {
            name: "🏷️ Discord Name",
            value: safeText(discordName),
            inline: true,
          },
          {
            name: "📧 Email",
            value: safeText(email),
            inline: true,
          },
          {
            name: "🎂 Age",
            value: safeText(age),
            inline: true,
          },
          {
            name: "🌍 Timezone",
            value: safeText(timezone),
            inline: true,
          },
          {
            name: "⏳ Availability",
            value: safeText(availability),
            inline: true,
          },
          {
            name: "📚 Experience",
            value: cut(experience),
            inline: false,
          },
          {
            name: "🔥 Motivation",
            value: cut(motivation),
            inline: false,
          },
          ...roleSpecificFields,
          {
            name: "⚡ Admin Actions",
            value:
              `[Open Review](${reviewUrl})\n` +
              `[Accept Candidate](${acceptUrl})\n` +
              `[Reject Candidate](${rejectUrl})`,
            inline: false,
          },
        ].filter(Boolean),
        footer: {
          text: `Auros Royale • Premium Recruitment Flow`,
          icon_url: logoUrl,
        },
        timestamp: new Date().toISOString(),
      };

      const discordResponse = await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Auros Applications Manager",
          avatar_url: logoUrl,
          embeds: [embed],
        }),
      });

      const discordText = await discordResponse.text();
      console.log("Discord status:", discordResponse.status);
      console.log("Discord response:", discordText);
    }

    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.ADMIN_NOTIFY_EMAIL
    ) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const roleSpecificText =
        category === "Developer"
          ? `Developer Skills:\n${safeText(developerSkills)}\n\nDeveloper Projects:\n${safeText(developerProjects)}`
          : category === "Supporter"
          ? `Support Experience:\n${safeText(supportCases)}\n\nCommunication Skills:\n${safeText(supportCommunication)}`
          : category === "Competitive Manager"
          ? `Competitive Knowledge:\n${safeText(competitiveKnowledge)}\n\nCompetitive Plans:\n${safeText(competitivePlans)}`
          : category === "Manager"
          ? `Leadership Experience:\n${safeText(managerLeadership)}\n\nOrganization Skills:\n${safeText(managerOrganization)}`
          : category === "Director"
          ? `Vision:\n${safeText(directorVision)}\n\nResponsibility:\n${safeText(directorResponsibility)}`
          : `Role Fit:\n${safeText(otherStrengths)}`;

      const mailInfo = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.ADMIN_NOTIFY_EMAIL,
        subject: `New Auros Application - ${safeText(jobTitle, "Unknown Role")}`,
        text: `
A new application was submitted.

Role: ${safeText(jobTitle)}
Category: ${safeText(category, "Other")}
Name: ${safeText(name)}
Discord Username: ${safeText(discord)}
Discord Name: ${safeText(discordName)}
Email: ${safeText(email)}
Age: ${safeText(age)}
Timezone: ${safeText(timezone)}
Availability: ${safeText(availability)}
Tracking Code: ${safeText(trackingCode)}

Experience:
${safeText(experience)}

Motivation:
${safeText(motivation)}

Role-Specific Answers:
${roleSpecificText}

Admin Review:
${reviewUrl}

Accept:
${acceptUrl}

Reject:
${rejectUrl}
        `,
      });

      console.log("Mail sent:", mailInfo.messageId);
    } else {
      console.log("SMTP variables missing, mail skipped");
    }

    return NextResponse.json({
      success: true,
      message: "Notifications processed",
    });
  } catch (error) {
    console.error("Notify error:", error);
    return NextResponse.json(
      { success: false, error: "Notification failed" },
      { status: 500 }
    );
  }
}
