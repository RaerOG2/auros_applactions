"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";

import DevPageGuard from "../../components/dev/DevPageGuard";

import {
  createDevProject,
  getDevProjects,
} from "../../services/dev-project.service";

import {
  getSiteAccess,
} from "../../services/access.service";

import type {
  DevProject,
  DevProjectStatus,
} from "../../types/dev-projects";

type ProjectFormState = {
  name: string;
  slug: string;
  shortName: string;
  description: string;
  accent: string;
  status: DevProjectStatus;
};

const emptyForm:
  ProjectFormState = {
  name: "",
  slug: "",
  shortName: "",
  description: "",
  accent: "#b985ff",
  status: "active",
};

function createSlug(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /ä/g,
      "ae"
    )
    .replace(
      /ö/g,
      "oe"
    )
    .replace(
      /ü/g,
      "ue"
    )
    .replace(
      /ß/g,
      "ss"
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

function projectStatusLabel(
  project:
    DevProject
) {
  switch (
    project.status
  ) {
    case "planning":
      return "PLANNING";

    case "paused":
      return "PAUSED";

    case "archived":
      return "ARCHIVED";

    default:
      return "ACTIVE DEVELOPMENT";
  }
}

export default function DevPage() {
  const [
    projects,
    setProjects,
  ] =
    useState<
      DevProject[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    loadError,
    setLoadError,
  ] =
    useState<
      string | null
    >(null);

  const [
    canManageProjects,
    setCanManageProjects,
  ] =
    useState(false);

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState<ProjectFormState>(
      emptyForm
    );

  const [
    slugTouched,
    setSlugTouched,
  ] =
    useState(false);

  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const [
    createError,
    setCreateError,
  ] =
    useState<
      string | null
    >(null);

  useEffect(() => {
    let alive =
      true;

    async function load() {
      try {
        setLoading(
          true
        );

        setLoadError(
          null
        );

        const [
          loadedProjects,
          access,
        ] =
          await Promise.all([
            getDevProjects(),
            getSiteAccess(),
          ]);

        if (!alive) {
          return;
        }

        setProjects(
          loadedProjects
        );

        setCanManageProjects(
          access.isAdmin &&
            access.isDev
        );
      } catch (
        error
      ) {
        console.error(
          "DEV HUB LOAD ERROR:",
          error
        );

        if (!alive) {
          return;
        }

        setLoadError(
          error instanceof
            Error
            ? error.message
            : "Could not load Development Hub."
        );
      } finally {
        if (alive) {
          setLoading(
            false
          );
        }
      }
    }

    load();

    return () => {
      alive =
        false;
    };
  }, []);

  const projectCount =
    useMemo(
      () =>
        projects.length,
      [projects]
    );

  function updateName(
    value: string
  ) {
    setForm(
      (
        previous
      ) => ({
        ...previous,
        name:
          value,

        slug:
          slugTouched
            ? previous.slug
            : createSlug(
                value
              ),
      })
    );
  }

  function closeCreate() {
    if (
      creating
    ) {
      return;
    }

    setCreateOpen(
      false
    );

    setCreateError(
      null
    );

    setSlugTouched(
      false
    );

    setForm(
      emptyForm
    );
  }

  async function handleCreate(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !canManageProjects
    ) {
      return;
    }

    const name =
      form.name.trim();

    const slug =
      createSlug(
        form.slug
      );

    const shortName =
      form.shortName
        .trim()
        .toUpperCase();

    if (
      !name ||
      !slug ||
      !shortName
    ) {
      setCreateError(
        "Name, slug and project code are required."
      );

      return;
    }

    try {
      setCreating(
        true
      );

      setCreateError(
        null
      );

      const created =
        await createDevProject(
          {
            name,
            slug,
            short_name:
              shortName,

            description:
              form.description,

            accent:
              form.accent,

            status:
              form.status,
          }
        );

      setProjects(
        (
          previous
        ) => [
          ...previous,
          created,
        ]
      );

      setCreateOpen(
        false
      );

      setForm(
        emptyForm
      );

      setSlugTouched(
        false
      );
    } catch (
      error
    ) {
      console.error(
        "CREATE DEV PROJECT ERROR:",
        error
      );

      setCreateError(
        error instanceof
          Error
          ? error.message
          : "Could not create project."
      );
    } finally {
      setCreating(
        false
      );
    }
  }

  return (
    <DevPageGuard>
      <main className="devHubPage">
        <section className="devHubHero">
          <div className="devHubHeroGlow" />

          <div className="devHubHeroContent">
            <div className="devHubEyebrow">
              AUROS INTERNAL
              DEVELOPMENT
            </div>

            <h1>
              Development Hub
            </h1>

            <p>
              Select the
              project you
              want to open.
              Each project
              has its own
              development
              space,
              roadmap,
              planning
              tools and
              internal
              information.
            </p>
          </div>

          <div className="devHubAccessBadge">
            <span className="devHubAccessDot" />

            DEV ACCESS
          </div>
        </section>

        <section className="devProjectSection">
          <div className="devProjectSectionHeader">
            <div>
              <span>
                PROJECT SELECTOR
              </span>

              <h2>
                Choose a project
              </h2>
            </div>

            <div className="devProjectHeaderActions">
              <div className="devProjectCount">
                {
                  projectCount
                }
                {" "}
                {projectCount ===
                1
                  ? "PROJECT"
                  : "PROJECTS"}
              </div>

              {canManageProjects ? (
                <button
                  type="button"
                  className="devCreateProjectButton"
                  onClick={() =>
                    setCreateOpen(
                      true
                    )
                  }
                >
                  <span>
                    +
                  </span>

                  Create Project
                </button>
              ) : null}
            </div>
          </div>

          {loading ? (
            <div className="devHubStateCard">
              Loading development
              projects...
            </div>
          ) : loadError ? (
            <div className="devHubStateCard error">
              <strong>
                Could not load
                projects.
              </strong>

              <span>
                {
                  loadError
                }
              </span>
            </div>
          ) : projects.length ===
            0 ? (
            <div className="devHubStateCard">
              No development
              projects exist yet.
            </div>
          ) : (
            <div className="devProjectGrid">
              {projects.map(
                (
                  project
                ) => (
                  <Link
                    key={
                      project.id
                    }
                    href={`/dev/${project.slug}`}
                    className="devProjectCard"
                    style={
                      {
                        "--project-accent":
                          project.accent,
                      } as CSSProperties
                    }
                  >
                    <div className="devProjectCardTop">
                      <div className="devProjectIcon">
                        {
                          project.short_name
                        }
                      </div>

                      <div className="devProjectStatus">
                        <span />

                        {
                          projectStatusLabel(
                            project
                          )
                        }
                      </div>
                    </div>

                    <div className="devProjectCardBody">
                      <h3>
                        {
                          project.name
                        }
                      </h3>

                      <p>
                        {project.description ||
                          "Internal Auros development project."}
                      </p>
                    </div>

                    <div className="devProjectFeatures">
                      {project.modules
                        .slice(
                          0,
                          6
                        )
                        .map(
                          (
                            module
                          ) => (
                            <span
                              key={
                                module.title
                              }
                            >
                              {
                                module.title
                              }
                            </span>
                          )
                        )}
                    </div>

                    <div className="devProjectOpen">
                      Open Project

                      <span
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </section>

        <section className="devHubInfoBar">
          <div>
            <strong>
              Internal Workspace
            </strong>

            <span>
              Development content
              is only visible to
              accounts with DEV
              access.
            </span>
          </div>

          <div>
            <strong>
              Project Based
            </strong>

            <span>
              Every project keeps
              its own roadmap,
              updates and
              development data.
            </span>
          </div>

          <div>
            <strong>
              Admin + DEV
            </strong>

            <span>
              Accounts with both
              permissions can
              create additional
              Auros projects.
            </span>
          </div>
        </section>

        {createOpen &&
        canManageProjects ? (
          <div
            className="devProjectModalBackdrop"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeCreate();
              }
            }}
          >
            <div className="devProjectModal">
              <div className="devProjectModalHeader">
                <div>
                  <span>
                    DEVELOPMENT
                    PROJECT
                  </span>

                  <h2>
                    Create Project
                  </h2>
                </div>

                <button
                  type="button"
                  className="devProjectModalClose"
                  onClick={
                    closeCreate
                  }
                  disabled={
                    creating
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleCreate
                }
                className="devProjectForm"
              >
                <label>
                  <span>
                    Project Name
                  </span>

                  <input
                    value={
                      form.name
                    }
                    onChange={(
                      event
                    ) =>
                      updateName(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Auros App"
                    maxLength={
                      80
                    }
                    required
                  />
                </label>

                <div className="devProjectFormRow">
                  <label>
                    <span>
                      Project Code
                    </span>

                    <input
                      value={
                        form.shortName
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            shortName:
                              event
                                .target
                                .value
                                .toUpperCase(),
                          })
                        )
                      }
                      placeholder="AA"
                      maxLength={
                        6
                      }
                      required
                    />
                  </label>

                  <label>
                    <span>
                      Status
                    </span>

                    <select
                      value={
                        form.status
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            status:
                              event
                                .target
                                .value as DevProjectStatus,
                          })
                        )
                      }
                    >
                      <option value="active">
                        Active
                      </option>

                      <option value="planning">
                        Planning
                      </option>

                      <option value="paused">
                        Paused
                      </option>
                    </select>
                  </label>
                </div>

                <label>
                  <span>
                    URL Slug
                  </span>

                  <div className="devProjectSlugInput">
                    <strong>
                      /dev/
                    </strong>

                    <input
                      value={
                        form.slug
                      }
                      onChange={(
                        event
                      ) => {
                        setSlugTouched(
                          true
                        );

                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            slug:
                              createSlug(
                                event
                                  .target
                                  .value
                              ),
                          })
                        );
                      }}
                      placeholder="auros-app"
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Description
                  </span>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,

                          description:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Internal development workspace for the Auros App..."
                    rows={
                      4
                    }
                    maxLength={
                      500
                    }
                  />
                </label>

                <label>
                  <span>
                    Project Accent
                  </span>

                  <div className="devProjectColorRow">
                    <input
                      type="color"
                      value={
                        form.accent
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            accent:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                    />

                    <code>
                      {
                        form.accent
                      }
                    </code>
                  </div>
                </label>

                {createError ? (
                  <div className="devProjectCreateError">
                    {
                      createError
                    }
                  </div>
                ) : null}

                <div className="devProjectFormActions">
                  <button
                    type="button"
                    className="devProjectCancelButton"
                    onClick={
                      closeCreate
                    }
                    disabled={
                      creating
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="devProjectSubmitButton"
                    disabled={
                      creating
                    }
                  >
                    {creating
                      ? "Creating..."
                      : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>

      <style jsx global>{`
        .devHubPage {
          width:
            100%;

          min-height:
            100vh;

          padding:
            18px
            0
            80px;

          color:
            white;
        }

        .devHubHero {
          position:
            relative;

          overflow:
            hidden;

          display:
            flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap:
            28px;

          min-height:
            300px;

          padding:
            clamp(
              30px,
              5vw,
              58px
            );

          border:
            1px solid
            rgba(
              185,
              133,
              255,
              0.2
            );

          border-radius:
            30px;

          background:
            radial-gradient(
              circle
              at
              82%
              18%,
              rgba(
                156,
                86,
                255,
                0.22
              ),
              transparent
              35%
            ),
            linear-gradient(
              135deg,
              rgba(
                31,
                18,
                54,
                0.98
              ),
              rgba(
                9,
                19,
                38,
                0.96
              )
              58%,
              rgba(
                7,
                17,
                33,
                0.98
              )
            );

          box-shadow:
            0
            28px
            90px
            rgba(
              0,
              0,
              0,
              0.28
            ),
            inset
            0
            1px
            0
            rgba(
              255,
              255,
              255,
              0.04
            );
        }

        .devHubHeroGlow {
          position:
            absolute;

          right:
            -120px;

          bottom:
            -180px;

          width:
            460px;

          height:
            460px;

          border-radius:
            999px;

          background:
            rgba(
              156,
              86,
              255,
              0.15
            );

          filter:
            blur(
              70px
            );

          pointer-events:
            none;
        }

        .devHubHeroContent {
          position:
            relative;

          z-index:
            1;

          max-width:
            760px;
        }

        .devHubEyebrow {
          margin-bottom:
            14px;

          color:
            #c69cff;

          font-size:
            11px;

          font-weight:
            900;

          letter-spacing:
            0.16em;
        }

        .devHubHero h1 {
          margin:
            0;

          font-size:
            clamp(
              42px,
              7vw,
              76px
            );

          line-height:
            0.98;

          letter-spacing:
            -0.045em;
        }

        .devHubHero p {
          max-width:
            700px;

          margin:
            22px
            0
            0;

          color:
            #adbbd4;

          font-size:
            clamp(
              15px,
              2vw,
              18px
            );

          line-height:
            1.75;
        }

        .devHubAccessBadge {
          position:
            relative;

          z-index:
            1;

          flex-shrink:
            0;

          display:
            inline-flex;

          align-items:
            center;

          gap:
            9px;

          padding:
            11px
            14px;

          border:
            1px solid
            rgba(
              185,
              133,
              255,
              0.25
            );

          border-radius:
            999px;

          background:
            rgba(
              185,
              133,
              255,
              0.08
            );

          color:
            #e2caff;

          font-size:
            11px;

          font-weight:
            900;

          letter-spacing:
            0.1em;
        }

        .devHubAccessDot {
          width:
            7px;

          height:
            7px;

          border-radius:
            999px;

          background:
            #b985ff;

          box-shadow:
            0
            0
            16px
            rgba(
              185,
              133,
              255,
              0.9
            );
        }

        .devProjectSection {
          margin-top:
            34px;
        }

        .devProjectSectionHeader {
          display:
            flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap:
            20px;

          margin-bottom:
            17px;

          padding:
            0
            4px;
        }

        .devProjectSectionHeader
          > div
          > span {
          color:
            #8497b6;

          font-size:
            10px;

          font-weight:
            850;

          letter-spacing:
            0.14em;
        }

        .devProjectSectionHeader h2 {
          margin:
            7px
            0
            0;

          font-size:
            clamp(
              25px,
              4vw,
              34px
            );

          letter-spacing:
            -0.03em;
        }

        .devProjectHeaderActions {
          display:
            flex;

          align-items:
            center;

          gap:
            12px;
        }

        .devProjectCount {
          color:
            #8394af;

          font-size:
            11px;

          font-weight:
            850;

          letter-spacing:
            0.1em;
        }

        .devCreateProjectButton {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            8px;

          min-height:
            40px;

          padding:
            9px
            14px;

          border:
            1px solid
            rgba(
              185,
              133,
              255,
              0.32
            );

          border-radius:
            12px;

          background:
            rgba(
              185,
              133,
              255,
              0.11
            );

          color:
            #e6d3ff;

          cursor:
            pointer;

          font: inherit;

          font-size:
            12px;

          font-weight:
            850;
        }

        .devCreateProjectButton span {
          font-size:
            19px;

          line-height:
            1;
        }

        .devProjectGrid {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );

          gap:
            18px;
        }

        .devProjectCard {
          --project-accent:
            #b985ff;

          position:
            relative;

          overflow:
            hidden;

          min-height:
            390px;

          display:
            flex;

          flex-direction:
            column;

          padding:
            clamp(
              22px,
              3vw,
              30px
            );

          border:
            1px solid
            rgba(
              130,
              158,
              205,
              0.16
            );

          border-radius:
            26px;

          background:
            radial-gradient(
              circle
              at
              90%
              0%,
              color-mix(
                in srgb,
                var(
                  --project-accent
                )
                18%,
                transparent
              ),
              transparent
              33%
            ),
            rgba(
              9,
              18,
              35,
              0.9
            );

          color:
            white;

          text-decoration:
            none;

          transition:
            transform
              180ms
              ease,
            border-color
              180ms
              ease;
        }

        .devProjectCard::after {
          content:
            "";

          position:
            absolute;

          left:
            0;

          right:
            0;

          bottom:
            0;

          height:
            2px;

          background:
            var(
              --project-accent
            );

          opacity:
            0.55;
        }

        .devProjectCardTop {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            18px;
        }

        .devProjectIcon {
          width:
            54px;

          height:
            54px;

          display:
            grid;

          place-items:
            center;

          border:
            1px solid
            color-mix(
              in srgb,
              var(
                --project-accent
              )
              38%,
              transparent
            );

          border-radius:
            17px;

          background:
            color-mix(
              in srgb,
              var(
                --project-accent
              )
              11%,
              transparent
            );

          color:
            var(
              --project-accent
            );

          font-size:
            14px;

          font-weight:
            950;
        }

        .devProjectStatus {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            7px;

          color:
            #a9b7ce;

          font-size:
            9px;

          font-weight:
            850;

          letter-spacing:
            0.08em;
        }

        .devProjectStatus span {
          width:
            6px;

          height:
            6px;

          border-radius:
            999px;

          background:
            var(
              --project-accent
            );

          box-shadow:
            0
            0
            12px
            var(
              --project-accent
            );
        }

        .devProjectCardBody {
          margin-top:
            34px;
        }

        .devProjectCardBody h3 {
          margin:
            0;

          font-size:
            clamp(
              28px,
              4vw,
              38px
            );

          letter-spacing:
            -0.035em;
        }

        .devProjectCardBody p {
          margin:
            14px
            0
            0;

          color:
            #9dafca;

          line-height:
            1.68;
        }

        .devProjectFeatures {
          display:
            flex;

          flex-wrap:
            wrap;

          gap:
            8px;

          margin-top:
            24px;
        }

        .devProjectFeatures span {
          padding:
            7px
            9px;

          border:
            1px solid
            rgba(
              129,
              155,
              198,
              0.13
            );

          border-radius:
            9px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          color:
            #a8b8d0;

          font-size:
            10px;

          font-weight:
            750;
        }

        .devProjectOpen {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            15px;

          margin-top:
            auto;

          padding-top:
            28px;

          color:
            var(
              --project-accent
            );

          font-size:
            13px;

          font-weight:
            850;
        }

        .devHubStateCard {
          padding:
            28px;

          border:
            1px solid
            rgba(
              130,
              158,
              205,
              0.15
            );

          border-radius:
            20px;

          background:
            rgba(
              8,
              17,
              33,
              0.9
            );

          color:
            #9dafca;
        }

        .devHubStateCard.error strong,
        .devHubStateCard.error span {
          display:
            block;
        }

        .devHubStateCard.error span {
          margin-top:
            7px;

          color:
            #d59ba6;
        }

        .devHubInfoBar {
          display:
            grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap:
            1px;

          overflow:
            hidden;

          margin-top:
            18px;

          border:
            1px solid
            rgba(
              125,
              151,
              193,
              0.12
            );

          border-radius:
            20px;

          background:
            rgba(
              125,
              151,
              193,
              0.12
            );
        }

        .devHubInfoBar > div {
          padding:
            20px;

          background:
            rgba(
              8,
              17,
              33,
              0.96
            );
        }

        .devHubInfoBar strong {
          display:
            block;

          color:
            #e9f0fc;

          font-size:
            12px;
        }

        .devHubInfoBar span {
          display:
            block;

          margin-top:
            7px;

          color:
            #8295b2;

          font-size:
            11px;

          line-height:
            1.55;
        }

        .devProjectModalBackdrop {
          position:
            fixed;

          z-index:
            1000;

          inset:
            0;

          display:
            grid;

          place-items:
            center;

          padding:
            20px;

          background:
            rgba(
              1,
              6,
              15,
              0.76
            );

          backdrop-filter:
            blur(
              8px
            );
        }

        .devProjectModal {
          width:
            min(
              620px,
              100%
            );

          max-height:
            calc(
              100vh -
              40px
            );

          overflow-y:
            auto;

          padding:
            26px;

          border:
            1px solid
            rgba(
              185,
              133,
              255,
              0.25
            );

          border-radius:
            24px;

          background:
            #091223;

          box-shadow:
            0
            30px
            100px
            rgba(
              0,
              0,
              0,
              0.55
            );
        }

        .devProjectModalHeader {
          display:
            flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap:
            20px;

          margin-bottom:
            22px;
        }

        .devProjectModalHeader span {
          color:
            #c69cff;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.14em;
        }

        .devProjectModalHeader h2 {
          margin:
            6px
            0
            0;

          font-size:
            30px;
        }

        .devProjectModalClose {
          width:
            38px;

          height:
            38px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.1
            );

          border-radius:
            11px;

          background:
            rgba(
              255,
              255,
              255,
              0.04
            );

          color:
            white;

          cursor:
            pointer;

          font-size:
            22px;
        }

        .devProjectForm {
          display:
            grid;

          gap:
            16px;
        }

        .devProjectForm label {
          display:
            grid;

          gap:
            7px;
        }

        .devProjectForm label > span {
          color:
            #9fb1cc;

          font-size:
            11px;

          font-weight:
            800;
        }

        .devProjectForm input,
        .devProjectForm textarea,
        .devProjectForm select {
          width:
            100%;

          min-height:
            43px;

          padding:
            10px
            12px;

          border:
            1px solid
            rgba(
              130,
              158,
              205,
              0.17
            );

          border-radius:
            11px;

          outline:
            none;

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );

          color:
            white;

          font:
            inherit;
        }

        .devProjectForm textarea {
          resize:
            vertical;

          min-height:
            100px;
        }

        .devProjectForm select option {
          background:
            #091223;
        }

        .devProjectFormRow {
          display:
            grid;

          grid-template-columns:
            1fr
            1fr;

          gap:
            12px;
        }

        .devProjectSlugInput {
          display:
            flex;

          align-items:
            center;

          border:
            1px solid
            rgba(
              130,
              158,
              205,
              0.17
            );

          border-radius:
            11px;

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );
        }

        .devProjectSlugInput strong {
          padding-left:
            12px;

          color:
            #7086a5;

          font-size:
            12px;
        }

        .devProjectSlugInput input {
          border:
            0;

          background:
            transparent;
        }

        .devProjectColorRow {
          display:
            flex;

          align-items:
            center;

          gap:
            12px;
        }

        .devProjectColorRow input {
          width:
            52px;

          min-height:
            42px;

          padding:
            4px;

          cursor:
            pointer;
        }

        .devProjectColorRow code {
          color:
            #acbdd5;
        }

        .devProjectCreateError {
          padding:
            11px
            13px;

          border:
            1px solid
            rgba(
              255,
              115,
              135,
              0.2
            );

          border-radius:
            10px;

          background:
            rgba(
              255,
              115,
              135,
              0.07
            );

          color:
            #ffabb9;

          font-size:
            12px;
        }

        .devProjectFormActions {
          display:
            flex;

          justify-content:
            flex-end;

          gap:
            10px;

          margin-top:
            4px;
        }

        .devProjectCancelButton,
        .devProjectSubmitButton {
          min-height:
            42px;

          padding:
            9px
            15px;

          border-radius:
            11px;

          cursor:
            pointer;

          font:
            inherit;

          font-size:
            12px;

          font-weight:
            850;
        }

        .devProjectCancelButton {
          border:
            1px solid
            rgba(
              130,
              158,
              205,
              0.16
            );

          background:
            transparent;

          color:
            #9fb0ca;
        }

        .devProjectSubmitButton {
          border:
            1px solid
            rgba(
              185,
              133,
              255,
              0.34
            );

          background:
            rgba(
              185,
              133,
              255,
              0.16
            );

          color:
            #eadcff;
        }

        @media (
          hover: hover
        ) and (
          pointer: fine
        ) {
          .devProjectCard:hover {
            transform:
              translateY(
                -4px
              );

            border-color:
              color-mix(
                in srgb,
                var(
                  --project-accent
                )
                42%,
                transparent
              );
          }

          .devCreateProjectButton:hover {
            background:
              rgba(
                185,
                133,
                255,
                0.18
              );
          }
        }

        @media (
          max-width:
            900px
        ) {
          .devProjectGrid {
            grid-template-columns:
              1fr;
          }

          .devHubInfoBar {
            grid-template-columns:
              1fr;
          }
        }

        @media (
          max-width:
            700px
        ) {
          .devHubPage {
            padding-top:
              8px;
          }

          .devHubHero {
            align-items:
              flex-start;

            flex-direction:
              column;

            min-height:
              auto;

            padding:
              28px
              22px;

            border-radius:
              24px;
          }

          .devProjectSectionHeader {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .devProjectHeaderActions {
            width:
              100%;

            justify-content:
              space-between;
          }

          .devProjectFormRow {
            grid-template-columns:
              1fr;
          }

          .devProjectCard {
            min-height:
              360px;

            border-radius:
              22px;
          }
        }
      `}</style>
    </DevPageGuard>
  );
}