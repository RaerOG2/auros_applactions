"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import CompetitiveStaffEntry from "../../../../components/competitive/CompetitiveStaffEntry";
import CompetitiveCareerProgress from "../../../../components/competitive/CompetitiveCareerProgress";

import {
  getAPDivision,
  getCompetitiveAPHistory,
  type CompetitiveAPHistoryEntry,
} from "../../../../services/competitive-rankings.service";

import {
  getPublicCompetitivePlayer,
  getPublicCompetitivePlayerHistory,
  type CompetitivePlayerHistory,
  type PublicCompetitivePlayer,
} from "../../../../services/competitive-players.service";

function formatEventDate(value: string | null) {
  if (!value) {
    return "DATE PENDING";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function CompetitivePlayerDetailPage() {
  const { competitiveId } = useParams<{ competitiveId: string }>();

  const [player, setPlayer] = useState<PublicCompetitivePlayer | null>(null);
  const [history, setHistory] = useState<CompetitivePlayerHistory[]>([]);
  const [apHistory, setApHistory] = useState<CompetitiveAPHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [playerData, historyData, awardData] = await Promise.all([
          getPublicCompetitivePlayer(competitiveId),
          getPublicCompetitivePlayerHistory(competitiveId),
          getCompetitiveAPHistory(competitiveId),
        ]);

        if (active) {
          setPlayer(playerData);
          setHistory(historyData);
          setApHistory(awardData);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load this player profile.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [competitiveId]);

  if (loading) {
    return (
      <section className="competitivePage">
        <div className="competitivePanel compPlayerDirectoryEmpty">
          Loading Player Card…
        </div>
      </section>
    );
  }

  if (!player) {
    return (
      <section className="competitivePage">
        <div className="competitivePanel compPlayerDirectoryEmpty">
          <strong>Player unavailable</strong>
          <p>{error || "No public player was found with that Competitive ID."}</p>
          <Link href="/competitive/players" className="compSecondaryButton">
            BACK TO PLAYERS
          </Link>
        </div>
      </section>
    );
  }

  const profileStats = [
    { label: "EVENTS", value: player.tournamentsPlayed },
    { label: "ROUNDS", value: player.roundsPlayed },
    { label: "ROUND WINS", value: player.roundWins },
    { label: "TOP 10 ROUNDS", value: player.topTenRounds },
    { label: "ELIMINATIONS", value: player.eliminations },
    { label: "BEST PLACEMENT", value: player.bestPlacement ? `#${player.bestPlacement}` : "—" },
  ];

  return (
    <section className="competitivePage">
      <div className="compPlayerDetailHeader">
        <Link href="/competitive/players" className="compBack">
          ← ALL PLAYERS
        </Link>
        <CompetitiveStaffEntry compact />
      </div>

      <div className="competitiveHero compPlayerDetailHero">
        <div className="compPlayerDetailAvatar" aria-hidden="true">
          {player.displayName.slice(0, 1).toUpperCase()}
        </div>

        <span className="competitiveEyebrow gold">AUROS COMPETITIVE // PLAYER CARD</span>
        <h1>{player.displayName}</h1>

        <div className="compPlayerDetailIdentity">
          <span>{player.competitiveId}</span>
          {player.countryCode && <span>{player.countryCode}</span>}
          <span>SOLO COMPETITOR</span>
          {player.epicVerified && <span className="gold">EPIC VERIFIED</span>}
        </div>

        <p>{player.bio || "A Competitive career in the making."}</p>
      </div>

      <CompetitiveCareerProgress competitiveId={player.competitiveId} />

      <div className="compPlayerDetailGrid">
        <main>
          <section className="competitivePanel compPlayerSection">
            <div className="competitivePanelHeader">
              <h2>Career Statistics</h2>
              <span>PUBLISHED RESULTS ONLY</span>
            </div>

            <div className="compPlayerCareerGrid">
              {profileStats.map((stat) => (
                <div className="compPlayerCareerStat" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="competitivePanel compPlayerSection">
            <div className="competitivePanelHeader">
              <h2>Auros Points History</h2>
              <span>{apHistory.length} AWARDS</span>
            </div>

            {apHistory.length === 0 ? (
              <div className="competitiveEmpty">
                <div>
                  <strong>No AP awards yet.</strong>
                  Awards appear when Competitive Admin finalizes an
                  AP-enabled event.
                </div>
              </div>
            ) : (
              <div className="compAPHistoryList">
                {apHistory.map((award) => (
                  <Link
                    key={`${award.tournamentSlug}-${award.awardedAt}`}
                    href={`/competitive/tournaments/${award.tournamentSlug}`}
                    className="compAPHistoryRow"
                  >
                    <div>
                      <strong>{award.tournamentName}</strong>
                      <small>
                        FINAL #{award.finishingPosition} · {award.rewardProfile.toUpperCase()}
                      </small>
                    </div>
                    <strong>+{award.apAwarded} AP</strong>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="competitivePanel compPlayerSection">
            <div className="competitivePanelHeader">
              <h2>Tournament History</h2>
              <span>{history.length} EVENTS</span>
            </div>

            {history.length === 0 ? (
              <div className="competitiveEmpty">
                <div>
                  <strong>No official results yet.</strong>
                  Published tournament results will appear here.
                </div>
              </div>
            ) : (
              <div className="compPlayerHistoryList">
                {history.map((event) => (
                  <Link
                    key={event.tournamentSlug}
                    href={`/competitive/tournaments/${event.tournamentSlug}`}
                    className="compPlayerHistoryRow"
                  >
                    <div>
                      <small>{formatEventDate(event.lastRoundAt)}</small>
                      <strong>{event.tournamentName}</strong>
                      <span>
                        {event.roundsPlayed} ROUNDS · {event.eliminations} ELIMS ·{" "}
                        {event.roundWins} ROUND WINS
                      </span>
                    </div>

                    <div className="compHistoryScore">
                      <strong>{event.totalPoints} PTS</strong>
                      <small>
                        BEST {event.bestPlacement ? `#${event.bestPlacement}` : "—"}
                      </small>
                    </div>

                    <b aria-hidden="true">→</b>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className="competitivePanel compPlayerSection compPlayerDetailAside">
          <span className="competitiveEyebrow gold">PLAYER IDENTITY</span>
          <h2>{player.competitiveId}</h2>

          <div className="compPlayerAsideItem">
            <span>EPIC LINK</span>
            <strong>{player.epicVerified ? "VERIFIED" : "NOT VERIFIED"}</strong>
          </div>

          <div className="compPlayerAsideItem">
            <span>FAVORITE POI</span>
            <strong>{player.favoritePoi || "NOT SET"}</strong>
          </div>

          <div className="compPlayerAsideItem">
            <span>COMPETITIVE DIVISION</span>
            <strong>{getAPDivision(player.currentAp)}</strong>
          </div>

          <div className="compPlayerAsideItem">
            <span>CURRENT AUROS POINTS</span>
            <strong>{player.currentAp}</strong>
          </div>

          <div className="compPlayerAsideItem">
            <span>PEAK AUROS POINTS</span>
            <strong>{player.peakAp}</strong>
          </div>

          <p className="compPlayerAsideNote">
            AP awards come from finalized events. Tournament points and
            global Auros Points are tracked separately.
          </p>

          <Link href="/competitive/rankings" className="compSecondaryButton">
            GLOBAL RANKINGS →
          </Link>

          <Link href="/competitive/me" className="compSecondaryButton">
            MY PLAYER PROFILE →
          </Link>
        </aside>
      </div>
    </section>
  );
}
