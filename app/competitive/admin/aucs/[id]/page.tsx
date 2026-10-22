"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CompetitiveAdminGuard from "../../../../../components/competitive/CompetitiveAdminGuard";
import type { CompetitiveStaffAccess } from "../../../../../types/competitive";
import {
  assignAUCSEvent,
  finalizeAUCSEvent,
  getAdminAUCSEvents,
  getAdminAUCSSeasons,
  setAUCSStatus,
  type AUCSAdminEvent,
  type AUCSAdminSeason,
} from "../../../../../services/competitive-aucs.service";

function AUCSSeasonControl({ access }: { access: CompetitiveStaffAccess }) {
  const { id } = useParams<{ id: string }>();
  const canManage = access.isSiteAdmin || access.role === "competitive_admin";

  const [season, setSeason] = useState<AUCSAdminSeason | null>(null);
  const [events, setEvents] = useState<AUCSAdminEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const [seasons, allEvents] = await Promise.all([
      getAdminAUCSSeasons(),
      getAdminAUCSEvents(),
    ]);

    setSeason(seasons.find((item) => item.id === id) ?? null);
    setEvents(allEvents);
  }

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    let active = true;

    refresh()
      .catch((issue: unknown) => {
        if (active) {
          setError(issue instanceof Error ? issue.message : "Could not load season.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [canManage, id]);

  const assignedEvents = useMemo(
    () => events.filter((event) => event.seriesId === id),
    [events, id],
  );

  const availableEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.seriesId === null &&
          ["draft", "scheduled", "registration_open"].includes(event.status),
      ),
    [events],
  );

  async function runAction(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await action();
      await refresh();
      setMessage(success);
    } catch (issue: unknown) {
      setError(issue instanceof Error ? issue.message : "Operation failed.");
    } finally {
      setBusy(false);
    }
  }

  function changeSeasonStatus(status: "active" | "completed") {
    const text = status === "active"
      ? "Publish this AUCS season? It will become visible to everyone."
      : "Complete this season and officially crown its championship leader?";

    if (!window.confirm(text)) {
      return;
    }

    runAction(
      () => setAUCSStatus(id, status),
      status === "active" ? "Season published." : "Season completed. Champion recorded.",
    );
  }

  function finalize(event: AUCSAdminEvent) {
    if (!window.confirm(
      `Finalize Championship Points for ${event.name}? This action cannot be undone in V0.1.`,
    )) {
      return;
    }

    runAction(
      () => finalizeAUCSEvent(event.id),
      `Official Championship Points finalized for ${event.name}.`,
    );
  }

  if (loading) {
    return <div className="competitiveGate">Loading AUCS Operations…</div>;
  }

  if (!canManage || !season) {
    return (
      <div className="competitiveGate">
        <h1>Season Control unavailable</h1>
        <p>Competitive Admin access is required, or the season does not exist.</p>
        <Link href="/competitive/admin">Return to Race Control</Link>
      </div>
    );
  }

  return (
    <section className="competitivePage">
      <header className="competitiveOpsHeader compAUCSHeader">
        <div>
          <Link href="/competitive/admin/aucs" className="compBack">
            ← AUCS SEASON CONTROL
          </Link>
          <span className="competitiveEyebrow gold">CHAMPIONSHIP ADMIN // SOLO</span>
          <h1>{season.name}</h1>
          <p className="compHeaderDescription">
            {season.seasonLabel || "AUCS SERIES"} · {season.status.toUpperCase()}
          </p>

          <div className="compHeroActions">
            <Link href="/competitive/admin/tournaments/new" className="compPrimaryButton">
              + CREATE TOURNAMENT
            </Link>
            <Link href="/competitive/admin/tournaments" className="compSecondaryButton">
              EVENT REGISTRY →
            </Link>
            <Link
              href={`/competitive/admin/aucs/${id}/grand-final`}
              className="compSecondaryButton"
            >
              GRAND FINAL CONTROL →
            </Link>
            {season.isPublic && (
              <Link
                href={`/competitive/aucs/${season.slug}`}
                className="compSecondaryButton"
              >
                PUBLIC CHAMPIONSHIP ↗
              </Link>
            )}
          </div>
        </div>

        <div className="compAUCSFormat">
          <span>SEASON STATUS</span>
          <strong>{season.status.toUpperCase()}</strong>
          <small>{assignedEvents.length} EVENTS</small>
        </div>
      </header>

      {error && <div className="compError compAUCSAlert">{error}</div>}
      {message && <div className="compSuccess compAUCSAlert">{message}</div>}

      <div className="compAUCSMetrics">
        <div className="competitiveMetric">
          <span>ASSIGNED EVENTS</span>
          <strong>{assignedEvents.length}</strong>
        </div>
        <div className="competitiveMetric">
          <span>COMPLETED EVENTS</span>
          <strong>{assignedEvents.filter((event) => event.status === "completed").length}</strong>
        </div>
        <div className="competitiveMetric">
          <span>POINTS FINALIZED</span>
          <strong>{assignedEvents.filter((event) => event.pointsFinalized).length}</strong>
        </div>
      </div>

      <div className="compAUCSAdminLayout">
        <main className="competitivePanel compAUCSPadded">
          <div className="competitivePanelHeader">
            <div>
              <span className="competitiveEyebrow">SERIES EVENTS</span>
              <h2>Tournament Operations</h2>
            </div>
            <span>{assignedEvents.length} EVENTS</span>
          </div>

          {assignedEvents.length === 0 && (
            <div className="competitiveEmpty">
              <div>
                <strong>No events assigned.</strong>
                Assign an existing tournament from the side panel.
              </div>
            </div>
          )}

          <div className="compAUCSEventList">
            {assignedEvents.map((event) => (
              <div className="compAUCSEventRow" key={event.id}>
                <div>
                  <span className={`compStatus compStatus--${event.status}`}>
                    {event.status.replaceAll("_", " ")}
                  </span>
                  <strong>{event.name}</strong>
                  <small>
                    {event.roundCount} ROUNDS ·
                    {event.pointsFinalized ? " CHAMPIONSHIP POINTS FINALIZED" : " POINTS PENDING"}
                  </small>
                  {event.qualificationEnabled && (
                    <small>QUALIFIER · TOP {event.qualificationTop ?? "—"}</small>
                  )}
                </div>

                <div className="compHeaderActions">
                  <Link
                    className="compSecondaryButton"
                    href={`/competitive/admin/tournaments/${event.id}`}
                  >
                    CONTROL →
                  </Link>

                  {season.status === "active" &&
                    event.status === "completed" &&
                    event.isPublic &&
                    !event.pointsFinalized && (
                      <button
                        className="compMiniAction gold"
                        type="button"
                        disabled={busy}
                        onClick={() => finalize(event)}
                      >
                        FINALIZE POINTS
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </main>

        <aside className="competitivePanel compAUCSPadded">
          <div className="competitivePanelHeader">
            <div>
              <span className="competitiveEyebrow gold">CHAMPIONSHIP CONTROL</span>
              <h2>Season Operations</h2>
            </div>
          </div>

          <div className="compAUCSActionStack">
            {season.status === "draft" && (
              <button
                type="button"
                className="compCreateButton"
                disabled={busy}
                onClick={() => changeSeasonStatus("active")}
              >
                PUBLISH SEASON
              </button>
            )}

            {season.status === "active" && (
              <button
                type="button"
                className="compCreateButton"
                disabled={busy}
                onClick={() => changeSeasonStatus("completed")}
              >
                COMPLETE SEASON & CROWN CHAMPION
              </button>
            )}

            {season.status === "completed" && (
              <div className="compSuccess">
                Season completed. Champion archived in Hall of Champions.
              </div>
            )}

            <p className="compAUCSFootnote">
              Publish the season when ready. Championship Points can be finalized
              only after a public event has completed all published rounds.
            </p>
          </div>

          {season.status !== "completed" && (
            <div className="compAUCSAssignPanel">
              <label className="compField">
                <span>Assign existing tournament</span>
                <select
                  value={selectedEvent}
                  onChange={(event) => setSelectedEvent(event.target.value)}
                >
                  <option value="">Select a tournament…</option>
                  {availableEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} · {event.status.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="compSecondaryButton"
                disabled={busy || !selectedEvent}
                onClick={() =>
                  runAction(
                    () => assignAUCSEvent(selectedEvent, id),
                    "Tournament assigned to this AUCS season.",
                  ).then(() => setSelectedEvent(""))
                }
              >
                + ASSIGN TO AUCS
              </button>
              <p className="compAUCSFootnote">
                Only unassigned tournaments in Draft, Scheduled or Registration Open
                can be linked here. A tournament cannot belong to two seasons.
              </p>
            </div>
          )}

          <div className="compAUCSPointPreview">
            <span className="competitiveEyebrow gold">SEASON SCORING</span>
            <h3>Championship Points</h3>
            {season.points.map((points, index) => (
              <div key={index}>
                <span>#{index + 1}</span>
                <strong>{points} PTS</strong>
              </div>
            ))}
            <p className="compAUCSFootnote">
              Positions outside the listed rewards score 0 championship points.
              This table does not change AP rewards.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function AUCSSeasonAdminPage() {
  return (
    <CompetitiveAdminGuard>
      {(access) => <AUCSSeasonControl access={access} />}
    </CompetitiveAdminGuard>
  );
}
