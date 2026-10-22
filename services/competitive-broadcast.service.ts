import { supabase } from "../lib/supabase";

export type BroadcastStanding = {
  rank: number;
  competitiveId: string;
  displayName: string;
  points: number;
  eliminations: number;
  roundsPlayed: number;
  bestPlacement: number | null;
  latestPlacement: number | null;
  latestEliminations: number | null;
  rankChange: number | null;
};

export type GrandFinalBroadcastSnapshot = {
  seasonName: string;
  seasonSlug: string;
  tournamentName: string;
  tournamentStatus: string;
  totalRounds: number;
  publishedRounds: number;
  latestPublishedRound: number | null;
  lastPublishedAt: string | null;
  finalists: number;
  standings: BroadcastStanding[];
};

export type BroadcastView = "standings" | "top3" | "ticker";

function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapStanding(row: Record<string, unknown>): BroadcastStanding {
  return {
    rank: Number(row.rank ?? 0),
    competitiveId: String(row.competitiveId ?? ""),
    displayName: String(row.displayName ?? ""),
    points: Number(row.points ?? 0),
    eliminations: Number(row.eliminations ?? 0),
    roundsPlayed: Number(row.roundsPlayed ?? 0),
    bestPlacement: optionalNumber(row.bestPlacement),
    latestPlacement: optionalNumber(row.latestPlacement),
    latestEliminations: optionalNumber(row.latestEliminations),
    rankChange: optionalNumber(row.rankChange),
  };
}

export async function getGrandFinalBroadcastSnapshot(
  seasonSlug: string,
): Promise<GrandFinalBroadcastSnapshot | null> {
  const { data, error } = await supabase.rpc(
    "competitive_aucs_broadcast_snapshot",
    {
      p_slug: seasonSlug,
    },
  );

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const raw = data as Record<string, unknown>;
  const rawStandings = Array.isArray(raw.standings)
    ? raw.standings
    : [];

  return {
    seasonName: String(raw.seasonName ?? "AUCS"),
    seasonSlug: String(raw.seasonSlug ?? seasonSlug),
    tournamentName: String(raw.tournamentName ?? "Grand Final"),
    tournamentStatus: String(raw.tournamentStatus ?? "scheduled"),
    totalRounds: Number(raw.totalRounds ?? 0),
    publishedRounds: Number(raw.publishedRounds ?? 0),
    latestPublishedRound: optionalNumber(raw.latestPublishedRound),
    lastPublishedAt:
      typeof raw.lastPublishedAt === "string"
        ? raw.lastPublishedAt
        : null,
    finalists: Number(raw.finalists ?? 0),
    standings: rawStandings.map((row) =>
      mapStanding(row as Record<string, unknown>),
    ),
  };
}

export function getBroadcastUrl(
  seasonSlug: string,
  view: BroadcastView = "standings",
): string {
  return `/broadcast/aucs/${encodeURIComponent(seasonSlug)}?view=${view}`;
}

export function formatRankMovement(value: number | null): string {
  if (value === null) {
    return "—";
  }

  if (value > 0) {
    return `▲ ${value}`;
  }

  if (value < 0) {
    return `▼ ${Math.abs(value)}`;
  }

  return "—";
}

export function formatPublishedTime(value: string | null): string {
  if (!value) {
    return "AWAITING ROUND RESULTS";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "ROUND RESULTS PUBLISHED";
  }

  return `PUBLISHED ${date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
