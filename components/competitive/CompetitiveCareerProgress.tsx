"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getCompetitiveCareerExtension,
  getDivisionProgress,
  type CompetitiveCareerExtension,
} from "../../services/competitive-career.service";

type Props = {
  competitiveId: string;
};

export default function CompetitiveCareerProgress({ competitiveId }: Props) {
  const [career, setCareer] = useState<CompetitiveCareerExtension | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getCompetitiveCareerExtension(competitiveId)
      .then((data) => {
        if (active) {
          setCareer(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Career data unavailable.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [competitiveId]);

  if (loading) {
    return <div className="competitivePanel compCareerPanel">Loading career progress…</div>;
  }

  if (error || !career) {
    return (
      <div className="competitivePanel compCareerPanel">
        {error || "Career progress is not available for this player."}
      </div>
    );
  }

  const progress = getDivisionProgress(career.currentAp);

  return (
    <div className="compCareerSections">
      <section className="competitivePanel compCareerPanel">
        <div className="competitivePanelHeader">
          <div>
            <span className="competitiveEyebrow gold">AP / PRESTIGE</span>
            <h2>Competitive Division</h2>
          </div>
          <Link href="/competitive/divisions" className="compTextLink">
            ALL DIVISIONS →
          </Link>
        </div>

        <div className="compDivisionIdentity">
          <div>
            <span>CURRENT DIVISION</span>
            <strong>{progress.current.name}</strong>
            <small>{career.globalRank ? `GLOBAL #${career.globalRank}` : "UNRANKED"}</small>
          </div>
          <strong>{career.currentAp} AP</strong>
        </div>

        <div className="compDivisionBar">
          <i style={{ width: `${progress.percent}%` }} />
        </div>
        <p className="compPlayerAsideNote">
          {progress.next
            ? `${progress.remaining} AP to ${progress.next.name} • Peak: ${career.peakAp} AP`
            : `Champion division reached • Peak: ${career.peakAp} AP`}
        </p>
      </section>

      <section className="competitivePanel compCareerPanel">
        <div className="competitivePanelHeader">
          <h2>Achievements</h2>
          <span>{career.earnedAchievements.length} UNLOCKED</span>
        </div>

        {career.earnedAchievements.length === 0 ? (
          <div className="competitiveEmpty">
            <div>Achievements unlock from verified links and official tournament results.</div>
          </div>
        ) : (
          <div className="compAchievementGrid">
            {career.earnedAchievements.map((badge) => (
              <div key={badge.id} className="compAchievement">
                <span>◆ EARNED</span>
                <strong>{badge.label}</strong>
                <small>{badge.description}</small>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="competitivePanel compCareerPanel">
        <div className="competitivePanelHeader">
          <h2>Ranking History</h2>
          <span>{career.rankHistory.length} SNAPSHOTS</span>
        </div>

        {career.rankHistory.length === 0 ? (
          <div className="competitiveEmpty">
            <div>
              Official snapshots appear after the next AP award is finalized.
              Earlier ranking history is not fabricated.
            </div>
          </div>
        ) : (
          <div className="compRankTimeline">
            {career.rankHistory.map((snapshot, index) => (
              <Link
                key={`${snapshot.slug}-${index}`}
                href={`/competitive/tournaments/${snapshot.slug}`}
                className="compRankTimelineRow"
              >
                <span>#{snapshot.globalRank}</span>
                <div>
                  <strong>{snapshot.event}</strong>
                  <small>{new Date(snapshot.recordedAt).toLocaleDateString("en-GB")}</small>
                </div>
                <b>{snapshot.ap} AP</b>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
