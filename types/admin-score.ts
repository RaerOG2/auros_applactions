export type ScoreBreakdown = {
  hasDiscord: number;
  hasPortfolio: number;
  hasAttachment: number;
  experienceLength: number;
  motivationLength: number;
  availabilityFilled: number;
  roleSpecificAnswered: number;
};

export type CalculatedScoreResult = {
  autoScore: number;
  finalScore: number;
  breakdown: ScoreBreakdown;
};