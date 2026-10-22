import { supabase } from "../lib/supabase";

export type PublicCompetitivePlayer = {
  competitiveId: string;
  displayName: string;
  epicVerified: boolean;
  countryCode: string | null;
  bio: string;
  favoritePoi: string;
  currentAp: number;
  peakAp: number;
  tournamentsPlayed: number;
  roundsPlayed: number;
  roundWins: number;
  topTenRounds: number;
  eliminations: number;
  bestPlacement: number | null;
};

export type CompetitivePlayerHistory = {
  tournamentSlug: string;
  tournamentName: string;
  roundsPlayed: number;
  eliminations: number;
  roundWins: number;
  totalPoints: number;
  bestPlacement: number | null;
  lastRoundAt: string | null;
};

export type MyCompetitiveIdentity = {
  competitiveId: string;
  displayName: string;
  epicVerified: boolean;
  countryCode: string | null;
  bio: string;
  favoritePoi: string;
  currentAp: number;
  peakAp: number;
};

export type UpdateMyCompetitiveIdentity = {
  countryCode: string | null;
  bio: string;
  favoritePoi: string;
};

type PublicPlayerRow = {
  competitive_id: string;
  display_name: string;
  epic_verified: boolean;
  country_code: string | null;
  bio: string | null;
  favorite_poi: string | null;
  current_ap: number;
  peak_ap: number;
  tournaments_played: number;
  rounds_played: number;
  round_wins: number;
  top_ten_rounds: number;
  eliminations: number;
  best_placement: number | null;
};

type HistoryRow = {
  tournament_slug: string;
  tournament_name: string;
  rounds_played: number;
  eliminations: number;
  round_wins: number;
  total_points: number;
  best_placement: number | null;
  last_round_at: string | null;
};

type MyIdentityRow = {
  competitive_id: string;
  display_name: string;
  epic_verified: boolean;
  country_code: string | null;
  bio: string | null;
  favorite_poi: string | null;
  current_ap: number;
  peak_ap: number;
};

function mapPlayer(row: PublicPlayerRow): PublicCompetitivePlayer {
  return {
    competitiveId: row.competitive_id,
    displayName: row.display_name,
    epicVerified: Boolean(row.epic_verified),
    countryCode: row.country_code,
    bio: row.bio ?? "",
    favoritePoi: row.favorite_poi ?? "",
    currentAp: Number(row.current_ap ?? 0),
    peakAp: Number(row.peak_ap ?? 0),
    tournamentsPlayed: Number(row.tournaments_played ?? 0),
    roundsPlayed: Number(row.rounds_played ?? 0),
    roundWins: Number(row.round_wins ?? 0),
    topTenRounds: Number(row.top_ten_rounds ?? 0),
    eliminations: Number(row.eliminations ?? 0),
    bestPlacement: row.best_placement === null ? null : Number(row.best_placement),
  };
}

function mapHistory(row: HistoryRow): CompetitivePlayerHistory {
  return {
    tournamentSlug: row.tournament_slug,
    tournamentName: row.tournament_name,
    roundsPlayed: Number(row.rounds_played ?? 0),
    eliminations: Number(row.eliminations ?? 0),
    roundWins: Number(row.round_wins ?? 0),
    totalPoints: Number(row.total_points ?? 0),
    bestPlacement: row.best_placement === null ? null : Number(row.best_placement),
    lastRoundAt: row.last_round_at ?? null,
  };
}

function mapMyIdentity(row: MyIdentityRow): MyCompetitiveIdentity {
  return {
    competitiveId: row.competitive_id,
    displayName: row.display_name,
    epicVerified: Boolean(row.epic_verified),
    countryCode: row.country_code ?? null,
    bio: row.bio ?? "",
    favoritePoi: row.favorite_poi ?? "",
    currentAp: Number(row.current_ap ?? 0),
    peakAp: Number(row.peak_ap ?? 0),
  };
}

export async function getPublicCompetitivePlayers(
  search = "",
  limit = 60,
): Promise<PublicCompetitivePlayer[]> {
  const { data, error } = await supabase.rpc(
    "competitive_public_player_directory",
    {
      p_search: search.trim(),
      p_limit: limit,
    },
  );

  if (error) {
    throw error;
  }

  return ((data ?? []) as PublicPlayerRow[]).map(mapPlayer);
}

export async function getPublicCompetitivePlayer(
  competitiveId: string,
): Promise<PublicCompetitivePlayer | null> {
  const results = await getPublicCompetitivePlayers(competitiveId, 10);

  return (
    results.find(
      (player) =>
        player.competitiveId.toUpperCase() === competitiveId.trim().toUpperCase(),
    ) ?? null
  );
}

export async function getPublicCompetitivePlayerHistory(
  competitiveId: string,
): Promise<CompetitivePlayerHistory[]> {
  const { data, error } = await supabase.rpc(
    "competitive_public_player_history",
    {
      p_competitive_id: competitiveId.trim(),
    },
  );

  if (error) {
    throw error;
  }

  return ((data ?? []) as HistoryRow[]).map(mapHistory);
}

export async function getMyCompetitiveIdentity(): Promise<MyCompetitiveIdentity | null> {
  const { data, error } = await supabase.rpc(
    "competitive_get_my_profile",
  );

  if (error) {
    throw error;
  }

  return data ? mapMyIdentity(data as MyIdentityRow) : null;
}

export async function createMyCompetitiveIdentity(): Promise<MyCompetitiveIdentity> {
  const { data, error } = await supabase.rpc(
    "competitive_create_my_profile",
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Competitive profile could not be created.");
  }

  return mapMyIdentity(data as MyIdentityRow);
}

export async function updateMyCompetitiveIdentity(
  input: UpdateMyCompetitiveIdentity,
): Promise<void> {
  const { error } = await supabase.rpc(
    "competitive_update_my_profile",
    {
      p_country_code: input.countryCode,
      p_bio: input.bio,
      p_favorite_poi: input.favoritePoi,
    },
  );

  if (error) {
    throw error;
  }
}
