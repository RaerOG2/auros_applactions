"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import CompetitiveAdminGuard from "../../../components/competitive/CompetitiveAdminGuard";
import {
  getUnifiedTournaments,
  type UnifiedTournament,
} from "../../../services/competitive-unified.service";

const quickTools = [
  { href: "/competitive/admin/tournaments/new", icon: "+", title: "Tournament Creator 2.0", description: "Create a cup, qualifier, championship or final." },
  { href: "/competitive/admin/rehearsal", icon: "▶", title: "Rehearsal Studio", description: "Test real cups, scoring and OBS safely." },
  { href: "/competitive/admin/test-players", icon: "⚙", title: "Test Tournament Lab", description: "Run a complete private test tournament." },
  { href: "/competitive/admin/scoring", icon: "≡", title: "Scoring Rules", description: "Build and edit placement / elimination rules." },
  { href: "/competitive/admin/points", icon: "◆", title: "Auros Points", description: "Review and finalize official AP rewards." },
  { href: "/competitive/admin/production", icon: "◫", title: "Production Studio", description: "Manage broadcasts, scenes and overlays." },
];

function AdminDashboard() {
  const [events, setEvents] = useState<UnifiedTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUnifiedTournaments()
      .then(setEvents)
      .catch((reason) => setError(reason?.message ?? "Could not load tournaments."))
      .finally(() => setLoading(false));
  }, []);

  const active = events.filter((event) => event.status === "in_progress");
  const finals = events.filter((event) => event.event_kind === "final");
  const test = events.filter((event) => event.is_test);

  return (
    <section className="competitivePage">
      <div className="comp3PageHeader">
        <div>
          <span className="comp3Overline">MANAGEMENT / OVERVIEW</span>
          <h1>Competitive Control.</h1>
          <p>Ein zentraler Arbeitsplatz für alle Turniere. Du findest deine täglichen Aktionen direkt hier oder links in der Sidebar.</p>
        </div>
        <div className="comp3Actions">
          <Link href="/competitive/admin/tournaments/new" className="comp3Button comp3Button--primary">+ Create Tournament</Link>
          <Link href="/competitive/admin/tournaments" className="comp3Button">All Tournaments</Link>
        </div>
      </div>

      {error && <div className="compError" role="alert">{error}</div>}
      <div className="comp3Cards comp3Cards--four">
        {[
          { label: "ALL TOURNAMENTS", value: events.length },
          { label: "LIVE EVENTS", value: active.length },
          { label: "GRAND FINALS", value: finals.length },
          { label: "TEST TOURNAMENTS", value: test.length },
        ].map((item) => (
          <div className="comp3Surface comp3Stat" key={item.label}>
            <span>{item.label}</span>
            <strong>{loading ? "—" : item.value}</strong>
          </div>
        ))}
      </div>

      <div className="comp3Columns">
        <div className="comp3Surface">
          <div className="comp3SectionHeader">
            <h2>Recent Tournaments</h2>
            <Link href="/competitive/admin/tournaments" className="comp3Button">Manage all →</Link>
          </div>
          {!loading && events.length === 0 && <div className="comp3Empty">No events yet. Start with Tournament Creator 2.0.</div>}
          <div className="comp3List">
            {events.slice(0, 7).map((event) => (
              <div className="comp3ListRow" key={event.id}>
                <div>
                  <span className={`comp3Badge${event.is_test ? " comp3Badge--test" : ""}`}>
                    {event.is_test ? "TEST · " : ""}{event.event_kind.toUpperCase()}
                  </span>
                  <strong>{event.name}</strong>
                  <small>{event.status.replaceAll("_", " ")} · {event.round_count} rounds</small>
                </div>
                <div className="comp3Actions">
                  <Link href={`/competitive/admin/tournaments/${event.id}`}>Control →</Link>
                  <Link href={`/competitive/admin/rehearsal?tournament=${event.id}`}>Test →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="comp3Surface">
          <div className="comp3SectionHeader"><h2>Quick Tools</h2></div>
          <div className="comp3List">
            {quickTools.map((tool) => (
              <Link href={tool.href} className="comp3QuickLink" key={tool.href}>
                <span>{tool.icon}</span>
                <div><strong>{tool.title}</strong><small>{tool.description}</small></div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function CompetitiveAdminPage() {
  return <CompetitiveAdminGuard>{() => <AdminDashboard />}</CompetitiveAdminGuard>;
}
