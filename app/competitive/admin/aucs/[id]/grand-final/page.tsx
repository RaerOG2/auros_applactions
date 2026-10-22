"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CompetitiveAdminGuard from "../../../../../../components/competitive/CompetitiveAdminGuard";

import {
  getAdminTournaments,
} from "../../../../../../services/competitive.service";

import {
  getAdminAUCSSeasons,
  type AUCSAdminSeason,
} from "../../../../../../services/competitive-aucs.service";

import {
  configureGrandFinal,
  getGrandFinalInfo,
  getGrandFinalPool,
  importGrandFinalLineup,
  lockGrandFinalLineup,
  type GrandFinalCandidate,
  type GrandFinalInfo,
} from "../../../../../../services/competitive-grand-final.service";

import type {
  CompetitiveStaffAccess,
  CompetitiveTournament,
} from "../../../../../../types/competitive";

function getCutlineLabel(candidate: GrandFinalCandidate) {
  if (candidate.registered) {
    return "IN FINAL";
  }

  if (candidate.inLineup) {
    return "SELECTED";
  }

  if (candidate.cutoffStatus === "inside_cutline") {
    return "INSIDE CUTLINE";
  }

  if (candidate.cutoffStatus === "outside_cutline") {
    return "OUTSIDE CUTLINE";
  }

  if (candidate.cutoffStatus === "not_selected") {
    return "NOT SELECTED";
  }

  return "UNCONFIGURED";
}

function GrandFinalControl({
  access,
}: {
  access: CompetitiveStaffAccess;
}) {
  const { id } = useParams<{ id: string }>();

  const canManage =
    access.isSiteAdmin ||
    access.role === "competitive_admin";

  const [season, setSeason] = useState<AUCSAdminSeason | null>(null);
  const [info, setInfo] = useState<GrandFinalInfo | null>(null);
  const [candidates, setCandidates] = useState<GrandFinalCandidate[]>([]);
  const [tournaments, setTournaments] = useState<CompetitiveTournament[]>([]);

  const [tournamentId, setTournamentId] = useState("");
  const [slots, setSlots] = useState(50);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const [seasons, allTournaments] = await Promise.all([
      getAdminAUCSSeasons(),
      getAdminTournaments(),
    ]);

    const foundSeason = seasons.find((item) => item.id === id) ?? null;

    setSeason(foundSeason);
    setTournaments(allTournaments);

    if (!foundSeason) {
      setInfo(null);
      setCandidates([]);
      return;
    }

    const [configuration, pool] = await Promise.all([
      getGrandFinalInfo(foundSeason.slug),
      getGrandFinalPool(id),
    ]);

    setInfo(configuration);
    setCandidates(pool);

    if (configuration?.slots != null) {
      setSlots(configuration.slots);
    }

    const assignedTournament = allTournaments.find(
      (item) => item.slug === configuration?.tournamentSlug,
    );

    if (assignedTournament) {
      setTournamentId(assignedTournament.id);
    }
  }

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function initialize() {
      setLoading(true);

      try {
        await refresh();
      } catch (issue: unknown) {
        if (!cancelled) {
          setError(
            issue instanceof Error
              ? issue.message
              : "Grand Final Control is unavailable.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [id, canManage]);

  const eligibleTournaments = useMemo(() => {
    return tournaments.filter((event) => {
      const available =
        event.seriesId === null ||
        event.seriesId === id;

      return (
        available &&
        event.format === "solo" &&
        ["draft", "scheduled"].includes(event.status) &&
        !event.qualificationEnabled &&
        event.maxEntries >= slots
      );
    });
  }, [tournaments, id, slots]);

  const filteredCandidates = useMemo(() => {
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

  const selectedFinalEvent = tournaments.find(
    (event) => event.slug === info?.tournamentSlug,
  );

  const configured = info?.slots != null;
  const locked = Boolean(info?.lineupLocked);
  const readyToLock =
    configured &&
    !locked &&
    season?.status === "active" &&
    info?.pendingQualifiers === 0 &&
    candidates.length > 0;

  const readyToImport =
    locked &&
    (info?.selectedPlayers ?? 0) > 0 &&
    (info?.importedPlayers ?? 0) === 0;

  async function runAction(
    action: () => Promise<unknown>,
    successMessage: (result: unknown) => string,
  ) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const result = await action();
      await refresh();
      setMessage(successMessage(result));
    } catch (issue: unknown) {
      setError(
        issue instanceof Error
          ? issue.message
          : "Grand Final action failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  function saveConfiguration() {
    if (!tournamentId) {
      setError("Please choose a Grand Final tournament.");
      return;
    }

    runAction(
      () =>
        configureGrandFinal({
          seasonId: id,
          tournamentId,
          slots,
        }),
      () => "Grand Final linked. Registration was restricted to invites.",
    );
  }

  function lockLineup() {
    const accepted = window.confirm(
      "Lock the official Grand Final lineup? All qualifier events must " +
        "already have finalized Championship Points. " +
        "This selection cannot be changed in V0.1.",
    );

    if (!accepted) {
      return;
    }

    runAction(
      () => lockGrandFinalLineup(id),
      (result) => `${result} finalists officially selected.`,
    );
  }

  function importFinalists() {
    const accepted = window.confirm(
      "Import the selected finalists into the Grand Final event? " +
        "They will be registered, but not checked in.",
    );

    if (!accepted) {
      return;
    }

    runAction(
      () => importGrandFinalLineup(id),
      (result) => `${result} finalists registered for the Grand Final.`,
    );
  }

  if (loading) {
    return <div className="competitiveGate">Loading Grand Final Control…</div>;
  }

  if (!canManage || !season) {
    return (
      <div className="competitiveGate">
        <h1>Grand Final Control unavailable</h1>
        <p>A Competitive Admin account and AUCS season are required.</p>
        <Link href="/competitive/admin/aucs">Return to AUCS</Link>
      </div>
    );
  }

  return (
    <section className="competitivePage">
      <header className="competitiveOpsHeader compGFHeader">
        <div>
          <Link
            className="compBack"
            href={`/competitive/admin/aucs/${id}`}
          >
            ← SEASON OPERATIONS
          </Link>

          <span className="competitiveEyebrow gold">
            AUCS // ROAD TO GRAND FINALS
          </span>

          <h1>Grand Final Control</h1>
          <p className="compHeaderDescription">
            {season.name} · Official qualifiers, cutline and finalist roster.
          </p>

          <div className="compHeroActions">
            <Link
              className="compSecondaryButton"
              href={`/competitive/aucs/${season.slug}/grand-final`}
            >
              PUBLIC GRAND FINAL ↗
            </Link>

            <Link
              className="compSecondaryButton"
              href="/competitive/admin/tournaments/new"
            >
              + CREATE FINAL EVENT
            </Link>

            <Link
              className="compPrimaryButton"
              href={`/competitive/admin/aucs/${id}/production`}
            >
              ◉ OPEN PRODUCTION STUDIO →
            </Link>

            <Link
              className="compSecondaryButton"
              href={`/broadcast/aucs/${season.slug}?view=director`}
              target="_blank"
              rel="noopener noreferrer"
            >
              OBS DIRECTOR ↗
            </Link>

            <Link
              className="compSecondaryButton"
              href={`/broadcast/aucs/${season.slug}?view=standings`}
              target="_blank"
              rel="noopener noreferrer"
            >
              OBS STANDINGS ↗
            </Link>

            <Link
              className="compSecondaryButton"
              href={`/broadcast/aucs/${season.slug}?view=ticker`}
              target="_blank"
              rel="noopener noreferrer"
            >
              OBS TICKER ↗
            </Link>
          </div>
        </div>

        <div className="compAUCSFormat">
          <span>LINEUP STATUS</span>
          <strong>{locked ? "LOCKED" : "OPEN"}</strong>
          <small>{season.status.toUpperCase()} SEASON</small>
        </div>
      </header>

      {error && <div className="compError compGFAlert">{error}</div>}
      {message && <div className="compSuccess compGFAlert">{message}</div>}

      <div className="compGFMetrics">
        <div className="competitiveMetric">
          <span>UNIQUE QUALIFIERS</span>
          <strong>{info?.qualifiedPlayers ?? 0}</strong>
        </div>

        <div className="competitiveMetric">
          <span>FINAL SLOTS</span>
          <strong>{info?.slots ?? "—"}</strong>
        </div>

        <div className="competitiveMetric">
          <span>SELECTED FINALISTS</span>
          <strong>{info?.selectedPlayers ?? 0}</strong>
        </div>

        <div className="competitiveMetric">
          <span>PENDING QUALIFIER EVENTS</span>
          <strong>{info?.pendingQualifiers ?? 0}</strong>
        </div>
      </div>

      <div className="compGFLayout">
        <main className="competitivePanel compGFPadded">
          <div className="competitivePanelHeader">
            <div>
              <span className="competitiveEyebrow">QUALIFICATION REGISTRY</span>
              <h2>Road to the Final</h2>
            </div>

            <span>{filteredCandidates.length} PLAYERS</span>
          </div>

          <label className="compGFSearch compField">
            <span>FIND PLAYER</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Epic name or Competitive ID"
            />
          </label>

          <p className="compGFHint">
            Players are ranked by Championship Points, event wins, best
            qualifier finish and Competitive ID. Multiple qualification
            tickets still produce only one place in the lineup.
          </p>

          {filteredCandidates.length === 0 ? (
            <div className="competitiveEmpty">
              <div>
                <strong>No finalized qualifiers yet.</strong>
                Complete qualifier tournaments and finalize their
                Championship Points to populate the cutline.
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

              {filteredCandidates.map((candidate) => (
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
                      {candidate.epicVerified ? " ✓" : ""}
                    </Link>
                    <small>{candidate.competitiveId}</small>
                  </div>

                  <span>{candidate.qualificationCount}</span>
                  <strong>{candidate.championshipPoints}</strong>

                  <span className={`compGFBadge compGFBadge--${candidate.cutoffStatus}`}>
                    {getCutlineLabel(candidate)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>

        <aside className="compGFAside">
          <section className="competitivePanel compGFPadded">
            <div className="competitivePanelHeader">
              <div>
                <span className="competitiveEyebrow gold">
                  01 // GRAND FINAL SETUP
                </span>
                <h2>Final Event</h2>
              </div>
            </div>

            <p className="compGFHint">
              Create a separate SOLO tournament first. It must be empty,
              Draft or Scheduled, and must not be another qualifier.
            </p>

            <label className="compField">
              <span>GRAND FINAL TOURNAMENT</span>
              <select
                value={tournamentId}
                onChange={(event) => setTournamentId(event.target.value)}
                disabled={locked || busy}
              >
                <option value="">Select an existing tournament…</option>

                {eligibleTournaments.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} · {event.maxEntries} CAPACITY
                  </option>
                ))}
              </select>
            </label>

            <label className="compField compGFSlots">
              <span>FINAL STARTING SLOTS</span>
              <input
                type="number"
                min="1"
                max="1000"
                value={slots}
                onChange={(event) => setSlots(Number(event.target.value))}
                disabled={locked || busy}
              />
            </label>

            <button
              type="button"
              className="compPrimaryButton compGFWideButton"
              disabled={locked || busy || !tournamentId}
              onClick={saveConfiguration}
            >
              SAVE GRAND FINAL CONFIG
            </button>

            <p className="compGFHint">
              This also sets the Final to Invite Only. General players
              cannot register themselves into the finale.
            </p>
          </section>

          <section className="competitivePanel compGFPadded">
            <div className="competitivePanelHeader">
              <div>
                <span className="competitiveEyebrow gold">
                  02 // FINALIST SELECTION
                </span>
                <h2>Lock Official Lineup</h2>
              </div>
            </div>

            <p className="compGFHint">
              Finalize every qualifier first. Once locked, the
              top-ranked unique players become official finalists.
            </p>

            <button
              type="button"
              className="compPrimaryButton compGFWideButton"
              disabled={busy || !readyToLock}
              onClick={lockLineup}
            >
              {locked ? "LINEUP LOCKED ✓" : "LOCK FINAL LINEUP"}
            </button>

            {(info?.pendingQualifiers ?? 0) > 0 && (
              <p className="compGFWarning">
                {info?.pendingQualifiers} qualifier events still need
                completion or Championship Points finalization.
              </p>
            )}
          </section>

          <section className="competitivePanel compGFPadded">
            <div className="competitivePanelHeader">
              <div>
                <span className="competitiveEyebrow gold">
                  03 // REGISTRATION IMPORT
                </span>
                <h2>Send Players to Final</h2>
              </div>
            </div>

            <p className="compGFHint">
              Import every selected finalist into the linked tournament.
              All players start Registered, not Checked In.
            </p>

            <button
              type="button"
              className="compPrimaryButton compGFWideButton"
              disabled={busy || !readyToImport}
              onClick={importFinalists}
            >
              {info?.importedPlayers
                ? "FINALISTS IMPORTED ✓"
                : "IMPORT FINALISTS"}
            </button>

            {selectedFinalEvent && (
              <Link
                className="compSecondaryButton compGFWideButton"
                href={`/competitive/admin/tournaments/${selectedFinalEvent.id}`}
              >
                OPEN GRAND FINAL CONTROL →
              </Link>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}

export default function GrandFinalAdminPage() {
  return (
    <CompetitiveAdminGuard>
      {(access) => <GrandFinalControl access={access} />}
    </CompetitiveAdminGuard>
  );
}
