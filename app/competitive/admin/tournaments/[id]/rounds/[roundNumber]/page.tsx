"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import CompetitiveAdminGuard from "../../../../../../../components/competitive/CompetitiveAdminGuard";

import {
  getRoundOperations,
  getTournamentStandings,
  publishRound,
  reopenRound,
  saveRoundResultsBulk,
  scoreResult,
  validateRound,
  type RoundEntry,
  type RoundResultStatus,
  type RoundRules,
  type RoundValidation,
  type TournamentStanding,
} from "../../../../../../../services/competitive-rounds.service";

type SaveState =
  | "idle"
  | "dirty"
  | "saving"
  | "saved"
  | "error";

function RaceControl() {
  const {
    id,
    roundNumber,
  } = useParams<{
    id: string;
    roundNumber: string;
  }>();

  const router =
    useRouter();

  const currentRoundNumber =
    Number(
      roundNumber,
    );

  const [
    tournament,
    setTournament,
  ] = useState<any>(
    null,
  );

  const [
    round,
    setRound,
  ] = useState<any>(
    null,
  );

  const [
    rules,
    setRules,
  ] = useState<RoundRules>({
    eliminationPoints: 0,
    milestones: [],
    modifiers: [],
  });

  const [
    rows,
    setRows,
  ] = useState<
    RoundEntry[]
  >([]);

  const [
    standings,
    setStandings,
  ] = useState<
    TournamentStanding[]
  >([]);

  const [
    validation,
    setValidation,
  ] = useState<
    RoundValidation | null
  >(
    null,
  );

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    saveState,
    setSaveState,
  ] = useState<SaveState>(
    "idle",
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    standingsOpen,
    setStandingsOpen,
  ] = useState(true);

  const dirtyEntries =
    useRef<
      Set<string>
    >(
      new Set(),
    );

  const autoSaveTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(
      null,
    );

  const rowsRef =
    useRef<
      RoundEntry[]
    >([]);

  useEffect(
    () => {
      rowsRef.current =
        rows;
    },
    [
      rows,
    ],
  );

  async function loadPage() {
    setLoading(true);
    setError("");

    try {
      const [
        operations,
        currentStandings,
      ] =
        await Promise.all([
          getRoundOperations(
            id,
            currentRoundNumber,
          ),

          getTournamentStandings(
            id,
          ),
        ]);

      setTournament(
        operations.tournament,
      );

      setRound(
        operations.round,
      );

      setRules(
        operations.rules,
      );

      setRows(
        operations.rows,
      );

      setStandings(
        currentStandings,
      );

      dirtyEntries.current.clear();

      setSaveState(
        "idle",
      );
    } catch (
      loadError: any
    ) {
      setError(
        loadError?.message ??
          "Race Control could not be loaded.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(
    () => {
      loadPage();
    },
    [
      id,
      currentRoundNumber,
    ],
  );

  useEffect(
    () => {
      return () => {
        if (
          autoSaveTimer.current
        ) {
          clearTimeout(
            autoSaveTimer.current,
          );
        }
      };
    },
    [],
  );

  function getPreview(
    row: RoundEntry,
  ) {
    return scoreResult(
      row.placement,
      row.eliminations,
      row.special,
      row.penalty,
      rules,
    );
  }

  function patchRow(
    entryId: string,
    patch: Partial<RoundEntry>,
  ) {
    setRows(
      (currentRows) =>
        currentRows.map(
          (row) => {
            if (
              row.entryId !==
              entryId
            ) {
              return row;
            }

            const nextRow = {
              ...row,
              ...patch,
              saved: false,
            };

            const preview =
              getPreview(
                nextRow,
              );

            return {
              ...nextRow,

              placementPoints:
                preview.placementPoints,

              eliminationPoints:
                preview.eliminationPoints,

              bonusPoints:
                preview.bonusPoints,

              total:
                preview.total,
            };
          },
        ),
    );

    dirtyEntries.current.add(
      entryId,
    );

    setValidation(
      null,
    );

    setSaveState(
      "dirty",
    );

    scheduleAutoSave();
  }

  function scheduleAutoSave() {
    if (
      autoSaveTimer.current
    ) {
      clearTimeout(
        autoSaveTimer.current,
      );
    }

    autoSaveTimer.current =
      setTimeout(
        () => {
          flushAutoSave();
        },
        900,
      );
  }

  async function flushAutoSave() {
    if (
      !round ||
      round.status ===
        "published" ||
      round.status ===
        "locked"
    ) {
      return;
    }

    const ids =
      Array.from(
        dirtyEntries.current,
      );

    if (
      ids.length === 0
    ) {
      return;
    }

    const changedRows =
      rowsRef.current.filter(
        (row) =>
          ids.includes(
            row.entryId,
          ),
      );

    if (
      changedRows.length ===
      0
    ) {
      return;
    }

    setSaveState(
      "saving",
    );

    try {
      await saveRoundResultsBulk(
        round.id,
        changedRows,
        rules,
      );

      ids.forEach(
        (entryId) => {
          dirtyEntries.current.delete(
            entryId,
          );
        },
      );

      setRows(
        (currentRows) =>
          currentRows.map(
            (row) =>
              ids.includes(
                row.entryId,
              )
                ? {
                    ...row,
                    saved: true,
                  }
                : row,
          ),
      );

      setSaveState(
        "saved",
      );

      window.setTimeout(
        () => {
          setSaveState(
            (current) =>
              current ===
              "saved"
                ? "idle"
                : current,
          );
        },
        1600,
      );
    } catch (
      saveError: any
    ) {
      setSaveState(
        "error",
      );

      setError(
        saveError?.message ??
          "Auto-save failed.",
      );
    }
  }

  async function saveAllNow() {
    if (
      autoSaveTimer.current
    ) {
      clearTimeout(
        autoSaveTimer.current,
      );
    }

    await flushAutoSave();
  }

  async function runValidation() {
    setBusy(true);
    setError("");

    try {
      await saveAllNow();

      const result =
        await validateRound(
          round.id,
        );

      setValidation(
        result,
      );
    } catch (
      validationError: any
    ) {
      setError(
        validationError?.message ??
          "Round validation failed.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  async function handlePublish() {
    if (
      !validation?.valid
    ) {
      return;
    }

    const isFinal =
      currentRoundNumber ===
      tournament?.round_count;

    const accepted =
      window.confirm(
        isFinal
          ? "Publish the FINAL RESULTS? This completes the tournament."
          : `Publish Round ${currentRoundNumber}? The standings will update and the next round will unlock.`,
      );

    if (
      !accepted
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await saveAllNow();

      const result =
        await publishRound(
          round.id,
        );

      if (
        result.final
      ) {
        await loadPage();
        return;
      }

      router.push(
        `/competitive/admin/tournaments/${id}/rounds/${currentRoundNumber + 1}`,
      );
    } catch (
      publishError: any
    ) {
      setError(
        publishError?.message ??
          "Round could not be published.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  async function handleReopen() {
    const accepted =
      window.confirm(
        `Reopen Round ${currentRoundNumber}?`,
      );

    if (
      !accepted
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await reopenRound(
        round.id,
      );

      await loadPage();
    } catch (
      reopenError: any
    ) {
      setError(
        reopenError?.message ??
          "Round could not be reopened.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  function markAllDNS() {
    if (
      round?.status ===
        "published" ||
      round?.status ===
        "locked"
    ) {
      return;
    }

    const unsolvedRows =
      rows.filter(
        (row) =>
          row.placement ===
            null &&
          row.status ===
            "normal",
      );

    if (
      unsolvedRows.length ===
      0
    ) {
      return;
    }

    setRows(
      (currentRows) =>
        currentRows.map(
          (row) => {
            if (
              row.placement !==
                null ||
              row.status !==
                "normal"
            ) {
              return row;
            }

            dirtyEntries.current.add(
              row.entryId,
            );

            return {
              ...row,
              status:
                "dns",
              saved:
                false,
            };
          },
        ),
    );

    setValidation(
      null,
    );

    setSaveState(
      "dirty",
    );

    scheduleAutoSave();
  }

  const filteredRows =
    useMemo(
      () => {
        const normalized =
          query
            .trim()
            .toLowerCase();

        if (
          !normalized
        ) {
          return rows;
        }

        return rows.filter(
          (row) =>
            row.displayName
              .toLowerCase()
              .includes(
                normalized,
              ),
        );
      },
      [
        rows,
        query,
      ],
    );

  const enteredCount =
    useMemo(
      () =>
        rows.filter(
          (row) =>
            row.saved &&
            (
              row.placement !==
                null ||
              row.status !==
                "normal"
            ),
        ).length,
      [
        rows,
      ],
    );

  const missingCount =
    rows.length -
    enteredCount;

  const roundLocked =
    round?.status ===
      "locked";

  const roundPublished =
    round?.status ===
      "published";

  const canEdit =
    !roundLocked &&
    !roundPublished;

  if (
    loading
  ) {
    return (
      <section className="competitivePage">
        <div className="competitivePanel competitiveEmpty">
          Loading Race Control…
        </div>
      </section>
    );
  }

  return (
    <section className="competitivePage">
      <div className="competitiveOpsHeader">
        <div>
          <Link
            className="compBack"
            href={`/competitive/admin/tournaments/${id}`}
          >
            ← TOURNAMENT CONTROL
          </Link>

          <span className="competitiveEyebrow gold">
            RACE CONTROL // ROUND OPERATIONS
          </span>

          <h1>
            {tournament?.name ??
              "Tournament"}
          </h1>

          <p>
            ROUND{" "}
            {currentRoundNumber} /{" "}
            {tournament?.round_count ??
              "—"}{" "}
            ·{" "}
            {String(
              round?.status ??
                "loading",
            ).toUpperCase()}
          </p>

          {tournament?.series_id && (
            <div className="compProductionToolbar" style={{ marginTop: 18 }}>
              <Link
                href={`/competitive/admin/aucs/${tournament.series_id}/production`}
                className="compSecondaryButton"
              >
                ◉ OPEN BROADCAST STUDIO →
              </Link>

              <Link
                href="/competitive/admin/production"
                className="compSecondaryButton"
              >
                PRODUCTION NETWORK →
              </Link>
            </div>
          )}
        </div>

        <div className="compOpsCounter">
          <span>
            RESULTS ENTERED
          </span>

          <strong>
            {enteredCount} /{" "}
            {rows.length}
          </strong>

          <div>
            <i
              style={{
                width: `${
                  rows.length
                    ? (
                        enteredCount /
                        rows.length
                      ) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="compRoundStatusGrid">
        <div className="competitiveMetric">
          <span>
            ROUND
          </span>

          <strong>
            {String(
              currentRoundNumber,
            ).padStart(
              2,
              "0",
            )}
          </strong>
        </div>

        <div className="competitiveMetric">
          <span>
            ENTERED
          </span>

          <strong>
            {enteredCount}
          </strong>
        </div>

        <div className="competitiveMetric">
          <span>
            MISSING
          </span>

          <strong>
            {missingCount}
          </strong>
        </div>

        <div className="competitiveMetric">
          <span>
            AUTO-SAVE
          </span>

          <strong className={`compSaveState compSaveState--${saveState}`}>
            {saveState ===
              "saving"
              ? "SAVING"
              : saveState ===
                  "dirty"
                ? "PENDING"
                : saveState ===
                    "error"
                  ? "ERROR"
                  : "READY"}
          </strong>
        </div>
      </div>

      <div className="compRoundCommandBar">
        <input
          value={query}
          onChange={
            (event) =>
              setQuery(
                event.target.value,
              )
          }
          placeholder="Search player…"
        />

        <button
          type="button"
          className="compMiniAction"
          disabled={
            !canEdit ||
            busy
          }
          onClick={
            markAllDNS
          }
        >
          MARK MISSING AS DNS
        </button>

        <button
          type="button"
          className="compMiniAction gold"
          disabled={
            roundLocked ||
            busy
          }
          onClick={
            runValidation
          }
        >
          VALIDATE ROUND
        </button>

        {roundPublished ? (
          <button
            type="button"
            className="compPrimaryButton"
            disabled={
              busy
            }
            onClick={
              handleReopen
            }
          >
            REOPEN ROUND
          </button>
        ) : (
          <button
            type="button"
            className="compPrimaryButton"
            disabled={
              busy ||
              !validation?.valid
            }
            onClick={
              handlePublish
            }
          >
            {currentRoundNumber ===
            tournament?.round_count
              ? "PUBLISH FINAL RESULTS"
              : `PUBLISH ROUND ${currentRoundNumber}`}
          </button>
        )}
      </div>

      {error && (
        <div className="compError compRaceError">
          {error}
        </div>
      )}

      {validation && (
        <div
          className={`compValidation ${
            validation.valid
              ? "compValidation--valid"
              : "compValidation--invalid"
          }`}
        >
          <div>
            <span>
              ROUND CHECK
            </span>

            <strong>
              {validation.valid
                ? "READY TO PUBLISH"
                : "ACTION REQUIRED"}
            </strong>
          </div>

          <div>
            <span>
              RESULTS
            </span>

            <strong>
              {validation.resultsEntered} /{" "}
              {validation.activePlayers}
            </strong>
          </div>

          <div>
            <span>
              MISSING
            </span>

            <strong>
              {validation.missingResults}
            </strong>
          </div>

          <div>
            <span>
              DUPLICATES
            </span>

            <strong>
              {validation.duplicatePlacements}
            </strong>
          </div>
        </div>
      )}

      <div className="compRaceLayout">
        <main className="competitivePanel compResultsPanel">
          <div className="competitivePanelHeader">
            <div>
              <span className="competitiveEyebrow">
                BULK RESULT ENTRY
              </span>

              <h2>
                Round{" "}
                {currentRoundNumber}
              </h2>
            </div>

            <span>
              {filteredRows.length} PLAYERS
            </span>
          </div>

          <div className="compResultsScroller">
            <div
              className="compResultsHead"
              style={{
                "--modifier-count":
                  rules.modifiers.length,
              } as React.CSSProperties}
            >
              <span>
                PLAYER
              </span>

              <span>
                PLACE
              </span>

              <span>
                ELIMS
              </span>

              {rules.modifiers.map(
                (modifier) => (
                  <span
                    key={
                      modifier.key
                    }
                  >
                    {modifier.label ??
                      modifier.key}
                  </span>
                ),
              )}

              <span>
                STATUS
              </span>

              <span>
                PENALTY
              </span>

              <span>
                PTS
              </span>

              <span>
                SAVE
              </span>
            </div>

            {filteredRows.map(
              (row) => {
                const preview =
                  getPreview(
                    row,
                  );

                return (
                  <div
                    className="compResultRow"
                    key={
                      row.entryId
                    }
                    style={{
                      "--modifier-count":
                        rules.modifiers.length,
                    } as React.CSSProperties}
                  >
                    <div className="compResultPlayer">
                      <strong>
                        {row.displayName}
                      </strong>

                      <small>
                        {row.saved
                          ? "SAVED"
                          : dirtyEntries.current.has(
                                row.entryId,
                              )
                            ? "PENDING"
                            : "NOT ENTERED"}
                      </small>
                    </div>

                    <input
                      type="number"
                      min="1"
                      value={
                        row.placement ??
                        ""
                      }
                      disabled={
                        !canEdit ||
                        row.status !==
                          "normal"
                      }
                      onChange={
                        (event) =>
                          patchRow(
                            row.entryId,
                            {
                              placement:
                                event
                                  .target
                                  .value
                                  ? Number(
                                      event
                                        .target
                                        .value,
                                    )
                                  : null,
                            },
                          )
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      value={
                        row.eliminations
                      }
                      disabled={
                        !canEdit
                      }
                      onChange={
                        (event) =>
                          patchRow(
                            row.entryId,
                            {
                              eliminations:
                                Number(
                                  event
                                    .target
                                    .value,
                                ),
                            },
                          )
                      }
                    />

                    {rules.modifiers.map(
                      (modifier) => (
                        <input
                          key={
                            modifier.key
                          }
                          type="number"
                          min="0"
                          title={
                            modifier.label ??
                            modifier.key
                          }
                          value={
                            row.special[
                              modifier
                                .key
                            ] ??
                            0
                          }
                          disabled={
                            !canEdit
                          }
                          onChange={
                            (event) =>
                              patchRow(
                                row.entryId,
                                {
                                  special: {
                                    ...row.special,

                                    [modifier.key]:
                                      Number(
                                        event
                                          .target
                                          .value,
                                      ),
                                  },
                                },
                              )
                          }
                        />
                      ),
                    )}

                    <select
                      value={
                        row.status
                      }
                      disabled={
                        !canEdit
                      }
                      onChange={
                        (event) =>
                          patchRow(
                            row.entryId,
                            {
                              status:
                                event
                                  .target
                                  .value as RoundResultStatus,
                            },
                          )
                      }
                    >
                      <option value="normal">
                        NORMAL
                      </option>

                      <option value="dns">
                        DNS
                      </option>

                      <option value="dnf">
                        DNF
                      </option>

                      <option value="dq">
                        DQ
                      </option>
                    </select>

                    <input
                      type="number"
                      min="0"
                      value={
                        row.penalty
                      }
                      disabled={
                        !canEdit
                      }
                      onChange={
                        (event) =>
                          patchRow(
                            row.entryId,
                            {
                              penalty:
                                Number(
                                  event
                                    .target
                                    .value,
                                ),
                            },
                          )
                      }
                    />

                    <strong className="compResultPoints">
                      {preview.total} PTS
                    </strong>

                    <span
                      className={`compRowSaveIndicator ${
                        row.saved
                          ? "is-saved"
                          : dirtyEntries.current.has(
                                row.entryId,
                              )
                            ? "is-pending"
                            : ""
                      }`}
                    >
                      {row.saved
                        ? "✓"
                        : dirtyEntries.current.has(
                              row.entryId,
                            )
                          ? "•••"
                          : "—"}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </main>

        <aside className="competitivePanel compLiveStandings">
          <div className="competitivePanelHeader">
            <div>
              <span className="competitiveEyebrow gold">
                OFFICIAL STANDINGS
              </span>

              <h2>
                After Published Rounds
              </h2>
            </div>

            <button
              type="button"
              className="compStandingsToggle"
              onClick={
                () =>
                  setStandingsOpen(
                    (current) =>
                      !current,
                  )
              }
            >
              {standingsOpen
                ? "HIDE"
                : "SHOW"}
            </button>
          </div>

          {standingsOpen && (
            <div className="compStandingsList">
              {standings.length ===
              0 ? (
                <div className="competitiveEmpty">
                  No published round yet.
                </div>
              ) : (
                standings
                  .slice(
                    0,
                    20,
                  )
                  .map(
                    (standing) => (
                      <div
                        className="compStandingRow"
                        key={
                          standing.entryId
                        }
                      >
                        <span className="compStandingRank">
                          #
                          {standing.rank}
                        </span>

                        <div>
                          <strong>
                            {standing.displayName}
                          </strong>

                          <small>
                            {
                              standing.eliminations
                            }{" "}
                            ELIMS ·{" "}
                            {
                              standing.roundsPlayed
                            }{" "}
                            ROUNDS
                          </small>
                        </div>

                        <strong className="compStandingPoints">
                          {
                            standing.totalPoints
                          }
                        </strong>
                      </div>
                    ),
                  )
              )}
            </div>
          )}

          <div className="compStandingsNotice">
            <span>
              OFFICIAL DATA
            </span>

            Standings only include
            published rounds. The
            current round does not
            affect the leaderboard
            until you publish it.
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function RoundOperationsPage() {
  return (
    <CompetitiveAdminGuard>
      {() => (
        <RaceControl />
      )}
    </CompetitiveAdminGuard>
  );
}
