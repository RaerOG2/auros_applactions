export const FEATURE_FLAGS = {
  AUROS_CHANNEL:
    "AUROS_CHANNEL",

  MULTI_LANGUAGE:
    "MULTI_LANGUAGE",
} as const;


export type FeatureFlagKey =
  typeof FEATURE_FLAGS[
    keyof typeof FEATURE_FLAGS
  ];