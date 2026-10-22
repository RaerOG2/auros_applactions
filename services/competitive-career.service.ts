import { supabase } from "../lib/supabase";

export type CompetitiveAchievement = {
  id: string;
  label: string;
  description: string;
};

export type CompetitiveRankHistory = {
  event: string;
  slug: string;
  globalRank: number;
  ap: number;
  recordedAt: string;
};

export type CompetitiveCareerExtension = {
  competitiveId: string;
  currentAp: number;
  peakAp: number;
  globalRank: number | null;
  tournamentsPlayed: number;
  roundWins: number;
  eliminations: number;
  earnedAchievements: CompetitiveAchievement[];
  rankHistory: CompetitiveRankHistory[];
};

export async function getCompetitiveCareerExtension(
  competitiveId: string,
): Promise<CompetitiveCareerExtension | null> {
  const { data, error } = await supabase.rpc(
    "competitive_public_career_extension",
    { p_competitive_id: competitiveId },
  );

  if (error) {
    throw error;
  }

  return data as CompetitiveCareerExtension | null;
}

export {
  COMPETITIVE_DIVISIONS,
  getDivisionProgress,
} from "../lib/competitive-divisions";
