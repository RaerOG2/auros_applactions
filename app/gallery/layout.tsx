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
      "Gallery",

    description:
      "Browse screenshots, environments, locations and visual development from the world of Auros Royale.",

    path:
      "/gallery",

    keywords: [
      "Auros Gallery",
      "Auros Royale Screenshots",
      "Auros UEFN",
      "Auros Locations",
      "Auros Island",
    ],
  });


export default function GalleryLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}