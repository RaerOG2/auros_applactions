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
      "Interactive Map",

    description:
      "Explore the Auros Royale interactive map, discover POIs and landmarks, search locations, browse the map archive, use the timeline and compare different versions of the island.",

    path:
      "/map",

    keywords: [
      "Auros Royale Map",
      "Auros Interactive Map",
      "Auros POIs",
      "Auros Landmarks",
      "Fortnite UEFN Map",
      "Auros Map Archive",
    ],
  });


export default function MapLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}