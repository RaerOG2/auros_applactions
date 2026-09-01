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
      "Patchnotes",

    description:
      "Browse Auros Royale and Auros Website patchnotes, feature updates, improvements, changes and fixes.",

    path:
      "/patchnotes",

    keywords: [
      "Auros Patchnotes",
      "Auros Royale Updates",
      "Auros Website Updates",
      "Auros Changelog",
      "Auros Release Notes",
    ],
  });


export default function PatchnotesLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}