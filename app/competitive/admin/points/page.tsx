"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import CompetitiveAdminGuard from "../../../../components/competitive/CompetitiveAdminGuard";

import {
  finalizeTournamentAP,
  getCompetitiveAPEvents,
  type CompetitiveAPEvent,
} from "../../../../services/competitive-rankings.service";

type AdminAccess = {
  role: string;
  isSiteAdmin: boolean;
};

function PointsControl({ access }: { access: AdminAccess }) {
  const [events, setEvents] = useState<CompetitiveAPEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canFinalize =
    access.isSiteAdmin || access.role === "competitive_admin";

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getCompetitiveAPEvents();
      setEvents(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load AP control.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canFinalize) {
      loadEvents();
    } else {
      setLoading(false);
    }
  }, [canFinalize, loadEvents]);

  async function finalize(event: CompetitiveAPEvent) {
    const accepted = window.confirm(
      `FINALIZE AUROS POINTS for ${event.tournamentName}?\n\n` +
        `Reward profile: ${event.rewardProfile.toUpperCase()}\n` +
        "This awards AP permanently and locks published round results " +
        "against reopening. You cannot undo this in V0.1.",
    );

    if (!accepted) {
      return;
    }

    setBusyId(event.tournamentId);
    setError("");
    setSuccess("");

    try {
      const result = await finalizeTournamentAP(event.tournamentId);

      setSuccess(
        result.status === "already_finalized"
          ? "This event was already finalized. No extra AP was awarded."
          : `${result.awards} player(s) awarded ${result.totalAp ?? 0} AP in total.`,
      );

      await loadEvents();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "AP finalization failed.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="competitivePage">
      <div className="competitiveOpsHeader">
        <div>
          <Link href="/competitive/admin" className="compBack">
            ← RACE CONTROL
          </Link>

          <span className="competitiveEyebrow gold">
            COMPETITIVE ADMIN // AP ENGINE
          </span>

          <h1>AUROS POINTS.</h1>

          <p className="compHeaderDescription">
            Review completed solo events and explicitly finalize AP rewards.
            Event scoring points and career Auros Points are separate systems.
          </p>
        </div>

        <div className="compHeaderActions">
          <Link href="/competitive/rankings" className="compPrimaryButton">
            GLOBAL RANKINGS →
          </Link>
        </div>
      </div>

      <div className="compAdminActionBar">
        <Link href="/competitive/admin/tournaments" className="compSecondaryButton">
          TOURNAMENT REGISTRY
        </Link>

        <Link href="/competitive/admin/scoring" className="compSecondaryButton">
          SCORING RULESETS
        </Link>
      </div>

      {!canFinalize && (
        <div className="competitivePanel">
          <h2>Competitive Admin required.</h2>
          <p className="compHeaderDescription">
            AP finalization is reserved for site administrators and
            Competitive Admins.
          </p>
        </div>
      )}

      {canFinalize && (
        <>
          <div className="competitivePanel compAPPolicyPanel">
            <div className="competitivePanelHeader">
              <h2>AP Reward Policy V0.1</h2>
              <span>OFFICIAL / FIXED</span>
            </div>

            <p>
              Finishing position by tournament points: winner 100 AP,
              #2–3 75 AP, #4–10 50 AP, #11–25 25 AP, everyone else 10 AP.
              Reward tier multiplies that amount.
            </p>

            <div className="compAPMultipliers">
              <span>COMMUNITY ×0.5</span>
              <span>STANDARD ×1</span>
              <span>QUALIFIER ×1.25</span>
              <span>MAJOR ×2</span>
            </div>
          </div>

          {error && <div className="compError">{error}</div>}
          {success && <div className="compSuccess">{success}</div>}

          <section className="competitivePanel compAPEventPanel">
            <div className="competitivePanelHeader">
              <h2>Tournament AP Awards</h2>
              <span>{loading ? "LOADING" : `${events.length} EVENTS`}</span>
            </div>

            {!loading && events.length === 0 && (
              <div className="competitiveEmpty">
                No tournaments have been created yet.
              </div>
            )}

            <div className="compAPEventList">
              {events.map((event) => {
                const eligible =
                  event.status === "completed" &&
                  event.apEnabled &&
                  event.isPublic &&
                  event.publicLeaderboard &&
                  event.playerAwards === 0;

                return (
                  <div className="compAPEvent" key={event.tournamentId}>
                    <div>
                      <span className="competitiveEyebrow">
                        {event.status.replaceAll("_", " ").toUpperCase()}
                      </span>

                      <h3>{event.tournamentName}</h3>

                      <small>
                        {event.rewardProfile.toUpperCase()} · {event.apEnabled ? "AP ENABLED" : "AP DISABLED"}
                      </small>
                    </div>

                    <div className="compAPEventActions">
                      {event.playerAwards > 0 ? (
                        <span className="compAPFinalized">
                          ✓ {event.playerAwards} REWARDS / {event.totalAp} AP
                        </span>
                      ) : (
                        <span className="compAPEventStatus">
                          {eligible ? "READY FOR REVIEW" : "NOT ELIGIBLE YET"}
                        </span>
                      )}

                      <Link
                        href={`/competitive/admin/tournaments/${event.tournamentId}`}
                        className="compSecondaryButton"
                      >
                        CONTROL →
                      </Link>

                      {eligible && (
                        <button
                          type="button"
                          className="compPrimaryButton"
                          disabled={busyId !== null}
                          onClick={() => finalize(event)}
                        >
                          {busyId === event.tournamentId
                            ? "FINALIZING..."
                            : "FINALIZE AP"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </section>
  );
}

export default function CompetitivePointsPage() {
  return (
    <CompetitiveAdminGuard>
      {(access) => <PointsControl access={access} />}
    </CompetitiveAdminGuard>
  );
}
