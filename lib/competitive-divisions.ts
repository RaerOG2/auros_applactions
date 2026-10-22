export const COMPETITIVE_DIVISIONS = [
  { name: "ROOKIE", minimum: 0 },
  { name: "BRONZE", minimum: 100 },
  { name: "SILVER", minimum: 250 },
  { name: "GOLD", minimum: 500 },
  { name: "ELITE", minimum: 1000 },
  { name: "CHAMPION", minimum: 2000 },
] as const;

export function getDivisionProgress(ap: number) {
  const current = [...COMPETITIVE_DIVISIONS]
    .reverse()
    .find((division) => ap >= division.minimum)
    ?? COMPETITIVE_DIVISIONS[0];

  const next = COMPETITIVE_DIVISIONS.find(
    (division) => division.minimum > ap,
  ) ?? null;

  const remaining = next ? next.minimum - ap : 0;

  const percent = next
    ? Math.min(
        100,
        Math.max(
          0,
          ((ap - current.minimum) / (next.minimum - current.minimum)) * 100,
        ),
      )
    : 100;

  return {
    current,
    next,
    remaining,
    percent,
  };
}
