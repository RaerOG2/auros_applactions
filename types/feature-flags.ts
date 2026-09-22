export type FeatureFlagAudience =
  | "everyone"
  | "beta"
  | "developers"
  | "admin";


export type FeatureFlag = {
  id:
    string;

  key:
    string;

  name:
    string;

  description:
    string | null;

  enabled:
    boolean;

  audience:
    FeatureFlagAudience;

  created_by:
    string | null;

  created_at:
    string;

  updated_at:
    string;
};


export type FeatureFlagInput = {
  key:
    string;

  name:
    string;

  description:
    string;

  enabled:
    boolean;

  audience:
    FeatureFlagAudience;
};


export type FeatureFlagAccessContext = {
  isLoggedIn:
    boolean;

  isBeta:
    boolean;

  isDev:
    boolean;

  isAdmin:
    boolean;
};