"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import CompetitiveStaffEntry from "../../../../components/competitive/CompetitiveStaffEntry";
import {
  checkInTournament,
  getMyTournamentEntry,
  getTournamentForRegistration,
  registerForTournament,
} from "../../../../services/competitive-registration.service";

type EventData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
  round_count: number;
  max_entries: number;
  public_leaderboard: boolean;
  is_public: boolean;
};

type MyEntry = {
  id: string;
  display_name: string;
  status: string;
};

export default function PublicTournamentPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [entry, setEntry] = useState<MyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);

    try {
      const current = await getTournamentForRegistration(slug);
      setEvent(current);

      if (!current) {
        setEntry(null);
        return;
      }

      try {
        setEntry(await getMyTournamentEntry(current.id));
      } catch {
        setEntry(null);
      }
    } catch (err: any) {
      setMessage(err?.message || "Could not load the event.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  async function handleJoin() {
    if (!event || busy) {
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      await registerForTournament(event.id);
      await load();
    } catch (err: any) {
      const reason = err?.message || "Registration failed.";
      setMessage(
        reason.includes("AUTH_REQUIRED")
          ? "Sign in to your Auros account before registering."
          : reason,
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckIn() {
    if (!event || busy) {
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      await checkInTournament(event.id);
      await load();
    } catch (err: any) {
      setMessage(err?.message || "Check-in failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <section className="competitivePage">
        <div className="competitivePanel compPublicEventState">LOADING EVENT…</div>
      </section>
    );
  }

  if (!event || !event.is_public || event.status === "draft") {
    return (
      <section className="competitivePage">
        <div className="competitivePanel compPublicEventState">
          <h2>Event unavailable</h2>
          <Link href="/competitive/tournaments" className="compSecondaryButton">
            BACK TO TOURNAMENTS
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="competitivePage">
      <div className="compEventPageHeader">
        <Link href="/competitive/tournaments" className="compBack">
          ← ALL TOURNAMENTS
        </Link>
        <CompetitiveStaffEntry compact />
      </div>

      <div className="competitiveHero compTournamentHero">
        <span className="competitiveEyebrow gold">AUROS COMPETITIVE // SOLO</span>
        <h1>{event.name}</h1>
        <p>{event.description || "One lobby. One player. One result."}</p>

        <div className="compEventMeta">
          <span>{event.status.replaceAll("_", " ").toUpperCase()}</span>
          <span>{event.round_count} ROUNDS</span>
          <span>{event.max_entries} PLAYERS MAX</span>
        </div>

        <div className="compHeroActions">
          {event.public_leaderboard && (
            <Link
              href={`/competitive/tournaments/${slug}/standings`}
              className="compSecondaryButton"
            >
              OFFICIAL STANDINGS →
            </Link>
          )}
          <Link href="/competitive/tournaments" className="compSecondaryButton">
            MORE TOURNAMENTS
          </Link>
        </div>
      </div>

      <div className="compPublicEventGrid">
        <div className="competitivePanel compRegistrationCard">
          <span className="competitiveEyebrow">TOURNAMENT ENTRY</span>

          {!entry ? (
            <>
              <h2>Claim your place.</h2>
              <p>
                Register with your Auros account. If the main grid is full,
                Competitive places you on the waitlist.
              </p>

              <button
                type="button"
                className="compCreateButton"
                disabled={busy || event.status !== "registration_open"}
                onClick={handleJoin}
              >
                {event.status === "registration_open"
                  ? "JOIN TOURNAMENT"
                  : "REGISTRATION CLOSED"}
              </button>
              <Link href="/login" className="compTextLink">
                Need to sign in? Open Login →
              </Link>
            </>
          ) : (
            <>
              <h2>{entry.display_name}</h2>
              <div className={`compTicketStatus status-${entry.status}`}>
                {entry.status.replaceAll("_", " ").toUpperCase()}
              </div>

              <p>Your Competitive entry is linked to your Auros account.</p>

              {event.status === "check_in" && entry.status === "registered" && (
                <button
                  type="button"
                  className="compCreateButton"
                  disabled={busy}
                  onClick={handleCheckIn}
                >
                  CHECK IN NOW
                </button>
              )}

              {entry.status === "checked_in" && (
                <div className="compCheckedBanner">✓ CHECK-IN COMPLETE</div>
              )}
            </>
          )}

          {message && <div className="compError compEventMessage">{message}</div>}
        </div>

        <div className="competitivePanel compEventInfo">
          <span className="competitiveEyebrow gold">EVENT FORMAT</span>
          <strong>SOLO</strong>
          <div><span>Rounds</span><b>{event.round_count}</b></div>
          <div><span>Capacity</span><b>{event.max_entries}</b></div>
          <div>
            <span>Leaderboard</span>
            <b>{event.public_leaderboard ? "PUBLIC" : "PRIVATE"}</b>
          </div>
        </div>
      </div>
    </section>
  );
}
