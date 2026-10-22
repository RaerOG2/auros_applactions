import { supabase } from "../lib/supabase";

export type UnifiedTournamentKind =
  | "standard"
  | "qualifier"
  | "final"
  | "championship";

export type UnifiedTournament = {
  id: string;
  name: string;
  slug: string;
  status: string;
  event_kind: UnifiedTournamentKind;
  is_test: boolean;
  max_entries: number;
  round_count: number;
  starts_at: string | null;
  is_public: boolean;
  registration_type: string;
  ap_reward_profile: string | null;
};

export type FinalSourceInput = {
  tournamentId: string;
  top: number;
};

export type UnifiedCreatorInput = {
  kind: UnifiedTournamentKind;
  test: boolean;
  name: string;
  slug: string;
  description: string;
  maxEntries: number;
  roundCount: number;
  startsAt: string | null;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  checkInOpensAt: string | null;
  checkInClosesAt: string | null;
  registrationType: string;
  scoringRulesetId: string | null;
  seriesId: string | null;
  isPublic: boolean;
  publicLeaderboard: boolean;
  apEnabled: boolean;
  apRewardProfile: string | null;
  qualificationEnabled: boolean;
  qualificationTop: number | null;
  playerStatsEnabled: boolean;
  reviewsEnabled: boolean;
  broadcastEnabled: boolean;
};

export type FinalCandidate = {
  source_tournament_id: string;
  source_name: string;
  source_entry_id: string;
  player_id: string | null;
  test_player_id: string | null;
  display_name: string;
  finishing_position: number;
  total_points: number;
  source_ready: boolean;
};

export type FinalSourceRecord = {
  source_tournament_id: string;
  qualify_top: number;
  source_name: string;
  source_status: string;
  source_round_count: number;
  published_round_count: number;
  ready: boolean;
};

async function requireAdmin() {
  const { data, error } = await supabase.rpc("is_competitive_admin");

  if (error) {
    throw error;
  }

  if (data !== true) {
    throw new Error("Competitive Admin access is required.");
  }
}

export async function getUnifiedTournaments(): Promise<UnifiedTournament[]> {
  await requireAdmin();

  const { data, error } = await supabase
    .from("competitive_tournaments")
    .select(
      "id,name,slug,status,event_kind,is_test,max_entries,round_count,starts_at,is_public,registration_type,ap_reward_profile",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as UnifiedTournament[];
}

export async function createUnifiedTournament(
  config: UnifiedCreatorInput,
  sources: FinalSourceInput[],
): Promise<string> {
  await requireAdmin();

  const { data, error } = await supabase.rpc("competitive_v2_create_tournament", {
    p_config: config,
    p_sources: sources,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function getFinalSources(
  tournamentId: string,
): Promise<FinalSourceRecord[]> {
  await requireAdmin();

  const { data, error } = await supabase
    .from("competitive_final_sources")
    .select("source_tournament_id,qualify_top")
    .eq("final_tournament_id", tournamentId);

  if (error) {
    throw error;
  }

  if (!data?.length) {
    return [];
  }

  const sourceIds = data.map((source) => source.source_tournament_id);
  const { data: tournaments, error: tournamentError } = await supabase
    .from("competitive_tournaments")
    .select("id,name,status,round_count")
    .in("id", sourceIds);

  if (tournamentError) {
    throw tournamentError;
  }

  const { data: rounds, error: roundsError } = await supabase
    .from("competitive_rounds")
    .select("tournament_id,status")
    .in("tournament_id", sourceIds);

  if (roundsError) {
    throw roundsError;
  }

  const publishedCounts = new Map<string, number>();

  for (const round of rounds ?? []) {
    if (round.status === "published") {
      publishedCounts.set(
        round.tournament_id,
        (publishedCounts.get(round.tournament_id) ?? 0) + 1,
      );
    }
  }

  const tournamentMap = new Map(
    (tournaments ?? []).map((tournament) => [tournament.id, tournament]),
  );

  return data.map((source) => {
    const event = tournamentMap.get(source.source_tournament_id);
    const publishedRounds = publishedCounts.get(source.source_tournament_id) ?? 0;

    return {
      source_tournament_id: source.source_tournament_id,
      qualify_top: source.qualify_top,
      source_name: event?.name ?? "Missing source tournament",
      source_status: event?.status ?? "unknown",
      source_round_count: event?.round_count ?? 0,
      published_round_count: publishedRounds,
      ready: event?.status === "completed" && publishedRounds === event?.round_count,
    };
  });
}

export async function getFinalCandidates(
  tournamentId: string,
): Promise<FinalCandidate[]> {
  await requireAdmin();

  const { data, error } = await supabase.rpc(
    "competitive_v2_final_candidates",
    { p_final_id: tournamentId },
  );

  if (error) {
    throw error;
  }

  return (data ?? []) as FinalCandidate[];
}

export async function importFinalists(tournamentId: string): Promise<number> {
  await requireAdmin();

  const { data, error } = await supabase.rpc(
    "competitive_v2_import_finalists",
    { p_final_id: tournamentId },
  );

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

export async function seedTestPlayers(
  tournamentId: string,
  amount: number,
): Promise<number> {
  await requireAdmin();

  const { data, error } = await supabase.rpc(
    "competitive_v2_seed_test_players",
    {
      p_tournament_id: tournamentId,
      p_count: amount,
    },
  );

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

export async function prepareTestTournament(
  tournamentId: string,
): Promise<number> {
  await requireAdmin();

  const { data, error } = await supabase.rpc("competitive_v2_prepare_test", {
    p_tournament_id: tournamentId,
  });

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

export async function simulateTestRound(
  tournamentId: string,
  roundNumber: number,
): Promise<number> {
  await requireAdmin();

  const { data, error } = await supabase.rpc(
    "competitive_v2_simulate_test_round",
    {
      p_tournament_id: tournamentId,
      p_round_number: roundNumber,
    },
  );

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

export type TournamentOperationEntry = {
  id: string;
  display_name: string;
  status: string;
};

export type TournamentProtest = {
  id: string;
  reason: string;
  status: string;
  resolution: string | null;
  created_at: string;
};

export type TournamentAuditRow = {
  id: number;
  action: string;
  entity_type: string;
  created_at: string;
};

export async function getTournamentOperationData(tournamentId: string) {
  await requireAdmin();

  const [entryResponse, protestResponse, auditResponse] = await Promise.all([
    supabase
      .from("competitive_entries")
      .select("id,display_name,status")
      .eq("tournament_id", tournamentId)
      .order("created_at"),
    supabase
      .from("competitive_result_protests")
      .select("id,reason,status,resolution,created_at")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: false }),
    supabase
      .from("competitive_audit_log")
      .select("id,action,entity_type,created_at")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (entryResponse.error) throw entryResponse.error;
  if (protestResponse.error) throw protestResponse.error;
  if (auditResponse.error) throw auditResponse.error;

  return {
    entries: (entryResponse.data ?? []) as TournamentOperationEntry[],
    protests: (protestResponse.data ?? []) as TournamentProtest[],
    audit: (auditResponse.data ?? []) as TournamentAuditRow[],
  };
}

export async function applyBulkEntryAction(
  tournamentId: string,
  entryIds: string[],
  status: "registered" | "checked_in" | "withdrawn",
): Promise<number> {
  await requireAdmin();
  const { data, error } = await supabase.rpc("competitive_v2_bulk_entry_action", {
    p_tournament_id: tournamentId,
    p_entry_ids: entryIds,
    p_status: status,
  });
  if (error) throw error;
  return Number(data ?? 0);
}

export async function createTournamentProtest(
  tournamentId: string,
  reason: string,
): Promise<string> {
  await requireAdmin();
  const { data, error } = await supabase.rpc("competitive_v2_create_protest", {
    p_tournament_id: tournamentId,
    p_round_id: null,
    p_entry_id: null,
    p_reason: reason,
  });
  if (error) throw error;
  return data as string;
}

export async function resolveTournamentProtest(
  protestId: string,
  status: "reviewing" | "resolved" | "rejected",
  resolution: string,
): Promise<void> {
  await requireAdmin();
  const { error } = await supabase.rpc("competitive_v2_resolve_protest", {
    p_protest_id: protestId,
    p_status: status,
    p_resolution: resolution,
  });
  if (error) throw error;
}

/** Public read: never exposes private TEST tournaments or admin-only entries. */
export async function getPublicUnifiedTournaments(): Promise<UnifiedTournament[]> {
  const { data, error } = await supabase
    .from("competitive_tournaments")
    .select(
      "id,name,slug,status,event_kind,is_test,max_entries,round_count,starts_at,is_public,registration_type,ap_reward_profile",
    )
    .eq("is_public", true)
    .eq("is_test", false)
    .neq("status", "draft")
    .order("starts_at", { ascending: true, nullsFirst: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as UnifiedTournament[];
}

export type EditableRound = {
  id: string;
  round_number: number;
  status: string;
};

export async function getTournamentEditableRounds(tournamentId: string) {
  await requireAdmin();
  const { data, error } = await supabase
    .from("competitive_rounds")
    .select("id,round_number,status")
    .eq("tournament_id", tournamentId)
    .order("round_number", { ascending: true });
  if (error) throw error;
  return (data ?? []) as EditableRound[];
}

export async function applyTournamentPenalty(
  roundId: string,
  entryId: string,
  amount: number,
  reason: string,
) {
  await requireAdmin();
  const { error } = await supabase.rpc("competitive_v2_apply_penalty", {
    p_round_id: roundId,
    p_entry_id: entryId,
    p_penalty: amount,
    p_reason: reason,
  });
  if (error) throw error;
}
