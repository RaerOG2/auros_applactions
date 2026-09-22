"use client";

import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

import {
  getSiteAccess,
} from "../../services/access.service";

import {
  getFeatureFlagByKey,
} from "../../services/feature-flag.service";

import {
  canAccessFeature,
} from "../../lib/feature-access";


type FeatureGateProps = {
  feature:
    string;

  children:
    ReactNode;

  fallback?:
    ReactNode;

  loadingFallback?:
    ReactNode;
};


type FeatureGateState =
  | "loading"
  | "allowed"
  | "denied";


export default function FeatureGate({
  feature,
  children,
  fallback = null,
  loadingFallback = null,
}: FeatureGateProps) {
  const [
    state,
    setState,
  ] =
    useState<FeatureGateState>(
      "loading"
    );


  useEffect(() => {
    let mounted =
      true;


    async function resolveFeature() {
      setState(
        "loading"
      );


      try {
        const [
          flag,
          access,
        ] =
          await Promise.all([
            getFeatureFlagByKey(
              feature
            ),

            getSiteAccess(),
          ]);


        if (
          !mounted
        ) {
          return;
        }


        const allowed =
          canAccessFeature(
            flag,
            {
              isLoggedIn:
                !!access.user,

              isBeta:
                access.isBeta,

              isDev:
                access.isDev,

              isAdmin:
                access.isAdmin,
            }
          );


        setState(
          allowed
            ? "allowed"
            : "denied"
        );
      } catch (
        error
      ) {
        console.error(
          `[FeatureGate] Failed to resolve feature "${feature}":`,
          error
        );


        if (
          mounted
        ) {
          /*
           * Fail closed.
           *
           * If feature access cannot be determined,
           * the protected feature is not rendered.
           */
          setState(
            "denied"
          );
        }
      }
    }


    void resolveFeature();


    return () => {
      mounted =
        false;
    };
  }, [
    feature,
  ]);


  if (
    state ===
    "loading"
  ) {
    return (
      <>
        {loadingFallback}
      </>
    );
  }


  if (
    state ===
    "denied"
  ) {
    return (
      <>
        {fallback}
      </>
    );
  }


  return (
    <>
      {children}
    </>
  );
}