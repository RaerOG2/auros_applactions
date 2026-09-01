import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import "./globals.css";
import "../styles/auros-channel.css";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import AurosSiteShell from "../components/AurosSiteShell";
import StructuredData from "../components/seo/StructuredData";

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "../lib/seo";

import {
  createOrganizationStructuredData,
  createVideoGameStructuredData,
  createWebsiteStructuredData,
} from "../lib/structured-data";


const geistSans =
  Geist({
    variable:
      "--font-geist-sans",

    subsets: [
      "latin",
    ],
  });


const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",

    subsets: [
      "latin",
    ],
  });


export const metadata:
  Metadata =
  {
    metadataBase:
      new URL(
        SITE_URL
      ),

    title: {
      default:
        "Auros Royale — Official Website",

      template:
        "%s | Auros Royale",
    },

    description:
      DEFAULT_DESCRIPTION,

    applicationName:
      SITE_NAME,

    keywords: [
      "Auros Royale",
      "Auros",
      "Fortnite",
      "UEFN",
      "Fortnite Creative",
      "Battle Royale",
      "Auros Map",
      "Auros Interactive Map",
      "Auros News",
      "Auros Patchnotes",
      "Auros Gallery",
    ],

    authors: [
      {
        name:
          SITE_NAME,

        url:
          SITE_URL,
      },
    ],

    creator:
      SITE_NAME,

    publisher:
      SITE_NAME,

    category:
      "gaming",

    icons: {
      icon:
        DEFAULT_IMAGE,

      shortcut:
        DEFAULT_IMAGE,

      apple:
        DEFAULT_IMAGE,
    },

    alternates: {
      canonical:
        SITE_URL,
    },

    openGraph: {
      type:
        "website",

      locale:
        "en_US",

      url:
        SITE_URL,

      siteName:
        SITE_NAME,

      title:
        "Auros Royale — Official Website",

      description:
        DEFAULT_DESCRIPTION,

      images: [
        {
          url:
            DEFAULT_IMAGE,

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
        DEFAULT_DESCRIPTION,

      images: [
        DEFAULT_IMAGE,
      ],
    },

    robots: {
      index:
        true,

      follow:
        true,

      googleBot: {
        index:
          true,

        follow:
          true,

        "max-image-preview":
          "large",

        "max-snippet":
          -1,

        "max-video-preview":
          -1,
      },
    },
  };


export default function RootLayout({
  children,
}: Readonly<{
  children:
    ReactNode;
}>) {
  const websiteData =
    createWebsiteStructuredData();


  const organizationData =
    createOrganizationStructuredData();


  const gameData =
    createVideoGameStructuredData();


  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData
          data={
            websiteData
          }
        />


        <StructuredData
          data={
            organizationData
          }
        />


        <StructuredData
          data={
            gameData
          }
        />


        <AurosSiteShell>
          {
            children
          }
        </AurosSiteShell>
      </body>
    </html>
  );
}