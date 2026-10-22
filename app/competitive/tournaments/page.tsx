"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getPublicUnifiedTournaments,
  type UnifiedTournament,
} from "../../../services/competitive-unified.service";

const filters = [
  { key: "all", label: "All Events" },
  { key: "standard", label: "Normal" },
  { key: "qualifier", label: "Qualifiers" },
  { key: "final", label: "Finals" },
  { key: "championship", label: "Championships" },
];

export default function CompetitiveTournamentsPage() {
  const [events, setEvents] = useState<UnifiedTournament[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicUnifiedTournaments()
      .then(setEvents)
      .catch((reason) => setError(reason?.message ?? "Could not load events."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => events.filter((event) => (
    (filter === "all" || event.event_kind === filter) &&
    `${event.name} ${event.slug}`.toLowerCase().includes(search.trim().toLowerCase())
  )), [events, filter, search]);

  return (
    <section className="competitivePage">
      <div className="comp3PageHeader">
        <div>
          <span className="comp3Overline">COMPETE / ALL TOURNAMENTS</span>
          <h1>Tournaments.</h1>
          <p>Von Community Cups bis zum Grand Final: Alle Wettbewerbe in einer einzigen, übersichtlichen Liste.</p>
        </div>
        <div className="comp3Actions">
          <Link href="/competitive/rankings" className="comp3Button">Official Rankings</Link>
          <Link href="/competitive/me" className="comp3Button">My Player Card</Link>
        </div>
      </div>

      <div className="comp3Surface">
        <div className="comp3TournamentFilters">
          <div className="comp3Chips" role="group" aria-label="Filter by event kind">
            {filters.map((item) => (
              <button key={item.key} type="button" className={filter === item.key ? "is-active" : ""} onClick={() => setFilter(item.key)}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="comp3FormField comp3SearchField">
            <label htmlFor="comp3-event-search">Search</label>
            <input id="comp3-event-search" value={search} onChange={(change) => setSearch(change.target.value)} placeholder="Find a tournament…" />
          </div>
        </div>

        {error && <div className="compError" role="alert">{error}</div>}
        {loading ? (
          <div className="comp3Empty">Loading tournaments…</div>
        ) : filtered.length === 0 ? (
          <div className="comp3Empty">No public tournaments match the selected filters.</div>
        ) : (
          <div className="comp3List">
            {filtered.map((event) => (
              <article key={event.id} className="comp3ListRow comp3TournamentRow">
                <div>
                  <div className="comp3Actions">
                    <span className="comp3Badge">{event.event_kind.toUpperCase()}</span>
                    <span className="comp3Badge comp3Badge--subtle">{event.status.replaceAll("_", " ").toUpperCase()}</span>
                  </div>
                  <strong>{event.name}</strong>
                  <small>SOLO · {event.round_count} ROUNDS · UP TO {event.max_entries} PLAYERS</small>
                </div>
                <div className="comp3Actions">
                  <Link className="comp3Button" href={`/competitive/tournaments/${event.slug}/standings`}>Standings</Link>
                  <Link className="comp3Button comp3Button--primary" href={`/competitive/tournaments/${event.slug}`}>Open Event →</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
