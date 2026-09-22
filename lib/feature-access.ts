import type {
  FeatureFlag,
  FeatureFlagAccessContext,
} from "../types/feature-flags";


export function canAccessFeatureAudience(
  audience:
    FeatureFlag["audience"],

  access:
    FeatureFlagAccessContext
): boolean {
  switch (
    audience
  ) {
    case "everyone":
      return true;


    case "beta":
      return (
        access.isBeta ||
        access.isDev ||
        access.isAdmin
      );


    case "developers":
      return (
        access.isDev ||
        access.isAdmin
      );


    case "admin":
      return access.isAdmin;


    default:
      return false;
  }
}


export function canAccessFeature(
  flag:
    FeatureFlag | null,

  access:
    FeatureFlagAccessContext
): boolean {
  if (
    !flag
  ) {
    return false;
  }


  if (
    !flag.enabled
  ) {
    return false;
  }


  return canAccessFeatureAudience(
    flag.audience,
    access
  );
}