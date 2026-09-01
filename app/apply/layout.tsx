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
      "Join the Auros Team",

    description:
      "Apply to join the Auros Royale development team. Explore available roles, submit your application and help build the evolving Auros experience.",

    path:
      "/apply",

    keywords: [
      "Auros Applications",
      "Join Auros",
      "Auros Royale Team",
      "UEFN Developer Application",
      "Fortnite Creative Team",
    ],
  });


export default function ApplyLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}