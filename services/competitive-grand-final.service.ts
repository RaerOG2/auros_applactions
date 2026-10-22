import { supabase } from "../lib/supabase";

export type GrandFinalCutlineStatus =
  | "awaiting_configuration"
  | "inside_cutline"
  | "outside_cutline"
  | "selected"
  | "not_selected";

export type GrandFinalInfo = {
  seasonId: string;
  seasonName: string;
  slots: number | null;
  lineupLocked: boolean;
  tournamentSlug: string | null;
  tournamentName: string | null;
  tournamentStatus: string | null;
  qualifiedPlayers: number;
  selectedPlayers: number;
  importedPlayers: number;
  pendingQualifiers: number;
};

export type GrandFinalCandidate = {
  rankingPosition: number;
  competitiveId: string;
  displayName: string;
  epicVerified: boolean;
  qualificationCount: number;
  championshipPoints: number;
  bestQualifierFinish: number;
  cutoffStatus: GrandFinalCutlineStatus;
  inLineup: boolean;
  registered: boolean;
};

export async function getGrandFinalInfo(
  seasonSlug: string,
): Promise<GrandFinalInfo | null> {
  const { data, error } = await supabase.rpc(
    "competitive_aucs_grand_final_info",
    {
      p_slug: seasonSlug,
    },
  );

  if (error) {
    throw error;
  }

  const row = data?.[0];

  if (!row) {
    return null;
  }

  return {
    seasonId: row.season_id,
    seasonName: row.season_name,
    slots: row.slots === null ? null : Number(row.slots),
    lineupLocked: Boolean(row.lineup_locked),
    tournamentSlug: row.tournament_slug ?? null,
    tournamentName: row.tournament_name ?? null,
    tournamentStatus: row.tournament_status ?? null,
    qualifiedPlayers: Number(row.qualified_players ?? 0),
    selectedPlayers: Number(row.selected_players ?? 0),
    importedPlayers: Number(row.imported_players ?? 0),
    pendingQualifiers: Number(row.pending_qualifiers ?? 0),
  };
}

export async function getGrandFinalPool(
  seasonId: string,
): Promise<GrandFinalCandidate[]> {
  const { data, error } = await supabase.rpc(
    "competitive_aucs_grand_final_pool",
    {
      p_series_id: seasonId,
    },
  );

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    rankingPosition: Number(row.ranking_position),
    competitiveId: row.competitive_id,
    displayName: row.display_name,
    epicVerified: Boolean(row.epic_verified),
    qualificationCount: Number(row.qualification_count ?? 0),
    championshipPoints: Number(row.championship_points ?? 0),
    bestQualifierFinish: Number(row.best_qualifier_finish ?? 0),
    cutoffStatus: row.cutoff_status as GrandFinalCutlineStatus,
    inLineup: Boolean(row.in_lineup),
    registered: Boolean(row.registered),
  }));
}

export async function configureGrandFinal(input: {
  seasonId: string;
  tournamentId: string;
  slots: number;
}): Promise<void> {
  const { error } = await supabase.rpc(
    "competitive_aucs_configure_grand_final",
    {
      p_series_id: input.seasonId,
      p_tournament_id: input.tournamentId,
      p_slots: input.slots,
    },
  );

  if (error) {
    throw error;
  }
}

export async function lockGrandFinalLineup(
  seasonId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc(
    "competitive_aucs_lock_grand_final",
    {
      p_series_id: seasonId,
    },
  );

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

export async function importGrandFinalLineup(
  seasonId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc(
    "competitive_aucs_import_grand_final",
    {
      p_series_id: seasonId,
    },
  );

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}
