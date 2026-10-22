"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

import CompetitiveAdminGuard from "../../../../../../components/competitive/CompetitiveAdminGuard";
import {
  applyBulkEntryAction,
  applyTournamentPenalty,
  getTournamentEditableRounds,
  type EditableRound,
  createTournamentProtest,
  getTournamentOperationData,
  resolveTournamentProtest,
  type TournamentAuditRow,
  type TournamentOperationEntry,
  type TournamentProtest,
} from "../../../../../../services/competitive-unified.service";

function Operations({ tournamentId }: { tournamentId: string }) {
  const [entries, setEntries] = useState<TournamentOperationEntry[]>([]);
  const [rounds, setRounds] = useState<EditableRound[]>([]);
  const [penaltyRound, setPenaltyRound] = useState("");
  const [penaltyEntry, setPenaltyEntry] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [penaltyReason, setPenaltyReason] = useState("");
  const [protests, setProtests] = useState<TournamentProtest[]>([]);
  const [audit, setAudit] = useState<TournamentAuditRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState<"registered" | "checked_in" | "withdrawn">(
    "checked_in",
  );
  const [reason, setReason] = useState("");
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    const [result, roundList] = await Promise.all([
      getTournamentOperationData(tournamentId),
      getTournamentEditableRounds(tournamentId),
    ]);
    setRounds(roundList);
    setEntries(result.entries);
    setProtests(result.protests);
    setAudit(result.audit);
  }, [tournamentId]);

  useEffect(() => {
    refresh()
      .catch((reason) => setError(reason?.message ?? "Could not load operations."))
      .finally(() => setLoading(false));
  }, [refresh]);

  async function run(task: () => Promise<string>) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await task();
      setNotice(result);
      await refresh();
    } catch (reason: any) {
      setError(reason?.message ?? "Operation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function bulkUpdate() {
    if (!selected.length) return;
    if (!window.confirm(`${selected.length} player entries to ${action.toUpperCase()}?`)) {
      return;
    }

    await run(async () => {
      const changed = await applyBulkEntryAction(tournamentId, selected, action);
      setSelected([]);
      return `${changed} Spielerstatus wurden aktualisiert.`;
    });
  }

  async function openProtest() {
    await run(async () => {
      await createTournamentProtest(tournamentId, reason);
      setReason("");
      return "A new correction request has been recorded.";
    });
  }

  async function updateProtest(id: string, status: "reviewing" | "resolved" | "rejected") {
    await run(async () => {
      await resolveTournamentProtest(id, status, resolution);
      setResolution("");
      return `Protest updated: ${status}.`;
    });
  }

  return (
    <section className="competitivePage compV2Page">
      <Link className="compBack" href={`/competitive/admin/tournaments/${tournamentId}`}>
        ← TOURNAMENT CONTROL
      </Link>
      <div className="compV2TitleBar">
        <div>
          <span className="competitiveEyebrow">COMPETITIVE // OPERATIONS MANAGER 2.0</span>
          <h1>Tournament Operations.</h1>
          <p>Teilnehmer in Gruppen bearbeiten, Proteste dokumentieren und alle Aktionen prüfen.</p>
        </div>
        <Link className="compV2SoftButton" href={`/competitive/admin/tournaments/${tournamentId}/players`}>
          PLAYER LIST →
        </Link>
      </div>

      {error && <div className="compError">{error}</div>}
      {notice && <div className="compV2Success">{notice}</div>}

      <div className="competitiveGrid">
        <article className="competitivePanel">
          <div className="competitivePanelHeader">
            <h2>Bulk Player Operations</h2>
            <span>{selected.length} SELECTED</span>
          </div>
          <div className="compV2ButtonRow">
            <button
              type="button"
              className="compV2SoftButton"
              disabled={busy || loading}
              onClick={() => setSelected(entries.map((entry) => entry.id))}
            >
              SELECT ALL
            </button>
            <button
              type="button"
              className="compV2SoftButton"
              onClick={() => setSelected([])}
            >
              CLEAR
            </button>
            <select
              className="compV2Search"
              value={action}
              onChange={(event) => setAction(
                event.target.value as "registered" | "checked_in" | "withdrawn",
              )}
            >
              <option value="checked_in">Mark Checked In</option>
              <option value="registered">Mark Registered</option>
              <option value="withdrawn">Withdraw Selected</option>
            </select>
            <button
              type="button"
              className="compPrimaryButton"
              disabled={busy || selected.length === 0}
              onClick={() => void bulkUpdate()}
            >
              APPLY TO {selected.length} PLAYERS
            </button>
          </div>

          <div className="compV2Rows compV2OperationsRows">
            {entries.map((entry) => (
              <label key={entry.id} className="compV2DataRow compV2Selectable">
                <input
                  type="checkbox"
                  checked={selected.includes(entry.id)}
                  onChange={(event) => setSelected((current) =>
                    event.target.checked
                      ? [...current, entry.id]
                      : current.filter((id) => id !== entry.id),
                  )}
                />
                <span>
                  <strong>{entry.display_name}</strong>
                  <small>{entry.status.toUpperCase()}</small>
                </span>
              </label>
            ))}
          </div>
        </article>

        <aside className="competitivePanel">
          <div className="competitivePanelHeader">
            <h2>Protest Center</h2>
            <span>RESULT REVIEWS</span>
          </div>
          <p className="compV2Muted">
            Erfasst Entscheidungen nachvollziehbar. Eine Korrektur an einem
            veröffentlichten Ergebnis erfolgt separat über Race Control.
          </p>

          <label className="compV2Field">
            <span>New protest / correction reason</span>
            <textarea
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="What result needs to be reviewed?"
            />
          </label>
          <button
            type="button"
            className="compV2SoftButton"
            disabled={busy || reason.trim().length < 5}
            onClick={() => void openProtest()}
          >
            + OPEN REVIEW CASE
          </button>

          <div className="compV2Rows compV2ProtestRows">
            {protests.map((protest) => (
              <div key={protest.id} className="compV2Action">
                <span className="compV2KindTag">{protest.status.toUpperCase()}</span>
                <strong>{protest.reason}</strong>
                {protest.resolution && <small>{protest.resolution}</small>}
                {["open", "reviewing"].includes(protest.status) && (
                  <>
                    <label className="compV2Field">
                      <span>Resolution note</span>
                      <input
                        value={resolution}
                        onChange={(event) => setResolution(event.target.value)}
                        placeholder="Write a reason…"
                      />
                    </label>
                    <div className="compV2ButtonRow">
                      {protest.status === "open" && (
                        <button
                          type="button"
                          className="compV2SoftButton"
                          disabled={busy}
                          onClick={() => void updateProtest(protest.id, "reviewing")}
                        >
                          IN REVIEW
                        </button>
                      )}
                      <button
                        type="button"
                        className="compV2SoftButton"
                        disabled={busy || resolution.trim().length < 5}
                        onClick={() => void updateProtest(protest.id, "resolved")}
                      >
                        RESOLVE
                      </button>
                      <button
                        type="button"
                        className="compV2SoftButton"
                        disabled={busy || resolution.trim().length < 5}
                        onClick={() => void updateProtest(protest.id, "rejected")}
                      >
                        REJECT
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>

      <article className="competitivePanel compV2Section">
        <div className="competitivePanelHeader">
          <h2>Penalty Desk</h2>
          <span>MANUAL DECISIONS</span>
        </div>
        <p className="compV2Muted">
          Strafpunkte nur für aktive oder zur Prüfung geöffnete Runden.
          Zuerst muss das Rundenergebnis in Race Control gespeichert sein.
          Bereits veröffentlichte Runden können hier nicht verändert werden.
        </p>
        <div className="compV2FieldGrid">
          <label className="compV2Field">
            <span>Editable round</span>
            <select value={penaltyRound} onChange={(event) => setPenaltyRound(event.target.value)}>
              <option value="">Choose round…</option>
              {rounds.filter((item) => ["active", "review"].includes(item.status)).map((item) => (
                <option value={item.id} key={item.id}>Round {item.round_number}</option>
              ))}
            </select>
          </label>
          <label className="compV2Field">
            <span>Player entry</span>
            <select value={penaltyEntry} onChange={(event) => setPenaltyEntry(event.target.value)}>
              <option value="">Choose player…</option>
              {entries.map((item) => (
                <option value={item.id} key={item.id}>{item.display_name}</option>
              ))}
            </select>
          </label>
          <label className="compV2Field">
            <span>Points to deduct</span>
            <input
              type="number"
              min={0}
              max={1000}
              value={penaltyAmount}
              onChange={(event) => setPenaltyAmount(Number(event.target.value))}
            />
          </label>
          <label className="compV2Field">
            <span>Reason</span>
            <input
              value={penaltyReason}
              onChange={(event) => setPenaltyReason(event.target.value)}
              placeholder="Reason for penalty…"
            />
          </label>
        </div>
        <button
          type="button"
          className="compPrimaryButton"
          disabled={busy || !penaltyRound || !penaltyEntry || penaltyReason.trim().length < 5}
          onClick={() => {
            if (!window.confirm(`Deduct ${penaltyAmount} points?`)) return;
            void run(async () => {
              await applyTournamentPenalty(
                penaltyRound,
                penaltyEntry,
                penaltyAmount,
                penaltyReason,
              );
              setPenaltyReason("");
              return "Penalty applied to the draft round result.";
            });
          }}
        >
          APPLY PENALTY →
        </button>
      </article>

      <article className="competitivePanel compV2Section">
        <div className="competitivePanelHeader">
          <h2>Event Audit</h2>
          <span>LAST 50 ACTIONS</span>
        </div>
        <div className="compV2Rows">
          {audit.map((entry) => (
            <div key={entry.id} className="compV2DataRow">
              <div>
                <strong>{entry.action.replaceAll("_", " ")}</strong>
                <small>{entry.entity_type}</small>
              </div>
              <small>{new Date(entry.created_at).toLocaleString("de-DE")}</small>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default function TournamentOperationsPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <CompetitiveAdminGuard>
      {() => <Operations tournamentId={id} />}
    </CompetitiveAdminGuard>
  );
}
