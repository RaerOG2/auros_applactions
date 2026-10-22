"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";

import CompetitiveAdminGuard from "../../../../../../components/competitive/CompetitiveAdminGuard";
import {
  getFinalCandidates,
  getUnifiedTournaments,
  getFinalSources,
  importFinalists,
  type FinalCandidate,
  type FinalSourceRecord,
} from "../../../../../../services/competitive-unified.service";

function getIdentity(candidate: FinalCandidate): string {
  return candidate.player_id
    ? `real:${candidate.player_id}`
    : `test:${candidate.test_player_id}`;
}

function QualificationControl({ tournamentId }: { tournamentId: string }) {
  const [name, setName] = useState("");
  const [isTest, setIsTest] = useState(false);
  const [sources, setSources] = useState<FinalSourceRecord[]>([]);
  const [candidates, setCandidates] = useState<FinalCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [events, sourceRows, candidateRows] = await Promise.all([
      getUnifiedTournaments(),
      getFinalSources(tournamentId),
      getFinalCandidates(tournamentId),
    ]);

    const tournament = events.find((event) => event.id === tournamentId);
    setName(tournament?.name ?? "Unknown tournament");
    setIsTest(Boolean(tournament?.is_test));
    setSources(sourceRows);
    setCandidates(candidateRows);
  }, [tournamentId]);

  useEffect(() => {
    load()
      .catch((reason) => setError(reason?.message ?? "Could not load qualification."))
      .finally(() => setLoading(false));
  }, [load]);

  const distinctCandidates = useMemo(() => {
    const ordered = [...candidates].sort((a, b) => {
      return (
        a.finishing_position - b.finishing_position ||
        b.total_points - a.total_points ||
        a.source_entry_id.localeCompare(b.source_entry_id)
      );
    });

    const used = new Set<string>();

    return ordered.filter((candidate) => {
      const identity = getIdentity(candidate);
      if (used.has(identity)) {
        return false;
      }

      used.add(identity);
      return true;
    });
  }, [candidates]);

  const sourcesWaiting = sources.filter((source) => !source.ready);

  async function handleImport() {
    if (
      !window.confirm(
        "Finalteilnehmer übernehmen? Die Qualifier-Ergebnisse werden danach für dieses Finale gesperrt.",
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const imported = await importFinalists(tournamentId);
      setMessage(
        imported === 0
          ? "Die Teilnehmer wurden bereits übernommen. Keine Duplikate erstellt."
          : `${imported} Spieler wurden in das Grand Final übernommen.`,
      );
      await load();
    } catch (reason: any) {
      setError(reason?.message ?? "Could not import finalists.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="competitivePage compV2Page">
      <Link className="compBack" href={`/competitive/admin/tournaments/${tournamentId}`}>
        ← BACK TO TOURNAMENT
      </Link>

      <div className="compV2TitleBar">
        <div>
          <span className="competitiveEyebrow">TOURNAMENT CONTROL // QUALIFICATION</span>
          <h1>Grand Final Lineup.</h1>
          <p>{name || "Loading tournament…"}</p>
        </div>
        <Link
          className="compV2SoftButton"
          href={`/competitive/admin/tournaments/${tournamentId}/players`}
        >
          VIEW REGISTERED PLAYERS →
        </Link>
      </div>

      {loading ? (
        <div className="competitivePanel">Loading qualifier results…</div>
      ) : (
        <>
          <div className="compV2Stats">
            <div className="competitiveMetric">
              <span>QUALIFIER EVENTS</span>
              <strong>{sources.length}</strong>
            </div>
            <div className="competitiveMetric">
              <span>QUALIFIED ENTRIES</span>
              <strong>{candidates.length}</strong>
            </div>
            <div className="competitiveMetric">
              <span>UNIQUE FINALISTS</span>
              <strong>{distinctCandidates.length}</strong>
            </div>
            <div className="competitiveMetric">
              <span>WAITING</span>
              <strong>{sourcesWaiting.length}</strong>
            </div>
          </div>

          {isTest && (
            <div className="compV2Info">
              TEST GRAND FINAL — importierte Testspieler bleiben privat.
              Es werden keine offiziellen AP oder Karrierewerte vergeben.
            </div>
          )}

          <div className="competitiveGrid">
            <article className="competitivePanel">
              <div className="competitivePanelHeader">
                <h2>Qualification sources</h2>
                <span>{sources.length} RULES</span>
              </div>

              <div className="compV2Rows">
                {sources.map((source) => (
                  <div className="compV2DataRow" key={source.source_tournament_id}>
                    <div>
                      <strong>{source.source_name}</strong>
                      <small>
                        TOP {source.qualify_top} qualify · {source.source_status} ·
                        {source.published_round_count}/{source.source_round_count} rounds published
                      </small>
                    </div>
                    <Link href={`/competitive/admin/tournaments/${source.source_tournament_id}`}>
                      OPEN →
                    </Link>
                  </div>
                ))}
              </div>
            </article>

            <aside className="competitivePanel">
              <div className="competitivePanelHeader">
                <h2>Finalist Import</h2>
                <span>OFFICIAL CONTROL</span>
              </div>
              <p className="compV2Muted">
                Jede Quellrunde muss veröffentlicht und das Quellturnier
                abgeschlossen sein. Doppelte Qualifikationen werden erkannt.
              </p>
              {sourcesWaiting.length > 0 && (
                <div className="compV2Info">
                  {sourcesWaiting.length} Qualifier sind noch nicht abgeschlossen.
                </div>
              )}

              {error && <div className="compError">{error}</div>}
              {message && <div className="compV2Success">{message}</div>}

              <button
                type="button"
                className="compPrimaryButton compV2Create"
                disabled={busy || sources.length === 0 || distinctCandidates.length === 0}
                onClick={handleImport}
              >
                {busy ? "IMPORTING…" : "IMPORT QUALIFIED PLAYERS →"}
              </button>

              <p className="compV2Muted">
                Import ist einmalig. Danach zum Check-in und Race Control wechseln.
              </p>
            </aside>
          </div>

          <article className="competitivePanel compV2Section">
            <div className="competitivePanelHeader">
              <h2>Qualified Players</h2>
              <span>FINISHING POSITIONS FROM PUBLISHED RESULTS</span>
            </div>

            {distinctCandidates.length === 0 ? (
              <div className="competitiveEmpty">
                Sobald die Qualifier abgeschlossen sind, erscheinen hier
                die echten Qualifikanten und ihre Platzierungen.
              </div>
            ) : (
              <div className="compV2Rows">
                {distinctCandidates.map((candidate, index) => (
                  <div className="compV2DataRow" key={getIdentity(candidate)}>
                    <div>
                      <strong>
                        {String(index + 1).padStart(2, "0")} · {candidate.display_name}
                      </strong>
                      <small>
                        {candidate.source_name} · #{candidate.finishing_position} ·
                        {Number(candidate.total_points).toLocaleString("de-DE")} PTS
                      </small>
                    </div>
                    {candidate.test_player_id && (
                      <span className="compV2TestBadge">TEST</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </article>
        </>
      )}
    </section>
  );
}

export default function TournamentQualificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <CompetitiveAdminGuard>
      {() => <QualificationControl tournamentId={id} />}
    </CompetitiveAdminGuard>
  );
}
