"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import CompetitiveStaffEntry from "../../../components/competitive/CompetitiveStaffEntry";

import {
  getAPDivision,
  getCompetitiveRankings,
  type CompetitiveRanking,
} from "../../../services/competitive-rankings.service";

export default function CompetitiveRankingsPage() {
  const [players, setPlayers] = useState<CompetitiveRanking[]>([]);
  const [countryCode, setCountryCode] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRankings() {
      setLoading(true);
      setError("");

      try {
        const result = await getCompetitiveRankings(
          countryCode === "ALL" ? null : countryCode,
          200,
        );

        if (active) {
          setPlayers(result);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Official rankings could not be loaded.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRankings();

    return () => {
      active = false;
    };
  }, [countryCode]);

  const filteredPlayers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return players;
    }

    return players.filter((player) => {
      return (
        player.displayName.toLowerCase().includes(value) ||
        player.competitiveId.toLowerCase().includes(value)
      );
    });
  }, [players, search]);

  const leader = players[0] ?? null;

  return (
    <section className="competitivePage">
      <div className="competitiveOpsHeader compRankingHeader">
        <div>
          <Link href="/competitive" className="compBack">
            ← COMPETITIVE OVERVIEW
          </Link>

          <span className="competitiveEyebrow gold">
            AUROS COMPETITIVE // GLOBAL RANKINGS
          </span>

          <h1>THE RANKINGS.</h1>

          <p className="compHeaderDescription">
            One global leaderboard. Your AP determines your position,
            while your tournament points stay inside each event.
          </p>
        </div>

        <div className="compHeaderActions">
          <Link href="/competitive/divisions" className="compSecondaryButton">
            ALL DIVISIONS →
          </Link>

          <Link href="/competitive/players" className="compSecondaryButton">
            ALL PLAYERS →
          </Link>

          <Link href="/competitive/me" className="compPrimaryButton">
            MY PLAYER CARD →
          </Link>

          <CompetitiveStaffEntry compact />
        </div>
      </div>

      <div className="compRankingMetrics">
        <div className="competitiveMetric">
          <span>RANKED PLAYERS SHOWN</span>
          <strong>{loading ? "—" : players.length}</strong>
        </div>

        <div className="competitiveMetric">
          <span>TOP PLAYER</span>
          <strong>{loading ? "—" : leader?.displayName ?? "TBD"}</strong>
        </div>

        <div className="competitiveMetric">
          <span>LEADER'S AP</span>
          <strong>{loading ? "—" : leader?.currentAp ?? "—"}</strong>
        </div>
      </div>

      <div className="competitivePanel compRankingPanel">
        <div className="competitivePanelHeader">
          <div>
            <span className="competitiveEyebrow">GLOBAL LEADERBOARD</span>
            <h2>Official Auros Points</h2>
          </div>

          <span>SOLO COMPETITIVE</span>
        </div>

        <div className="compRankingFilters">
          <label>
            <span>COUNTRY</span>
            <select
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
            >
              <option value="ALL">GLOBAL</option>
              <option value="DE">GERMANY</option>
              <option value="AT">AUSTRIA</option>
              <option value="CH">SWITZERLAND</option>
              <option value="US">UNITED STATES</option>
              <option value="GB">UNITED KINGDOM</option>
              <option value="FR">FRANCE</option>
              <option value="NL">NETHERLANDS</option>
              <option value="PL">POLAND</option>
              <option value="TR">TURKEY</option>
            </select>
          </label>

          <label>
            <span>SEARCH RESULTS</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search player or AC-ID..."
            />
          </label>
        </div>

        {error && <div className="compError">{error}</div>}

        {loading ? (
          <div className="competitiveEmpty">
            <strong>Loading official rankings…</strong>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="competitiveEmpty">
            <div>
              <strong>No ranked players yet.</strong>
              Global rankings appear when an AP-enabled tournament is
              completed and Competitive Admin finalizes its rewards.
              <div className="compEmptyActions">
                <Link href="/competitive/players" className="compSecondaryButton">
                  BROWSE PLAYERS →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="compRankingTableScroll">
            <div className="compRankingTableHeader">
              <span>GLOBAL #</span>
              <span>PLAYER</span>
              <span>DIVISION</span>
              <span>CAREER AP</span>
              <span>CURRENT AP</span>
            </div>

            {filteredPlayers.map((player) => (
              <Link
                key={player.competitiveId}
                href={`/competitive/players/${encodeURIComponent(player.competitiveId)}`}
                className="compRankingRow"
              >
                <span className="compRankingPosition">
                  #{player.globalRank}
                </span>

                <span className="compRankingIdentity">
                  <strong>{player.displayName}</strong>
                  <small>
                    {player.competitiveId}
                    {player.countryCode ? ` · ${player.countryCode}` : ""}
                    {player.epicVerified ? " · VERIFIED" : ""}
                  </small>
                </span>

                <span className="compRankingDivision">
                  {getAPDivision(player.currentAp)}
                </span>

                <span>{player.careerAp.toLocaleString("en-US")}</span>

                <strong className="compRankingPoints">
                  {player.currentAp.toLocaleString("en-US")} AP
                </strong>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="compRankingHelp">
        Global rank remains global when filtering by country. Players without
        earned AP are listed in the Player Directory but are unranked here.
        Division thresholds are provisional for Competitive 1.4.0.
      </p>
    </section>
  );
}
