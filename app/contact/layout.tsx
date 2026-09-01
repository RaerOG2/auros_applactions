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
      "Contact & Community",

    description:
      "Contact the Auros Royale team, join the community and find support, project and application information.",

    path:
      "/contact",

    keywords: [
      "Auros Contact",
      "Auros Community",
      "Auros Discord",
      "Auros Support",
    ],
  });


export default function ContactLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}