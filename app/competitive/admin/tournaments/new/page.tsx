"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import CompetitiveAdminGuard from "../../../../../components/competitive/CompetitiveAdminGuard";
import { getScoringRulesets } from "../../../../../services/competitive.service";
import {
  createUnifiedTournament,
  getUnifiedTournaments,
  type FinalSourceInput,
  type UnifiedTournament,
  type UnifiedTournamentKind,
} from "../../../../../services/competitive-unified.service";
import type { CompetitiveScoringRuleset } from "../../../../../types/competitive";

const eventTypes: {
  id: UnifiedTournamentKind;
  label: string;
  description: string;
}[] = [
  {
    id: "standard",
    label: "Normal Tournament",
    description: "Ein eigenständiges Turnier ohne Qualifikationspflicht.",
  },
  {
    id: "qualifier",
    label: "Qualifier",
    description: "Spieler können sich für ein späteres Finale qualifizieren.",
  },
  {
    id: "final",
    label: "Grand Final",
    description: "Teilnehmer kommen aus ausgewählten Quellturnieren.",
  },
  {
    id: "championship",
    label: "Championship",
    description: "Ein größeres Turnier mit Meisterschaftscharakter.",
  },
];

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toIso(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

function Creator() {
  const router = useRouter();

  const [kind, setKind] = useState<UnifiedTournamentKind>("standard");
  const [testMode, setTestMode] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [roundCount, setRoundCount] = useState(6);
  const [maxEntries, setMaxEntries] = useState(100);
  const [startsAt, setStartsAt] = useState("");
  const [registrationType, setRegistrationType] = useState("open");
  const [registrationOpensAt, setRegistrationOpensAt] = useState("");
  const [registrationClosesAt, setRegistrationClosesAt] = useState("");
  const [checkInOpensAt, setCheckInOpensAt] = useState("");
  const [checkInClosesAt, setCheckInClosesAt] = useState("");
  const [rulesetId, setRulesetId] = useState("");
  const [publicEvent, setPublicEvent] = useState(false);
  const [publicLeaderboard, setPublicLeaderboard] = useState(true);
  const [playerStats, setPlayerStats] = useState(true);
  const [reviewsEnabled, setReviewsEnabled] = useState(true);
  const [broadcastEnabled, setBroadcastEnabled] = useState(false);
  const [apEnabled, setApEnabled] = useState(false);
  const [apProfile, setApProfile] = useState("standard");
  const [qualificationTop, setQualificationTop] = useState(25);

  const [sources, setSources] = useState<FinalSourceInput[]>([]);
  const [existingEvents, setExistingEvents] = useState<UnifiedTournament[]>([]);
  const [rulesets, setRulesets] = useState<CompetitiveScoringRuleset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getUnifiedTournaments(), getScoringRulesets()])
      .then(([events, scoring]) => {
        setExistingEvents(events);
        setRulesets(scoring);
      })
      .catch((reason) => {
        setError(reason?.message ?? "Could not load tournament settings.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(makeSlug(name));
    }
  }, [name, slugEdited]);

  const availableSources = useMemo(() => {
    return existingEvents.filter((event) => {
      return event.is_test === testMode && event.event_kind !== "final";
    });
  }, [existingEvents, testMode]);

  const maximumPotentialFinalists = sources.reduce(
    (sum, source) => sum + source.top,
    0,
  );

  function toggleSource(tournamentId: string, enabled: boolean) {
    setSources((current) => {
      if (!enabled) {
        return current.filter((item) => item.tournamentId !== tournamentId);
      }

      const selected = availableSources.find((item) => item.id === tournamentId);
      if (!selected || current.some((item) => item.tournamentId === tournamentId)) {
        return current;
      }

      return [
        ...current,
        { tournamentId, top: Math.min(10, selected.max_entries) },
      ];
    });
  }

  function setSourceTop(tournamentId: string, top: number) {
    setSources((current) =>
      current.map((item) => {
        if (item.tournamentId !== tournamentId) {
          return item;
        }

        return { ...item, top };
      }),
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 3 || !slug.trim()) {
      setError("Bitte einen Namen und einen gültigen Slug angeben.");
      return;
    }

    if (kind === "final" && sources.length === 0) {
      setError("Für ein Finale mindestens ein Quellturnier auswählen.");
      return;
    }

    if (sources.some((item) => !Number.isInteger(item.top) || item.top < 1)) {
      setError("Jede Qualifikationsregel benötigt eine gültige Top-X-Zahl.");
      return;
    }

    setSaving(true);

    try {
      const eventId = await createUnifiedTournament(
        {
          kind,
          test: testMode,
          name,
          slug,
          description,
          maxEntries,
          roundCount,
          startsAt: toIso(startsAt),
          registrationOpensAt: toIso(registrationOpensAt),
          registrationClosesAt: toIso(registrationClosesAt),
          checkInOpensAt: toIso(checkInOpensAt),
          checkInClosesAt: toIso(checkInClosesAt),
          registrationType: kind === "final" ? "invite_only" : registrationType,
          scoringRulesetId: rulesetId || null,
          seriesId: null,
          isPublic: !testMode && publicEvent,
          publicLeaderboard: !testMode && publicLeaderboard,
          apEnabled: !testMode && apEnabled,
          apRewardProfile: !testMode && apEnabled ? apProfile : null,
          qualificationEnabled: kind === "qualifier",
          qualificationTop: kind === "qualifier" ? qualificationTop : null,
          playerStatsEnabled: !testMode && playerStats,
          reviewsEnabled,
          broadcastEnabled,
        },
        kind === "final" ? sources : [],
      );

      if (testMode) {
        router.push(`/competitive/admin/test-players?tournament=${eventId}`);
      } else if (kind === "final") {
        router.push(`/competitive/admin/tournaments/${eventId}/qualification`);
      } else {
        router.push(`/competitive/admin/tournaments/${eventId}`);
      }
    } catch (reason: any) {
      setError(reason?.message ?? "Tournament could not be created.");
      setSaving(false);
    }
  }

  return (
    <section className="competitivePage compV2Page">
      <div className="compV2TitleBar">
        <div>
          <Link href="/competitive/admin/tournaments" className="compBack">
            ← ALL TOURNAMENTS
          </Link>
          <span className="competitiveEyebrow">AUROS // CREATOR 2.0</span>
          <h1>One creator. Every competition.</h1>
          <p>
            Normales Turnier, Qualifier, Grand Final oder Championship –
            alles wird hier erstellt und später im selben Control Center verwaltet.
          </p>
        </div>
        <Link href="/competitive/admin/test-players" className="compV2SoftButton">
          TEST LAB →
        </Link>
      </div>

      <form className="compV2Creator" onSubmit={submit}>
        <main className="compV2Main">
          <section className="competitivePanel compV2Section">
            <div className="competitivePanelHeader">
              <h2>01 / What are we creating?</h2>
              <span>EVENT TYPE</span>
            </div>

            <div className="compV2KindGrid">
              {eventTypes.map((type) => (
                <button
                  type="button"
                  key={type.id}
                  className={`compV2Kind ${kind === type.id ? "is-active" : ""}`}
                  onClick={() => setKind(type.id)}
                >
                  <strong>{type.label}</strong>
                  <small>{type.description}</small>
                </button>
              ))}
            </div>

            <label className="compV2TestToggle">
              <input
                type="checkbox"
                checked={testMode}
                onChange={(event) => {
                  setTestMode(event.target.checked);
                  setSources([]);
                }}
              />
              <span>
                <strong>TEST TOURNAMENT</strong>
                <small>
                  Privat, ohne offizielle AP oder Spielerstatistiken.
                  Testspieler und Demo-Runden können hinzugefügt werden.
                </small>
              </span>
            </label>
          </section>

          <section className="competitivePanel compV2Section">
            <div className="competitivePanelHeader">
              <h2>02 / The basics</h2>
              <span>TOURNAMENT DETAILS</span>
            </div>

            <div className="compV2FieldGrid">
              <label className="compV2Field compV2Wide">
                <span>Tournament name *</span>
                <input
                  value={name}
                  maxLength={120}
                  placeholder="AUCS Open #01"
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>

              <label className="compV2Field">
                <span>URL slug *</span>
                <input
                  value={slug}
                  placeholder="aucs-open-01"
                  onChange={(event) => {
                    setSlugEdited(true);
                    setSlug(makeSlug(event.target.value));
                  }}
                  required
                />
              </label>

              <label className="compV2Field">
                <span>Start date and time</span>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
              </label>

              <label className="compV2Field">
                <span>Max players</span>
                <input
                  type="number"
                  min={2}
                  max={1000}
                  value={maxEntries}
                  onChange={(event) => setMaxEntries(Number(event.target.value))}
                  required
                />
              </label>

              <label className="compV2Field">
                <span>Rounds</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={roundCount}
                  onChange={(event) => setRoundCount(Number(event.target.value))}
                  required
                />
              </label>

              <label className="compV2Field compV2Wide">
                <span>Scoring ruleset</span>
                <select value={rulesetId} onChange={(event) => setRulesetId(event.target.value)}>
                  <option value="">No scoring ruleset yet</option>
                  {rulesets.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.name} · {rule.version}
                    </option>
                  ))}
                </select>
              </label>

              <label className="compV2Field compV2Full">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={description}
                  placeholder="What's this tournament about?"
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
            </div>
          </section>

          {kind === "final" && (
            <section className="competitivePanel compV2Section">
              <div className="competitivePanelHeader">
                <h2>03 / Where do finalists come from?</h2>
                <span>QUALIFICATION RULES</span>
              </div>
              <p className="compV2Muted">
                Wähle die Quellturniere und lege für jedes fest, welche Platzierungen
                sich qualifizieren. Pro Spieler gibt es nur einen Finalplatz.
              </p>

              {loading ? (
                <p className="compV2Muted">Loading tournaments…</p>
              ) : availableSources.length === 0 ? (
                <div className="compV2Info">
                  Keine passenden {testMode ? "Test-" : "regulären "}Turniere vorhanden.
                  Erstelle zuerst ein Qualifier-Turnier.
                </div>
              ) : (
                <div className="compV2Sources">
                  {availableSources.map((source) => {
                    const configured = sources.find(
                      (item) => item.tournamentId === source.id,
                    );

                    return (
                      <div key={source.id} className="compV2SourceRow">
                        <label>
                          <input
                            type="checkbox"
                            checked={Boolean(configured)}
                            onChange={(event) =>
                              toggleSource(source.id, event.target.checked)
                            }
                          />
                          <span>
                            <strong>{source.name}</strong>
                            <small>
                              {source.status.replaceAll("_", " ")} ·
                              {source.max_entries} players
                            </small>
                          </span>
                        </label>
                        {configured && (
                          <div className="compV2SourceTop">
                            <span>TOP</span>
                            <input
                              type="number"
                              min={1}
                              max={source.max_entries}
                              value={configured.top}
                              onChange={(event) =>
                                setSourceTop(source.id, Number(event.target.value))
                              }
                            />
                            <span>qualify</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="compV2Muted">
                {sources.length} source event(s), up to {maximumPotentialFinalists} tickets.
                Finalists are imported only after all source tournaments finish.
              </p>
              {maximumPotentialFinalists > maxEntries && (
                <div className="compV2Info">
                  Die möglichen Startplätze übersteigen deine Kapazität.
                  Doppelt qualifizierte Spieler zählen nur einmal;
                  falls dennoch zu viele übrig bleiben, wird der Import gestoppt.
                </div>
              )}
            </section>
          )}

          {kind === "qualifier" && (
            <section className="competitivePanel compV2Section">
              <div className="competitivePanelHeader">
                <h2>03 / Qualification</h2>
                <span>QUALIFIER SETTINGS</span>
              </div>
              <p className="compV2Muted">
                Markiere dieses Event als Qualifier. Welche Top-Platzierung für
                ein bestimmtes Finale zählt, stellst du später direkt im Finale ein.
              </p>
              <label className="compV2Field compV2SmallField">
                <span>Suggested Top X</span>
                <input
                  type="number"
                  min={1}
                  max={maxEntries}
                  value={qualificationTop}
                  onChange={(event) => setQualificationTop(Number(event.target.value))}
                />
              </label>
            </section>
          )}

          <details className="competitivePanel compV2Section compV2Advanced">
            <summary>Advanced options & more settings</summary>
            <div className="compV2FieldGrid compV2AdvancedBody">
              <label className="compV2Field">
                <span>Registration type</span>
                <select
                  disabled={testMode || kind === "final"}
                  value={kind === "final" ? "invite_only" : testMode ? "private" : registrationType}
                  onChange={(event) => setRegistrationType(event.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="invite_only">Invite only</option>
                  <option value="qualification_required">Qualification required</option>
                  <option value="private">Private</option>
                </select>
              </label>
              <label className="compV2Field">
                <span>Registration opens</span>
                <input
                  type="datetime-local"
                  value={registrationOpensAt}
                  onChange={(event) => setRegistrationOpensAt(event.target.value)}
                />
              </label>
              <label className="compV2Field">
                <span>Registration closes</span>
                <input
                  type="datetime-local"
                  value={registrationClosesAt}
                  onChange={(event) => setRegistrationClosesAt(event.target.value)}
                />
              </label>
              <label className="compV2Field">
                <span>Check-in opens</span>
                <input
                  type="datetime-local"
                  value={checkInOpensAt}
                  onChange={(event) => setCheckInOpensAt(event.target.value)}
                />
              </label>
              <label className="compV2Field">
                <span>Check-in closes</span>
                <input
                  type="datetime-local"
                  value={checkInClosesAt}
                  onChange={(event) => setCheckInClosesAt(event.target.value)}
                />
              </label>
              <div className="compV2CheckGrid">
                <label>
                  <input
                    type="checkbox"
                    checked={!testMode && publicEvent}
                    disabled={testMode}
                    onChange={(event) => setPublicEvent(event.target.checked)}
                  />
                  Public event page
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!testMode && publicLeaderboard}
                    disabled={testMode}
                    onChange={(event) => setPublicLeaderboard(event.target.checked)}
                  />
                  Public leaderboard
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!testMode && playerStats}
                    disabled={testMode}
                    onChange={(event) => setPlayerStats(event.target.checked)}
                  />
                  Career statistics
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={reviewsEnabled}
                    onChange={(event) => setReviewsEnabled(event.target.checked)}
                  />
                  Result reviews
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={broadcastEnabled}
                    onChange={(event) => setBroadcastEnabled(event.target.checked)}
                  />
                  Broadcast mode
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!testMode && apEnabled}
                    disabled={testMode}
                    onChange={(event) => setApEnabled(event.target.checked)}
                  />
                  Award Auros Points (AP)
                </label>
              </div>
              {apEnabled && !testMode && (
                <label className="compV2Field">
                  <span>AP reward profile</span>
                  <select value={apProfile} onChange={(event) => setApProfile(event.target.value)}>
                    <option value="community">Community</option>
                    <option value="standard">Standard</option>
                    <option value="qualifier">Qualifier</option>
                    <option value="major">Major</option>
                  </select>
                </label>
              )}
            </div>
          </details>
        </main>

        <aside className="compV2Sidebar">
          <div className="competitivePanel compV2Preview">
            <span className="competitiveEyebrow">LIVE SETUP PREVIEW</span>
            <h2>{name.trim() || "Untitled Tournament"}</h2>
            <p>{eventTypes.find((type) => type.id === kind)?.label}</p>

            {testMode && <span className="compV2TestBadge">TEST MODE</span>}

            <dl>
              <div><dt>FORMAT</dt><dd>SOLO</dd></div>
              <div><dt>ROUNDS</dt><dd>{roundCount}</dd></div>
              <div><dt>PLAYERS</dt><dd>{maxEntries}</dd></div>
              <div><dt>STATUS</dt><dd>DRAFT</dd></div>
              {kind === "final" && (
                <div><dt>QUALIFIERS</dt><dd>{sources.length}</dd></div>
              )}
            </dl>

            {error && <div className="compError">{error}</div>}

            <button
              className="compPrimaryButton compV2Create"
              type="submit"
              disabled={saving || loading}
            >
              {saving ? "CREATING…" : "CREATE TOURNAMENT →"}
            </button>
            <small>
              Creates a draft. No public event, player or official score is created automatically.
            </small>
          </div>
        </aside>
      </form>
    </section>
  );
}

export default function NewTournamentPage() {
  return (
    <CompetitiveAdminGuard>
      {() => <Creator />}
    </CompetitiveAdminGuard>
  );
}
