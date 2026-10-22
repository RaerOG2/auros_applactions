"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import CompetitiveAdminGuard from "../../../../components/competitive/CompetitiveAdminGuard";
import {
  getUnifiedTournaments,
  type UnifiedTournament,
} from "../../../../services/competitive-unified.service";
import {
  createCupRehearsal,
  getCupRehearsals,
  getCupRehearsalSnapshot,
  getRehearsalPreviewPath,
  previewAurosPoints,
  simulateCupRehearsalRound,
  type RehearsalSession,
  type RehearsalSnapshot,
} from "../../../../services/competitive-rehearsal.service";

function RehearsalStudio() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get("tournament") ?? "";

  const [events, setEvents] = useState<UnifiedTournament[]>([]);
  const [eventId, setEventId] = useState(initialEventId);
  const [sessions, setSessions] = useState<RehearsalSession[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [playerCount, setPlayerCount] = useState(30);
  const [roundNumber, setRoundNumber] = useState(1);
  const [snapshot, setSnapshot] = useState<RehearsalSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const event = events.find((item) => item.id === eventId);
  const session = sessions.find((item) => item.id === sessionId);
  const previewPath = session
    ? getRehearsalPreviewPath(session.id, session.viewer_token)
    : "";

  const apProfile = event?.ap_reward_profile ?? "standard";
  const canCreate = Boolean(eventId && event && playerCount >= 2 && playerCount <= 100);

  const sessionOptions = useMemo(() => sessions.filter((item) => item.tournament_id === eventId), [sessions, eventId]);

  const loadSnapshot = useCallback(async (target: RehearsalSession) => {
    const loaded = await getCupRehearsalSnapshot(target.id, target.viewer_token);
    setSnapshot(loaded);
  }, []);

  useEffect(() => {
    let alive = true;

    Promise.all([getUnifiedTournaments(), getCupRehearsals()])
      .then(([allEvents, allSessions]) => {
        if (!alive) return;
        setEvents(allEvents);
        setSessions(allSessions);
      })
      .catch((reason) => {
        if (alive) setError(reason?.message ?? "Rehearsal Studio could not load.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setSnapshot(null);
    if (!session) return;

    loadSnapshot(session).catch((reason) => {
      setError(reason?.message ?? "Preview could not load.");
    });
  }, [sessionId, session?.viewer_token, loadSnapshot]);

  async function create() {
    if (!canCreate) return;

    setWorking(true);
    setError("");
    setSuccess("");

    try {
      const result = await createCupRehearsal(eventId, playerCount);
      const allSessions = await getCupRehearsals();
      setSessions(allSessions);
      setSessionId(result.id);
      setRoundNumber(1);
      setSuccess(`${playerCount} Testspieler wurden für einen isolierten Cup-Probelauf erstellt.`);
    } catch (reason: any) {
      setError(reason?.message ?? "Rehearsal could not be created.");
    } finally {
      setWorking(false);
    }
  }

  async function simulateRound() {
    if (!session || !event) return;

    setWorking(true);
    setError("");
    setSuccess("");

    try {
      const count = await simulateCupRehearsalRound(session.id, roundNumber);
      await loadSnapshot(session);
      setSuccess(`Simulation für Runde ${roundNumber} abgeschlossen: ${count} Demo-Ergebnisse.`);
    } catch (reason: any) {
      setError(reason?.message ?? "Round simulation failed.");
    } finally {
      setWorking(false);
    }
  }

  function copyPreview() {
    if (!previewPath) return;
    const url = `${window.location.origin}${previewPath}`;
    navigator.clipboard.writeText(url)
      .then(() => setSuccess("OBS Preview URL copied."))
      .catch(() => setError("Copy failed. Open the OBS preview and copy its address."));
  }

  return (
    <section className="competitivePage">
      <div className="comp3PageHeader">
        <div>
          <span className="comp3Overline">COMPETITIVE ADMIN / SAFE TESTING</span>
          <h1>Rehearsal Studio</h1>
          <p>Teste jeden existierenden Cup mit eigenen Testspielern, Demo-Punkten und OBS-Preview. Die offizielle Turnierwertung bleibt unverändert.</p>
        </div>
        <div className="comp3Actions">
          <Link href="/competitive/admin/test-players" className="comp3Button">Test Tournament Lab</Link>
          <Link href="/competitive/admin/tournaments" className="comp3Button">All Tournaments</Link>
        </div>
      </div>

      <div className="comp3DangerNote">
        <strong>SAFE PREVIEW MODE.</strong> Dies ist keine echte Registrierung. Testspieler, Demo-Ergebnisse und projizierte AP werden ausschließlich im isolierten Rehearsal gespeichert – niemals in offiziellen Cup-Standings, Career Stats oder AP.
      </div>

      <div className="comp3Columns" style={{ marginTop: 16 }}>
        <div className="comp3Surface">
          <div className="comp3SectionHeader"><h2>01 · Choose Cup</h2><span className="comp3Badge">Official & test cups</span></div>
          <div className="comp3FormGrid">
            <div className="comp3FormField">
              <label htmlFor="rehearsal-event">Tournament</label>
              <select
                id="rehearsal-event"
                value={eventId}
                disabled={loading || working}
                onChange={(change) => {
                  setEventId(change.target.value);
                  setSessionId("");
                  setSnapshot(null);
                  setRoundNumber(1);
                }}
              >
                <option value="">Choose tournament…</option>
                {events.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.event_kind} {item.is_test ? "· TEST" : "· OFFICIAL"}
                  </option>
                ))}
              </select>
            </div>
            <div className="comp3FormField">
              <label htmlFor="rehearsal-player-count">Number of demo players</label>
              <input
                id="rehearsal-player-count"
                type="number"
                min={2}
                max={Math.min(100, event?.max_entries ?? 100)}
                value={playerCount}
                disabled={working}
                onChange={(change) => setPlayerCount(Number(change.target.value))}
              />
            </div>
          </div>

          {event && (
            <p className="comp3Helper">
              {event.round_count} rounds · {event.max_entries} cup slots · {event.is_test ? "Test tournament" : "Real production cup"}
              <br />The rehearsal reads the selected cup&apos;s core placement milestones and elimination multiplier.
            </p>
          )}
          <div className="comp3Actions" style={{ marginTop: 17 }}>
            <button type="button" className="comp3Button comp3Button--primary" disabled={!canCreate || working || playerCount > (event?.max_entries ?? 0)} onClick={create}>
              {working ? "Please wait…" : "+ Create Rehearsal"}
            </button>
          </div>

          <div className="comp3SectionHeader" style={{ marginTop: 30 }}>
            <h2>02 · Pick Rehearsal</h2>
          </div>
          <div className="comp3FormField">
            <label htmlFor="rehearsal-session">Saved previews (expire after 7 days)</label>
            <select
              id="rehearsal-session"
              value={sessionId}
              onChange={(change) => setSessionId(change.target.value)}
              disabled={working || !eventId}
            >
              <option value="">Choose a rehearsal…</option>
              {sessionOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {new Date(item.created_at).toLocaleString("de-DE")} · {item.name}
                </option>
              ))}
            </select>
          </div>

          {session && event && (
            <>
              <div className="comp3SectionHeader" style={{ marginTop: 30 }}><h2>03 · Simulate Round</h2></div>
              <div className="comp3FormGrid">
                <div className="comp3FormField">
                  <label htmlFor="rehearsal-round">Round</label>
                  <select id="rehearsal-round" value={roundNumber} onChange={(change) => setRoundNumber(Number(change.target.value))} disabled={working}>
                    {Array.from({ length: event.round_count }, (_, index) => (
                      <option key={index + 1} value={index + 1}>Round {index + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="comp3FormField">
                  <label>Simulation</label>
                  <button type="button" className="comp3Button comp3Button--primary" onClick={simulateRound} disabled={working}>
                    ▶ Generate Round Results
                  </button>
                </div>
              </div>
              <div className="comp3Actions" style={{ marginTop: 18 }}>
                <Link href={previewPath} target="_blank" rel="noopener noreferrer" className="comp3Button">↗ Open OBS Preview</Link>
                <Link href={`${previewPath}&view=top3`} target="_blank" rel="noopener noreferrer" className="comp3Button">OBS Top 3</Link>
                <Link href={`${previewPath}&view=ticker`} target="_blank" rel="noopener noreferrer" className="comp3Button">OBS Ticker</Link>
                <button type="button" className="comp3Button" onClick={copyPreview}>Copy OBS URL</button>
                <button type="button" className="comp3Button" onClick={() => loadSnapshot(session)}>Refresh Standings</button>
              </div>
              <p className="comp3Helper">OBS previews are read-only and auto-refresh. Treat preview URLs as temporary access links; do not share them publicly.</p>
            </>
          )}

          {error && <div className="compError" role="alert" style={{ marginTop: 17 }}>{error}</div>}
          {success && <div className="comp3Badge" role="status" style={{ marginTop: 17 }}>{success}</div>}
        </div>

        <aside className="comp3Surface">
          <div className="comp3SectionHeader"><h2>Rehearsal Standings</h2><span className="comp3Badge comp3Badge--test">TEST / PREVIEW</span></div>
          {!snapshot ? (
            <div className="comp3Empty">Erstelle oder öffne einen Testlauf, um Demo-Standings und eine AP-Vorschau zu sehen.</div>
          ) : (
            <div className="comp3RehearsalPreview">
              <span className="comp3PreviewWatermark">SIMULATED · NOT OFFICIAL</span>
              <h2 style={{ margin: "10px 0 4px" }}>{snapshot.tournamentName}</h2>
              <div className="comp3Muted" style={{ fontSize: 12 }}>{snapshot.simulatedRounds} / {snapshot.roundCount} rounds simulated</div>
              <div className="comp3PreviewRows">
                <div className="comp3PreviewRow comp3Muted"><span>#</span><span>PLAYER</span><span>KILLS</span><span>POINTS</span></div>
                {snapshot.standings.slice(0, 15).map((standing) => (
                  <div key={standing.rank} className="comp3PreviewRow">
                    <span>{standing.rank}</span>
                    <span>{standing.displayName}</span>
                    <span>{standing.eliminations}</span>
                    <span>{standing.points}</span>
                  </div>
                ))}
              </div>
              {snapshot.simulatedRounds > 0 && (
                <p className="comp3Helper">
                  Preview AP · 1st: {previewAurosPoints(1, apProfile)} ·
                  2nd: {previewAurosPoints(2, apProfile)} ·
                  10th: {previewAurosPoints(10, apProfile)}
                  <br />Only a non-binding estimate. No AP awarded.
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default function RehearsalPage() {
  return (
    <CompetitiveAdminGuard>
      {() => (
        <Suspense fallback={<div className="comp3Surface">Loading Rehearsal Studio…</div>}>
          <RehearsalStudio />
        </Suspense>
      )}
    </CompetitiveAdminGuard>
  );
}
