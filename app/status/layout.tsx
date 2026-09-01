import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  NO_INDEX_METADATA,
} from "../../lib/seo";


export const metadata:
  Metadata =
  {
    ...NO_INDEX_METADATA,

    title:
      "Application Status",
  };


export default function StatusLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}