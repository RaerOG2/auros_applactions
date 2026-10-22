export type CompetitiveRole =
  | "staff"
  | "result_manager"
  | "tournament_manager"
  | "competitive_admin";

export type TournamentStatus =
  | "draft"
  | "scheduled"
  | "registration_open"
  | "check_in"
  | "in_progress"
  | "completed"
  | "archived";

export type TournamentFormat = "solo";
export type RegistrationType = "open" | "invite_only" | "qualification_required" | "private";
export type RoundStatus = "locked" | "active" | "review" | "published";
export type ResultStatus = "normal" | "dns" | "dnf" | "dq";

export type PlacementMilestone = {
  id: string;
  top: number;
  points: number;
  label?: string;
};

export type EliminationModifier = {
  id: string;
  key: string;
  label: string;
  points: number;
};

export type CompetitiveScoringRules = {
  placementMode: "milestones";
  placementMilestones: PlacementMilestone[];
  eliminationModifiers: EliminationModifier[];
};

export type CompetitiveProfile = {
  id: string; competitiveId: string; epicDisplayName: string | null; epicAccountId: string | null;
  epicVerifiedAt: string | null; countryCode: string | null; currentAp: number; seasonAp: number;
  careerAp: number; peakAp: number; peakRank: number | null;
  status: "active" | "suspended" | "banned" | "retired"; createdAt: string; updatedAt: string;
};

export type CompetitiveSeries = {
  id: string; slug: string; name: string; shortName: string | null; description: string | null;
  seasonLabel: string | null; isPublic: boolean; createdAt: string;
};

export type CompetitiveScoringRuleset = {
  id: string;
  name: string;
  version: string;
  eliminationPoints: number;
  placementPoints: Record<string, number>;
  rules: CompetitiveScoringRules;
  isPreset: boolean;
  isLocked: boolean;
  createdAt: string;
};

export type CompetitiveTournament = {
  id: string; seriesId: string | null; scoringRulesetId: string | null; slug: string; name: string;
  description: string | null; status: TournamentStatus; format: TournamentFormat;
  registrationType: RegistrationType; maxEntries: number; roundCount: number; startsAt: string | null;
  registrationOpensAt: string | null; registrationClosesAt: string | null; checkInOpensAt: string | null;
  checkInClosesAt: string | null; isPublic: boolean; publicLeaderboard: boolean; apEnabled: boolean;
  apRewardProfile: string | null; qualificationEnabled: boolean; qualificationTop: number | null;
  playerStatsEnabled: boolean; reviewsEnabled: boolean; broadcastEnabled: boolean; createdAt: string; updatedAt: string;
};

export type CompetitiveRound = {
  id: string; tournamentId: string; roundNumber: number; name: string | null; status: RoundStatus;
  publishedAt: string | null; createdAt: string; updatedAt: string;
};

export type CreateTournamentInput = {
  name: string; slug: string; description: string; seriesId: string | null; scoringRulesetId: string | null;
  format: TournamentFormat; registrationType: RegistrationType; maxEntries: number; roundCount: number;
  startsAt: string | null; registrationOpensAt: string | null; registrationClosesAt: string | null;
  checkInOpensAt: string | null; checkInClosesAt: string | null; isPublic: boolean; publicLeaderboard: boolean;
  apEnabled: boolean; apRewardProfile: string | null; qualificationEnabled: boolean; qualificationTop: number | null;
  playerStatsEnabled: boolean; reviewsEnabled: boolean; broadcastEnabled: boolean;
};

export type CompetitiveStaffAccess = { userId: string; role: CompetitiveRole; isSiteAdmin: boolean; };

export type CreateScoringRulesetInput = {
  name: string;
  version: string;
  eliminationPoints: number;
  placementMilestones: PlacementMilestone[];
  eliminationModifiers: EliminationModifier[];
  isPreset: boolean;
};
