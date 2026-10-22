import type {
  ReactNode,
} from "react";

import {
  redirect,
} from "next/navigation";

import "./competitive.css";
import "./competitive-workspace.css";
import CompetitiveWorkspace from "../../components/competitive/CompetitiveWorkspace";

import {
  canAccessFeature,
} from "../../lib/feature-access";

import {
  FEATURE_FLAGS,
} from "../../lib/feature-flags";

import {
  createSupabaseServerClient,
} from "../../lib/supabase-server";

import type {
  FeatureFlag,
} from "../../types/feature-flags";


export default async function CompetitiveLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  const supabase =
    await createSupabaseServerClient();


  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  let isAdmin =
    false;

  let isDev =
    false;

  let isBeta =
    false;


  if (
    user
  ) {
    const {
      data: profile,
    } =
      await supabase
        .from(
          "profiles"
        )
        .select(
          "is_admin, is_dev, is_beta"
        )
        .eq(
          "id",
          user.id
        )
        .maybeSingle();


    isAdmin =
      !!profile?.is_admin;

    isDev =
      !!profile?.is_dev;

    isBeta =
      !!profile?.is_beta;
  }


  let isCompetitiveStaff = false;

  if (user) {
    const { data: staff } = await supabase
      .from("competitive_staff")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    isCompetitiveStaff = Boolean(staff?.role);
  }

  /*
   * Admins always keep Competitive access so development and
   * configuration can continue while the public feature flag is off.
   */
  if (
    isAdmin || isCompetitiveStaff
  ) {
    return (
      <>
        <CompetitiveWorkspace>{children}</CompetitiveWorkspace>
      </>
    );
  }


  const {
    data: flagData,
    error: flagError,
  } =
    await supabase
      .from(
        "feature_flags"
      )
      .select(
        "*"
      )
      .eq(
        "key",
        FEATURE_FLAGS.COMPETITIVE
      )
      .maybeSingle();


  if (
    flagError
  ) {
    console.error(
      "[Competitive] Failed to resolve Competitive feature flag:",
      flagError
    );

    redirect(
      "/"
    );
  }


  const allowed =
    canAccessFeature(
      (
        flagData ??
        null
      ) as FeatureFlag | null,
      {
        isLoggedIn:
          !!user,

        isBeta,

        isDev,

        isAdmin,
      }
    );


  if (
    !allowed
  ) {
    redirect(
      "/"
    );
  }


  return (
    <>
      <CompetitiveWorkspace>{children}</CompetitiveWorkspace>
    </>
  );
}