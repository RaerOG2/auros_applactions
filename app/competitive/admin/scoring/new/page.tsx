"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import CompetitiveAdminGuard from "../../../../../components/competitive/CompetitiveAdminGuard";
import { createScoringRuleset } from "../../../../../services/competitive.service";
import type {
  EliminationModifier,
  PlacementMilestone,
} from "../../../../../types/competitive";

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const DEFAULT_MILESTONES: PlacementMilestone[] = [
  { id: "top-99", top: 99, points: 1, label: "Top 99" },
  { id: "top-75", top: 75, points: 1, label: "Top 75" },
  { id: "top-50", top: 50, points: 1, label: "Top 50" },
  { id: "top-35", top: 35, points: 2, label: "Top 35" },
  { id: "top-25", top: 25, points: 2, label: "Top 25" },
  { id: "top-10", top: 10, points: 4, label: "Top 10" },
  { id: "victory", top: 1, points: 10, label: "Victory Royale" },
];

const EXAMPLE_IMPORT = `AUROS-SCORING-V1

NAME: AUCS Standard
VERSION: v1.0
ELIM: 4
PRESET: true

PLACEMENT:
40=1
35=1
30=1
25=1
24=1
23=1
22=1
21=1
20=2
19=1
18=1
17=1
16=1
15=2
14=1
13=1
12=1
11=1
10=2
9=1
8=1
7=1
6=1
5=2
4=2
3=3
2=4
1=5

BONUS:
shotgun=1|Shotgun elimination
sniper=2|Sniper elimination`;

function calculatePlacement(
  place: number,
  rules: PlacementMilestone[],
) {
  return rules
    .filter((rule) => place <= rule.top)
    .reduce((sum, rule) => sum + Number(rule.points || 0), 0);
}

function cleanLines(value: string) {
  return value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim());
}

type ParsedImport = {
  name?: string;
  version?: string;
  eliminationPoints?: number;
  isPreset?: boolean;
  milestones: PlacementMilestone[];
  modifiers: EliminationModifier[];
};

function parseScoringCode(value: string): ParsedImport {
  const lines = cleanLines(value);

  if (!lines.some((line) => line.toUpperCase() === "AUROS-SCORING-V1")) {
    throw new Error("Missing AUROS-SCORING-V1 header.");
  }

  let section: "" | "placement" | "bonus" = "";

  const result: ParsedImport = {
    milestones: [],
    modifiers: [],
  };

  for (const rawLine of lines) {
    if (!rawLine || rawLine.startsWith("#")) continue;

    const upper = rawLine.toUpperCase();

    if (upper === "AUROS-SCORING-V1") continue;

    if (upper === "PLACEMENT:") {
      section = "placement";
      continue;
    }

    if (upper === "BONUS:") {
      section = "bonus";
      continue;
    }

    if (section === "") {
      const separator = rawLine.indexOf(":");
      if (separator === -1) continue;

      const key = rawLine.slice(0, separator).trim().toUpperCase();
      const rawValue = rawLine.slice(separator + 1).trim();

      if (key === "NAME") result.name = rawValue;
      if (key === "VERSION") result.version = rawValue;

      if (key === "ELIM") {
        const points = Number(rawValue);
        if (!Number.isFinite(points) || points < 0) {
          throw new Error(`Invalid ELIM value: ${rawValue}`);
        }
        result.eliminationPoints = points;
      }

      if (key === "PRESET") {
        result.isPreset = ["TRUE", "YES", "1", "ON"].includes(
          rawValue.toUpperCase(),
        );
      }

      continue;
    }

    if (section === "placement") {
      const match = rawLine.match(/^(\d+)\s*=\s*(-?\d+(?:\.\d+)?)$/);

      if (!match) {
        throw new Error(
          `Invalid placement rule "${rawLine}". Use TOP=POINTS, for example 25=2.`,
        );
      }

      const top = Number(match[1]);
      const points = Number(match[2]);

      if (top < 1) {
        throw new Error(`Placement threshold must be at least 1: ${rawLine}`);
      }

      result.milestones.push({
        id: `import-top-${top}-${result.milestones.length}`,
        top,
        points,
        label: top === 1 ? "Victory Royale" : `Top ${top}`,
      });

      continue;
    }

    if (section === "bonus") {
      const match = rawLine.match(
        /^([a-zA-Z0-9_-]+)\s*=\s*(-?\d+(?:\.\d+)?)\s*\|\s*(.+)$/,
      );

      if (!match) {
        throw new Error(
          `Invalid bonus rule "${rawLine}". Use key=POINTS|Label.`,
        );
      }

      result.modifiers.push({
        id: `import-bonus-${match[1]}-${result.modifiers.length}`,
        key: match[1],
        points: Number(match[2]),
        label: match[3].trim(),
      });
    }
  }

  if (result.milestones.length === 0) {
    throw new Error("The import contains no PLACEMENT rules.");
  }

  const duplicateTops = result.milestones
    .map((rule) => rule.top)
    .filter((top, index, all) => all.indexOf(top) !== index);

  if (duplicateTops.length > 0) {
    throw new Error(
      `Duplicate placement threshold: Top ${duplicateTops[0]}.`,
    );
  }

  const duplicateBonusKeys = result.modifiers
    .map((rule) => rule.key.toLowerCase())
    .filter((key, index, all) => all.indexOf(key) !== index);

  if (duplicateBonusKeys.length > 0) {
    throw new Error(
      `Duplicate bonus key: ${duplicateBonusKeys[0]}.`,
    );
  }

  return result;
}

function exportScoringCode(input: {
  name: string;
  version: string;
  eliminationPoints: number;
  isPreset: boolean;
  milestones: PlacementMilestone[];
  modifiers: EliminationModifier[];
}) {
  const placementLines = [...input.milestones]
    .sort((a, b) => b.top - a.top)
    .map((rule) => `${rule.top}=${rule.points}`);

  const bonusLines = input.modifiers.map(
    (rule) => `${rule.key}=${rule.points}|${rule.label}`,
  );

  return [
    "AUROS-SCORING-V1",
    "",
    `NAME: ${input.name}`,
    `VERSION: ${input.version}`,
    `ELIM: ${input.eliminationPoints}`,
    `PRESET: ${input.isPreset ? "true" : "false"}`,
    "",
    "PLACEMENT:",
    ...placementLines,
    "",
    "BONUS:",
    ...bonusLines,
  ].join("\n");
}

function RulesetCreator() {
  const router = useRouter();

  const [name, setName] = useState("AUCS Standard");
  const [version, setVersion] = useState("v1.0");
  const [eliminationPoints, setEliminationPoints] = useState(2);
  const [milestones, setMilestones] =
    useState<PlacementMilestone[]>(DEFAULT_MILESTONES);
  const [modifiers, setModifiers] =
    useState<EliminationModifier[]>([]);
  const [isPreset, setIsPreset] = useState(true);

  const [simPlace, setSimPlace] = useState(12);
  const [simElims, setSimElims] = useState(5);
  const [simModifierCounts, setSimModifierCounts] =
    useState<Record<string, number>>({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [codeMode, setCodeMode] =
    useState<"import" | "export" | null>(null);
  const [codeValue, setCodeValue] = useState("");
  const [codeMessage, setCodeMessage] = useState("");

  const simulator = useMemo(() => {
    const placement = calculatePlacement(
      Math.max(1, simPlace),
      milestones,
    );

    const eliminations =
      Math.max(0, simElims) * eliminationPoints;

    const modifier = modifiers.reduce(
      (sum, rule) =>
        sum +
        (simModifierCounts[rule.id] ?? 0) *
          Number(rule.points || 0),
      0,
    );

    return {
      placement,
      eliminations,
      modifier,
      total: placement + eliminations + modifier,
    };
  }, [
    milestones,
    modifiers,
    simPlace,
    simElims,
    simModifierCounts,
    eliminationPoints,
  ]);

  function addMilestone() {
    setMilestones((current) => [
      ...current,
      {
        id: makeId(),
        top: 25,
        points: 1,
        label: "Top 25",
      },
    ]);
  }

  function updateMilestone(
    ruleId: string,
    patch: Partial<PlacementMilestone>,
  ) {
    setMilestones((current) =>
      current.map((rule) =>
        rule.id === ruleId ? { ...rule, ...patch } : rule,
      ),
    );
  }

  function removeMilestone(ruleId: string) {
    setMilestones((current) =>
      current.filter((rule) => rule.id !== ruleId),
    );
  }

  function addModifier() {
    const ruleId = makeId();

    setModifiers((current) => [
      ...current,
      {
        id: ruleId,
        key: `custom_${current.length + 1}`,
        label: "Shotgun elimination",
        points: 1,
      },
    ]);
  }

  function updateModifier(
    ruleId: string,
    patch: Partial<EliminationModifier>,
  ) {
    setModifiers((current) =>
      current.map((rule) =>
        rule.id === ruleId ? { ...rule, ...patch } : rule,
      ),
    );
  }

  function removeModifier(ruleId: string) {
    setModifiers((current) =>
      current.filter((rule) => rule.id !== ruleId),
    );

    setSimModifierCounts((current) => {
      const next = { ...current };
      delete next[ruleId];
      return next;
    });
  }

  function openImport() {
    setCodeMessage("");
    setCodeValue(EXAMPLE_IMPORT);
    setCodeMode("import");
  }

  function openExport() {
    setCodeMessage("");
    setCodeValue(
      exportScoringCode({
        name,
        version,
        eliminationPoints,
        isPreset,
        milestones,
        modifiers,
      }),
    );
    setCodeMode("export");
  }

  function applyImport() {
    setCodeMessage("");

    try {
      const parsed = parseScoringCode(codeValue);

      if (parsed.name) setName(parsed.name);
      if (parsed.version) setVersion(parsed.version);

      if (parsed.eliminationPoints !== undefined) {
        setEliminationPoints(parsed.eliminationPoints);
      }

      if (parsed.isPreset !== undefined) {
        setIsPreset(parsed.isPreset);
      }

      setMilestones(parsed.milestones);
      setModifiers(parsed.modifiers);
      setSimModifierCounts({});

      setCodeMessage(
        `IMPORT READY — ${parsed.milestones.length} placement rules and ${parsed.modifiers.length} special bonuses loaded.`,
      );
    } catch (err: any) {
      setCodeMessage(
        err?.message || "The scoring code could not be parsed.",
      );
    }
  }

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(codeValue);
      setCodeMessage("SCORING CODE COPIED.");
    } catch {
      setCodeMessage(
        "Clipboard access failed. Select the code and copy it manually.",
      );
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !version.trim()) {
      setError("Ruleset name and version are required.");
      return;
    }

    if (milestones.some((rule) => rule.top < 1)) {
      setError("Placement thresholds must be Top 1 or higher.");
      return;
    }

    const tops = milestones.map((rule) => rule.top);
    if (new Set(tops).size !== tops.length) {
      setError("Every placement threshold can only exist once.");
      return;
    }

    setSaving(true);

    try {
      await createScoringRuleset({
        name,
        version,
        eliminationPoints,
        placementMilestones: milestones,
        eliminationModifiers: modifiers,
        isPreset,
      });

      router.push("/competitive/admin/scoring");
    } catch (err: any) {
      setError(
        err?.message || "Ruleset could not be created.",
      );
      setSaving(false);
    }
  }

  return (
    <section className="competitivePage">
      <div className="compCreatorTop">
        <div>
          <Link
            href="/competitive/admin/scoring"
            className="compBack"
          >
            ← SCORING CONTROL
          </Link>

          <span className="competitiveEyebrow">
            CREATE // ADVANCED RULESET
          </span>

          <h1>Build the scoring DNA.</h1>

          <p>
            Build manually or paste an AUROS scoring code and let
            Competitive generate the complete ruleset instantly.
          </p>
        </div>

        <div className="compReadiness">
          <span>AUROS FORMAT</span>
          <strong>SOLO</strong>
          <div>
            <i style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      <div
        className="competitivePanel"
        style={{
          marginBottom: 18,
          padding: 18,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 340px" }}>
          <span className="competitiveEyebrow gold">
            RULESET CODE SYSTEM
          </span>
          <h2 style={{ margin: "6px 0" }}>
            Import instead of typing 40 placement rows.
          </h2>
          <p className="compSectionHelp" style={{ margin: 0 }}>
            Paste AUROS-SCORING-V1 code to replace the complete
            editor configuration, or export the current setup.
          </p>
        </div>

        <button
          type="button"
          className="compMiniAction"
          onClick={openImport}
        >
          ↓ IMPORT CODE
        </button>

        <button
          type="button"
          className="compMiniAction gold"
          onClick={openExport}
        >
          ↑ EXPORT CODE
        </button>
      </div>

      {codeMode && (
        <section
          className="competitivePanel compFormSection"
          style={{
            marginBottom: 18,
            borderColor:
              codeMode === "import"
                ? "rgba(255, 38, 52, .55)"
                : "rgba(238, 190, 79, .55)",
          }}
        >
          <div className="competitivePanelHeader">
            <div>
              <span className="competitiveEyebrow gold">
                {codeMode === "import"
                  ? "IMPORT RULESET"
                  : "EXPORT RULESET"}
              </span>

              <h2>
                {codeMode === "import"
                  ? "Paste scoring code"
                  : "AUROS scoring code"}
              </h2>

              <p className="compSectionHelp">
                {codeMode === "import"
                  ? "Applying the import replaces the current placement milestones and special bonuses in the editor. Nothing is saved to Supabase until you press CREATE SCORING RULESET."
                  : "Copy this code to duplicate the ruleset, archive it, or send it back to ChatGPT for changes."}
              </p>
            </div>

            <button
              type="button"
              className="compRuleDelete"
              onClick={() => {
                setCodeMode(null);
                setCodeMessage("");
              }}
            >
              ×
            </button>
          </div>

          <textarea
            value={codeValue}
            onChange={(event) =>
              setCodeValue(event.target.value)
            }
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: 430,
              resize: "vertical",
              padding: 18,
              borderRadius: 10,
              border:
                "1px solid rgba(255,255,255,.12)",
              background: "rgba(0,0,0,.58)",
              color: "#f6f1e7",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: 13,
              lineHeight: 1.6,
              outline: "none",
            }}
          />

          {codeMessage && (
            <div
              className="compEmptyRule"
              style={{ marginTop: 12 }}
            >
              {codeMessage}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            {codeMode === "import" ? (
              <>
                <button
                  type="button"
                  className="compCreateButton"
                  style={{ width: "auto", paddingInline: 28 }}
                  onClick={applyImport}
                >
                  PARSE & APPLY RULESET
                </button>

                <button
                  type="button"
                  className="compMiniAction gold"
                  onClick={() =>
                    setCodeValue(EXAMPLE_IMPORT)
                  }
                >
                  LOAD EXAMPLE
                </button>
              </>
            ) : (
              <button
                type="button"
                className="compCreateButton"
                style={{ width: "auto", paddingInline: 28 }}
                onClick={copyExport}
              >
                COPY SCORING CODE
              </button>
            )}
          </div>
        </section>
      )}

      <form
        onSubmit={submit}
        className="compCreatorLayout"
      >
        <main className="compCreatorMain">
          <section className="competitivePanel compFormSection">
            <div className="compSectionNumber">01</div>

            <div className="competitivePanelHeader">
              <h2>Ruleset identity</h2>
              <span>VERSIONED</span>
            </div>

            <div className="compFieldGrid">
              <label className="compField">
                <span>Name</span>
                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              </label>

              <label className="compField">
                <span>Version</span>
                <input
                  value={version}
                  onChange={(e) =>
                    setVersion(e.target.value)
                  }
                />
              </label>
            </div>

            <label className="compToggle compGapTop">
              <span>
                <strong>Reusable preset</strong>
                <small>
                  Make this available to future tournaments.
                </small>
              </span>

              <input
                type="checkbox"
                checked={isPreset}
                onChange={(e) =>
                  setIsPreset(e.target.checked)
                }
              />

              <i />
            </label>
          </section>

          <section className="competitivePanel compFormSection">
            <div className="compSectionNumber">02</div>

            <div className="competitivePanelHeader">
              <h2>Base eliminations</h2>
              <span>EVERY ELIM</span>
            </div>

            <div className="compScoringHeroInput">
              <div>
                <span>STANDARD ELIMINATION</span>
                <strong>
                  +{eliminationPoints} PTS
                </strong>
              </div>

              <input
                type="number"
                min="0"
                step="0.5"
                value={eliminationPoints}
                onChange={(e) =>
                  setEliminationPoints(
                    Number(e.target.value),
                  )
                }
              />
            </div>
          </section>

          <section className="competitivePanel compFormSection">
            <div className="compSectionNumber">03</div>

            <div className="competitivePanelHeader">
              <div>
                <h2>Placement milestones</h2>
                <p className="compSectionHelp">
                  Milestones are additive. A #20 player
                  receives every milestone they reached.
                </p>
              </div>

              <button
                type="button"
                className="compMiniAction"
                onClick={addMilestone}
              >
                + ADD MILESTONE
              </button>
            </div>

            <div className="compRuleTable">
              <div className="compRuleTableHead">
                <span>THRESHOLD</span>
                <span>AWARD</span>
                <span>LABEL</span>
                <span />
              </div>

              {[...milestones]
                .sort((a, b) => b.top - a.top)
                .map((rule) => (
                  <div
                    className="compRuleRow"
                    key={rule.id}
                  >
                    <label>
                      <b>TOP</b>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={rule.top}
                        onChange={(e) =>
                          updateMilestone(rule.id, {
                            top: Number(
                              e.target.value,
                            ),
                          })
                        }
                      />
                    </label>

                    <label>
                      <b>+</b>
                      <input
                        type="number"
                        step="0.5"
                        value={rule.points}
                        onChange={(e) =>
                          updateMilestone(rule.id, {
                            points: Number(
                              e.target.value,
                            ),
                          })
                        }
                      />
                      <b>PTS</b>
                    </label>

                    <input
                      value={rule.label ?? ""}
                      onChange={(e) =>
                        updateMilestone(rule.id, {
                          label: e.target.value,
                        })
                      }
                      placeholder={`Top ${rule.top}`}
                    />

                    <button
                      type="button"
                      className="compRuleDelete"
                      onClick={() =>
                        removeMilestone(rule.id)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          </section>

          <section className="competitivePanel compFormSection">
            <div className="compSectionNumber">04</div>

            <div className="competitivePanelHeader">
              <div>
                <h2>Special elimination bonuses</h2>
                <p className="compSectionHelp">
                  Optional bonus on top of the normal
                  elimination score.
                </p>
              </div>

              <button
                type="button"
                className="compMiniAction gold"
                onClick={addModifier}
              >
                + ADD BONUS
              </button>
            </div>

            {modifiers.length === 0 ? (
              <div className="compEmptyRule">
                No special elimination rules. Standard
                eliminations still score normally.
              </div>
            ) : (
              <div className="compRuleTable">
                <div className="compRuleTableHead modifier">
                  <span>RULE KEY</span>
                  <span>DESCRIPTION / ITEM</span>
                  <span>BONUS</span>
                  <span />
                </div>

                {modifiers.map((rule) => (
                  <div
                    className="compRuleRow modifier"
                    key={rule.id}
                  >
                    <input
                      value={rule.key}
                      onChange={(e) =>
                        updateModifier(rule.id, {
                          key: e.target.value,
                        })
                      }
                      placeholder="shotgun"
                    />

                    <input
                      value={rule.label}
                      onChange={(e) =>
                        updateModifier(rule.id, {
                          label: e.target.value,
                        })
                      }
                      placeholder="Shotgun elimination"
                    />

                    <label>
                      <b>+</b>
                      <input
                        type="number"
                        step="0.5"
                        value={rule.points}
                        onChange={(e) =>
                          updateModifier(rule.id, {
                            points: Number(
                              e.target.value,
                            ),
                          })
                        }
                      />
                      <b>PTS</b>
                    </label>

                    <button
                      type="button"
                      className="compRuleDelete"
                      onClick={() =>
                        removeModifier(rule.id)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="compMutedNote">
              Round Operations will use these rule keys as
              optional elimination counters. Example: 5 total
              eliminations, 2 with a shotgun = base points +
              2× shotgun bonus.
            </p>
          </section>
        </main>

        <aside className="compCreatorSide">
          <div className="competitivePanel compSticky compSimulator">
            <span className="competitiveEyebrow gold">
              LIVE SCORING SIMULATOR
            </span>

            <h2>{name || "Scoring Ruleset"}</h2>

            <p>
              Test the exact score before saving.
            </p>

            <div className="compFieldGrid compSimulatorInputs">
              <label className="compField">
                <span>Placement</span>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={simPlace}
                  onChange={(e) =>
                    setSimPlace(
                      Number(e.target.value),
                    )
                  }
                />
              </label>

              <label className="compField">
                <span>Total eliminations</span>
                <input
                  type="number"
                  min="0"
                  value={simElims}
                  onChange={(e) =>
                    setSimElims(
                      Number(e.target.value),
                    )
                  }
                />
              </label>
            </div>

            {modifiers.length > 0 && (
              <div className="compSimulatorModifiers">
                <span>SPECIAL ELIMINATIONS</span>

                {modifiers.map((rule) => (
                  <label key={rule.id}>
                    <span>
                      {rule.label || rule.key}
                      <small>
                        +{rule.points} each
                      </small>
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        simModifierCounts[
                          rule.id
                        ] ?? 0
                      }
                      onChange={(e) =>
                        setSimModifierCounts(
                          (current) => ({
                            ...current,
                            [rule.id]: Number(
                              e.target.value,
                            ),
                          }),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            )}

            <div className="compScoreBreakdown">
              <div>
                <span>
                  PLACEMENT MILESTONES
                </span>
                <strong>
                  +{simulator.placement}
                </strong>
              </div>

              <div>
                <span>
                  {simElims} BASE ELIMS
                </span>
                <strong>
                  +{simulator.eliminations}
                </strong>
              </div>

              <div>
                <span>SPECIAL BONUSES</span>
                <strong>
                  +{simulator.modifier}
                </strong>
              </div>

              <div className="total">
                <span>ROUND TOTAL</span>
                <strong>
                  {simulator.total} PTS
                </strong>
              </div>
            </div>

            {error && (
              <div className="compError">
                {error}
              </div>
            )}

            <button
              className="compCreateButton"
              disabled={saving}
            >
              {saving
                ? "SAVING RULESET…"
                : "CREATE SCORING RULESET"}
            </button>

            <small className="compSaveHint">
              Historical tournaments keep the exact ruleset
              version they were created with.
            </small>
          </div>
        </aside>
      </form>
    </section>
  );
}

export default function NewScoringRulesetPage() {
  return (
    <CompetitiveAdminGuard>
      {() => <RulesetCreator />}
    </CompetitiveAdminGuard>
  );
}
