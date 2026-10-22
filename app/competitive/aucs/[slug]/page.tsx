"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CompetitiveStaffEntry from "../../../../components/competitive/CompetitiveStaffEntry";
import {
  getPublicAUCSSeasons,
  getPublicAUCSEvents,
  getPublicAUCSStandings,
  getPublicAUCSQualifiers,
  type AUCSSeason,
  type AUCSEvent,
  type AUCSStanding,
  type AUCSQualifier,
} from "../../../../services/competitive-aucs.service";

function formatDate(value: string | null) {
  if (!value) {
    return "DATE TO BE ANNOUNCED";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AUCSSeasonPage() {
  const { slug } = useParams<{ slug: string }>();
  const [season, setSeason] = useState<AUCSSeason | null>(null);
  const [events, setEvents] = useState<AUCSEvent[]>([]);
  const [standings, setStandings] = useState<AUCSStanding[]>([]);
  const [qualifiers, setQualifiers] = useState<AUCSQualifier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [seasons, seasonEvents, seasonStandings, seasonQualifiers] =
          await Promise.all([
            getPublicAUCSSeasons(),
            getPublicAUCSEvents(slug),
            getPublicAUCSStandings(slug),
            getPublicAUCSQualifiers(slug),
          ]);

        if (!active) {
          return;
        }

        setSeason(seasons.find((item) => item.slug === slug) ?? null);
        setEvents(seasonEvents);
        setStandings(seasonStandings);
        setQualifiers(seasonQualifiers);
      } catch (issue: unknown) {
        if (active) {
          setError(issue instanceof Error ? issue.message : "Championship data unavailable.");
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
  }, [slug]);

  const filteredStandings = useMemo(() => {
    const needle = search.toLowerCase().trim();

    return standings.filter((player) =>
      `${player.displayName} ${player.competitiveId}`.toLowerCase().includes(needle),
    );
  }, [search, standings]);

  if (loading) {
    return <div className="competitiveGate">Loading AUCS Championship…</div>;
  }

  if (!season || error) {
    return (
      <div className="competitiveGate">
        <h1>Championship unavailable</h1>
        <p>{error || "This season has not been published."}</p>
        <Link href="/competitive/aucs">Back to AUCS</Link>
      </div>
    );
  }

  return (
    <section className="competitivePage">
      <header className="competitiveOpsHeader compAUCSHeader">
        <div>
          <Link className="compBack" href="/competitive/aucs">
            ← AUCS CHAMPIONSHIPS
          </Link>
          <span className="competitiveEyebrow gold">
            {season.seasonLabel || "AUCS"} // SOLO CHAMPIONSHIP
          </span>
          <h1>{season.name}</h1>
          <p className="compHeaderDescription">
            {season.description || "Official AUROS Championship standings and schedule."}
          </p>

          <div className="compHeroActions">
            <a className="compPrimaryButton" href="#standings">
              CHAMPIONSHIP STANDINGS ↓
            </a>
            <a className="compSecondaryButton" href="#schedule">
              EVENT SCHEDULE ↓
            </a>
            <a className="compSecondaryButton" href="#qualifiers">
              QUALIFIERS ↓
            </a>
            <Link
              className="compSecondaryButton"
              href={`/competitive/aucs/${slug}/grand-final`}
            >
              ROAD TO GRAND FINALS ↗
            </Link>
            <CompetitiveStaffEntry compact />
          </div>
        </div>
        <div className="compAUCSFormat">
          <span>SEASON STATUS</span>
          <strong>{season.status === "active" ? "LIVE" : "COMPLETE"}</strong>
          <small>CHAMPIONSHIP POINTS</small>
        </div>
      </header>

      <div className="compAUCSMetrics">
        <div className="competitiveMetric">
          <span>CHAMPIONSHIP EVENTS</span>
          <strong>{events.length}</strong>
        </div>
        <div className="competitiveMetric">
          <span>OFFICIAL LEADERBOARD</span>
          <strong>{standings.length}</strong>
        </div>
        <div className="competitiveMetric">
          <span>QUALIFICATION RESULTS</span>
          <strong>{qualifiers.length}</strong>
        </div>
      </div>

      {season.winnerCompetitiveId && (
        <section className="competitivePanel compAUCSChampionHero">
          <span className="competitiveEyebrow gold">HALL OF CHAMPIONS // OFFICIAL</span>
          <h2>{season.winnerDisplayName}</h2>
          <p>AUCS SEASON CHAMPION</p>
          <Link
            className="compSecondaryButton"
            href={`/competitive/players/${season.winnerCompetitiveId}`}
          >
            VIEW CHAMPION PROFILE →
          </Link>
        </section>
      )}

      <section id="standings" className="competitivePanel compAUCSPadded">
        <div className="competitivePanelHeader">
          <div>
            <span className="competitiveEyebrow">CHAMPIONSHIP POINTS // NOT AP</span>
            <h2>Season Standings</h2>
          </div>
          <span>OFFICIAL FINALIZED EVENTS ONLY</span>
        </div>

        <label className="compAUCSFilter">
          <span>SEARCH PLAYER</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or Competitive ID"
          />
        </label>

        {filteredStandings.length === 0 ? (
          <div className="competitiveEmpty">
            <div>
              <strong>No published championship points found.</strong>
              Players appear after an eligible event is completed and finalized.
            </div>
          </div>
        ) : (
          <div className="compAUCSTableScroll">
            <div className="compAUCSStandingHeader">
              <span>RANK</span>
              <span>PLAYER</span>
              <span>EVENTS</span>
              <span>WINS</span>
              <span>CHAMP POINTS</span>
            </div>
            {filteredStandings.map((player) => (
              <div className="compAUCSStandingRow" key={player.competitiveId}>
                <strong>#{player.rank}</strong>
                <Link href={`/competitive/players/${player.competitiveId}`}>
                  <span>{player.displayName}</span>
                  {player.epicVerified && <small> VERIFIED EPIC</small>}
                </Link>
                <span>{player.eventsPlayed}</span>
                <span>{player.eventWins}</span>
                <b>{player.championshipPoints}</b>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="schedule" className="competitivePanel compAUCSPadded">
        <div className="competitivePanelHeader">
          <div>
            <span className="competitiveEyebrow gold">TOURNAMENT CALENDAR</span>
            <h2>Championship Events</h2>
          </div>
          <span>{events.length} EVENTS</span>
        </div>

        {events.length === 0 ? (
          <div className="competitiveEmpty">
            <div>No public championship events have been announced yet.</div>
          </div>
        ) : (
          <div className="compAUCSEventList">
            {events.map((event) => (
              <div className="compAUCSEventRow" key={event.tournamentId}>
                <div>
                  <span className={`compStatus compStatus--${event.status}`}>
                    {event.status.replaceAll("_", " ")}
                  </span>
                  <strong>{event.name}</strong>
                  <small>
                    {formatDate(event.startsAt)} · {event.roundCount} ROUNDS ·
                    {event.pointsFinalized ? " OFFICIAL POINTS" : " POINTS PENDING"}
                  </small>
                  {event.qualificationEnabled && event.qualificationTop && (
                    <small>QUALIFIER · TOP {event.qualificationTop}</small>
                  )}
                </div>
                <Link
                  href={`/competitive/tournaments/${event.slug}`}
                  className="compSecondaryButton"
                >
                  VIEW EVENT →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="qualifiers" className="competitivePanel compAUCSPadded">
        <div className="competitivePanelHeader">
          <div>
            <span className="competitiveEyebrow">ROAD TO FINALS</span>
            <h2>Qualified Players</h2>
          </div>
          <span>{qualifiers.length} QUALIFICATION RESULTS</span>
        </div>

        {qualifiers.length === 0 ? (
          <div className="competitiveEmpty">
            <div>Official qualifiers appear after qualifying events are finalized.</div>
          </div>
        ) : (
          <div className="compAUCSQualifierGrid">
            {qualifiers.map((qualifier) => (
              <div
                className="compAUCSQualifier"
                key={`${qualifier.tournamentSlug}-${qualifier.competitiveId}`}
              >
                <small>QUALIFIED · #{qualifier.finishingPosition}</small>
                <Link href={`/competitive/players/${qualifier.competitiveId}`}>
                  {qualifier.displayName}
                </Link>
                <span>{qualifier.tournamentName}</span>
              </div>
            ))}
          </div>
        )}
        <p className="compAUCSFootnote">
          Qualification is a confirmed result, not an automatic registration
          for a separate Grand Final event.
        </p>
      </section>
    </section>
  );
}
