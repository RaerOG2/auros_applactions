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
  getServerAdminAccess,
} from "../../lib/server-access";


export const metadata:
  Metadata =
  NO_INDEX_METADATA;


export const dynamic =
  "force-dynamic";


export default async function AdminLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  const access =
    await getServerAdminAccess();


  /*
   * Not logged in:
   *
   * Send the visitor to the
   * normal Auros login.
   */
  if (
    !access.isAuthenticated
  ) {
    redirect(
      "/login?redirect=/admin"
    );
  }


  /*
   * Logged in but not an admin.
   *
   * Do NOT render any part of
   * the Admin application.
   */
  if (
    !access.hasAdminAccess
  ) {
    redirect(
      "/"
    );
  }


  return children;
}