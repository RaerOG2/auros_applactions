import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  redirect,
} from "next/navigation";

import {
  NO_INDEX_METADATA,
} from "../../lib/seo";

import {
  getServerDevAccess,
} from "../../lib/server-access";


export const metadata:
  Metadata =
  NO_INDEX_METADATA;


export const dynamic =
  "force-dynamic";


export default async function DevLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  const access =
    await getServerDevAccess();


  /*
   * User must first have a
   * valid Supabase session.
   */
  if (
    !access.isAuthenticated
  ) {
    redirect(
      "/login?redirect=/dev"
    );
  }


  /*
   * IMPORTANT:
   *
   * Admin alone does NOT grant
   * DEV access.
   *
   * profiles.is_dev must
   * explicitly be true.
   */
  if (
    !access.hasDevAccess
  ) {
    redirect(
      "/"
    );
  }


  return children;
}