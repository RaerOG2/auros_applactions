"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CompetitiveAdminGuard from "../../../../../../components/competitive/CompetitiveAdminGuard";
import { supabase } from "../../../../../../lib/supabase";
import {
  addParticipantByCompetitiveId,
  getTournamentParticipants,
  startTournament,
  updateParticipant,
  type EntryStatus,
  type TournamentParticipant,
} from "../../../../../../services/competitive-registration.service";

type PlayerTournament = {
  id: string;
  name: string;
  status: string;
  max_entries: number;
  slug: string;
  is_public: boolean;
};

function PlayerOperations() {
  const { id } = useParams<{ id: string }>();

  const [tournament, setTournament] = useState<PlayerTournament | null>(null);
  const [players, setPlayers] = useState<TournamentParticipant[]>([]);
  const [competitiveId, setCompetitiveId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const [{ data, error: tournamentError }, entries] = await Promise.all([
      supabase
        .from("competitive_tournaments")
        .select("id, name, status, max_entries, slug, is_public")
        .eq("id", id)
        .single(),
      getTournamentParticipants(id),
    ]);

    if (tournamentError) {
      throw tournamentError;
    }

    setTournament(data);
    setPlayers(entries);
  }

  useEffect(() => {
    load().catch((err) => setError(err?.message || "Could not load players."));
  }, [id]);

  const stats = useMemo(() => {
    const registered = players.filter((player) => player.status === "registered").length;
    const checkedIn = players.filter((player) => player.status === "checked_in").length;
    const active = players.filter((player) => player.status === "active").length;
    const waitlisted = players.filter((player) => player.status === "waitlisted").length;

    return {
      registered,
      checkedIn,
      active,
      waitlisted,
    };
  }, [players]);

  async function addPlayer() {
    if (!competitiveId.trim() || busy) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await addParticipantByCompetitiveId(id, competitiveId);
      setCompetitiveId("");
      await load();
      setNotice("Player added to the tournament.");
    } catch (err: any) {
      setError(err?.message || "Could not add player.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(entryId: string, status: EntryStatus) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await updateParticipant(entryId, status);
      await load();
    } catch (err: any) {
      setError(err?.message || "Could not update player.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStart() {
    if (tournament?.status !== "check_in" || stats.checkedIn === 0) {
      setError("Open check-in and check in at least one player before starting.");
      return;
    }

    if (!window.confirm("Start tournament? Checked-in players become active and Round 1 opens.")) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await startTournament(id);
      await load();
      setNotice("Tournament started. Round 1 is now active.");
    } catch (err: any) {
      setError(err?.message || "Could not start tournament.");
    } finally {
      setBusy(false);
    }
  }

  const mayEdit = tournament?.status !== "in_progress" &&
    tournament?.status !== "completed" &&
    tournament?.status !== "archived";

  return (
    <section className="competitivePage">
      <div className="compCreatorTop">
        <div>
          <Link href={`/competitive/admin/tournaments/${id}`} className="compBack">
            ← TOURNAMENT CONTROL
          </Link>

          <span className="competitiveEyebrow">PLAYER OPERATIONS // SOLO</span>
          <h1>{tournament?.name || "Tournament Players"}</h1>
          <p>Manage entries, player check-in and the starting grid.</p>
        </div>

        <div className="compReadiness">
          <span>CAPACITY / ALL ENTRIES</span>
          <strong>{players.length} / {tournament?.max_entries ?? "—"}</strong>
          <div>
            <i
              style={{
                width: `${Math.min(100, players.length / (tournament?.max_entries || 1) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="compAdminActionBar">
        <Link href={`/competitive/admin/tournaments/${id}`} className="compSecondaryButton">
          EVENT SETTINGS / STATUS
        </Link>
        <Link href="/competitive/players" className="compSecondaryButton">
          PLAYER DIRECTORY
        </Link>
        <Link href={`/competitive/admin/tournaments/${id}/rounds/1`} className="compSecondaryButton">
          RACE CONTROL / ROUND 1
        </Link>
        {tournament?.is_public && (
          <Link
            href={`/competitive/tournaments/${tournament.slug}`}
            className="compSecondaryButton"
          >
            PUBLIC EVENT ↗
          </Link>
        )}
      </div>

      <div className="compParticipantMetrics">
        <div className="competitiveMetric">
          <span>REGISTERED</span>
          <strong>{stats.registered}</strong>
        </div>
        <div className="competitiveMetric">
          <span>CHECKED IN</span>
          <strong>{stats.checkedIn + stats.active}</strong>
        </div>
        <div className="competitiveMetric">
          <span>WAITLIST</span>
          <strong>{stats.waitlisted}</strong>
        </div>
        <div className="competitiveMetric">
          <span>ACTIVE</span>
          <strong>{stats.active}</strong>
        </div>
      </div>

      <div className="competitivePanel compParticipantToolbar">
        <div>
          <span className="competitiveEyebrow gold">MANUAL ENTRY</span>
          <strong>Add by Competitive ID</strong>
        </div>

        <div className="compParticipantAdd">
          <input
            value={competitiveId}
            onChange={(event) => setCompetitiveId(event.target.value)}
            placeholder="AC-000001"
            disabled={!mayEdit || busy}
          />
          <button
            type="button"
            className="compMiniAction gold"
            disabled={!mayEdit || busy || !competitiveId.trim()}
            onClick={addPlayer}
          >
            + ADD PLAYER
          </button>
        </div>

        <button
          type="button"
          className="compCreateButton compStartEvent"
          disabled={busy || tournament?.status !== "check_in" || stats.checkedIn === 0}
          onClick={handleStart}
        >
          {tournament?.status === "in_progress"
            ? "EVENT IN PROGRESS"
            : "START TOURNAMENT"}
        </button>
      </div>

      {error && <div className="compError">{error}</div>}
      {notice && <div className="compSuccess">{notice}</div>}

      <div className="competitivePanel compParticipantPanel">
        <div className="competitivePanelHeader">
          <div>
            <span className="competitiveEyebrow">ENTRY GRID</span>
            <h2>Players</h2>
          </div>
          <span>{players.length} ENTRIES</span>
        </div>

        {players.length === 0 ? (
          <div className="compEmptyRule">
            No players registered yet. Add an existing Competitive player above
            or open public registration in Tournament Control.
          </div>
        ) : (
          <div className="compParticipantTable">
            <div className="compParticipantHead">
              <span>SEED</span>
              <span>PLAYER</span>
              <span>COMP ID</span>
              <span>STATUS</span>
              <span>CONTROL</span>
            </div>

            {players.map((player, index) => (
              <div className="compParticipantRow" key={player.id}>
                <span className="compSeed">
                  #{String(player.seed ?? index + 1).padStart(3, "0")}
                </span>

                <div className="compPlayerIdentity">
                  <strong>{player.epicDisplayName || player.displayName}</strong>
                  <small>
                    {player.epicDisplayName ? "EPIC DISPLAY NAME" : "AUROS IDENTITY"}
                  </small>
                  {player.competitiveId && (
                    <Link
                      href={`/competitive/players/${encodeURIComponent(player.competitiveId)}`}
                      className="compPlayerInlineLink"
                    >
                      VIEW PLAYER CARD ↗
                    </Link>
                  )}
                </div>

                <span>{player.competitiveId || "—"}</span>

                <span className={`compEntryStatus status-${player.status}`}>
                  {player.status.replaceAll("_", " ").toUpperCase()}
                </span>

                <select
                  value={player.status}
                  disabled={busy || !mayEdit}
                  onChange={(event) => changeStatus(player.id, event.target.value as EntryStatus)}
                >
                  <option value="registered">Registered</option>
                  <option value="waitlisted">Waitlist</option>
                  <option value="checked_in">Checked In</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="disqualified">Disqualified</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function TournamentPlayersPage() {
  return (
    <CompetitiveAdminGuard>
      {() => <PlayerOperations />}
    </CompetitiveAdminGuard>
  );
}
