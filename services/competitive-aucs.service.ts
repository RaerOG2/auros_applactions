import { supabase } from "../lib/supabase";
import { getCompetitiveStaffAccess } from "./competitive.service";

export type AUCSStatus = "draft" | "active" | "completed";

export type AUCSSeason = {
  slug: string;
  name: string;
  seasonLabel: string | null;
  description: string | null;
  status: AUCSStatus;
  eventCount: number;
  completedEvents: number;
  winnerCompetitiveId: string | null;
  winnerDisplayName: string | null;
};

export type AUCSEvent = {
  tournamentId: string;
  slug: string;
  name: string;
  status: string;
  startsAt: string | null;
  roundCount: number;
  qualificationEnabled: boolean;
  qualificationTop: number | null;
  pointsFinalized: boolean;
};

export type AUCSStanding = {
  rank: number;
  competitiveId: string;
  displayName: string;
  epicVerified: boolean;
  countryCode: string | null;
  championshipPoints: number;
  eventsPlayed: number;
  eventWins: number;
  bestFinish: number;
};

export type AUCSQualifier = {
  tournamentSlug: string;
  tournamentName: string;
  competitiveId: string;
  displayName: string;
  finishingPosition: number;
};

export type AUCSAdminSeason = {
  id: string;
  slug: string;
  name: string;
  seasonLabel: string | null;
  description: string | null;
  status: AUCSStatus;
  isPublic: boolean;
  points: number[];
};

export type AUCSAdminEvent = {
  id: string;
  slug: string;
  name: string;
  status: string;
  seriesId: string | null;
  roundCount: number;
  isPublic: boolean;
  qualificationEnabled: boolean;
  qualificationTop: number | null;
  pointsFinalized: boolean;
};

export const DEFAULT_AUCS_POINTS = [
  100, 80, 65, 55, 45, 40, 35, 30, 25, 20,
];

async function requireAUCSAdmin() {
  const access = await getCompetitiveStaffAccess();

  if (!access || (!access.isSiteAdmin && access.role !== "competitive_admin")) {
    throw new Error("Competitive Admin access required.");
  }
}

export async function getPublicAUCSSeasons(): Promise<AUCSSeason[]> {
  const { data, error } = await supabase.rpc("competitive_aucs_public_seasons");

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    slug: row.slug,
    name: row.name,
    seasonLabel: row.season_label ?? null,
    description: row.description ?? null,
    status: row.championship_status as AUCSStatus,
    eventCount: Number(row.event_count ?? 0),
    completedEvents: Number(row.completed_events ?? 0),
    winnerCompetitiveId: row.winner_competitive_id ?? null,
    winnerDisplayName: row.winner_display_name ?? null,
  }));
}

export async function getPublicAUCSEvents(slug: string): Promise<AUCSEvent[]> {
  const { data, error } = await supabase.rpc("competitive_aucs_public_events", {
    p_slug: slug,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    tournamentId: row.tournament_id,
    slug: row.tournament_slug,
    name: row.tournament_name,
    status: row.status,
    startsAt: row.starts_at ?? null,
    roundCount: Number(row.round_count ?? 0),
    qualificationEnabled: Boolean(row.qualification_enabled),
    qualificationTop: row.qualification_top ?? null,
    pointsFinalized: Boolean(row.points_finalized),
  }));
}

export async function getPublicAUCSStandings(slug: string): Promise<AUCSStanding[]> {
  const { data, error } = await supabase.rpc("competitive_aucs_public_standings", {
    p_slug: slug,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    rank: Number(row.rank),
    competitiveId: row.competitive_id,
    displayName: row.display_name,
    epicVerified: Boolean(row.epic_verified),
    countryCode: row.country_code ?? null,
    championshipPoints: Number(row.championship_points ?? 0),
    eventsPlayed: Number(row.events_played ?? 0),
    eventWins: Number(row.event_wins ?? 0),
    bestFinish: Number(row.best_finish ?? 0),
  }));
}

export async function getPublicAUCSQualifiers(slug: string): Promise<AUCSQualifier[]> {
  const { data, error } = await supabase.rpc("competitive_aucs_public_qualifiers", {
    p_slug: slug,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    tournamentSlug: row.tournament_slug,
    tournamentName: row.tournament_name,
    competitiveId: row.competitive_id,
    displayName: row.display_name,
    finishingPosition: Number(row.finishing_position),
  }));
}

export async function getAdminAUCSSeasons(): Promise<AUCSAdminSeason[]> {
  await requireAUCSAdmin();

  const { data, error } = await supabase
    .from("competitive_series")
    .select("id,slug,name,season_label,description,championship_status,is_public,championship_points")
    .eq("series_type", "aucs")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    seasonLabel: row.season_label ?? null,
    description: row.description ?? null,
    status: row.championship_status as AUCSStatus,
    isPublic: Boolean(row.is_public),
    points: (row.championship_points ?? []).map(Number),
  }));
}

export async function getAdminAUCSEvents(): Promise<AUCSAdminEvent[]> {
  await requireAUCSAdmin();

  const { data: events, error } = await supabase
    .from("competitive_tournaments")
    .select("id,slug,name,status,series_id,round_count,is_public,qualification_enabled,qualification_top")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const { data: awards, error: awardsError } = await supabase
    .from("competitive_championship_awards")
    .select("tournament_id");

  if (awardsError) {
    throw awardsError;
  }

  const finalized = new Set((awards ?? []).map((award) => award.tournament_id));

  return (events ?? []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    seriesId: row.series_id ?? null,
    roundCount: Number(row.round_count ?? 0),
    isPublic: Boolean(row.is_public),
    qualificationEnabled: Boolean(row.qualification_enabled),
    qualificationTop: row.qualification_top ?? null,
    pointsFinalized: finalized.has(row.id),
  }));
}

export async function createAUCSSeason(input: {
  name: string;
  slug: string;
  seasonLabel: string;
  description: string;
  points: number[];
}): Promise<string> {
  await requireAUCSAdmin();

  const { data, error } = await supabase.rpc("competitive_aucs_create_season", {
    p_name: input.name.trim(),
    p_slug: input.slug.trim(),
    p_season_label: input.seasonLabel.trim(),
    p_description: input.description.trim(),
    p_points: input.points,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function setAUCSStatus(id: string, status: "active" | "completed") {
  await requireAUCSAdmin();

  const { error } = await supabase.rpc("competitive_aucs_set_season_status", {
    p_series_id: id,
    p_status: status,
  });

  if (error) {
    throw error;
  }
}

export async function assignAUCSEvent(tournamentId: string, seasonId: string) {
  await requireAUCSAdmin();

  const { error } = await supabase.rpc("competitive_aucs_assign_tournament", {
    p_tournament_id: tournamentId,
    p_series_id: seasonId,
  });

  if (error) {
    throw error;
  }
}

export async function finalizeAUCSEvent(tournamentId: string) {
  await requireAUCSAdmin();

  const { data, error } = await supabase.rpc("competitive_aucs_finalize_tournament", {
    p_tournament_id: tournamentId,
  });

  if (error) {
    throw error;
  }

  return data as { status: string; players: number };
}
