import type { ApplicationItem } from "../types/admin";
import type { CalculatedScoreResult, ScoreBreakdown } from "../types/admin-score";
import { SCORE_RULES } from "../lib/admin-score-config";
import { supabase } from "../lib/supabase";

function hasValue(value?: string | null) {
  return !!value && value.trim().length > 0;
}

function textLength(value?: string | null) {
  return value?.trim().length ?? 0;
}

function hasRoleSpecificAnswer(app: ApplicationItem) {
  return [
    app.developer_skills,
    app.developer_projects,
    app.support_cases,
    app.support_communication,
    app.competitive_knowledge,
    app.competitive_plans,
    app.manager_leadership,
    app.manager_organization,
    app.director_vision,
    app.director_responsibility,
    app.other_strengths,
  ].some((value) => hasValue(value));
}

export function calculateApplicationScore(app: ApplicationItem): CalculatedScoreResult {
  const breakdown: ScoreBreakdown = {
    hasDiscord: hasValue(app.discord) ? SCORE_RULES.hasDiscord : 0,
    hasPortfolio: hasValue((app as any).portfolio_url) ? SCORE_RULES.hasPortfolio : 0,
    hasAttachment: hasValue((app as any).attachment_url) ? SCORE_RULES.hasAttachment : 0,
    experienceLength:
      textLength(app.experience) >= SCORE_RULES.experienceLength.min
        ? SCORE_RULES.experienceLength.points
        : 0,
    motivationLength:
      textLength(app.motivation) >= SCORE_RULES.motivationLength.min
        ? SCORE_RULES.motivationLength.points
        : 0,
    availabilityFilled: hasValue(app.availability) ? SCORE_RULES.availabilityFilled : 0,
    roleSpecificAnswered: hasRoleSpecificAnswer(app) ? SCORE_RULES.roleSpecificAnswered : 0,
  };

  const autoScore = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const manualScore = typeof (app as any).manual_score === "number" ? (app as any).manual_score : null;
  const finalScore = manualScore ?? autoScore;

  return {
    autoScore,
    finalScore,
    breakdown,
  };
}

export async function saveCalculatedApplicationScore(app: ApplicationItem) {
  const result = calculateApplicationScore(app);
  const manualScore = typeof (app as any).manual_score === "number" ? (app as any).manual_score : null;

  const { error } = await supabase
    .from("applications")
    .update({
      auto_score: result.autoScore,
      final_score: manualScore ?? result.autoScore,
      score_breakdown: result.breakdown,
    })
    .eq("id", app.id);

  if (error) {
    throw error;
  }

  return result;
}

export async function updateManualApplicationScore(id: string, manualScore: number | null, autoScore: number) {
  const finalScore = manualScore ?? autoScore;

  const { error } = await supabase
    .from("applications")
    .update({
      manual_score: manualScore,
      final_score: finalScore,
      score: finalScore,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return { manualScore, finalScore };
}