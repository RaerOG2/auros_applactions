"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  formatRankMovement,
  formatPublishedTime,
  getGrandFinalBroadcastSnapshot,
  type BroadcastStanding,
  type GrandFinalBroadcastSnapshot,
} from "../../../../services/competitive-broadcast.service";

import {
  DEFAULT_PRODUCTION_STATE,
  getPublicProductionState,
  type ProductionScene,
  type ProductionState,
} from "../../../../services/competitive-production.service";

import "../../broadcast-production.css";

type OverlayView = "director" | ProductionScene;

const REFRESH_INTERVAL = 4000;
const VALID_VIEWS: OverlayView[] = [
  "director",
  "standings",
  "top3",
  "ticker",
  "spotlight",
  "reveal",
  "intermission",
];

function getRequestedView(): OverlayView {
  if (typeof window === "undefined") {
    return "director";
  }

  const requested = new URLSearchParams(window.location.search).get("view");

  return VALID_VIEWS.includes(requested as OverlayView)
    ? (requested as OverlayView)
    : "director";
}

function BroadcastRow({ player }: { player: BroadcastStanding }) {
  return (
    <div className="compObsRow" key={player.competitiveId}>
      <strong>#{player.rank}</strong>
      <span>{player.displayName}</span>
      <small>{formatRankMovement(player.rankChange)}</small>
      <b>{player.points}</b>
    </div>
  );
}

function TopPlayers({
  snapshot,
  limit,
}: {
  snapshot: GrandFinalBroadcastSnapshot;
  limit: number;
}) {
  if (snapshot.publishedRounds === 0) {
    return (
      <p className="compObsWaiting">
        Results will appear after the first round is officially published.
      </p>
    );
  }

  return (
    <div className="compObsRows">
      {snapshot.standings.slice(0, limit).map((player) => (
        <BroadcastRow key={player.competitiveId} player={player} />
      ))}
    </div>
  );
}

export default function GrandFinalBroadcastPage() {
  const { slug } = useParams<{ slug: string }>();

  const [requestedView, setRequestedView] = useState<OverlayView>("director");
  const [snapshot, setSnapshot] = useState<GrandFinalBroadcastSnapshot | null>(null);
  const [production, setProduction] = useState<ProductionState>(
    DEFAULT_PRODUCTION_STATE,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setRequestedView(getRequestedView());
  }, []);

  useEffect(() => {
    let cancelled = false;
    let refreshing = false;

    async function refresh() {
      if (refreshing) {
        return;
      }

      refreshing = true;

      try {
        const [nextSnapshot, nextState] = await Promise.all([
          getGrandFinalBroadcastSnapshot(slug),
          getPublicProductionState(slug),
        ]);

        if (!cancelled) {
          setSnapshot(nextSnapshot);
          setProduction(nextState ?? DEFAULT_PRODUCTION_STATE);
          setError("");
        }
      } catch (issue) {
        if (!cancelled) {
          setError(
            issue instanceof Error ? issue.message : "Broadcast data unavailable.",
          );
        }
      } finally {
        refreshing = false;

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [slug]);

  const scene: ProductionScene =
    requestedView === "director"
      ? production.scene
      : requestedView;

  const featuredPlayer = useMemo(() => {
    return snapshot?.standings.find(
      (player) => player.competitiveId === production.featuredCompetitiveId,
    ) ?? null;
  }, [snapshot, production.featuredCompetitiveId]);

  if (loading && !snapshot) {
    return (
      <main className="compObsCanvas compObsCanvas--empty">
        <span className="compObsLoading">AUCS PRODUCTION // CONNECTING</span>
      </main>
    );
  }

  if (!snapshot) {
    return (
      <main className="compObsCanvas compObsCanvas--empty">
        <div className="compObsUnavailable">
          <strong>AUCS BROADCAST UNAVAILABLE</strong>
          <span>
            {error || "This Grand Final is not currently public."}
          </span>
          <Link href="/competitive/aucs">BACK TO AUCS</Link>
        </div>
      </main>
    );
  }

  const leaders = snapshot.standings.slice(0, 3);
  const latestRoundLabel = snapshot.latestPublishedRound === null
    ? "AWAITING FIRST OFFICIAL ROUND"
    : `UPDATED AFTER ROUND ${snapshot.latestPublishedRound} / ${snapshot.totalRounds}`;

  return (
    <main
      className={`compObsCanvas compObsCanvas--${scene} compProductionObs`}
      data-director-revision={production.revision}
    >
      {scene !== "ticker" && (
        <div className="compObsUpperLeft">
          <div className="compObsEventTag">
            <span className="compObsSignal" />
            AUROS COMPETITIVE // AUCS
          </div>

          <div className="compObsTitleBlock">
            <small>{snapshot.seasonName}</small>
            <h1>{snapshot.tournamentName}</h1>
            <p>{latestRoundLabel}</p>
          </div>
        </div>
      )}

      {scene === "standings" && (
        <aside className="compObsLeaderboard">
          <header>
            <div>
              <small>OFFICIAL GRAND FINAL</small>
              <strong>STANDINGS</strong>
            </div>
            <span>{snapshot.publishedRounds} / {snapshot.totalRounds}</span>
          </header>

          <TopPlayers snapshot={snapshot} limit={10} />
          <footer>OFFICIAL // PUBLISHED ROUND RESULTS ONLY</footer>
        </aside>
      )}

      {scene === "top3" && (
        <section className="compObsPodium">
          <header>GRAND FINAL // CHAMPIONSHIP TOP 3</header>

          {snapshot.publishedRounds === 0 ? (
            <p className="compObsWaiting">AWAITING OFFICIAL RESULTS</p>
          ) : (
            leaders.map((player) => (
              <div className="compObsPodiumRow" key={player.competitiveId}>
                <strong>#{player.rank}</strong>
                <span>{player.displayName}</span>
                <small>{formatRankMovement(player.rankChange)}</small>
                <b>{player.points} PTS</b>
              </div>
            ))
          )}
        </section>
      )}

      {scene === "ticker" && (
        <div className="compObsTicker">
          <div className="compObsTickerLabel">
            AUCS
            <strong>TOP 5</strong>
          </div>

          {snapshot.publishedRounds > 0 &&
            snapshot.standings.slice(0, 5).map((player) => (
              <div className="compObsTickerPlayer" key={player.competitiveId}>
                <small>#{player.rank}</small>
                <strong>{player.displayName}</strong>
                <span>{player.points}</span>
              </div>
            ))}

          <div className="compObsTickerRound">
            {snapshot.latestPublishedRound === null
              ? "AWAITING ROUND 1"
              : `AFTER ROUND ${snapshot.latestPublishedRound}`}
          </div>
        </div>
      )}

      {scene === "spotlight" && (
        <section className="compProductionSpotlight">
          <span className="compProductionOverlayEyebrow">PLAYER SPOTLIGHT</span>

          {featuredPlayer && snapshot.publishedRounds > 0 ? (
            <>
              <div className="compProductionSpotlightRank">
                #{featuredPlayer.rank}
              </div>
              <h2>{featuredPlayer.displayName}</h2>
              <div className="compProductionSpotlightStats">
                <span><strong>{featuredPlayer.points}</strong> PTS</span>
                <span><strong>{featuredPlayer.eliminations}</strong> ELIMS</span>
                <span>
                  <strong>{featuredPlayer.roundsPlayed}</strong> ROUNDS
                </span>
              </div>
            </>
          ) : (
            <h2>AWAITING OFFICIAL PLAYER RESULTS</h2>
          )}
        </section>
      )}

      {scene === "reveal" && (
        <section
          className="compProductionReveal"
          key={`reveal-${production.revision}-${snapshot.latestPublishedRound}`}
        >
          <span className="compProductionOverlayEyebrow">
            OFFICIAL ROUND RESULTS
          </span>
          <h2>
            ROUND {production.lastRevealRound ?? snapshot.latestPublishedRound ?? "—"}
          </h2>
          <p>RESULTS NOW PUBLISHED</p>

          {snapshot.publishedRounds > 0 && (
            <div className="compProductionRevealLeaders">
              {leaders.map((player, index) => (
                <div key={player.competitiveId} style={{ animationDelay: `${index * 180}ms` }}>
                  <strong>#{player.rank}</strong>
                  <span>{player.displayName}</span>
                  <b>{player.points} PTS</b>
                  <small>{formatRankMovement(player.rankChange)}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {scene === "intermission" && (
        <section className="compProductionIntermission">
          <span className="compProductionOverlayEyebrow">AUROS COMPETITIVE</span>
          <h2>{production.headline}</h2>
          <p>{production.subtitle}</p>
          <div className="compProductionIntermissionStatus">
            {snapshot.publishedRounds} / {snapshot.totalRounds} ROUNDS COMPLETE
          </div>
        </section>
      )}

      {scene !== "ticker" && scene !== "intermission" && (
        <div className="compObsFooterTag">
          {production.subtitle} · {formatPublishedTime(snapshot.lastPublishedAt)}
        </div>
      )}
    </main>
  );
}
