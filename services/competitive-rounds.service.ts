import { supabase } from "../lib/supabase";

export type RoundResultStatus =
  | "normal"
  | "dns"
  | "dnf"
  | "dq";

export type PlacementMilestoneRule = {
  threshold: number;
  points: number;
};

export type EliminationModifierRule = {
  key: string;
  points: number;
  label?: string;
};

export type RoundRules = {
  eliminationPoints: number;
  milestones: PlacementMilestoneRule[];
  modifiers: EliminationModifierRule[];
};

export type RoundEntry = {
  entryId: string;
  displayName: string;

  placement: number | null;
  eliminations: number;
  status: RoundResultStatus;
  penalty: number;

  placementPoints: number;
  eliminationPoints: number;
  bonusPoints: number;
  total: number;

  special: Record<string, number>;
  saved: boolean;
};

export type RoundValidation = {
  valid: boolean;
  activePlayers: number;
  resultsEntered: number;
  normalResults: number;
  missingResults: number;
  duplicatePlacements: number;
};

export type TournamentStanding = {
  rank: number;
  entryId: string;
  displayName: string;
  roundsPlayed: number;
  eliminations: number;
  placementPoints: number;
  eliminationPoints: number;
  bonusPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  bestPlacement: number | null;
};

export type RoundOperationsData = {
  tournament: any;
  round: any;
  rules: RoundRules;
  rows: RoundEntry[];
};

export type RoundSavePayload = {
  roundId: string;
  row: RoundEntry;
  rules: RoundRules;
};

export type ScoreBreakdown = {
  placementPoints: number;
  eliminationPoints: number;
  bonusPoints: number;
  total: number;
};

function normalizeMilestones(
  rawRules: any,
): PlacementMilestoneRule[] {
  const milestones =
    rawRules?.placementMilestones ??
    rawRules?.placement_milestones ??
    [];

  return milestones
    .map((rule: any) => ({
      threshold: Number(
        rule.threshold ??
          rule.top ??
          rule.placement ??
          0,
      ),
      points: Number(
        rule.points ??
          0,
      ),
    }))
    .filter(
      (rule: PlacementMilestoneRule) =>
        rule.threshold > 0,
    );
}

function normalizeModifiers(
  rawRules: any,
): EliminationModifierRule[] {
  const modifiers =
    rawRules?.eliminationModifiers ??
    rawRules?.elimination_modifiers ??
    [];

  return modifiers
    .map((rule: any) => ({
      key: String(
        rule.key ??
          "",
      ),
      points: Number(
        rule.points ??
          0,
      ),
      label:
        rule.label ??
        undefined,
    }))
    .filter(
      (rule: EliminationModifierRule) =>
        rule.key.length > 0,
    );
}

export function scoreResult(
  placement: number | null,
  eliminations: number,
  special: Record<string, number>,
  penalty: number,
  rules: RoundRules,
): ScoreBreakdown {
  const placementPoints =
    placement === null
      ? 0
      : rules.milestones
          .filter(
            (milestone) =>
              placement <= milestone.threshold,
          )
          .reduce(
            (sum, milestone) =>
              sum + Number(milestone.points || 0),
            0,
          );

  const eliminationPoints =
    Math.max(0, eliminations) *
    Number(rules.eliminationPoints || 0);

  const bonusPoints =
    rules.modifiers.reduce(
      (sum, modifier) => {
        const count =
          special[modifier.key] ??
          0;

        return (
          sum +
          Math.max(0, count) *
            Number(modifier.points || 0)
        );
      },
      0,
    );

  const total =
    placementPoints +
    eliminationPoints +
    bonusPoints -
    Math.max(0, penalty);

  return {
    placementPoints,
    eliminationPoints,
    bonusPoints,
    total,
  };
}

export async function getRoundOperations(
  tournamentId: string,
  roundNumber: number,
): Promise<RoundOperationsData> {
  const {
    data: tournament,
    error: tournamentError,
  } = await supabase
    .from("competitive_tournaments")
    .select(
      "*, competitive_scoring_rulesets(*)",
    )
    .eq("id", tournamentId)
    .single();

  if (tournamentError) {
    throw tournamentError;
  }

  const {
    data: existingRound,
    error: roundError,
  } = await supabase
    .from("competitive_rounds")
    .select("*")
    .eq(
      "tournament_id",
      tournamentId,
    )
    .eq(
      "round_number",
      roundNumber,
    )
    .maybeSingle();

  if (roundError) {
    throw roundError;
  }

  let round = existingRound;

  if (!round) {
    const {
      data: createdRound,
      error: createError,
    } = await supabase
      .from("competitive_rounds")
      .insert({
        tournament_id: tournamentId,
        round_number: roundNumber,
        name: `Round ${roundNumber}`,
        status:
          roundNumber === 1 &&
          tournament.status === "in_progress"
            ? "active"
            : "locked",
      })
      .select("*")
      .single();

    if (createError) {
      throw createError;
    }

    round = createdRound;
  }

  const {
    data: entries,
    error: entriesError,
  } = await supabase
    .from("competitive_entries")
    .select(
      "id, display_name",
    )
    .eq(
      "tournament_id",
      tournamentId,
    )
    .eq(
      "status",
      "active",
    )
    .order(
      "display_name",
      {
        ascending: true,
      },
    );

  if (entriesError) {
    throw entriesError;
  }

  const {
    data: results,
    error: resultsError,
  } = await supabase
    .from("competitive_round_results")
    .select("*")
    .eq(
      "round_id",
      round.id,
    );

  if (resultsError) {
    throw resultsError;
  }

  const resultByEntry =
    new Map(
      (results ?? []).map(
        (result) => [
          result.entry_id,
          result,
        ],
      ),
    );

  const rawRuleset: any =
    tournament.competitive_scoring_rulesets ??
    {};

  const rawRules =
    rawRuleset.rules ??
    rawRuleset.advanced_rules ??
    {};

  const rules: RoundRules = {
    eliminationPoints: Number(
      rawRuleset.elimination_points ??
        0,
    ),

    milestones:
      normalizeMilestones(
        rawRules,
      ),

    modifiers:
      normalizeModifiers(
        rawRules,
      ),
  };

  const rows: RoundEntry[] =
    (entries ?? []).map(
      (entry) => {
        const result =
          resultByEntry.get(
            entry.id,
          );

        const scoringSnapshot =
          result?.scoring_snapshot ??
          {};

        const special =
          scoringSnapshot.special ??
          result?.elimination_breakdown ??
          {};

        return {
          entryId:
            entry.id,

          displayName:
            entry.display_name,

          placement:
            result?.placement ??
            null,

          eliminations:
            Number(
              result?.eliminations ??
                0,
            ),

          status:
            (
              result?.result_status ??
              "normal"
            ) as RoundResultStatus,

          penalty:
            Number(
              result?.penalty_points ??
                0,
            ),

          placementPoints:
            Number(
              result?.placement_points ??
                0,
            ),

          eliminationPoints:
            Number(
              result?.elimination_points ??
                0,
            ),

          bonusPoints:
            Number(
              scoringSnapshot.bonusPoints ??
                0,
            ),

          total:
            Number(
              result?.total_points ??
                0,
            ),

          special,

          saved:
            Boolean(result),
        };
      },
    );

  return {
    tournament,
    round,
    rules,
    rows,
  };
}

export async function saveRoundResult(
  roundId: string,
  row: RoundEntry,
  rules: RoundRules,
): Promise<ScoreBreakdown> {
  const score =
    scoreResult(
      row.placement,
      row.eliminations,
      row.special,
      row.penalty,
      rules,
    );

  const payload = {
    round_id:
      roundId,

    entry_id:
      row.entryId,

    placement:
      row.status === "normal"
        ? row.placement
        : null,

    eliminations:
      Math.max(
        0,
        row.eliminations,
      ),

    result_status:
      row.status,

    placement_points:
      score.placementPoints,

    elimination_points:
      score.eliminationPoints,

    penalty_points:
      Math.max(
        0,
        row.penalty,
      ),

    total_points:
      score.total,

    elimination_breakdown:
      row.special,

    scoring_snapshot: {
      special:
        row.special,

      bonusPoints:
        score.bonusPoints,

      rules,
    },

    updated_at:
      new Date().toISOString(),
  };

  const {
    error,
  } = await supabase
    .from(
      "competitive_round_results",
    )
    .upsert(
      payload,
      {
        onConflict:
          "round_id,entry_id",
      },
    );

  if (error) {
    throw error;
  }

  return score;
}

export async function saveRoundResultsBulk(
  roundId: string,
  rows: RoundEntry[],
  rules: RoundRules,
) {
  const payload =
    rows.map(
      (row) => {
        const score =
          scoreResult(
            row.placement,
            row.eliminations,
            row.special,
            row.penalty,
            rules,
          );

        return {
          round_id:
            roundId,

          entry_id:
            row.entryId,

          placement:
            row.status === "normal"
              ? row.placement
              : null,

          eliminations:
            Math.max(
              0,
              row.eliminations,
            ),

          result_status:
            row.status,

          placement_points:
            score.placementPoints,

          elimination_points:
            score.eliminationPoints,

          penalty_points:
            Math.max(
              0,
              row.penalty,
            ),

          total_points:
            score.total,

          elimination_breakdown:
            row.special,

          scoring_snapshot: {
            special:
              row.special,

            bonusPoints:
              score.bonusPoints,

            rules,
          },

          updated_at:
            new Date().toISOString(),
        };
      },
    );

  if (payload.length === 0) {
    return;
  }

  const {
    error,
  } = await supabase
    .from(
      "competitive_round_results",
    )
    .upsert(
      payload,
      {
        onConflict:
          "round_id,entry_id",
      },
    );

  if (error) {
    throw error;
  }
}

export async function validateRound(
  roundId: string,
): Promise<RoundValidation> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "validate_competitive_round",
    {
      p_round_id:
        roundId,
    },
  );

  if (error) {
    throw error;
  }

  return data as RoundValidation;
}

export async function publishRound(
  roundId: string,
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "publish_competitive_round",
    {
      p_round_id:
        roundId,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function reopenRound(
  roundId: string,
) {
  const {
    error,
  } = await supabase.rpc(
    "reopen_competitive_round",
    {
      p_round_id:
        roundId,
    },
  );

  if (error) {
    throw error;
  }
}

export async function getTournamentStandings(
  tournamentId: string,
): Promise<TournamentStanding[]> {
  const {
    data: entries,
    error: entriesError,
  } = await supabase
    .from(
      "competitive_entries",
    )
    .select(
      "id, display_name",
    )
    .eq(
      "tournament_id",
      tournamentId,
    )
    .in(
      "status",
      [
        "active",
        "eliminated",
        "disqualified",
      ],
    );

  if (entriesError) {
    throw entriesError;
  }

  const entryIds =
    (entries ?? []).map(
      (entry) =>
        entry.id,
    );

  if (
    entryIds.length === 0
  ) {
    return [];
  }

  const {
    data: rounds,
    error: roundsError,
  } = await supabase
    .from(
      "competitive_rounds",
    )
    .select(
      "id",
    )
    .eq(
      "tournament_id",
      tournamentId,
    )
    .eq(
      "status",
      "published",
    );

  if (roundsError) {
    throw roundsError;
  }

  const roundIds =
    (rounds ?? []).map(
      (round) =>
        round.id,
    );

  const standings =
    new Map<
      string,
      Omit<
        TournamentStanding,
        "rank"
      >
    >();

  for (
    const entry of
    entries ?? []
  ) {
    standings.set(
      entry.id,
      {
        entryId:
          entry.id,

        displayName:
          entry.display_name,

        roundsPlayed:
          0,

        eliminations:
          0,

        placementPoints:
          0,

        eliminationPoints:
          0,

        bonusPoints:
          0,

        penaltyPoints:
          0,

        totalPoints:
          0,

        bestPlacement:
          null,
      },
    );
  }

  if (
    roundIds.length > 0
  ) {
    const {
      data: results,
      error: resultsError,
    } = await supabase
      .from(
        "competitive_round_results",
      )
      .select(
        "*",
      )
      .in(
        "round_id",
        roundIds,
      )
      .in(
        "entry_id",
        entryIds,
      );

    if (resultsError) {
      throw resultsError;
    }

    for (
      const result of
      results ?? []
    ) {
      const standing =
        standings.get(
          result.entry_id,
        );

      if (!standing) {
        continue;
      }

      const snapshot =
        result.scoring_snapshot ??
        {};

      standing.roundsPlayed +=
        1;

      standing.eliminations +=
        Number(
          result.eliminations ??
            0,
        );

      standing.placementPoints +=
        Number(
          result.placement_points ??
            0,
        );

      standing.eliminationPoints +=
        Number(
          result.elimination_points ??
            0,
        );

      standing.bonusPoints +=
        Number(
          snapshot.bonusPoints ??
            0,
        );

      standing.penaltyPoints +=
        Number(
          result.penalty_points ??
            0,
        );

      standing.totalPoints +=
        Number(
          result.total_points ??
            0,
        );

      if (
        result.placement !==
        null
      ) {
        const placement =
          Number(
            result.placement,
          );

        standing.bestPlacement =
          standing.bestPlacement ===
          null
            ? placement
            : Math.min(
                standing.bestPlacement,
                placement,
              );
      }
    }
  }

  const sorted =
    [...standings.values()]
      .sort(
        (a, b) =>
          b.totalPoints -
            a.totalPoints ||
          b.eliminations -
            a.eliminations ||
          (
            a.bestPlacement ??
            Number.MAX_SAFE_INTEGER
          ) -
            (
              b.bestPlacement ??
              Number.MAX_SAFE_INTEGER
            ) ||
          a.displayName.localeCompare(
            b.displayName,
          ),
      );

  return sorted.map(
    (standing, index) => ({
      rank:
        index + 1,

      ...standing,
    }),
  );
}
