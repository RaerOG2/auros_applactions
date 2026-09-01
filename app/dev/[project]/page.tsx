"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";

import {
  useParams,
} from "next/navigation";

import DevPageGuard from "../../../components/dev/DevPageGuard";

import {
  getDevProjectBySlug,
} from "../../../services/dev-project.service";

import type {
  DevProject,
  DevProjectModule,
} from "../../../types/dev-projects";


function moduleHref(
  projectSlug: string,
  module: DevProjectModule
) {
  const title =
    module.title
      .trim()
      .toLowerCase();


  if (
    title ===
    "roadmap"
  ) {
    return `/dev/${projectSlug}/roadmap`;
  }


  if (
    title ===
      "seasons & updates" ||
    title ===
      "updates" ||
    title ===
      "update planner"
  ) {
    return `/dev/${projectSlug}/updates`;
  }


  if (
    title ===
    "tasks"
  ) {
    return `/dev/${projectSlug}/tasks`;
  }


  if (
    title ===
      "known issues" ||
    title ===
      "known issue"
  ) {
    return `/dev/${projectSlug}/known-issues`;
  }


  if (
    title ===
      "notes" ||
    title ===
      "internal notes"
  ) {
    return `/dev/${projectSlug}/notes`;
  }


  if (
    title ===
      "features" ||
    title ===
      "feature"
  ) {
    return `/dev/${projectSlug}/features`;
  }


  return null;
}


export default function DevProjectPage() {
  const params =
    useParams<{
      project: string;
    }>();


  const [
    project,
    setProject,
  ] =
    useState<
      DevProject | null
    >(null);


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    );


  useEffect(
    () => {
      let alive =
        true;


      async function load() {
        try {
          setLoading(
            true
          );

          setError(
            null
          );


          const loaded =
            await getDevProjectBySlug(
              params.project
            );


          if (!alive) {
            return;
          }


          setProject(
            loaded
          );
        } catch (
          loadError
        ) {
          console.error(
            "DEV PROJECT LOAD ERROR:",
            loadError
          );


          if (!alive) {
            return;
          }


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load project."
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
    },
    [
      params.project,
    ]
  );


  if (loading) {
    return (
      <DevPageGuard>
        <main className="devProjectPage">
          <div className="devProjectState">
            Loading development project...
          </div>

          <ProjectStyles />
        </main>
      </DevPageGuard>
    );
  }


  if (
    error ||
    !project
  ) {
    return (
      <DevPageGuard>
        <main className="devProjectPage">
          <section className="devProjectMissing">
            <span>
              UNKNOWN PROJECT
            </span>

            <h1>
              Project not found
            </h1>

            <p>
              {error ||
                "This development project does not exist or has not been configured yet."}
            </p>

            <Link href="/dev">
              Back to Development Hub
            </Link>
          </section>

          <ProjectStyles />
        </main>
      </DevPageGuard>
    );
  }


  return (
    <DevPageGuard>
      <main
        className="devProjectPage"
        style={
          {
            "--dev-project-accent":
              project.accent,
          } as CSSProperties
        }
      >
        <div className="devProjectBreadcrumbs">
          <Link href="/dev">
            Development Hub
          </Link>

          <span>
            /
          </span>

          <strong>
            {project.name}
          </strong>
        </div>


        <section className="devProjectHero">
          <div className="devProjectIdentity">
            <div className="devProjectIdentityIcon">
              {project.short_name}
            </div>

            <div>
              <div className="devProjectEyebrow">
                DEVELOPMENT PROJECT
              </div>

              <h1>
                {project.name}
              </h1>

              <p>
                {project.description ||
                  "Internal Auros development project."}
              </p>
            </div>
          </div>


          <div className="devProjectLiveBadge">
            <span />

            {project.status
              .replace(
                "_",
                " "
              )
              .toUpperCase()}
          </div>
        </section>


        <section className="devProjectOverview">
          <div className="devProjectOverviewHeader">
            <div>
              <span>
                PROJECT MODULES
              </span>

              <h2>
                Development workspace
              </h2>
            </div>

            <Link
              href="/dev"
              className="devProjectSwitch"
            >
              Switch Project
            </Link>
          </div>


          <div className="devProjectModuleGrid">
            {project.modules.map(
              (
                module
              ) => {
                const href =
                  moduleHref(
                    project.slug,
                    module
                  );


                const content = (
                  <>
                    <div className="devProjectModuleTop">
                      <div className="devProjectModuleIcon">
                        {module.title.slice(
                          0,
                          1
                        )}
                      </div>


                      <span className="devProjectModuleStatus">
                        {href
                          ? "READY"
                          : module.status ===
                            "ready"
                          ? "READY"
                          : "COMING NEXT"}
                      </span>
                    </div>


                    <h3>
                      {module.title}
                    </h3>


                    <p>
                      {
                        module.description
                      }
                    </p>


                    <div className="devProjectModuleFooter">
                      {href
                        ? "Open Module →"
                        : module.status ===
                          "ready"
                        ? "Open Module"
                        : "Module planned"}
                    </div>
                  </>
                );


                if (href) {
                  return (
                    <Link
                      key={
                        module.title
                      }
                      href={
                        href
                      }
                      className="devProjectModuleCard devProjectModuleLink"
                    >
                      {content}
                    </Link>
                  );
                }


                return (
                  <article
                    key={
                      module.title
                    }
                    className="devProjectModuleCard"
                  >
                    {content}
                  </article>
                );
              }
            )}
          </div>
        </section>


        <ProjectStyles />
      </main>
    </DevPageGuard>
  );
}


function ProjectStyles() {
  return (
    <style jsx global>{`
      .devProjectPage {
        --dev-project-accent:
          #b985ff;

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

      .devProjectBreadcrumbs {
        display:
          flex;

        align-items:
          center;

        gap:
          9px;

        margin:
          4px
          4px
          16px;

        color:
          #7186a7;

        font-size:
          11px;

        font-weight:
          750;
      }

      .devProjectBreadcrumbs a {
        color:
          #93a7c6;

        text-decoration:
          none;
      }

      .devProjectBreadcrumbs strong {
        color:
          var(
            --dev-project-accent
          );
      }

      .devProjectHero {
        display:
          flex;

        align-items:
          flex-end;

        justify-content:
          space-between;

        gap:
          30px;

        padding:
          clamp(
            28px,
            5vw,
            50px
          );

        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --dev-project-accent
            )
            24%,
            transparent
          );

        border-radius:
          28px;

        background:
          radial-gradient(
            circle
            at
            85%
            15%,
            color-mix(
              in srgb,
              var(
                --dev-project-accent
              )
              19%,
              transparent
            ),
            transparent
            35%
          ),
          linear-gradient(
            135deg,
            rgba(
              13,
              25,
              46,
              0.98
            ),
            rgba(
              8,
              17,
              33,
              0.97
            )
          );
      }

      .devProjectIdentity {
        display:
          flex;

        align-items:
          flex-start;

        gap:
          24px;

        max-width:
          900px;
      }

      .devProjectIdentityIcon {
        flex:
          0
          0
          auto;

        width:
          76px;

        height:
          76px;

        display:
          grid;

        place-items:
          center;

        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --dev-project-accent
            )
            40%,
            transparent
          );

        border-radius:
          22px;

        background:
          color-mix(
            in srgb,
            var(
              --dev-project-accent
            )
            12%,
            transparent
          );

        color:
          var(
            --dev-project-accent
          );

        font-size:
          19px;

        font-weight:
          950;
      }

      .devProjectEyebrow {
        margin-bottom:
          10px;

        color:
          var(
            --dev-project-accent
          );

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          0.15em;
      }

      .devProjectHero h1 {
        margin:
          0;

        font-size:
          clamp(
            36px,
            6vw,
            62px
          );

        letter-spacing:
          -0.045em;

        line-height:
          1;
      }

      .devProjectHero p {
        max-width:
          720px;

        margin:
          17px
          0
          0;

        color:
          #a1b1ca;

        line-height:
          1.7;
      }

      .devProjectLiveBadge {
        flex-shrink:
          0;

        display:
          inline-flex;

        align-items:
          center;

        gap:
          8px;

        padding:
          10px
          13px;

        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --dev-project-accent
            )
            30%,
            transparent
          );

        border-radius:
          999px;

        color:
          #d7e2f2;

        font-size:
          10px;

        font-weight:
          850;

        letter-spacing:
          0.08em;
      }

      .devProjectLiveBadge span {
        width:
          7px;

        height:
          7px;

        border-radius:
          999px;

        background:
          var(
            --dev-project-accent
          );

        box-shadow:
          0
          0
          14px
          var(
            --dev-project-accent
          );
      }

      .devProjectOverview {
        margin-top:
          32px;
      }

      .devProjectOverviewHeader {
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

      .devProjectOverviewHeader span {
        color:
          #7e92b1;

        font-size:
          10px;

        font-weight:
          850;

        letter-spacing:
          0.13em;
      }

      .devProjectOverviewHeader h2 {
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

      .devProjectSwitch {
        padding:
          9px
          12px;

        border:
          1px solid
          rgba(
            125,
            151,
            193,
            0.15
          );

        border-radius:
          11px;

        background:
          rgba(
            255,
            255,
            255,
            0.025
          );

        color:
          #a5b6cf;

        text-decoration:
          none;

        font-size:
          11px;

        font-weight:
          800;
      }

      .devProjectModuleGrid {
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
          15px;
      }

      .devProjectModuleCard {
        min-height:
          260px;

        display:
          flex;

        flex-direction:
          column;

        padding:
          22px;

        border:
          1px solid
          rgba(
            125,
            151,
            193,
            0.13
          );

        border-radius:
          20px;

        background:
          rgba(
            8,
            17,
            33,
            0.88
          );

        color:
          white;

        text-decoration:
          none;

        transition:
          transform
          160ms
          ease,
          border-color
          160ms
          ease,
          background
          160ms
          ease;
      }

      .devProjectModuleLink {
        cursor:
          pointer;
      }

      .devProjectModuleTop {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          14px;
      }

      .devProjectModuleIcon {
        width:
          38px;

        height:
          38px;

        display:
          grid;

        place-items:
          center;

        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --dev-project-accent
            )
            25%,
            transparent
          );

        border-radius:
          12px;

        background:
          color-mix(
            in srgb,
            var(
              --dev-project-accent
            )
            8%,
            transparent
          );

        color:
          var(
            --dev-project-accent
          );

        font-size:
          12px;

        font-weight:
          900;
      }

      .devProjectModuleStatus {
        color:
          #7286a5;

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.1em;
      }

      .devProjectModuleCard h3 {
        margin:
          24px
          0
          0;

        font-size:
          20px;

        letter-spacing:
          -0.025em;
      }

      .devProjectModuleCard p {
        margin:
          10px
          0
          0;

        color:
          #899dbb;

        font-size:
          13px;

        line-height:
          1.65;
      }

      .devProjectModuleFooter {
        margin-top:
          auto;

        padding-top:
          20px;

        color:
          var(
            --dev-project-accent
          );

        font-size:
          10px;

        font-weight:
          800;
      }

      .devProjectState,
      .devProjectMissing {
        margin:
          40px
          auto;

        padding:
          32px;

        border:
          1px solid
          rgba(
            125,
            151,
            193,
            0.16
          );

        border-radius:
          24px;

        background:
          rgba(
            8,
            17,
            33,
            0.94
          );

        color:
          #91a5c3;
      }

      .devProjectMissing {
        max-width:
          720px;
      }

      .devProjectMissing > span {
        color:
          #b985ff;

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          0.13em;
      }

      .devProjectMissing h1 {
        margin:
          10px
          0
          0;

        color:
          white;
      }

      .devProjectMissing p {
        line-height:
          1.65;
      }

      .devProjectMissing a {
        display:
          inline-flex;

        margin-top:
          10px;

        color:
          #c7a5ff;

        font-weight:
          800;

        text-decoration:
          none;
      }

      @media (
        hover: hover
      ) and (
        pointer: fine
      ) {
        .devProjectModuleLink:hover {
          transform:
            translateY(
              -3px
            );

          border-color:
            color-mix(
              in srgb,
              var(
                --dev-project-accent
              )
              35%,
              transparent
            );
        }
      }

      @media (
        max-width:
          1000px
      ) {
        .devProjectModuleGrid {
          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );
        }
      }

      @media (
        max-width:
          700px
      ) {
        .devProjectHero,
        .devProjectIdentity {
          flex-direction:
            column;
        }

        .devProjectHero {
          align-items:
            flex-start;

          padding:
            26px
            22px;

          border-radius:
            22px;
        }

        .devProjectIdentity {
          gap:
            18px;
        }

        .devProjectIdentityIcon {
          width:
            58px;

          height:
            58px;
        }

        .devProjectOverviewHeader {
          align-items:
            flex-start;

          flex-direction:
            column;
        }

        .devProjectModuleGrid {
          grid-template-columns:
            1fr;
        }
      }

      @media (
        prefers-reduced-motion:
          reduce
      ) {
        .devProjectModuleCard {
          transition:
            none;
        }
      }
    `}</style>
  );
}