import { supabase } from "../lib/supabase";

export type CompetitiveRanking = {
  globalRank: number;
  competitiveId: string;
  displayName: string;
  countryCode: string | null;
  epicVerified: boolean;
  currentAp: number;
  careerAp: number;
  peakAp: number;
  tournamentsPlayed: number;
};

export type CompetitiveAPHistoryEntry = {
  tournamentSlug: string;
  tournamentName: string;
  finishingPosition: number;
  apAwarded: number;
  rewardProfile: string;
  awardedAt: string;
};

export type CompetitiveAPEvent = {
  tournamentId: string;
  tournamentName: string;
  status: string;
  apEnabled: boolean;
  isPublic: boolean;
  publicLeaderboard: boolean;
  rewardProfile: string;
  playerAwards: number;
  totalAp: number;
};

export type CompetitiveAPFinalization = {
  status: "finalized" | "already_finalized";
  awards: number;
  totalAp?: number;
};

type RankingRow = {
  global_rank: number;
  competitive_id: string;
  display_name: string;
  country_code: string | null;
  epic_verified: boolean;
  current_ap: number;
  career_ap: number;
  peak_ap: number;
  tournaments_played: number;
};

type HistoryRow = {
  tournament_slug: string;
  tournament_name: string;
  finishing_position: number;
  ap_awarded: number;
  reward_profile: string;
  awarded_at: string;
};

type EventRow = {
  tournament_id: string;
  tournament_name: string;
  status: string;
  ap_enabled: boolean;
  is_public: boolean;
  public_leaderboard: boolean;
  reward_profile: string;
  player_awards: number;
  total_ap: number;
};

export async function getCompetitiveRankings(
  countryCode: string | null = null,
  limit = 100,
): Promise<CompetitiveRanking[]> {
  const { data, error } = await supabase.rpc(
    "competitive_public_rankings",
    {
      p_country_code: countryCode,
      p_limit: limit,
    },
  );

  if (error) {
    throw error;
  }

  return ((data ?? []) as RankingRow[]).map((row) => ({
    globalRank: Number(row.global_rank),
    competitiveId: row.competitive_id,
    displayName: row.display_name,
    countryCode: row.country_code,
    epicVerified: Boolean(row.epic_verified),
    currentAp: Number(row.current_ap),
    careerAp: Number(row.career_ap),
    peakAp: Number(row.peak_ap),
    tournamentsPlayed: Number(row.tournaments_played),
  }));
}

export async function getCompetitiveAPHistory(
  competitiveId: string,
): Promise<CompetitiveAPHistoryEntry[]> {
  const { data, error } = await supabase.rpc(
    "competitive_public_ap_history",
    {
      p_competitive_id: competitiveId.trim(),
    },
  );

  if (error) {
    throw error;
  }

  return ((data ?? []) as HistoryRow[]).map((row) => ({
    tournamentSlug: row.tournament_slug,
    tournamentName: row.tournament_name,
    finishingPosition: Number(row.finishing_position),
    apAwarded: Number(row.ap_awarded),
    rewardProfile: row.reward_profile,
    awardedAt: row.awarded_at,
  }));
}

export async function getCompetitiveAPEvents(): Promise<CompetitiveAPEvent[]> {
  const { data, error } = await supabase.rpc("competitive_ap_event_status");

  if (error) {
    throw error;
  }

  return ((data ?? []) as EventRow[]).map((row) => ({
    tournamentId: row.tournament_id,
    tournamentName: row.tournament_name,
    status: row.status,
    apEnabled: Boolean(row.ap_enabled),
    isPublic: Boolean(row.is_public),
    publicLeaderboard: Boolean(row.public_leaderboard),
    rewardProfile: row.reward_profile,
    playerAwards: Number(row.player_awards),
    totalAp: Number(row.total_ap),
  }));
}

export async function finalizeTournamentAP(
  tournamentId: string,
): Promise<CompetitiveAPFinalization> {
  const { data, error } = await supabase.rpc(
    "competitive_finalize_tournament_ap",
    {
      p_tournament_id: tournamentId,
    },
  );

  if (error) {
    throw error;
  }

  return data as CompetitiveAPFinalization;
}

export function getAPDivision(points: number) {
  if (points >= 2000) {
    return "CHAMPION";
  }

  if (points >= 1000) {
    return "ELITE";
  }

  if (points >= 500) {
    return "GOLD";
  }

  if (points >= 250) {
    return "SILVER";
  }

  if (points >= 100) {
    return "BRONZE";
  }

  return "ROOKIE";
}
