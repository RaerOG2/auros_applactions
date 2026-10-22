"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CompetitiveStaffEntry from "../../../../../components/competitive/CompetitiveStaffEntry";
import GrandFinalLivePanel from "../../../../../components/competitive/GrandFinalLivePanel";

import {
  getGrandFinalInfo,
  getGrandFinalPool,
  type GrandFinalCandidate,
  type GrandFinalInfo,
} from "../../../../../services/competitive-grand-final.service";

function formatStatus(candidate: GrandFinalCandidate) {
  if (candidate.registered) {
    return "GRAND FINAL ENTRY";
  }

  if (candidate.inLineup) {
    return "OFFICIAL FINALIST";
  }

  if (candidate.cutoffStatus === "inside_cutline") {
    return "PROJECTED IN";
  }

  if (candidate.cutoffStatus === "outside_cutline") {
    return "BUBBLE / OUTSIDE";
  }

  if (candidate.cutoffStatus === "not_selected") {
    return "NOT SELECTED";
  }

  return "QUALIFIED TICKET";
}

export default function PublicGrandFinalPage() {
  const { slug } = useParams<{ slug: string }>();

  const [info, setInfo] = useState<GrandFinalInfo | null>(null);
  const [candidates, setCandidates] = useState<GrandFinalCandidate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const seasonInfo = await getGrandFinalInfo(slug);

      if (!seasonInfo) {
        setInfo(null);
        setCandidates([]);
        return;
      }

      const pool = await getGrandFinalPool(seasonInfo.seasonId);

      setInfo(seasonInfo);
      setCandidates(pool);
    } catch (issue: unknown) {
      setError(
        issue instanceof Error
          ? issue.message
          : "Grand Final data could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) {
      return candidates;
    }

    return candidates.filter((candidate) =>
      `${candidate.displayName} ${candidate.competitiveId}`
        .toLowerCase()
        .includes(needle),
    );
  }, [candidates, search]);

  if (loading) {
    return <div className="competitiveGate">Loading Road to Grand Finals…</div>;
  }

  if (error || !info) {
    return (
      <div className="competitiveGate">
        <h1>Grand Final unavailable</h1>
        <p>{error || "This AUCS season has not been published."}</p>
        <Link href="/competitive/aucs">Back to AUCS</Link>
      </div>
    );
  }

  const cutoff = info.slots ?? null;

  return (
    <section className="competitivePage">
      <header className="competitiveOpsHeader compGFHeader">
        <div>
          <Link className="compBack" href={`/competitive/aucs/${slug}`}>
            ← AUCS CHAMPIONSHIP
          </Link>

          <span className="competitiveEyebrow gold">
            AUCS // ROAD TO GRAND FINALS
          </span>

          <h1>THE GRAND FINAL.</h1>

          <p className="compHeaderDescription">
            One season. One final. The best Solo players compete for the title.
            {" "}Every place is earned through official qualification results.
          </p>

          <div className="compHeroActions">
            <a className="compPrimaryButton" href="#qualifiers">
              VIEW QUALIFICATION CUTLINE ↓
            </a>

            {info.tournamentSlug && (
              <Link
                className="compSecondaryButton"
                href={`/competitive/tournaments/${info.tournamentSlug}`}
              >
                VIEW GRAND FINAL EVENT →
              </Link>
            )}

            <Link
              className="compSecondaryButton"
              href={`/broadcast/aucs/${slug}?view=director`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WATCH OFFICIAL BROADCAST ↗
            </Link>

            <CompetitiveStaffEntry compact />
          </div>
        </div>

        <div className="compAUCSFormat">
          <span>ROAD TO THE FINAL</span>
          <strong>{info.lineupLocked ? "LOCKED" : "QUALIFYING"}</strong>
          <small>SOLO CHAMPIONSHIP</small>
        </div>
      </header>

      <div className="compGFMetrics">
        <div className="competitiveMetric">
          <span>UNIQUE QUALIFIERS</span>
          <strong>{info.qualifiedPlayers}</strong>
        </div>

        <div className="competitiveMetric">
          <span>GRAND FINAL SLOTS</span>
          <strong>{info.slots ?? "TBA"}</strong>
        </div>

        <div className="competitiveMetric">
          <span>OFFICIAL FINALISTS</span>
          <strong>{info.selectedPlayers}</strong>
        </div>

        <div className="competitiveMetric">
          <span>QUALIFIERS PENDING</span>
          <strong>{info.pendingQualifiers}</strong>
        </div>
      </div>

      {info.tournamentName && (
        <section className="competitivePanel compGFPadded compGFFeature">
          <span className="competitiveEyebrow gold">FINAL EVENT</span>
          <h2>{info.tournamentName}</h2>
          <p>
            {info.tournamentStatus?.replaceAll("_", " ").toUpperCase()}
            {" "}· {info.importedPlayers} PLAYERS IMPORTED
          </p>

          {info.tournamentSlug && (
            <Link
              className="compSecondaryButton"
              href={`/competitive/tournaments/${info.tournamentSlug}`}
            >
              EXPLORE EVENT →
            </Link>
          )}
        </section>
      )}

      <GrandFinalLivePanel seasonSlug={slug} />

      <section id="qualifiers" className="competitivePanel compGFPadded">
        <div className="competitivePanelHeader">
          <div>
            <span className="competitiveEyebrow">
              OFFICIAL QUALIFICATION RESULTS
            </span>
            <h2>{info.lineupLocked ? "Finalist Lineup" : "Qualification Cutline"}</h2>
          </div>

          <span>{filtered.length} PLAYERS</span>
        </div>

        <p className="compGFHint">
          {info.lineupLocked
            ? "This is the officially confirmed Grand Final selection."
            : cutoff == null
              ? "The starting capacity has not been announced yet."
              : `Top ${cutoff} is the current projected cutline. Finalists ` +
                "are not confirmed until all qualifiers finish and the " +
                "AUCS administration locks the lineup."}
        </p>

        <label className="compField compGFSearch">
          <span>SEARCH PLAYER</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Player name or Competitive ID"
          />
        </label>

        {filtered.length === 0 ? (
          <div className="competitiveEmpty">
            <div>
              <strong>No finalized qualification results yet.</strong>
              Complete the AUCS qualifier events to see the first players.
            </div>
          </div>
        ) : (
          <div className="compGFTableScroll">
            <div className="compGFTableHead">
              <span>RANK</span>
              <span>PLAYER</span>
              <span>TICKETS</span>
              <span>CHAMP. PTS</span>
              <span>STATUS</span>
            </div>

            {filtered.map((candidate) => (
              <div
                className={`compGFPlayerRow ${
                  candidate.inLineup ||
                  candidate.cutoffStatus === "inside_cutline"
                    ? "compGFPlayerRow--qualified"
                    : ""
                }`}
                key={candidate.competitiveId}
              >
                <strong>#{candidate.rankingPosition}</strong>

                <div className="compGFPlayerIdentity">
                  <Link
                    href={`/competitive/players/${candidate.competitiveId}`}
                  >
                    {candidate.displayName}
                    {candidate.epicVerified && " ✓"}
                  </Link>
                  <small>{candidate.competitiveId}</small>
                </div>

                <span>{candidate.qualificationCount}</span>
                <strong>{candidate.championshipPoints}</strong>

                <span
                  className={`compGFBadge compGFBadge--${candidate.cutoffStatus}`}
                >
                  {formatStatus(candidate)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
