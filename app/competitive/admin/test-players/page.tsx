"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import CompetitiveAdminGuard from "../../../../components/competitive/CompetitiveAdminGuard";
import { startTournament } from "../../../../services/competitive-registration.service";
import {
  getUnifiedTournaments,
  prepareTestTournament,
  seedTestPlayers,
  simulateTestRound,
  type UnifiedTournament,
} from "../../../../services/competitive-unified.service";

function TestLab() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("tournament") ?? "";

  const [events, setEvents] = useState<UnifiedTournament[]>([]);
  const [selectedId, setSelectedId] = useState(initialId);
  const [amount, setAmount] = useState(20);
  const [round, setRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const allEvents = await getUnifiedTournaments();
    setEvents(allEvents.filter((event) => event.is_test));
  }, []);

  useEffect(() => {
    refresh()
      .catch((reason) => setError(reason?.message ?? "Could not load test tournaments."))
      .finally(() => setLoading(false));
  }, [refresh]);

  const tournament = events.find((event) => event.id === selectedId);

  async function runAction(
    action: () => Promise<number | void>,
    success: (result: number | void) => string,
  ) {
    setError("");
    setFeedback("");
    setWorking(true);

    try {
      const result = await action();
      setFeedback(success(result));
      await refresh();
    } catch (reason: any) {
      setError(reason?.message ?? "Operation failed.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="competitivePage compV2Page">
      <Link className="compBack" href="/competitive/admin">
        ← RACE CONTROL
      </Link>

      <div className="compV2TitleBar">
        <div>
          <span className="competitiveEyebrow">AUROS COMPETITIVE // TEST LAB</span>
          <h1>Test the whole tournament.</h1>
          <p>
            Spieler erzeugen, einchecken, Event starten und Demo-Rundenergebnisse
            vorbereiten. Ausschließlich für private TEST-Turniere.
          </p>
        </div>
        <Link className="compPrimaryButton" href="/competitive/admin/tournaments/new">
          + CREATE TEST TOURNAMENT
        </Link>
      </div>

      <div className="compV2Info">
        Testspieler sind keine Epic-Konten und haben keine öffentlichen
        Karriereprofile. Der Simulator veröffentlicht Ergebnisse niemals automatisch.
      </div>

      <div className="competitiveGrid">
        <article className="competitivePanel">
          <div className="competitivePanelHeader">
            <h2>Test Tournament</h2>
            <span>SELECT A SANDBOX</span>
          </div>

          <label className="compV2Field">
            <span>Tournament</span>
            <select
              value={selectedId}
              disabled={loading || working}
              onChange={(event) => {
                setSelectedId(event.target.value);
                setRound(1);
                setError("");
                setFeedback("");
              }}
            >
              <option value="">Select TEST tournament…</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({event.status})
                </option>
              ))}
            </select>
          </label>

          {tournament && (
            <div className="compV2TestDetails">
              <span className="compV2TestBadge">TEST MODE</span>
              <strong>{tournament.name}</strong>
              <small>
                {tournament.status.toUpperCase()} · {tournament.max_entries} MAX PLAYERS ·
                {tournament.round_count} ROUNDS
              </small>
              <div className="compV2ButtonRow">
                <Link
                  href={`/competitive/admin/tournaments/${tournament.id}`}
                  className="compV2SoftButton"
                >
                  TOURNAMENT CONTROL →
                </Link>
                <Link
                  href={`/competitive/admin/tournaments/${tournament.id}/players`}
                  className="compV2SoftButton"
                >
                  PLAYER OPERATIONS →
                </Link>
                {tournament.event_kind === "final" && (
                  <Link
                    href={`/competitive/admin/tournaments/${tournament.id}/qualification`}
                    className="compV2SoftButton"
                  >
                    FINAL QUALIFICATION →
                  </Link>
                )}
              </div>
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="competitiveEmpty">
              No test tournaments yet. Create a new tournament and enable TEST MODE.
            </div>
          )}
        </article>

        <aside className="competitivePanel">
          <div className="competitivePanelHeader">
            <h2>Quick Simulation</h2>
            <span>ONLY TEST EVENTS</span>
          </div>
          <p className="compV2Muted">
            Der normale Race-Control-Ablauf bleibt aktiv. Hier bereitest du
            nur Testdaten und Testspieler vor.
          </p>

          {error && <div className="compError">{error}</div>}
          {feedback && <div className="compV2Success">{feedback}</div>}

          <div className="compV2ActionStack">
            <div className="compV2Action">
              <strong>01 / Generate Test Players</strong>
              <p>Erzeugt echte Turniereinträge mit separaten TEST-Identitäten.</p>
              <label className="compV2Field">
                <span>How many players?</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                />
              </label>
              <button
                className="compPrimaryButton"
                type="button"
                disabled={working || !tournament || tournament.event_kind === "final" ||
                  !["draft", "scheduled", "registration_open", "check_in"].includes(tournament.status)}
                onClick={() => runAction(
                  () => seedTestPlayers(tournament!.id, amount),
                  (count) => `${count} Testspieler wurden registriert.`,
                )}
              >
                + ADD TEST PLAYERS
              </button>
            </div>

            <div className="compV2Action">
              <strong>02 / Prepare Check-In</strong>
              <p>Markiert die Testspieler als eingecheckt und öffnet die Test-Check-in-Phase.</p>
              <button
                className="compV2SoftButton"
                type="button"
                disabled={working || !tournament ||
                  !["draft", "scheduled", "registration_open", "check_in"].includes(tournament.status)}
                onClick={() => runAction(
                  () => prepareTestTournament(tournament!.id),
                  (count) => `Check-in vorbereitet. ${count} Spieler neu eingecheckt.`,
                )}
              >
                PREPARE TEST CHECK-IN →
              </button>
            </div>

            <div className="compV2Action">
              <strong>03 / Start Tournament</strong>
              <p>Startet das Turnier über die vorhandene offizielle Tournament-Startfunktion.</p>
              <button
                className="compV2SoftButton"
                type="button"
                disabled={working || !tournament || tournament.status !== "check_in"}
                onClick={() => runAction(
                  () => startTournament(tournament!.id),
                  () => "TEST tournament started. Round 1 is now active.",
                )}
              >
                START TEST TOURNAMENT →
              </button>
            </div>

            <div className="compV2Action">
              <strong>04 / Generate Demo Results</strong>
              <p>
                Füllt die gewählte aktive Runde mit Test-Platzierungen, Eliminations
                und Punkten. Danach in Race Control überprüfen und veröffentlichen.
              </p>
              <label className="compV2Field">
                <span>Round number</span>
                <input
                  type="number"
                  min={1}
                  max={tournament?.round_count ?? 50}
                  value={round}
                  onChange={(event) => setRound(Number(event.target.value))}
                />
              </label>
              <button
                className="compV2SoftButton"
                type="button"
                disabled={working || !tournament || tournament.status !== "in_progress"}
                onClick={() => {
                  if (!window.confirm("Vorhandene TEST-Rundenergebnisse überschreiben?")) {
                    return;
                  }

                  void runAction(
                    () => simulateTestRound(tournament!.id, round),
                    (count) => `${count} Testresultate erstellt. Bitte in Race Control prüfen.`,
                  );
                }}
              >
                GENERATE TEST RESULTS →
              </button>
              {tournament && (
                <Link
                  className="compV2SoftButton"
                  href={`/competitive/admin/tournaments/${tournament.id}/rounds/${round}`}
                >
                  OPEN ROUND {round} / PUBLISH →
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function TestPlayersPage() {
  return (
    <CompetitiveAdminGuard>
      {() => (
        <Suspense fallback={<div className="competitiveGate">Loading Test Lab…</div>}>
          <TestLab />
        </Suspense>
      )}
    </CompetitiveAdminGuard>
  );
}
