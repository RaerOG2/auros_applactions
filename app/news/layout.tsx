import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  createSeoMetadata,
} from "../../lib/seo";


export const metadata:
  Metadata =
  createSeoMetadata({
    title:
      "News",

    description:
      "Read the latest Auros Royale news, announcements, development updates and community information.",

    path:
      "/news",

    keywords: [
      "Auros News",
      "Auros Royale News",
      "Auros Announcements",
      "Auros Development",
      "UEFN News",
    ],
  });


export default function NewsLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}