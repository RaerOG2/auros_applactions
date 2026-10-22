import { supabase } from "../lib/supabase";
import type {
  CompetitiveProfile,
  CompetitiveSeries,
  CompetitiveStaffAccess,
  CompetitiveTournament,
  CompetitiveRole,
} from "../types/competitive";

function mapProfile(row: Record<string, any>): CompetitiveProfile {
  return {
    id: row.id,
    competitiveId: row.competitive_id,
    epicDisplayName: row.epic_display_name ?? null,
    epicAccountId: row.epic_account_id ?? null,
    epicVerifiedAt: row.epic_verified_at ?? null,
    countryCode: row.country_code ?? null,
    currentAp: row.current_ap ?? 0,
    seasonAp: row.season_ap ?? 0,
    careerAp: row.career_ap ?? 0,
    peakAp: row.peak_ap ?? 0,
    peakRank: row.peak_rank ?? null,
    status: row.status ?? "active",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSeries(row: Record<string, any>): CompetitiveSeries {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name ?? null,
    description: row.description ?? null,
    seasonLabel: row.season_label ?? null,
    isPublic: !!row.is_public,
    createdAt: row.created_at,
  };
}

function mapTournament(row: Record<string, any>): CompetitiveTournament {
  return {
    id: row.id,
    seriesId: row.series_id ?? null,
    scoringRulesetId: row.scoring_ruleset_id ?? null,
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    status: row.status,
    format: row.format,
    registrationType: row.registration_type,
    maxEntries: row.max_entries,
    roundCount: row.round_count,
    startsAt: row.starts_at ?? null,
    registrationOpensAt: row.registration_opens_at ?? null,
    registrationClosesAt: row.registration_closes_at ?? null,
    checkInOpensAt: row.check_in_opens_at ?? null,
    checkInClosesAt: row.check_in_closes_at ?? null,
    isPublic: !!row.is_public,
    publicLeaderboard: !!row.public_leaderboard,
    apEnabled: !!row.ap_enabled,
    apRewardProfile: row.ap_reward_profile ?? null,
    qualificationEnabled: !!row.qualification_enabled,
    qualificationTop: row.qualification_top ?? null,
    playerStatsEnabled: row.player_stats_enabled ?? true,
    reviewsEnabled: !!row.reviews_enabled,
    broadcastEnabled: !!row.broadcast_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPublicTournaments() {
  const { data, error } = await supabase
    .from("competitive_tournaments")
    .select("*")
    .eq("is_public", true)
    .neq("status", "draft")
    .order("starts_at", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data ?? []).map(mapTournament);
}

export async function getPublicSeries() {
  const { data, error } = await supabase
    .from("competitive_series")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapSeries);
}

export async function getMyCompetitiveProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;

  const { data, error } = await supabase
    .from("competitive_profiles")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function ensureMyCompetitiveProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("Not authenticated");

  const existing = await getMyCompetitiveProfile();
  if (existing) return existing;

  // The profile creation RPC protects AP, Epic verification and
  // other staff-managed fields from being written by the browser.
  const { error } = await supabase.rpc("competitive_create_my_profile");

  if (error) {
    throw error;
  }

  const created = await getMyCompetitiveProfile();

  if (!created) {
    throw new Error("Competitive profile could not be created.");
  }

  return created;
}

export async function getCompetitiveStaffAccess(): Promise<CompetitiveStaffAccess | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const user = authData.user;
  if (!user) return null;

  const [{ data: profile, error: profileError }, { data: staff, error: staffError }] =
    await Promise.all([
      supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle(),
      supabase
        .from("competitive_staff")
        .select("role")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

  if (profileError) throw profileError;
  if (staffError) throw staffError;

  const isSiteAdmin = !!profile?.is_admin;
  if (!isSiteAdmin && !staff?.role) return null;

  return {
    userId: user.id,
    role: (staff?.role ?? "competitive_admin") as CompetitiveRole,
    isSiteAdmin,
  };
}

export async function getAdminTournaments() {
  const access = await getCompetitiveStaffAccess();
  if (!access) throw new Error("Competitive staff access required");

  const { data, error } = await supabase
    .from("competitive_tournaments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapTournament);
}

export async function getAdminSeries() {
  const access = await getCompetitiveStaffAccess();
  if (!access) throw new Error("Competitive staff access required");

  const { data, error } = await supabase
    .from("competitive_series")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapSeries);
}

export async function getScoringRulesets() {
  const access = await getCompetitiveStaffAccess();
  if (!access) throw new Error("Competitive staff access required");

  const { data, error } = await supabase
    .from("competitive_scoring_rulesets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    version: row.version,
    eliminationPoints: Number(row.elimination_points ?? 0),
    placementPoints: (row.placement_points ?? {}) as Record<string, number>,
    rules: row.rules ?? { placementMode: "milestones", placementMilestones: [], eliminationModifiers: [] },
    isPreset: !!row.is_preset,
    isLocked: !!row.is_locked,
    createdAt: row.created_at,
  }));
}

export async function createTournament(input: import("../types/competitive").CreateTournamentInput) {
  const access = await getCompetitiveStaffAccess();
  if (!access) throw new Error("Competitive staff access required");

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("Not authenticated");

  const payload = {
    series_id: input.seriesId,
    scoring_ruleset_id: input.scoringRulesetId,
    slug: input.slug,
    name: input.name.trim(),
    description: input.description.trim() || null,
    status: "draft" as const,
    format: input.format,
    registration_type: input.registrationType,
    max_entries: input.maxEntries,
    round_count: input.roundCount,
    starts_at: input.startsAt,
    registration_opens_at: input.registrationOpensAt,
    registration_closes_at: input.registrationClosesAt,
    check_in_opens_at: input.checkInOpensAt,
    check_in_closes_at: input.checkInClosesAt,
    is_public: input.isPublic,
    public_leaderboard: input.publicLeaderboard,
    ap_enabled: input.apEnabled,
    ap_reward_profile: input.apEnabled ? input.apRewardProfile : null,
    qualification_enabled: input.qualificationEnabled,
    qualification_top: input.qualificationEnabled ? input.qualificationTop : null,
    player_stats_enabled: input.playerStatsEnabled,
    reviews_enabled: input.reviewsEnabled,
    broadcast_enabled: input.broadcastEnabled,
    created_by: authData.user.id,
  };

  const { data, error } = await supabase
    .from("competitive_tournaments")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;

  const rounds = Array.from({ length: input.roundCount }, (_, index) => ({
    tournament_id: data.id,
    round_number: index + 1,
    name: `Round ${index + 1}`,
    status: "locked" as const,
  }));

  const { error: roundError } = await supabase.from("competitive_rounds").insert(rounds);
  if (roundError) {
    await supabase.from("competitive_tournaments").delete().eq("id", data.id);
    throw roundError;
  }

  await supabase.from("competitive_audit_log").insert({
    actor_id: authData.user.id,
    tournament_id: data.id,
    entity_type: "tournament",
    entity_id: data.id,
    action: "created",
    after_data: payload,
  });

  return mapTournament(data);
}

export async function getAdminTournament(id: string) {
  const access = await getCompetitiveStaffAccess();
  if (!access) throw new Error("Competitive staff access required");
  const { data, error } = await supabase.from("competitive_tournaments").select("*").eq("id", id).single();
  if (error) throw error;
  return mapTournament(data);
}

export async function getTournamentRounds(tournamentId: string) {
  const { data, error } = await supabase
    .from("competitive_rounds")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("round_number", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    tournamentId: row.tournament_id,
    roundNumber: row.round_number,
    name: row.name ?? null,
    status: row.status,
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createScoringRuleset(
  input: import("../types/competitive").CreateScoringRulesetInput
) {
  const access = await getCompetitiveStaffAccess();
  if (!access) throw new Error("Competitive staff access required");

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("Not authenticated");

  const milestones = input.placementMilestones
    .map((rule) => ({
      id: rule.id,
      top: Math.max(1, Math.round(Number(rule.top))),
      points: Number(rule.points),
      label: rule.label?.trim() || `Top ${Math.max(1, Math.round(Number(rule.top)))}`,
    }))
    .filter((rule) => Number.isFinite(rule.top) && Number.isFinite(rule.points))
    .sort((a, b) => b.top - a.top);

  const modifiers = input.eliminationModifiers
    .map((rule) => ({
      id: rule.id,
      key: rule.key.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_"),
      label: rule.label.trim(),
      points: Number(rule.points),
    }))
    .filter((rule) => rule.key && rule.label && Number.isFinite(rule.points));

  // Legacy snapshot retained for backwards compatibility / quick inspection.
  // It contains the cumulative placement score for each configured threshold.
  const placementPoints: Record<string, number> = {};
  for (const milestone of milestones) {
    placementPoints[String(milestone.top)] = milestones
      .filter((candidate) => candidate.top >= milestone.top)
      .reduce((sum, candidate) => sum + candidate.points, 0);
  }

  const rules = {
    placementMode: "milestones" as const,
    placementMilestones: milestones,
    eliminationModifiers: modifiers,
  };

  const payload = {
    name: input.name.trim(),
    version: input.version.trim(),
    elimination_points: Number(input.eliminationPoints),
    placement_points: placementPoints,
    rules,
    is_preset: input.isPreset,
    is_locked: false,
    created_by: authData.user.id,
  };

  const { data, error } = await supabase
    .from("competitive_scoring_rulesets")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;

  await supabase.from("competitive_audit_log").insert({
    actor_id: authData.user.id,
    entity_type: "scoring_ruleset",
    entity_id: data.id,
    action: "created",
    after_data: payload,
  });

  return {
    id: data.id,
    name: data.name,
    version: data.version,
    eliminationPoints: Number(data.elimination_points ?? 0),
    placementPoints: (data.placement_points ?? {}) as Record<string, number>,
    rules: data.rules ?? rules,
    isPreset: !!data.is_preset,
    isLocked: !!data.is_locked,
    createdAt: data.created_at,
  };
}
