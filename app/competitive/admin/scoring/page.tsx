"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CompetitiveAdminGuard from "../../../../components/competitive/CompetitiveAdminGuard";
import { getScoringRulesets } from "../../../../services/competitive.service";
import type { CompetitiveScoringRuleset } from "../../../../types/competitive";

function ScoringCenter() {
  const [rulesets, setRulesets] = useState<CompetitiveScoringRuleset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScoringRulesets()
      .then(setRulesets)
      .catch((error) => console.error("Scoring rulesets failed:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="competitivePage">
      <div className="compCreatorTop">
        <div>
          <Link href="/competitive/admin" className="compBack">← RACE CONTROL</Link>
          <span className="competitiveEyebrow">SCORING // RULE ENGINE</span>
          <h1>Scoring Control.</h1>
          <p>Create reusable scoring systems for every Auros Competitive tournament.</p>
        </div>
        <Link href="/competitive/admin/scoring/new" className="compPrimaryButton">+ CREATE RULESET</Link>
      </div>

      <div className="competitiveOpsGrid">
        <div className="competitiveMetric"><span>Rulesets</span><strong>{loading ? "—" : rulesets.length}</strong></div>
        <div className="competitiveMetric"><span>Format</span><strong>SOLO</strong></div>
        <div className="competitiveMetric"><span>Input</span><strong>PLACE + ELIMS</strong></div>
        <div className="competitiveMetric"><span>Engine</span><strong>V0.1</strong></div>
      </div>

      <article className="competitivePanel">
        <div className="competitivePanelHeader"><h2>Scoring Rulesets</h2><span>REUSABLE PRESETS</span></div>
        {loading ? (
          <div className="competitiveEmpty"><div><strong>Loading scoring core…</strong>Reading Competitive rulesets.</div></div>
        ) : rulesets.length === 0 ? (
          <div className="competitiveEmpty"><div><strong>No scoring ruleset yet.</strong>Create AUCS Standard as your first ruleset.</div></div>
        ) : (
          <div className="compRulesetList">
            {rulesets.map((ruleset) => {
              const paidPlaces = Object.keys(ruleset.placementPoints).filter((key) => Number(ruleset.placementPoints[key]) !== 0).length;
              return (
                <div className="compRulesetRow" key={ruleset.id}>
                  <div className="compRulesetIdentity">
                    <span className="compGoldTag">{ruleset.isPreset ? "PRESET" : "CUSTOM"}</span>
                    <strong>{ruleset.name}</strong>
                    <small>{ruleset.version}</small>
                  </div>
                  <div className="compRulesetFacts">
                    <span><small>ELIM</small><strong>+{ruleset.eliminationPoints}</strong></span>
                    <span><small>PAID PLACES</small><strong>{paidPlaces}</strong></span>
                    <span><small>STATE</small><strong>{ruleset.isLocked ? "LOCKED" : "DRAFT"}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}

export default function ScoringPage() {
  return <CompetitiveAdminGuard>{() => <ScoringCenter />}</CompetitiveAdminGuard>;
}
