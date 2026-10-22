"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import {
  getCupRehearsalSnapshot,
  type RehearsalSnapshot,
} from "../../../../services/competitive-rehearsal.service";

import "./preview.css";

function PreviewOverlay() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const viewParam = searchParams.get("view");
  const view = viewParam === "top3" || viewParam === "ticker" ? viewParam : "standings";
  const visibleRows = view === "top3" ? 3 : view === "ticker" ? 5 : 12;

  const [snapshot, setSnapshot] = useState<RehearsalSnapshot | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !token) {
      setError("Missing preview access token.");
      return;
    }

    let mounted = true;

    async function refresh() {
      try {
        const data = await getCupRehearsalSnapshot(id, token);
        if (mounted) {
          setSnapshot(data);
          setError("");
        }
      } catch {
        if (mounted) {
          setSnapshot(null);
          setError("Preview not available or expired.");
        }
      }
    }

    refresh();
    const timer = window.setInterval(refresh, 5000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [id, token]);

  return (
    <main className={`comp3ObsPage comp3ObsPage--${view}`}>
      <div className="comp3ObsHeader">
        <div>
          <div className="comp3ObsEyebrow">AUROS COMPETITIVE / {view.toUpperCase()} REHEARSAL</div>
          <h1>{snapshot?.tournamentName ?? "PREVIEW STANDINGS"}</h1>
          <p>{snapshot ? `${snapshot.simulatedRounds} / ${snapshot.roundCount} ROUNDS` : "WAITING FOR PREVIEW"}</p>
        </div>
        <div className="comp3ObsStamp">TEST DATA<br />NOT OFFICIAL</div>
      </div>

      {error ? (
        <div className="comp3ObsEmpty">{error}</div>
      ) : !snapshot ? (
        <div className="comp3ObsEmpty">Connecting to Rehearsal Studio…</div>
      ) : (
        <div className="comp3ObsTable">
          <div className="comp3ObsColumns"><span>RANK</span><span>PLAYER</span><span>ELIMS</span><span>POINTS</span></div>
          {snapshot.standings.slice(0, visibleRows).map((standing) => (
            <div key={standing.rank} className="comp3ObsRow">
              <strong>{String(standing.rank).padStart(2, "0")}</strong>
              <span>{standing.displayName}</span>
              <small>{standing.eliminations}</small>
              <b>{standing.points}</b>
            </div>
          ))}
        </div>
      )}
      <div className="comp3ObsFooter">SIMULATED CUP · NO LIVE UEFN TELEMETRY · NO OFFICIAL POINTS</div>
    </main>
  );
}

export default function BroadcastPreviewPage() {
  return (
    <Suspense fallback={<main className="comp3ObsPage">Connecting…</main>}>
      <PreviewOverlay />
    </Suspense>
  );
}
