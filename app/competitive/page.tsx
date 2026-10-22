"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getPublicUnifiedTournaments,
  type UnifiedTournament,
} from "../../services/competitive-unified.service";

function statusName(status: string) {
  return status.replaceAll("_", " ").toUpperCase();
}

export default function CompetitiveHome() {
  const [events, setEvents] = useState<UnifiedTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicUnifiedTournaments()
      .then(setEvents)
      .catch((reason) => setError(reason?.message ?? "Tournament data unavailable."))
      .finally(() => setLoading(false));
  }, []);

  const active = useMemo(
    () => events.filter((event) => ["in_progress", "registration_open", "check_in"].includes(event.status)),
    [events],
  );

  const featured = active[0] ?? events[0];

  return (
    <section className="competitivePage">
      <div className="comp3PageHeader">
        <div>
          <span className="comp3Overline">AUROS / COMPETITIVE HUB</span>
          <h1>Your Competitive Home.</h1>
          <p>Alle Cups, Rankings und Spieler an einem Ort. Kein separates AUCS-Menü, kein unnötiges Suchen.</p>
        </div>
        <div className="comp3Actions">
          <Link href="/competitive/tournaments" className="comp3Button comp3Button--primary">Explore Tournaments →</Link>
          <Link href="/competitive/me" className="comp3Button">My Player Card</Link>
        </div>
      </div>

      {error && <div className="compError" role="alert">{error}</div>}

      <div className="comp3Cards">
        <div className="comp3Surface comp3Stat">
          <span>PUBLIC TOURNAMENTS</span>
          <strong>{loading ? "—" : events.length}</strong>
          <small className="comp3Muted">Official event directory</small>
        </div>
        <div className="comp3Surface comp3Stat">
          <span>ACTIVE / REGISTRATION</span>
          <strong>{loading ? "—" : active.length}</strong>
          <small className="comp3Muted">Current competitive events</small>
        </div>
        <div className="comp3Surface comp3Stat">
          <span>COMPETITION FORMAT</span>
          <strong>SOLO</strong>
          <small className="comp3Muted">AUROS Competitive</small>
        </div>
      </div>

      <div className="comp3Columns">
        <div className="comp3Surface">
          <div className="comp3SectionHeader">
            <h2>Featured Tournaments</h2>
            <Link href="/competitive/tournaments" className="comp3Button">View All →</Link>
          </div>
          {loading ? (
            <div className="comp3Empty">Loading official events…</div>
          ) : events.length === 0 ? (
            <div className="comp3Empty">Noch keine öffentlichen Turniere. Sobald ein Cup freigegeben ist, erscheint er hier.</div>
          ) : (
            <div className="comp3List">
              {[featured, ...events.filter((event) => event.id !== featured.id)].slice(0, 5).map((event) => (
                <div key={event.id} className="comp3ListRow">
                  <div>
                    <span className="comp3Badge">{event.event_kind.toUpperCase()}</span>
                    <strong>{event.name}</strong>
                    <small>{statusName(event.status)} · {event.round_count} ROUNDS · {event.max_entries} PLAYERS</small>
                  </div>
                  <Link href={`/competitive/tournaments/${event.slug}`}>Open →</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="comp3Surface">
          <div className="comp3SectionHeader"><h2>Explore Competitive</h2></div>
          <div className="comp3List">
            <Link href="/competitive/rankings" className="comp3QuickLink">
              <span>▥</span><div><strong>Official Rankings</strong><small>See player ranks, AP and progress</small></div>
            </Link>
            <Link href="/competitive/players" className="comp3QuickLink">
              <span>◎</span><div><strong>Player Directory</strong><small>Find Competitive IDs and profiles</small></div>
            </Link>
            <Link href="/competitive/divisions" className="comp3QuickLink">
              <span>◇</span><div><strong>Competitive Divisions</strong><small>See the progression system</small></div>
            </Link>
            <Link href="/competitive/me" className="comp3QuickLink">
              <span>◉</span><div><strong>My Player Card</strong><small>Manage your player identity and Epic link</small></div>
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
