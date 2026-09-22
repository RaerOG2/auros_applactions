import {
  supabase,
} from "../lib/supabase";

import {
  canAccessFeature,
} from "../lib/feature-access";

import {
  getSiteAccess,
} from "./access.service";

import type {
  FeatureFlag,
  FeatureFlagAudience,
  FeatureFlagInput,
} from "../types/feature-flags";


function normalizeFeatureFlagKey(
  key:
    string
) {
  return key
    .trim()
    .toUpperCase()
    .replace(
      /[^A-Z0-9_]+/g,
      "_"
    )
    .replace(
      /^_+|_+$/g,
      ""
    );
}


export async function getFeatureFlags():
  Promise<FeatureFlag[]> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "feature_flags"
      )
      .select(
        "*"
      )
      .order(
        "name",
        {
          ascending:
            true,
        }
      );


  if (
    error
  ) {
    console.error(
      "[FeatureFlags] Failed to load feature flags:",
      error
    );

    throw error;
  }


  return (
    data ??
    []
  ) as FeatureFlag[];
}


export async function getEnabledFeatureFlags():
  Promise<FeatureFlag[]> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "feature_flags"
      )
      .select(
        "*"
      )
      .eq(
        "enabled",
        true
      )
      .order(
        "name",
        {
          ascending:
            true,
        }
      );


  if (
    error
  ) {
    console.error(
      "[FeatureFlags] Failed to load enabled feature flags:",
      error
    );

    throw error;
  }


  return (
    data ??
    []
  ) as FeatureFlag[];
}


export async function getFeatureFlagByKey(
  key:
    string
): Promise<FeatureFlag | null> {
  const normalizedKey =
    normalizeFeatureFlagKey(
      key
    );


  if (
    !normalizedKey
  ) {
    return null;
  }


  const {
    data,
    error,
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
        normalizedKey
      )
      .maybeSingle();


  if (
    error
  ) {
    console.error(
      `[FeatureFlags] Failed to load feature flag "${normalizedKey}":`,
      error
    );

    throw error;
  }


  return (
    data ??
    null
  ) as FeatureFlag | null;
}


export async function hasFeatureAccess(
  key:
    string
): Promise<boolean> {
  try {
    const [
      flag,
      access,
    ] =
      await Promise.all([
        getFeatureFlagByKey(
          key
        ),

        getSiteAccess(),
      ]);


    return canAccessFeature(
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
  } catch (
    error
  ) {
    console.error(
      `[FeatureFlags] Failed to resolve access for "${key}":`,
      error
    );


    /*
     * Fail closed.
     *
     * If the feature flag system cannot determine access,
     * experimental/restricted features stay unavailable.
     */
    return false;
  }
}


export async function createFeatureFlag(
  input:
    FeatureFlagInput
): Promise<FeatureFlag> {
  const normalizedKey =
    normalizeFeatureFlagKey(
      input.key
    );


  if (
    !normalizedKey
  ) {
    throw new Error(
      "Feature flag key is required."
    );
  }


  if (
    !input.name.trim()
  ) {
    throw new Error(
      "Feature flag name is required."
    );
  }


  const {
    data:
      userData,
  } =
    await supabase.auth.getUser();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "feature_flags"
      )
      .insert({
        key:
          normalizedKey,

        name:
          input.name.trim(),

        description:
          input.description.trim() ||
          null,

        enabled:
          input.enabled,

        audience:
          input.audience,

        created_by:
          userData.user?.id ??
          null,
      })
      .select(
        "*"
      )
      .single();


  if (
    error
  ) {
    console.error(
      "[FeatureFlags] Failed to create feature flag:",
      error
    );

    throw error;
  }


  return data as FeatureFlag;
}


export async function updateFeatureFlag(
  id:
    string,

  input:
    FeatureFlagInput
): Promise<FeatureFlag> {
  const normalizedKey =
    normalizeFeatureFlagKey(
      input.key
    );


  if (
    !normalizedKey
  ) {
    throw new Error(
      "Feature flag key is required."
    );
  }


  if (
    !input.name.trim()
  ) {
    throw new Error(
      "Feature flag name is required."
    );
  }


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "feature_flags"
      )
      .update({
        key:
          normalizedKey,

        name:
          input.name.trim(),

        description:
          input.description.trim() ||
          null,

        enabled:
          input.enabled,

        audience:
          input.audience,
      })
      .eq(
        "id",
        id
      )
      .select(
        "*"
      )
      .single();


  if (
    error
  ) {
    console.error(
      "[FeatureFlags] Failed to update feature flag:",
      error
    );

    throw error;
  }


  return data as FeatureFlag;
}


export async function updateFeatureFlagEnabled(
  id:
    string,

  enabled:
    boolean
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from(
        "feature_flags"
      )
      .update({
        enabled,
      })
      .eq(
        "id",
        id
      );


  if (
    error
  ) {
    console.error(
      "[FeatureFlags] Failed to update feature flag state:",
      error
    );

    throw error;
  }
}


export async function updateFeatureFlagAudience(
  id:
    string,

  audience:
    FeatureFlagAudience
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from(
        "feature_flags"
      )
      .update({
        audience,
      })
      .eq(
        "id",
        id
      );


  if (
    error
  ) {
    console.error(
      "[FeatureFlags] Failed to update feature flag audience:",
      error
    );

    throw error;
  }
}


export async function deleteFeatureFlag(
  id:
    string
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from(
        "feature_flags"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (
    error
  ) {
    console.error(
      "[FeatureFlags] Failed to delete feature flag:",
      error
    );

    throw error;
  }
}


export {
  normalizeFeatureFlagKey,
};