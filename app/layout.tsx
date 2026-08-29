import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "../styles/auros-channel.css";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";
import AurosSiteShell from "../components/AurosSiteShell";

const geistSans = Geist({
  variable:
    "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable:
    "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase:
    new URL(
      "https://auros-uefn.com"
    ),

  title: {
    default:
      "Auros Royale — Official Website",

    template:
      "%s | Auros Royale",
  },

  description:
    "Explore Auros Royale, discover the interactive map, read the latest news and patchnotes, browse the gallery and stay connected with the Auros community.",

  applicationName:
    "Auros Royale",

  keywords: [
    "Auros Royale",
    "Auros",
    "Fortnite",
    "UEFN",
    "Fortnite Creative",
    "Auros Royale Map",
    "Auros Royale News",
    "Auros Royale Patchnotes",
  ],

  authors: [
    {
      name:
        "Auros Royale",
    },
  ],

  creator:
    "Auros Royale",

  publisher:
    "Auros Royale",

  icons: {
    icon:
      "/auros_royale_pfp_draft_1.png",

    shortcut:
      "/auros_royale_pfp_draft_1.png",

    apple:
      "/auros_royale_pfp_draft_1.png",
  },

  openGraph: {
    type:
      "website",

    locale:
      "en_US",

    url:
      "https://auros-uefn.com",

    siteName:
      "Auros Royale",

    title:
      "Auros Royale — Official Website",

    description:
      "Explore Auros Royale, discover the interactive map, read the latest news and patchnotes, browse the gallery and stay connected with the Auros community.",

    images: [
      {
        url:
          "/auros_royale_pfp_draft_1.png",

        alt:
          "Auros Royale",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Auros Royale — Official Website",

    description:
      "Explore Auros Royale, discover the interactive map, read the latest news and patchnotes, browse the gallery and stay connected with the Auros community.",

    images: [
      "/auros_royale_pfp_draft_1.png",
    ],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AurosSiteShell>
          {children}
        </AurosSiteShell>
      </body>
    </html>
  );
}