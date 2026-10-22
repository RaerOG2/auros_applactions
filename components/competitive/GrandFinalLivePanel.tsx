"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  formatPublishedTime,
  formatRankMovement,
  getBroadcastUrl,
  getGrandFinalBroadcastSnapshot,
  type GrandFinalBroadcastSnapshot,
} from "../../services/competitive-broadcast.service";

type GrandFinalLivePanelProps = {
  seasonSlug: string;
};

const REFRESH_INTERVAL_MS = 15000;

export default function GrandFinalLivePanel({
  seasonSlug,
}: GrandFinalLivePanelProps) {
  const [snapshot, setSnapshot] =
    useState<GrandFinalBroadcastSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let requestInFlight = false;

    async function refresh() {
      if (requestInFlight) {
        return;
      }

      requestInFlight = true;

      try {
        const next = await getGrandFinalBroadcastSnapshot(seasonSlug);

        if (!cancelled) {
          setSnapshot(next);
          setError("");
        }
      } catch (issue: unknown) {
        if (!cancelled) {
          setError(
            issue instanceof Error
              ? issue.message
              : "Could not load the Grand Final standings.",
          );
        }
      } finally {
        requestInFlight = false;

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    setSnapshot(null);
    refresh();

    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [seasonSlug]);

  if (!snapshot && !loading && !error) {
    return null;
  }

  return (
    <section className="competitivePanel compBroadcastPreview">
      <div className="competitivePanelHeader">
        <div>
          <span className="competitiveEyebrow gold">
            AUCS // CHAMPIONSHIP BROADCAST
          </span>

          <h2>Grand Final Standings</h2>
        </div>

        {snapshot && (
          <span className="compBroadcastPublishedBadge">
            UPDATED AFTER ROUND {snapshot.latestPublishedRound ?? "—"}
          </span>
        )}
      </div>

      <p className="compBroadcastHelp">
        Official results update after each round is published by the AUCS
        administration. This is not live Fortnite telemetry.
      </p>

      {loading && !snapshot && (
        <div className="compGFHint">Loading official standings…</div>
      )}

      {error && (
        <div className="compError" role="alert">
          {error}
        </div>
      )}

      {snapshot && (
        <>
          <div className="compBroadcastStats">
            <div>
              <span>ROUNDS PUBLISHED</span>
              <strong>
                {snapshot.publishedRounds} / {snapshot.totalRounds}
              </strong>
            </div>

            <div>
              <span>FINALISTS</span>
              <strong>{snapshot.finalists}</strong>
            </div>

            <div>
              <span>LATEST UPDATE</span>
              <strong>{formatPublishedTime(snapshot.lastPublishedAt)}</strong>
            </div>
          </div>

          {snapshot.publishedRounds === 0 ? (
            <div className="competitiveEmpty">
              <div>
                <strong>Awaiting the first official round.</strong>
                Standings will appear as soon as Round 1 is published.
              </div>
            </div>
          ) : (
            <div className="compBroadcastTable">
              <div className="compBroadcastTableHead">
                <span>RANK</span>
                <span>PLAYER</span>
                <span>MOVEMENT</span>
                <span>ELIMS</span>
                <span>POINTS</span>
              </div>

              {snapshot.standings.slice(0, 10).map((player) => (
                <div
                  className="compBroadcastTableRow"
                  key={player.competitiveId}
                >
                  <strong>#{player.rank}</strong>

                  <Link
                    href={`/competitive/players/${encodeURIComponent(player.competitiveId)}`}
                  >
                    {player.displayName}
                  </Link>

                  <span
                    className={
                      player.rankChange !== null && player.rankChange > 0
                        ? "is-up"
                        : player.rankChange !== null && player.rankChange < 0
                          ? "is-down"
                          : ""
                    }
                  >
                    {formatRankMovement(player.rankChange)}
                  </span>

                  <span>{player.eliminations}</span>
                  <b>{player.points}</b>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {snapshot && (
        <div className="compBroadcastActions">
          <Link
            className="compSecondaryButton"
            href={getBroadcastUrl(seasonSlug, "standings")}
            target="_blank"
            rel="noopener noreferrer"
          >
            FULL BROADCAST PREVIEW ↗
          </Link>

          <Link
            className="compSecondaryButton"
            href={getBroadcastUrl(seasonSlug, "top3")}
            target="_blank"
            rel="noopener noreferrer"
          >
            TOP 3 OVERLAY ↗
          </Link>

          <Link
            className="compSecondaryButton"
            href={getBroadcastUrl(seasonSlug, "ticker")}
            target="_blank"
            rel="noopener noreferrer"
          >
            TICKER OVERLAY ↗
          </Link>
        </div>
      )}
    </section>
  );
}
