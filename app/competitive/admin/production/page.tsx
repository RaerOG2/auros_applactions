"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import CompetitiveAdminGuard from "../../../../components/competitive/CompetitiveAdminGuard";

import {
  getAdminAUCSSeasons,
  type AUCSAdminSeason,
} from "../../../../services/competitive-aucs.service";

import {
  getGrandFinalInfo,
  type GrandFinalInfo,
} from "../../../../services/competitive-grand-final.service";

import {
  getProductionUrl,
} from "../../../../services/competitive-production.service";

type ProductionSeason = {
  season: AUCSAdminSeason;
  grandFinal: GrandFinalInfo | null;
};

function ProductionHub() {
  const [seasons, setSeasons] = useState<ProductionSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const allSeasons = await getAdminAUCSSeasons();

        const productionSeasons = await Promise.all(
          allSeasons.map(async (season) => ({
            season,
            grandFinal: await getGrandFinalInfo(season.slug),
          })),
        );

        if (!cancelled) {
          setSeasons(productionSeasons);
        }
      } catch (issue) {
        if (!cancelled) {
          setError(
            issue instanceof Error
              ? issue.message
              : "Production workspace could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const ready = seasons.filter(
    (item) => item.grandFinal?.tournamentSlug,
  ).length;

  return (
    <section className="competitivePage">
      <div className="competitiveOpsHeader">
        <div>
          <Link className="compBack" href="/competitive/admin">
            ← COMPETITIVE RACE CONTROL
          </Link>

          <span className="competitiveEyebrow gold">
            AUCS // BROADCAST NETWORK
          </span>

          <h1>PRODUCTION NETWORK.</h1>

          <p className="compHeaderDescription">
            One central place for every AUCS Grand Final production,
            OBS output and live broadcast director.
          </p>
        </div>

        <div className="compReadiness">
          <span>FINALS CONFIGURED</span>
          <strong>{loading ? "—" : `${ready} / ${seasons.length}`}</strong>
          <div>
            <i style={{ width: loading || !seasons.length ? "0%" : `${ready / seasons.length * 100}%` }} />
          </div>
        </div>
      </div>

      {error && <div className="compError compProductionAlert">{error}</div>}

      {loading ? (
        <div className="competitivePanel compProductionLoading">
          Connecting to the AUCS Production Network…
        </div>
      ) : seasons.length === 0 ? (
        <div className="competitivePanel compProductionSection">
          <div className="competitiveEmpty">
            <div>
              <strong>No AUCS Seasons yet.</strong>
              Create a Championship Season before setting up a broadcast.
              <div className="compEmptyActions">
                <Link href="/competitive/admin/aucs" className="compPrimaryButton">
                  CREATE AUCS SEASON →
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="compProductionNetworkGrid">
          {seasons.map(({ season, grandFinal }) => (
            <article className="competitivePanel compProductionNetworkCard" key={season.id}>
              <span className="competitiveEyebrow gold">
                AUCS // {season.status.toUpperCase()}
              </span>

              <h2>{season.name}</h2>

              <p>
                {grandFinal?.tournamentName ?? "Grand Final not configured"}
              </p>

              <div className="compProductionNetworkStats">
                <span>
                  <small>LINEUP</small>
                  <strong>{grandFinal?.lineupLocked ? "LOCKED" : "PREPARING"}</strong>
                </span>
                <span>
                  <small>FINALISTS</small>
                  <strong>{grandFinal?.importedPlayers ?? 0}</strong>
                </span>
                <span>
                  <small>FINAL STATUS</small>
                  <strong>{grandFinal?.tournamentStatus?.toUpperCase() ?? "—"}</strong>
                </span>
              </div>

              <div className="compProductionNetworkActions">
                <Link
                  href={`/competitive/admin/aucs/${season.id}/grand-final`}
                  className="compSecondaryButton"
                >
                  GRAND FINAL CONTROL
                </Link>

                {grandFinal?.tournamentSlug && (
                  <>
                    <Link
                      href={`/competitive/admin/aucs/${season.id}/production`}
                      className="compPrimaryButton"
                    >
                      OPEN STUDIO →
                    </Link>
                    <a
                      href={getProductionUrl(season.slug, "director")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="compSecondaryButton"
                    >
                      OBS DIRECTOR ↗
                    </a>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ProductionNetworkPage() {
  return (
    <CompetitiveAdminGuard>
      {(access) => (
        access.isSiteAdmin || access.role === "competitive_admin" ? (
          <ProductionHub />
        ) : (
          <div className="competitiveGate">
            <h1>Production access restricted</h1>
            <p>Competitive Admin access is required.</p>
          </div>
        )
      )}
    </CompetitiveAdminGuard>
  );
}
