"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

import CompetitiveAdminGuard from "../../../../../components/competitive/CompetitiveAdminGuard";
import { getAdminTournament, getTournamentRounds } from "../../../../../services/competitive.service";
import { startTournament } from "../../../../../services/competitive-registration.service";
import { getUnifiedTournaments, type UnifiedTournament } from "../../../../../services/competitive-unified.service";
import {
  getTournamentEntryCounts,
  performTournamentAction,
  type EntryCounts,
} from "../../../../../services/competitive-control.service";
import type {
  CompetitiveRound,
  CompetitiveTournament,
} from "../../../../../types/competitive";

const emptyCounts: EntryCounts = {
  registered: 0,
  checkedIn: 0,
  waitlisted: 0,
  active: 0,
  total: 0,
};

function TournamentControl({ id }: { id: string }) {
  const [event, setEvent] = useState<CompetitiveTournament | null>(null);
  const [eventV2, setEventV2] = useState<UnifiedTournament | null>(null);
  const [rounds, setRounds] = useState<CompetitiveRound[]>([]);
  const [counts, setCounts] = useState<EntryCounts>(emptyCounts);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const reload = useCallback(async () => {
    const [eventData, roundData, entryData, unifiedData] = await Promise.all([
      getAdminTournament(id),
      getTournamentRounds(id),
      getTournamentEntryCounts(id),
      getUnifiedTournaments(),
    ]);

    setEvent(eventData);
    setRounds(roundData);
    setCounts(entryData);
    setEventV2(unifiedData.find((item) => item.id === id) ?? null);
  }, [id]);

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    reload()
      .catch((err) => {
        if (mounted) {
          setError(err?.message || "Could not load tournament.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [reload]);

  async function runAction(
    action: "publish_event" | "open_registration" | "open_check_in" | "show_event_page",
  ) {
    if (!event || working) {
      return;
    }

    const message = {
      publish_event: "Publish this draft as a scheduled public event?",
      open_registration: "Open player registration for this tournament?",
      open_check_in: "Close registration and open player check-in?",
      show_event_page: "Make this event visible on the public Competitive page?",
    }[action];

    if (!window.confirm(message)) {
      return;
    }

    setWorking(true);
    setError("");
    setNotice("");

    try {
      await performTournamentAction(event.id, action);
      await reload();
      setNotice("Tournament updated successfully.");
    } catch (err: any) {
      setError(err?.message || "Could not update tournament.");
    } finally {
      setWorking(false);
    }
  }

  async function handleStart() {
    if (!event || working) {
      return;
    }

    if (counts.checkedIn === 0) {
      setError("At least one player must be checked in before starting.");
      return;
    }

    if (!window.confirm("Start this tournament? Checked-in players become active and Round 1 is unlocked.")) {
      return;
    }

    setWorking(true);
    setError("");
    setNotice("");

    try {
      await startTournament(event.id);
      await reload();
      setNotice("Tournament started. Round 1 is ready for results.");
    } catch (err: any) {
      setError(err?.message || "Could not start tournament.");
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return <div className="competitiveGate">Loading Tournament Control…</div>;
  }

  if (!event) {
    return (
      <div className="competitiveGate">
        <h1>Event unavailable</h1>
        <p>{error || "This tournament could not be found."}</p>
        <Link href="/competitive/admin/tournaments">Back to Tournaments</Link>
      </div>
    );
  }

  const date = event.startsAt
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(event.startsAt))
    : "Not scheduled";

  const currentRound =
    rounds.find((round) => round.status === "active" || round.status === "review") ??
    rounds.find((round) => round.status === "locked") ??
    rounds[rounds.length - 1] ??
    null;

  const playersLink = `/competitive/admin/tournaments/${event.id}/players`;
  const roundLink = (number: number) =>
    `/competitive/admin/tournaments/${event.id}/rounds/${number}`;
  const publicLink = `/competitive/tournaments/${event.slug}`;
  const standingsLink = `${publicLink}/standings`;

  return (
    <section className="competitivePage">
      <Link href="/competitive/admin/tournaments" className="compBack">
        ← TOURNAMENTS
      </Link>

      <div className="compEventHero" id="overview">
        <div>
          <span className={`compStatus compStatus--${event.status}`}>
            {event.status.replaceAll("_", " ")}
          </span>
          <span className="competitiveEyebrow">TOURNAMENT CONTROL</span>
          <h1>{event.name}</h1>
          <p>
            {date} · SOLO · {event.roundCount} ROUNDS
            {eventV2 ? ` · ${eventV2.event_kind.toUpperCase()}` : ""}
          </p>
        </div>

        <div className="compHeaderActions">
          {event.status === "draft" && !eventV2?.is_test && (
            <button
              type="button"
              className="compPrimaryButton"
              disabled={working}
              onClick={() => runAction("publish_event")}
            >
              PUBLISH EVENT
            </button>
          )}

          {event.status === "scheduled" && !eventV2?.is_test && event.registrationType === "open" && (
            <button
              type="button"
              className="compPrimaryButton"
              disabled={working}
              onClick={() => runAction("open_registration")}
            >
              OPEN REGISTRATION
            </button>
          )}

          {!eventV2?.is_test && (event.status === "registration_open" ||
            (event.status === "scheduled" && event.registrationType !== "open")) && (
            <button
              type="button"
              className="compPrimaryButton"
              disabled={working}
              onClick={() => runAction("open_check_in")}
            >
              OPEN CHECK-IN
            </button>
          )}

          {event.status === "check_in" && (
            <button
              type="button"
              className="compPrimaryButton"
              disabled={working || counts.checkedIn === 0}
              title={counts.checkedIn === 0 ? "Check in a player first" : undefined}
              onClick={handleStart}
            >
              START TOURNAMENT
            </button>
          )}

          {event.status === "in_progress" && currentRound && (
            <Link href={roundLink(currentRound.roundNumber)} className="compPrimaryButton">
              OPEN ROUND {currentRound.roundNumber} →
            </Link>
          )}

          <Link href={playersLink} className="compSecondaryButton">
            MANAGE PLAYERS
          </Link>

          <Link
            href={`/competitive/admin/rehearsal?tournament=${event.id}`}
            className="compSecondaryButton"
          >
            ▶ CUP REHEARSAL
          </Link>

          {eventV2?.event_kind === "final" && (
            <Link
              href={`/competitive/admin/tournaments/${event.id}/qualification`}
              className="compSecondaryButton"
            >
              QUALIFICATION / FINALISTS
            </Link>
          )}

          {eventV2?.is_test && (
            <Link
              href={`/competitive/admin/test-players?tournament=${event.id}`}
              className="compPrimaryButton"
            >
              TEST LAB →
            </Link>
          )}
        </div>
      </div>

      {error && <div className="compError">{error}</div>}
      {notice && <div className="compSuccess">{notice}</div>}

      <nav className="compControlTabs" aria-label="Tournament control tabs">
        <a href="#overview" className="active">Overview</a>
        <Link href={playersLink}>Players</Link>
        <a href="#rounds">Rounds</a>
        <Link href="/competitive/admin/scoring">Scoring</Link>
        <Link href={`/competitive/admin/rehearsal?tournament=${event.id}`}>Preview / Test</Link>
        {event.isPublic && event.publicLeaderboard ? (
          <Link href={standingsLink}>Standings</Link>
        ) : (
          <span>Standings / Private</span>
        )}
        <Link href={`/competitive/admin/tournaments/${event.id}/operations`}>
          Operations Manager
        </Link>
        {eventV2?.event_kind === "final" && (
          <Link href={`/competitive/admin/tournaments/${event.id}/qualification`}>
            Qualification
          </Link>
        )}
        {eventV2?.is_test && (
          <Link href={`/competitive/admin/test-players?tournament=${event.id}`}>
            Test tools
          </Link>
        )}
      </nav>

      <div className="competitiveOpsGrid">
        <div className="competitiveMetric">
          <span>Entries</span>
          <strong>{counts.total} / {event.maxEntries}</strong>
        </div>
        <div className="competitiveMetric">
          <span>Checked In / Active</span>
          <strong>{counts.checkedIn + counts.active}</strong>
        </div>
        <div className="competitiveMetric">
          <span>Rounds</span>
          <strong>{rounds.length}</strong>
        </div>
        <div className="competitiveMetric">
          <span>Visibility</span>
          <strong>{event.isPublic ? "PUBLIC" : "PRIVATE"}</strong>
        </div>
      </div>

      <div className="compAdminActionBar" id="operations">
        <Link href={playersLink} className="compPrimaryButton">
          PLAYER OPERATIONS →
        </Link>

        {currentRound && (
          <Link href={roundLink(currentRound.roundNumber)} className="compSecondaryButton">
            ROUND {currentRound.roundNumber} / RACE CONTROL
          </Link>
        )}

        <Link href="/competitive/admin/scoring" className="compSecondaryButton">
          SCORING RULESETS
        </Link>

        <Link href={`/competitive/admin/rehearsal?tournament=${event.id}`} className="compSecondaryButton">
          REHEARSAL STUDIO
        </Link>

        <Link
          href={`/competitive/admin/tournaments/${event.id}/operations`}
          className="compSecondaryButton"
        >
          BULK ACTIONS / PROTESTS / AUDIT →
        </Link>

        {!eventV2?.is_test && event.isPublic ? (
          <Link href={publicLink} className="compSecondaryButton">
            PUBLIC EVENT ↗
          </Link>
        ) : !eventV2?.is_test && event.status !== "draft" ? (
          <button
            type="button"
            className="compSecondaryButton"
            disabled={working}
            onClick={() => runAction("show_event_page")}
          >
            MAKE EVENT PUBLIC
          </button>
        ) : null}

        {eventV2?.event_kind === "final" && (
          <Link
            className="compSecondaryButton"
            href={`/competitive/admin/tournaments/${event.id}/qualification`}
          >
            FINALIST IMPORT →
          </Link>
        )}

        {eventV2?.is_test && (
          <Link
            className="compSecondaryButton"
            href={`/competitive/admin/test-players?tournament=${event.id}`}
          >
            GENERATE TEST RESULTS →
          </Link>
        )}

        <button
          type="button"
          className="compSecondaryButton"
          disabled={working}
          onClick={() => reload().catch((err) => setError(err?.message || "Reload failed."))}
        >
          REFRESH
        </button>
      </div>

      <div className="competitiveGrid">
        <article className="competitivePanel" id="rounds">
          <div className="competitivePanelHeader">
            <h2>Round Structure</h2>
            <span>AUTO-GENERATED</span>
          </div>

          <div className="compRoundGrid">
            {rounds.map((round) => (
              <Link
                href={roundLink(round.roundNumber)}
                className="compRoundCard compRoundCardLink"
                key={round.id}
              >
                <span>R{String(round.roundNumber).padStart(2, "0")}</span>
                <strong>{round.name || `Round ${round.roundNumber}`}</strong>
                <small>{round.status.toUpperCase()}</small>
                <b>OPEN ROUND →</b>
              </Link>
            ))}
          </div>
        </article>

        <aside className="competitivePanel">
          <div className="competitivePanelHeader">
            <h2>Event Systems</h2>
            <span>CONFIG</span>
          </div>

          <div className="competitiveStatList">
            <div className="competitiveStat">
              <span>Leaderboard</span>
              <strong>{event.publicLeaderboard ? "ENABLED" : "OFF"}</strong>
            </div>
            <div className="competitiveStat">
              <span>Player Stats</span>
              <strong>{event.playerStatsEnabled ? "ENABLED" : "OFF"}</strong>
            </div>
            <div className="competitiveStat">
              <span>Auros Points</span>
              <strong>
                {event.apEnabled ? (event.apRewardProfile || "ENABLED").toUpperCase() : "OFF"}
              </strong>
            </div>
            <div className="competitiveStat">
              <span>Qualification</span>
              <strong>
                {event.qualificationEnabled ? `TOP ${event.qualificationTop ?? "—"}` : "OFF"}
              </strong>
            </div>
            <div className="competitiveStat">
              <span>Reviews</span>
              <strong>{event.reviewsEnabled ? "ENABLED" : "OFF"}</strong>
            </div>
            <div className="competitiveStat">
              <span>Broadcast</span>
              <strong>{event.broadcastEnabled ? "ENABLED" : "OFF"}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <CompetitiveAdminGuard>
      {() => <TournamentControl id={id} />}
    </CompetitiveAdminGuard>
  );
}
