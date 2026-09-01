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
      "Login",
  };


export default function LoginLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}