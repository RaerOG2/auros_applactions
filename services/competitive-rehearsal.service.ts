import { supabase } from "../lib/supabase";

export type RehearsalStanding = {
  rank: number;
  displayName: string;
  points: number;
  eliminations: number;
  roundsPlayed: number;
};

export type RehearsalSnapshot = {
  rehearsalId: string;
  tournamentName: string;
  tournamentKind: string;
  roundCount: number;
  simulatedRounds: number;
  expiresAt: string;
  preview: true;
  standings: RehearsalStanding[];
};

export type RehearsalSession = {
  id: string;
  tournament_id: string;
  name: string;
  viewer_token: string;
  created_at: string;
  expires_at: string;
};

async function requireCompetitiveAdmin() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Sign in as a Competitive admin to use rehearsals.");
  }

  // Actual permission enforcement is also performed by every mutation RPC.
  return data.user;
}

export async function createCupRehearsal(tournamentId: string, playerCount: number) {
  await requireCompetitiveAdmin();

  const { data, error } = await supabase.rpc("competitive_v3_create_rehearsal", {
    p_tournament_id: tournamentId,
    p_player_count: playerCount,
  });

  if (error) {
    throw error;
  }

  const created = (data as Array<{ rehearsal_id: string; viewer_token: string }> | null)?.[0];

  if (!created) {
    throw new Error("Rehearsal creation returned no preview link.");
  }

  return {
    id: created.rehearsal_id,
    token: created.viewer_token,
  };
}

export async function getCupRehearsals(tournamentId?: string) {
  await requireCompetitiveAdmin();

  let query = supabase
    .from("competitive_rehearsal_sessions")
    .select("id,tournament_id,name,viewer_token,created_at,expires_at")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(30);

  if (tournamentId) {
    query = query.eq("tournament_id", tournamentId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as RehearsalSession[];
}

export async function simulateCupRehearsalRound(rehearsalId: string, roundNumber: number) {
  await requireCompetitiveAdmin();

  const { data, error } = await supabase.rpc(
    "competitive_v3_simulate_rehearsal_round",
    { p_rehearsal_id: rehearsalId, p_round_number: roundNumber },
  );

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

export async function getCupRehearsalSnapshot(rehearsalId: string, token: string) {
  const { data, error } = await supabase.rpc("competitive_v3_rehearsal_snapshot", {
    p_rehearsal_id: rehearsalId,
    p_viewer_token: token,
  });

  if (error) {
    throw error;
  }

  return data as RehearsalSnapshot;
}

export function getRehearsalPreviewPath(rehearsalId: string, token: string) {
  return `/broadcast/preview/${encodeURIComponent(rehearsalId)}?token=${encodeURIComponent(token)}`;
}

export function previewAurosPoints(rank: number, profile = "standard") {
  // Preview only. Mirrors the V0.1 default, not an official AP award.
  const base = rank === 1 ? 100 : rank <= 3 ? 75 : rank <= 10 ? 50 : rank <= 25 ? 25 : 10;
  const multiplier: Record<string, number> = {
    community: 0.5,
    standard: 1,
    qualifier: 1.25,
    major: 2,
  };

  return Math.round(base * (multiplier[profile] ?? 1));
}
