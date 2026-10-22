"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import CompetitivePlayerCard from "../../../components/competitive/CompetitivePlayerCard";
import CompetitiveStaffEntry from "../../../components/competitive/CompetitiveStaffEntry";

import {
  getPublicCompetitivePlayers,
  type PublicCompetitivePlayer,
} from "../../../services/competitive-players.service";

type PlayerFilter = "all" | "competed" | "verified";

const filters: {
  id: PlayerFilter;
  label: string;
}[] = [
  { id: "all", label: "ALL PLAYERS" },
  { id: "competed", label: "COMPETED" },
  { id: "verified", label: "EPIC VERIFIED" },
];

export default function CompetitivePlayersPage() {
  const [players, setPlayers] = useState<PublicCompetitivePlayer[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PlayerFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getPublicCompetitivePlayers(search, 60);

        if (active) {
          setPlayers(result);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load the player directory.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  const filteredPlayers = useMemo(() => {
    if (filter === "competed") {
      return players.filter((player) => player.tournamentsPlayed > 0);
    }

    if (filter === "verified") {
      return players.filter((player) => player.epicVerified);
    }

    return players;
  }, [players, filter]);

  const eventPlayers = players.filter(
    (player) => player.tournamentsPlayed > 0,
  ).length;

  return (
    <section className="competitivePage">
      <div className="competitiveOpsHeader compPlayersHeader">
        <div>
          <Link href="/competitive" className="compBack">
            ← COMPETITIVE OVERVIEW
          </Link>

          <span className="competitiveEyebrow gold">
            PLAYER DIRECTORY // AUROS 1.4.0
          </span>

          <h1>THE PLAYERS.</h1>

          <p className="compHeaderDescription">
            Every career starts with an identity. Find players, open their
            Competitive cards and explore official tournament history.
          </p>
        </div>

        <div className="compHeaderActions">
          <Link href="/competitive/rankings" className="compSecondaryButton">
            GLOBAL RANKINGS →
          </Link>
          <Link href="/competitive/me" className="compPrimaryButton">
            MY PLAYER CARD →
          </Link>
          <CompetitiveStaffEntry compact />
        </div>
      </div>

      <div className="compRoundStatusGrid compPlayerDirectoryMetrics">
        <div className="competitiveMetric">
          <span>PROFILES LOADED</span>
          <strong>{loading ? "—" : players.length}</strong>
        </div>

        <div className="competitiveMetric">
          <span>WITH OFFICIAL RESULTS</span>
          <strong>{loading ? "—" : eventPlayers}</strong>
        </div>

        <div className="competitiveMetric">
          <span>COMPETITION FORMAT</span>
          <strong>SOLO</strong>
        </div>
      </div>

      <div className="competitivePanel compPlayerDirectoryToolbar">
        <div>
          <span className="competitiveEyebrow">SEARCH THE FIELD</span>
          <h2>Player Directory</h2>
          <p className="compHeaderDescription">
            Search by Epic display name or permanent Competitive ID.
          </p>
        </div>

        <input
          type="search"
          aria-label="Search competitive players"
          placeholder="Player name or AC-000001"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="compFilterBar" aria-label="Player filters">
        {filters.map((option) => (
          <button
            key={option.id}
            type="button"
            className={filter === option.id ? "active" : ""}
            aria-pressed={filter === option.id}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && <div className="compError">{error}</div>}

      {loading ? (
        <div className="competitivePanel compPlayerDirectoryEmpty">
          Loading Competitive Players…
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="competitivePanel compPlayerDirectoryEmpty">
          <strong>No matching players yet.</strong>
          <p>
            Player profiles appear here when Auros accounts create a
            Competitive identity.
          </p>
          <Link href="/competitive/me" className="compSecondaryButton">
            CREATE MY PROFILE →
          </Link>
        </div>
      ) : (
        <div className="compPlayerDirectoryGrid">
          {filteredPlayers.map((player, index) => (
            <CompetitivePlayerCard
              key={player.competitiveId}
              player={player}
              featured={index === 0 && player.tournamentsPlayed > 0}
            />
          ))}
        </div>
      )}

      <p className="compPlayerDirectoryFootnote">
        Showing up to 60 matching profiles. Career statistics are calculated
        from published rounds of public events with Player Stats enabled.
      </p>
    </section>
  );
}
