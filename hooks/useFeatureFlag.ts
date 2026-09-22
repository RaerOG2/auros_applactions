"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getSiteAccess,
} from "../services/access.service";

import {
  getFeatureFlagByKey,
} from "../services/feature-flag.service";

import {
  canAccessFeature,
} from "../lib/feature-access";

import type {
  FeatureFlag,
} from "../types/feature-flags";


type FeatureFlagState = {
  loading:
    boolean;

  enabled:
    boolean;

  flag:
    FeatureFlag | null;

  error:
    string | null;
};


export function useFeatureFlag(
  feature:
    string
): FeatureFlagState {
  const [
    state,
    setState,
  ] =
    useState<FeatureFlagState>({
      loading:
        true,

      enabled:
        false,

      flag:
        null,

      error:
        null,
    });


  useEffect(() => {
    let mounted =
      true;


    async function resolveFeature() {
      setState({
        loading:
          true,

        enabled:
          false,

        flag:
          null,

        error:
          null,
      });


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


        const enabled =
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


        setState({
          loading:
            false,

          enabled,

          flag,

          error:
            null,
        });
      } catch (
        error
      ) {
        console.error(
          `[useFeatureFlag] Failed to resolve feature "${feature}":`,
          error
        );


        if (
          !mounted
        ) {
          return;
        }


        setState({
          loading:
            false,

          enabled:
            false,

          flag:
            null,

          error:
            "Feature access could not be resolved.",
        });
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


  return state;
}