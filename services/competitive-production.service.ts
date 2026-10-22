import { supabase } from "../lib/supabase";

export type ProductionScene =
  | "standings"
  | "top3"
  | "ticker"
  | "spotlight"
  | "reveal"
  | "intermission";

export type ProductionState = {
  scene: ProductionScene;
  featuredCompetitiveId: string | null;
  headline: string;
  subtitle: string;
  autoReveal: boolean;
  revision: number;
  lastRevealRound: number | null;
  sceneChangedAt: string | null;
  sceneExpiresAt: string | null;
};

export type ProductionCue = {
  id: number;
  scene: ProductionScene;
  action: string;
  headline: string | null;
  round_number: number | null;
  created_at: string;
};

export type ProductionChanges = {
  scene?: ProductionScene;
  featuredCompetitiveId?: string | null;
  headline?: string;
  subtitle?: string;
  autoReveal?: boolean;
};

export const PRODUCTION_SCENES: Array<{
  id: ProductionScene;
  title: string;
  description: string;
}> = [
  {
    id: "standings",
    title: "Official Standings",
    description: "Top 10, Tournament Points and rank movement",
  },
  {
    id: "top3",
    title: "Championship Podium",
    description: "A large visual focus on the top three players",
  },
  {
    id: "ticker",
    title: "Live Ticker",
    description: "Compact lower-third Top 5 strip",
  },
  {
    id: "spotlight",
    title: "Player Spotlight",
    description: "Highlight one finalist and their verified results",
  },
  {
    id: "reveal",
    title: "Round Results Reveal",
    description: "A timed reveal of the latest published round",
  },
  {
    id: "intermission",
    title: "Intermission",
    description: "Custom message while waiting for the next round",
  },
];

export const DEFAULT_PRODUCTION_STATE: ProductionState = {
  scene: "standings",
  featuredCompetitiveId: null,
  headline: "AUROS CHAMPIONSHIP",
  subtitle: "OFFICIAL GRAND FINAL",
  autoReveal: true,
  revision: 0,
  lastRevealRound: null,
  sceneChangedAt: null,
  sceneExpiresAt: null,
};

function parseProductionState(value: any): ProductionState {
  if (!value) {
    return DEFAULT_PRODUCTION_STATE;
  }

  return {
    scene: value.scene ?? "standings",
    featuredCompetitiveId: value.featuredCompetitiveId ?? null,
    headline: value.headline ?? "AUROS CHAMPIONSHIP",
    subtitle: value.subtitle ?? "OFFICIAL GRAND FINAL",
    autoReveal: Boolean(value.autoReveal),
    revision: Number(value.revision ?? 0),
    lastRevealRound: value.lastRevealRound ?? null,
    sceneChangedAt: value.sceneChangedAt ?? null,
    sceneExpiresAt: value.sceneExpiresAt ?? null,
  };
}

export async function getPublicProductionState(
  seasonSlug: string,
): Promise<ProductionState | null> {
  const { data, error } = await supabase.rpc(
    "competitive_aucs_public_production",
    {
      p_slug: seasonSlug,
    },
  );

  if (error) {
    throw error;
  }

  return data ? parseProductionState(data) : null;
}

export async function saveProductionCue(
  seriesId: string,
  changes: ProductionChanges,
): Promise<void> {
  const { error } = await supabase.rpc(
    "competitive_aucs_set_production",
    {
      p_series_id: seriesId,
      p_scene: changes.scene ?? null,
      p_featured_competitive_id:
        changes.featuredCompetitiveId === undefined
          ? null
          : changes.featuredCompetitiveId ?? "",
      p_headline: changes.headline ?? null,
      p_subtitle: changes.subtitle ?? null,
      p_auto_reveal: changes.autoReveal ?? null,
    },
  );

  if (error) {
    throw error;
  }
}

export async function getProductionHistory(
  seriesId: string,
): Promise<ProductionCue[]> {
  const { data, error } = await supabase.rpc(
    "competitive_aucs_production_history",
    {
      p_series_id: seriesId,
    },
  );

  if (error) {
    throw error;
  }

  return (data ?? []) as ProductionCue[];
}

export function getProductionUrl(
  seasonSlug: string,
  scene: "director" | ProductionScene = "director",
): string {
  return `/broadcast/aucs/${encodeURIComponent(seasonSlug)}?view=${scene}`;
}

export function formatProductionTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
