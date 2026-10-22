"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { useParams } from "next/navigation";

import DevPageGuard from "../../../../components/dev/DevPageGuard";
import { getDevProjectBySlug } from "../../../../services/dev-project.service";
import {
  createDevConcept,
  deleteDevConcept,
  getDevConcepts,
  updateDevConcept,
} from "../../../../services/dev-concept.service";

import type { DevProject } from "../../../../types/dev-projects";
import type {
  DevConcept,
  DevConceptInput,
  DevConceptStatus,
  DevConceptType,
} from "../../../../types/dev-concepts";

const emptyForm: DevConceptInput = {
  title: "",
  codename: "",
  summary: "",
  content: "",
  internalNotes: "",
  type: "mini_season",
  status: "idea",
  targetWindow: "",
};

const types: Array<{ value: DevConceptType; label: string }> = [
  { value: "season", label: "Season" },
  { value: "mini_season", label: "Mini Season" },
  { value: "event", label: "Event" },
  { value: "feature", label: "Feature" },
  { value: "map_change", label: "Map Change" },
  { value: "gameplay", label: "Gameplay" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const statuses: Array<{ value: DevConceptStatus; label: string }> = [
  { value: "idea", label: "Idea" },
  { value: "concept", label: "Concept" },
  { value: "planning", label: "Planning" },
  { value: "approved", label: "Approved" },
  { value: "in_development", label: "In Development" },
  { value: "implemented", label: "Implemented" },
  { value: "on_hold", label: "On Hold" },
  { value: "scrapped", label: "Scrapped" },
];

function labelFor<T extends string>(
  items: Array<{ value: T; label: string }>,
  value: T
) {
  return items.find((item) => item.value === value)?.label ?? value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function DevConceptsPage() {
  const params = useParams<{ project: string }>();

  const [project, setProject] = useState<DevProject | null>(null);
  const [concepts, setConcepts] = useState<DevConcept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DevConceptInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const loadedProject = await getDevProjectBySlug(params.project);
        if (!loadedProject) {
          throw new Error("Development project not found.");
        }

        const loadedConcepts = await getDevConcepts(loadedProject.id);
        if (!alive) return;

        setProject(loadedProject);
        setConcepts(loadedConcepts);
      } catch (loadError) {
        if (!alive) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load concepts."
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [params.project]);

  const activeCount = useMemo(
    () =>
      concepts.filter(
        (concept) =>
          concept.status !== "scrapped" &&
          concept.status !== "implemented"
      ).length,
    [concepts]
  );

  function openNewConcept() {
    setEditingId(null);
    setForm(emptyForm);
    setEditorOpen(true);
    setError(null);
  }

  function openEditConcept(concept: DevConcept) {
    setEditingId(concept.id);
    setForm({
      title: concept.title,
      codename: concept.codename ?? "",
      summary: concept.summary ?? "",
      content: concept.content ?? "",
      internalNotes: concept.internal_notes ?? "",
      type: concept.type,
      status: concept.status,
      targetWindow: concept.target_window ?? "",
    });
    setEditorOpen(true);
    setError(null);
  }

  async function saveConcept(event: FormEvent) {
    event.preventDefault();
    if (!project || !form.title.trim()) return;

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        const updated = await updateDevConcept(editingId, form);
        setConcepts((current) =>
          current.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        const created = await createDevConcept(project.id, form);
        setConcepts((current) => [created, ...current]);
      }

      setEditorOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save concept."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeConcept(concept: DevConcept) {
    if (!window.confirm(`Delete concept “${concept.title}”?`)) return;

    try {
      await deleteDevConcept(concept.id);
      setConcepts((current) =>
        current.filter((item) => item.id !== concept.id)
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete concept."
      );
    }
  }

  return (
    <DevPageGuard>
      <main
        className="devConceptPage"
        style={
          {
            "--concept-accent": project?.accent ?? "#b985ff",
          } as CSSProperties
        }
      >
        <div className="devConceptBreadcrumbs">
          <Link href="/dev">Development Hub</Link>
          <span>/</span>
          <Link href={`/dev/${params.project}`}>
            {project?.name ?? params.project}
          </Link>
          <span>/</span>
          <strong>Concepts</strong>
        </div>

        <section className="devConceptHero">
          <div>
            <span className="devConceptEyebrow">INTERNAL CONCEPT LAB</span>
            <h1>Concepts</h1>
            <p>
              Capture ideas before they become roadmap items. Seasons, events,
              gameplay experiments, map changes and wild ideas all belong here.
            </p>
          </div>

          <button type="button" onClick={openNewConcept}>
            + New Concept
          </button>
        </section>

        <section className="devConceptStats">
          <article>
            <span>TOTAL CONCEPTS</span>
            <strong>{concepts.length}</strong>
          </article>
          <article>
            <span>ACTIVE IDEAS</span>
            <strong>{activeCount}</strong>
          </article>
          <article>
            <span>WORKSPACE</span>
            <strong>{project?.short_name ?? "DEV"}</strong>
          </article>
        </section>

        {error && <div className="devConceptError">{error}</div>}

        {loading ? (
          <div className="devConceptState">Loading concepts...</div>
        ) : concepts.length === 0 ? (
          <section className="devConceptEmpty">
            <span>NO CONCEPTS YET</span>
            <h2>Start with the idea in your head.</h2>
            <p>
              A concept does not need to be approved or scheduled. Write it down
              now and decide later whether AUROS should actually build it.
            </p>
            <button type="button" onClick={openNewConcept}>
              Create first concept
            </button>
          </section>
        ) : (
          <section className="devConceptGrid">
            {concepts.map((concept) => (
              <article key={concept.id} className="devConceptCard">
                <div className="devConceptCardTop">
                  <span className={`devConceptStatus status-${concept.status}`}>
                    {labelFor(statuses, concept.status)}
                  </span>
                  <span className="devConceptType">
                    {labelFor(types, concept.type)}
                  </span>
                </div>

                <div className="devConceptCardBody">
                  {concept.codename && (
                    <span className="devConceptCodename">
                      PROJECT {concept.codename.toUpperCase()}
                    </span>
                  )}
                  <h2>{concept.title}</h2>
                  <p>
                    {concept.summary ||
                      "No summary yet. Open this concept and start shaping the idea."}
                  </p>
                </div>

                <div className="devConceptMeta">
                  <span>
                    TARGET
                    <strong>{concept.target_window || "OPEN"}</strong>
                  </span>
                  <span>
                    UPDATED
                    <strong>{formatDate(concept.updated_at)}</strong>
                  </span>
                </div>

                <div className="devConceptActions">
                  <button type="button" onClick={() => openEditConcept(concept)}>
                    Open Concept
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => removeConcept(concept)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {editorOpen && (
          <div className="devConceptModalBackdrop" onMouseDown={() => !saving && setEditorOpen(false)}>
            <form
              className="devConceptEditor"
              onSubmit={saveConcept}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="devConceptEditorHeader">
                <div>
                  <span>{editingId ? "EDIT CONCEPT" : "NEW CONCEPT"}</span>
                  <h2>{editingId ? form.title || "Untitled Concept" : "Capture a new idea"}</h2>
                </div>
                <button type="button" onClick={() => setEditorOpen(false)}>×</button>
              </div>

              <div className="devConceptFormGrid">
                <label className="wide">
                  <span>Concept title</span>
                  <input
                    required
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="December Mini Season"
                  />
                </label>

                <label>
                  <span>Codename</span>
                  <input
                    value={form.codename}
                    onChange={(event) => setForm((current) => ({ ...current, codename: event.target.value }))}
                    placeholder="FROSTLINE"
                  />
                </label>

                <label>
                  <span>Target window</span>
                  <input
                    value={form.targetWindow}
                    onChange={(event) => setForm((current) => ({ ...current, targetWindow: event.target.value }))}
                    placeholder="December 2026"
                  />
                </label>

                <label>
                  <span>Type</span>
                  <select
                    value={form.type}
                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as DevConceptType }))}
                  >
                    {types.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>

                <label>
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as DevConceptStatus }))}
                  >
                    {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>

                <label className="wide">
                  <span>Summary</span>
                  <textarea
                    rows={3}
                    value={form.summary}
                    onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                    placeholder="What is the core idea and why could it be interesting for AUROS?"
                  />
                </label>

                <label className="wide">
                  <span>Full concept</span>
                  <textarea
                    rows={11}
                    value={form.content}
                    onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                    placeholder={"OVERVIEW\n\nSTORY\n\nMAP CHANGES\n\nGAMEPLAY\n\nTIMELINE\n\nOPEN QUESTIONS"}
                  />
                </label>

                <label className="wide">
                  <span>Internal notes</span>
                  <textarea
                    rows={5}
                    value={form.internalNotes}
                    onChange={(event) => setForm((current) => ({ ...current, internalNotes: event.target.value }))}
                    placeholder="Private thoughts, risks, things to discuss with the team..."
                  />
                </label>
              </div>

              <div className="devConceptEditorFooter">
                <button type="button" className="secondary" onClick={() => setEditorOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving || !form.title.trim()}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Concept"}
                </button>
              </div>
            </form>
          </div>
        )}

        <ConceptStyles />
      </main>
    </DevPageGuard>
  );
}

function ConceptStyles() {
  return (
    <style jsx global>{`
      .devConceptPage { --concept-accent: #b985ff; min-height: 100vh; padding: 18px 0 80px; color: #fff; }
      .devConceptBreadcrumbs { display:flex; align-items:center; gap:9px; margin:4px 4px 16px; color:#7186a7; font-size:11px; font-weight:750; }
      .devConceptBreadcrumbs a { color:#93a7c6; text-decoration:none; }
      .devConceptBreadcrumbs strong { color:var(--concept-accent); }
      .devConceptHero { display:flex; justify-content:space-between; align-items:flex-end; gap:28px; padding:34px; border:1px solid color-mix(in srgb, var(--concept-accent) 28%, transparent); border-radius:28px; background:linear-gradient(145deg, rgba(24,15,43,.94), rgba(8,17,34,.94)); box-shadow:0 28px 90px rgba(0,0,0,.25); }
      .devConceptEyebrow { color:var(--concept-accent); font-size:11px; font-weight:900; letter-spacing:.16em; }
      .devConceptHero h1 { margin:8px 0 8px; font-size:clamp(34px,6vw,64px); line-height:.95; }
      .devConceptHero p { max-width:720px; margin:0; color:#9eb0cd; line-height:1.7; }
      .devConceptHero button, .devConceptEmpty button, .devConceptEditorFooter button { border:1px solid color-mix(in srgb, var(--concept-accent) 45%, transparent); border-radius:13px; background:color-mix(in srgb, var(--concept-accent) 16%, rgba(10,15,28,.9)); color:#fff; min-height:44px; padding:0 18px; font-weight:850; cursor:pointer; }
      .devConceptStats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:16px 0; }
      .devConceptStats article { padding:18px 20px; border:1px solid rgba(145,174,221,.13); border-radius:18px; background:rgba(9,17,32,.72); }
      .devConceptStats span { display:block; color:#7186a7; font-size:10px; font-weight:850; letter-spacing:.12em; }
      .devConceptStats strong { display:block; margin-top:8px; font-size:24px; }
      .devConceptGrid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
      .devConceptCard { display:flex; flex-direction:column; min-height:330px; padding:22px; border:1px solid rgba(145,174,221,.14); border-radius:22px; background:linear-gradient(145deg,rgba(13,22,41,.92),rgba(8,13,27,.94)); box-shadow:0 20px 60px rgba(0,0,0,.18); }
      .devConceptCardTop { display:flex; justify-content:space-between; gap:12px; align-items:center; }
      .devConceptStatus,.devConceptType { padding:6px 9px; border-radius:999px; font-size:9px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; }
      .devConceptStatus { color:#d9c1ff; background:rgba(173,113,255,.12); border:1px solid rgba(190,143,255,.22); }
      .devConceptType { color:#88ddff; background:rgba(62,190,255,.08); }
      .status-approved,.status-in_development { color:#a8f7cf; background:rgba(48,208,139,.1); border-color:rgba(48,208,139,.2); }
      .status-scrapped,.status-on_hold { color:#ffb4bd; background:rgba(255,82,110,.09); border-color:rgba(255,82,110,.18); }
      .devConceptCardBody { flex:1; padding:24px 0; }
      .devConceptCodename { color:var(--concept-accent); font-size:10px; font-weight:900; letter-spacing:.14em; }
      .devConceptCard h2 { margin:7px 0 10px; font-size:25px; }
      .devConceptCard p { margin:0; color:#91a5c3; line-height:1.65; }
      .devConceptMeta { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:14px 0; border-top:1px solid rgba(145,174,221,.1); }
      .devConceptMeta span { color:#657a9b; font-size:9px; font-weight:850; letter-spacing:.1em; }
      .devConceptMeta strong { display:block; margin-top:5px; color:#dce8fb; font-size:11px; letter-spacing:0; }
      .devConceptActions { display:flex; gap:8px; }
      .devConceptActions button { flex:1; min-height:39px; border:1px solid rgba(148,176,220,.15); border-radius:11px; background:rgba(108,91,255,.1); color:#e8eeff; font-weight:800; cursor:pointer; }
      .devConceptActions .danger { flex:0 0 auto; background:rgba(255,75,100,.06); color:#ff9eac; }
      .devConceptState,.devConceptEmpty { margin-top:16px; padding:50px 30px; text-align:center; border:1px dashed rgba(145,174,221,.18); border-radius:24px; background:rgba(8,15,29,.6); color:#93a7c6; }
      .devConceptEmpty span { color:var(--concept-accent); font-size:10px; font-weight:900; letter-spacing:.14em; }
      .devConceptEmpty h2 { margin:10px 0 8px; color:#fff; font-size:28px; }
      .devConceptEmpty p { max-width:620px; margin:0 auto 22px; line-height:1.7; }
      .devConceptError { margin:14px 0; padding:13px 16px; border:1px solid rgba(255,91,112,.25); border-radius:13px; background:rgba(255,71,96,.08); color:#ffb4be; }
      .devConceptModalBackdrop { position:fixed; z-index:10000; inset:0; display:grid; place-items:center; padding:24px; background:rgba(2,5,12,.78); backdrop-filter:blur(14px); overflow:auto; }
      .devConceptEditor { width:min(900px,100%); max-height:calc(100dvh - 48px); overflow:auto; border:1px solid rgba(180,139,255,.24); border-radius:26px; background:#091121; box-shadow:0 40px 120px rgba(0,0,0,.55); }
      .devConceptEditorHeader { position:sticky; top:0; z-index:2; display:flex; justify-content:space-between; gap:20px; align-items:flex-start; padding:24px 26px; border-bottom:1px solid rgba(145,174,221,.12); background:rgba(9,17,33,.96); backdrop-filter:blur(14px); }
      .devConceptEditorHeader span { color:var(--concept-accent); font-size:10px; font-weight:900; letter-spacing:.14em; }
      .devConceptEditorHeader h2 { margin:6px 0 0; font-size:25px; }
      .devConceptEditorHeader > button { border:0; background:transparent; color:#91a5c3; font-size:30px; cursor:pointer; }
      .devConceptFormGrid { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:26px; }
      .devConceptFormGrid label { display:flex; flex-direction:column; gap:7px; }
      .devConceptFormGrid label.wide { grid-column:1/-1; }
      .devConceptFormGrid label > span { color:#8fa4c4; font-size:11px; font-weight:800; }
      .devConceptFormGrid input,.devConceptFormGrid select,.devConceptFormGrid textarea { width:100%; border:1px solid rgba(145,174,221,.15); border-radius:12px; outline:none; background:#07101f; color:#eef5ff; padding:12px 13px; font:inherit; resize:vertical; }
      .devConceptFormGrid input:focus,.devConceptFormGrid select:focus,.devConceptFormGrid textarea:focus { border-color:color-mix(in srgb,var(--concept-accent) 55%,transparent); box-shadow:0 0 0 3px color-mix(in srgb,var(--concept-accent) 9%,transparent); }
      .devConceptEditorFooter { position:sticky; bottom:0; display:flex; justify-content:flex-end; gap:10px; padding:18px 26px; border-top:1px solid rgba(145,174,221,.12); background:rgba(9,17,33,.96); backdrop-filter:blur(14px); }
      .devConceptEditorFooter .secondary { background:rgba(255,255,255,.03); border-color:rgba(145,174,221,.15); color:#9db0cb; }
      .devConceptEditorFooter button:disabled { opacity:.45; cursor:not-allowed; }
      @media(max-width:760px){ .devConceptHero{align-items:flex-start;flex-direction:column}.devConceptStats,.devConceptGrid{grid-template-columns:1fr}.devConceptFormGrid{grid-template-columns:1fr}.devConceptFormGrid label.wide{grid-column:auto}.devConceptModalBackdrop{padding:10px}.devConceptEditor{max-height:calc(100dvh - 20px)} }
    `}</style>
  );
}
