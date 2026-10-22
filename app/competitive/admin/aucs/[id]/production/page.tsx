"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import CompetitiveAdminGuard from "../../../../../../components/competitive/CompetitiveAdminGuard";

import {
  getAdminAUCSSeasons,
  type AUCSAdminSeason,
} from "../../../../../../services/competitive-aucs.service";

import {
  getGrandFinalPool,
  type GrandFinalCandidate,
} from "../../../../../../services/competitive-grand-final.service";

import {
  getGrandFinalBroadcastSnapshot,
  type GrandFinalBroadcastSnapshot,
} from "../../../../../../services/competitive-broadcast.service";

import {
  DEFAULT_PRODUCTION_STATE,
  formatProductionTimestamp,
  getProductionHistory,
  getProductionUrl,
  getPublicProductionState,
  PRODUCTION_SCENES,
  saveProductionCue,
  type ProductionChanges,
  type ProductionCue,
  type ProductionScene,
  type ProductionState,
} from "../../../../../../services/competitive-production.service";

const POLLING_INTERVAL = 6000;

function ProductionStudio() {
  const { id } = useParams<{ id: string }>();

  const [season, setSeason] = useState<AUCSAdminSeason | null>(null);
  const [players, setPlayers] = useState<GrandFinalCandidate[]>([]);
  const [snapshot, setSnapshot] = useState<GrandFinalBroadcastSnapshot | null>(null);
  const [production, setProduction] = useState<ProductionState>(
    DEFAULT_PRODUCTION_STATE,
  );
  const [history, setHistory] = useState<ProductionCue[]>([]);

  const [featuredId, setFeaturedId] = useState("");
  const [headline, setHeadline] = useState("AUROS CHAMPIONSHIP");
  const [subtitle, setSubtitle] = useState("OFFICIAL GRAND FINAL");
  const [autoReveal, setAutoReveal] = useState(true);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const finalistList = useMemo(
    () => players.filter((player) => player.registered),
    [players],
  );

  const overlayUrl = season
    ? getProductionUrl(season.slug, "director")
    : null;

  const fetchLiveState = useCallback(async (seasonSlug: string) => {
    const [currentState, currentSnapshot] = await Promise.all([
      getPublicProductionState(seasonSlug),
      getGrandFinalBroadcastSnapshot(seasonSlug),
    ]);

    if (currentState) {
      setProduction(currentState);
    }

    setSnapshot(currentSnapshot);
  }, []);

  const initialize = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const seasons = await getAdminAUCSSeasons();
      const selectedSeason = seasons.find((item) => item.id === id) ?? null;

      if (!selectedSeason) {
        throw new Error("AUCS season not found or access denied.");
      }

      setSeason(selectedSeason);

      const [finalistPool, cues] = await Promise.all([
        getGrandFinalPool(id),
        getProductionHistory(id),
      ]);

      setPlayers(finalistPool);
      setHistory(cues);

      const [state, currentSnapshot] = await Promise.all([
        getPublicProductionState(selectedSeason.slug),
        getGrandFinalBroadcastSnapshot(selectedSeason.slug),
      ]);

      const initial = state ?? DEFAULT_PRODUCTION_STATE;
      setProduction(initial);
      setSnapshot(currentSnapshot);
      setFeaturedId(initial.featuredCompetitiveId ?? "");
      setHeadline(initial.headline);
      setSubtitle(initial.subtitle);
      setAutoReveal(initial.autoReveal);
    } catch (issue) {
      setError(
        issue instanceof Error ? issue.message : "Unable to load Production Studio.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!season?.slug) {
      return;
    }

    const interval = window.setInterval(() => {
      void fetchLiveState(season.slug).catch(() => {
        // Keep the last known snapshot through transient network failures.
      });
    }, POLLING_INTERVAL);

    return () => window.clearInterval(interval);
  }, [season?.slug, fetchLiveState]);

  async function cue(changes: ProductionChanges, message: string) {
    if (!season) {
      return;
    }

    setWorking(true);
    setError("");
    setNotice("");

    try {
      await saveProductionCue(season.id, changes);

      const [state, latestHistory] = await Promise.all([
        getPublicProductionState(season.slug),
        getProductionHistory(season.id),
      ]);

      if (state) {
        setProduction(state);
      } else {
        // Draft/private finals are intentionally invisible to the public RPC.
        // The director still receives local confirmation of their saved cue.
        setProduction((current) => ({
          ...current,
          ...changes,
          revision: current.revision + 1,
          sceneChangedAt: new Date().toISOString(),
        }));
      }

      setHistory(latestHistory);
      setNotice(message);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Production cue failed.");
    } finally {
      setWorking(false);
    }
  }

  function changeScene(scene: ProductionScene) {
    if (scene === "spotlight" && !featuredId) {
      setError("Select a registered finalist before using Player Spotlight.");
      return;
    }

    void cue(
      {
        scene,
        ...(scene === "spotlight" ? { featuredCompetitiveId: featuredId } : {}),
      },
      `${scene.toUpperCase()} is now on the Director output.`,
    );
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${url}`);
      setNotice("OBS URL copied to clipboard.");
    } catch {
      setError("Clipboard permission denied. Open the link and copy its URL.");
    }
  }

  if (loading) {
    return (
      <section className="competitivePage">
        <div className="competitivePanel compProductionLoading">
          Connecting to AUCS Production Studio…
        </div>
      </section>
    );
  }

  return (
    <section className="competitivePage compProductionPage">
      <header className="compCreatorTop">
        <div>
          <Link className="compBack" href={`/competitive/admin/aucs/${id}/grand-final`}>
            ← GRAND FINAL CONTROL
          </Link>
          <span className="competitiveEyebrow gold">
            AUCS // PRODUCTION OPERATIONS
          </span>
          <h1>PRODUCTION STUDIO.</h1>
          <p>
            Direct your entire Grand Final broadcast. Every cue is sent to the
            connected OBS Director Source.
          </p>
        </div>

        <div className="compReadiness">
          <span>DIRECTOR OUTPUT</span>
          <strong>{production.scene.toUpperCase()}</strong>
          <div>
            <i style={{ width: "100%" }} />
          </div>
        </div>
      </header>

      {error && <div className="compError compProductionAlert">{error}</div>}
      {notice && <div className="compSuccess compProductionAlert">{notice}</div>}

      <div className="compProductionOverview">
        <div className="competitiveMetric">
          <span>SEASON</span>
          <strong>{season?.name ?? "—"}</strong>
        </div>
        <div className="competitiveMetric">
          <span>FINALISTS</span>
          <strong>{finalistList.length}</strong>
        </div>
        <div className="competitiveMetric">
          <span>ROUND</span>
          <strong>{snapshot?.latestPublishedRound ?? "—"} / {snapshot?.totalRounds ?? "—"}</strong>
        </div>
        <div className="competitiveMetric">
          <span>PRODUCTION REVISION</span>
          <strong>#{production.revision}</strong>
        </div>
      </div>

      <div className="compProductionGrid">
        <main className="compProductionMain">
          <section className="competitivePanel compProductionSection">
            <div className="competitivePanelHeader">
              <div>
                <span className="competitiveEyebrow gold">01 // SCENE SWITCHER</span>
                <h2>Broadcast scenes</h2>
              </div>
              <span>REMOTE CONTROL</span>
            </div>

            <div className="compProductionSceneGrid">
              {PRODUCTION_SCENES.map((scene, index) => (
                <button
                  type="button"
                  key={scene.id}
                  className={`compProductionScene ${
                    production.scene === scene.id ? "is-active" : ""
                  }`}
                  disabled={working}
                  onClick={() => changeScene(scene.id)}
                >
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <strong>{scene.title}</strong>
                  <span>{scene.description}</span>
                  <b>{production.scene === scene.id ? "ON AIR" : "TAKE SCENE →"}</b>
                </button>
              ))}
            </div>
          </section>

          <section className="competitivePanel compProductionSection">
            <div className="competitivePanelHeader">
              <div>
                <span className="competitiveEyebrow gold">02 // PLAYER SPOTLIGHT</span>
                <h2>Focus a finalist</h2>
              </div>
            </div>

            <div className="compProductionInline">
              <label className="compField">
                <span>REGISTERED FINALIST</span>
                <select
                  value={featuredId}
                  onChange={(event) => setFeaturedId(event.target.value)}
                >
                  <option value="">Select a player</option>
                  {finalistList.map((player) => (
                    <option key={player.competitiveId} value={player.competitiveId}>
                      {player.displayName} · {player.competitiveId}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="compPrimaryButton"
                type="button"
                disabled={working || !featuredId}
                onClick={() => void cue(
                  { scene: "spotlight", featuredCompetitiveId: featuredId },
                  "Player Spotlight taken to air.",
                )}
              >
                TAKE SPOTLIGHT
              </button>
            </div>
          </section>

          <section className="competitivePanel compProductionSection">
            <div className="competitivePanelHeader">
              <div>
                <span className="competitiveEyebrow gold">03 // BROADCAST GRAPHICS</span>
                <h2>Headline & lower third</h2>
              </div>
            </div>

            <div className="compProductionCopyGrid">
              <label className="compField">
                <span>PRIMARY HEADLINE</span>
                <input
                  maxLength={90}
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                />
              </label>

              <label className="compField">
                <span>SECONDARY LINE</span>
                <input
                  maxLength={140}
                  value={subtitle}
                  onChange={(event) => setSubtitle(event.target.value)}
                />
              </label>
            </div>

            <div className="compProductionToolbar">
              <button
                className="compMiniAction gold"
                type="button"
                disabled={working}
                onClick={() => void cue(
                  { headline, subtitle },
                  "Broadcast titles updated.",
                )}
              >
                APPLY TITLES
              </button>

              <label className="compProductionCheckbox">
                <input
                  type="checkbox"
                  checked={autoReveal}
                  onChange={(event) => setAutoReveal(event.target.checked)}
                />
                AUTO-REVEAL AFTER ROUND PUBLICATION
              </label>

              <button
                className="compMiniAction"
                type="button"
                disabled={working}
                onClick={() => void cue(
                  { autoReveal },
                  "Auto-reveal setting saved.",
                )}
              >
                SAVE AUTO-REVEAL
              </button>
            </div>
          </section>

          <section className="competitivePanel compProductionSection">
            <div className="competitivePanelHeader">
              <div>
                <span className="competitiveEyebrow gold">04 // OBS OUTPUTS</span>
                <h2>Browser Source links</h2>
              </div>
            </div>

            <div className="compProductionLinks">
              {(["director", ...PRODUCTION_SCENES.map((scene) => scene.id)] as const).map(
                (view) => {
                  if (!season) return null;

                  const url = getProductionUrl(season.slug, view);

                  return (
                    <div className="compProductionLink" key={view}>
                      <div>
                        <strong>{view.toUpperCase()}</strong>
                        <small>{url}</small>
                      </div>
                      <button
                        className="compMiniAction"
                        type="button"
                        onClick={() => void copyUrl(url)}
                      >
                        COPY
                      </button>
                      <a
                        className="compMiniAction gold"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        OPEN ↗
                      </a>
                    </div>
                  );
                },
              )}
            </div>
          </section>
        </main>

        <aside className="compProductionSide">
          <section className="competitivePanel compProductionSection">
            <span className="competitiveEyebrow gold">PROGRAM MONITOR</span>
            <h2>OBS Director Preview</h2>
            <p>Matches the remotely controlled Director Browser Source.</p>

            {overlayUrl ? (
              <div className="compProductionMonitor">
                <iframe
                  src={overlayUrl}
                  title="AUCS Director preview"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="compEmptyRule">No Grand Final configured.</div>
            )}

            {!snapshot && (
              <p className="compMutedNote">
                Public monitor preview becomes available when the Season
                and Final have been published.
              </p>
            )}
          </section>

          <section className="competitivePanel compProductionSection">
            <span className="competitiveEyebrow gold">PRODUCTION HISTORY</span>
            <h2>Recent cues</h2>

            {history.length === 0 ? (
              <div className="compEmptyRule">No scenes have been taken yet.</div>
            ) : (
              <div className="compProductionHistory">
                {history.map((cueItem) => (
                  <div key={cueItem.id}>
                    <strong>{cueItem.scene.toUpperCase()}</strong>
                    <small>{cueItem.action.replaceAll("_", " ")}</small>
                    <span>{formatProductionTimestamp(cueItem.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}

export default function AUCSProductionStudioPage() {
  return (
    <CompetitiveAdminGuard>
      {(access) => (
        access.isSiteAdmin || access.role === "competitive_admin" ? (
          <ProductionStudio />
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
