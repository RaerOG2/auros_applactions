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
      "Live Status",

    description:
      "Check the live operational status of Auros Royale services, current incidents, outages, maintenance and system updates.",

    path:
      "/status",

    keywords: [
      "Auros Status",
      "Auros Live Status",
      "Auros Royale Status",
      "Auros Service Status",
      "Auros Outage",
      "Auros Maintenance",
      "Auros System Status",
      "Auros Website Status",
    ],
  });


export default function StatusLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}