"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import CompetitiveAdminGuard from "../../../../components/competitive/CompetitiveAdminGuard";
import {
  getUnifiedTournaments,
  type UnifiedTournament,
} from "../../../../services/competitive-unified.service";

const categories = [
  { key: "all", label: "All tournaments" },
  { key: "standard", label: "Normal" },
  { key: "qualifier", label: "Qualifiers" },
  { key: "final", label: "Finals" },
  { key: "championship", label: "Championships" },
  { key: "test", label: "Test events" },
];

function UnifiedTournamentRegistry() {
  const [events, setEvents] = useState<UnifiedTournament[]>([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUnifiedTournaments()
      .then(setEvents)
      .catch((reason) => setError(reason?.message ?? "Could not load tournaments."))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory =
        category === "all"
          ? true
          : category === "test"
            ? event.is_test
            : event.event_kind === category && !event.is_test;

      return (
        matchesCategory &&
        `${event.name} ${event.slug}`.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [events, category, search]);

  return (
    <section className="competitivePage compV2Page">
      <div className="compV2TitleBar">
        <div>
          <Link className="compBack" href="/competitive/admin">
            ← RACE CONTROL
          </Link>
          <span className="competitiveEyebrow">AUROS COMPETITIVE // EVENTS</span>
          <h1>All tournaments. One place.</h1>
          <p>
            AUCS, normale Turniere, Qualifier und Grand Finals haben
            ab jetzt ein gemeinsames Control Center.
          </p>
        </div>
        <div className="compV2ButtonRow">
          <Link className="compV2SoftButton" href="/competitive/admin/test-players">
            TEST LAB
          </Link>
          <Link className="compV2SoftButton" href="/competitive/admin/rehearsal">
            REHEARSAL STUDIO
          </Link>
          <Link className="compPrimaryButton" href="/competitive/admin/tournaments/new">
            + CREATE TOURNAMENT
          </Link>
        </div>
      </div>

      <div className="competitivePanel">
        <div className="compV2FilterBar">
          <div className="compV2Chips">
            {categories.map((item) => (
              <button
                type="button"
                key={item.key}
                className={category === item.key ? "is-active" : ""}
                onClick={() => setCategory(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <input
            aria-label="Search tournaments"
            className="compV2Search"
            placeholder="Search tournament…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {error && <div className="compError">{error}</div>}
        {loading ? (
          <div className="competitiveEmpty">Loading tournaments…</div>
        ) : visible.length === 0 ? (
          <div className="competitiveEmpty">
            No tournaments match your filter.
          </div>
        ) : (
          <div className="compV2Rows">
            {visible.map((event) => (
              <div key={event.id} className="compV2DataRow compV2TournamentRow">
                <div>
                  <div className="compV2RowLabels">
                    <span className="compV2KindTag">
                      {event.event_kind.toUpperCase()}
                    </span>
                    {event.is_test && <span className="compV2TestBadge">TEST</span>}
                    <span className={`compStatus compStatus--${event.status}`}>
                      {event.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <strong>{event.name}</strong>
                  <small>
                    SOLO · {event.round_count} ROUNDS · {event.max_entries} PLAYERS
                  </small>
                </div>
                <div className="compV2ButtonRow">
                  <Link
                    className="compV2SoftButton"
                    href={`/competitive/admin/tournaments/${event.id}`}
                  >
                    CONTROL →
                  </Link>
                  <Link
                    className="compV2SoftButton"
                    href={`/competitive/admin/tournaments/${event.id}/players`}
                  >
                    PLAYERS
                  </Link>
                  <Link
                    className="compV2SoftButton"
                    href={`/competitive/admin/rehearsal?tournament=${event.id}`}
                  >
                    PREVIEW / OBS
                  </Link>
                  {event.event_kind === "final" && (
                    <Link
                      className="compV2SoftButton"
                      href={`/competitive/admin/tournaments/${event.id}/qualification`}
                    >
                      QUALIFICATION
                    </Link>
                  )}
                  {event.is_test && (
                    <Link
                      className="compV2SoftButton"
                      href={`/competitive/admin/test-players?tournament=${event.id}`}
                    >
                      TEST TOOLS
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function TournamentListPage() {
  return (
    <CompetitiveAdminGuard>
      {() => <UnifiedTournamentRegistry />}
    </CompetitiveAdminGuard>
  );
}
