"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import CompetitiveStaffEntry from "../../../../../components/competitive/CompetitiveStaffEntry";
import { supabase } from "../../../../../lib/supabase";
import { getTournamentStandings } from "../../../../../services/competitive-rounds.service";
import { getTournamentForRegistration } from "../../../../../services/competitive-registration.service";
import type { TournamentStanding } from "../../../../../services/competitive-rounds.service";

type PublicEvent = {
  id: string;
  slug: string;
  name: string;
  status: string;
  public_leaderboard: boolean;
  is_public: boolean;
};

export default function TournamentStandingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [standings, setStandings] = useState<TournamentStanding[]>([]);
  const [publishedRounds, setPublishedRounds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const current = await getTournamentForRegistration(slug);

        if (!current || !current.is_public || current.status === "draft") {
          throw new Error("This event is not publicly available.");
        }

        if (!current.public_leaderboard) {
          throw new Error("The leaderboard is private for this tournament.");
        }

        const { count, error: roundsError } = await supabase
          .from("competitive_rounds")
          .select("id", { count: "exact", head: true })
          .eq("tournament_id", current.id)
          .eq("status", "published");

        if (roundsError) {
          throw roundsError;
        }

        const results = count && count > 0
          ? await getTournamentStandings(current.id)
          : [];

        if (!alive) {
          return;
        }

        setEvent(current);
        setPublishedRounds(count ?? 0);
        setStandings(results);
      } catch (err: any) {
        if (alive) {
          setError(err?.message || "Could not load standings.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [slug]);

  return (
    <section className="competitivePage">
      <div className="compCreatorTop">
        <div>
          <Link
            href={`/competitive/tournaments/${slug}`}
            className="compBack"
          >
            ← EVENT CENTER
          </Link>
          <span className="competitiveEyebrow gold">OFFICIAL DATA // RESULTS</span>
          <h1>Standings.</h1>
          <p>{event?.name || "Tournament Leaderboard"}</p>
        </div>
        <div className="compHeaderActions">
          <Link href="/competitive/tournaments" className="compSecondaryButton">
            ALL TOURNAMENTS
          </Link>
          <CompetitiveStaffEntry compact />
        </div>
      </div>

      {loading ? (
        <div className="competitivePanel competitiveEmpty">Loading standings…</div>
      ) : error ? (
        <div className="competitivePanel">
          <div className="compError">{error}</div>
        </div>
      ) : (
        <div className="competitivePanel">
          <div className="competitivePanelHeader">
            <h2>{event?.name}</h2>
            <span>{publishedRounds} PUBLISHED ROUNDS</span>
          </div>

          {standings.length === 0 ? (
            <div className="competitiveEmpty">
              <div>
                <strong>No published results yet.</strong>
                Standings update after each round is officially published.
              </div>
            </div>
          ) : (
            <div className="compPublicStandingsTable">
              <div className="compPublicStandingsHeader">
                <span>RANK</span>
                <span>PLAYER</span>
                <span>ROUNDS</span>
                <span>ELIMS</span>
                <span>POINTS</span>
              </div>

              {standings.map((standing) => (
                <div className="compPublicStandingsRow" key={standing.entryId}>
                  <strong>#{standing.rank}</strong>
                  <span>{standing.displayName}</span>
                  <span>{standing.roundsPlayed}</span>
                  <span>{standing.eliminations}</span>
                  <strong>{standing.totalPoints}</strong>
                </div>
              ))}
            </div>
          )}

          <p className="compMutedNote">
            Rankings use points, eliminations and best placement as tiebreakers.
            Unpublished round results are excluded.
          </p>
        </div>
      )}
    </section>
  );
}
