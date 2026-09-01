"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";

import {
  useParams,
} from "next/navigation";

import DevPageGuard from "../../../../components/dev/DevPageGuard";

import {
  getDevProjectBySlug,
} from "../../../../services/dev-project.service";

import {
  createDevUpdate,
  deleteDevUpdate,
  getDevUpdates,
  updateDevUpdate,
} from "../../../../services/dev-update.service";

import {
  getDevRoadmapItems,
} from "../../../../services/dev-roadmap.service";

import type {
  DevProject,
} from "../../../../types/dev-projects";

import type {
  DevRoadmapItem,
} from "../../../../types/dev-roadmap";

import type {
  DevUpdate,
  DevUpdateInput,
  DevUpdateStatus,
  DevUpdateType,
} from "../../../../types/dev-updates";


type UpdateForm = {
  title: string;

  code: string;

  description: string;

  type: DevUpdateType;

  status: DevUpdateStatus;

  progress: number;

  autoProgress: boolean;

  targetDate: string;

  releaseDate: string;
};


const emptyForm:
  UpdateForm = {
  title: "",

  code: "",

  description: "",

  type:
    "update",

  status:
    "planning",

  progress:
    0,

  autoProgress:
    false,

  targetDate: "",

  releaseDate: "",
};


function typeLabel(
  type:
    DevUpdateType
) {
  switch (type) {
    case "season":
      return "Season";

    case "release":
      return "Release";

    case "hotfix":
      return "Hotfix";

    case "milestone":
      return "Milestone";

    default:
      return "Update";
  }
}


function statusLabel(
  status:
    DevUpdateStatus
) {
  switch (status) {
    case "in_development":
      return "In Development";

    case "testing":
      return "Testing";

    case "ready":
      return "Ready";

    case "released":
      return "Released";

    case "paused":
      return "Paused";

    case "cancelled":
      return "Cancelled";

    default:
      return "Planning";
  }
}


function formatDate(
  date:
    string | null
) {
  if (!date) {
    return "—";
  }


  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  );
}


export default function DevUpdatesPage() {
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
    updates,
    setUpdates,
  ] =
    useState<
      DevUpdate[]
    >([]);


  const [
    roadmapItems,
    setRoadmapItems,
  ] =
    useState<
      DevRoadmapItem[]
    >([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);


  const [
    editingUpdate,
    setEditingUpdate,
  ] =
    useState<
      DevUpdate | null
    >(null);


  const [
    form,
    setForm,
  ] =
    useState<UpdateForm>(
      emptyForm
    );


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    formError,
    setFormError,
  ] =
    useState<
      string | null
    >(null);


  useEffect(() => {
    let alive =
      true;


    async function load() {
      try {
        const loadedProject =
          await getDevProjectBySlug(
            params.project
          );


        if (!loadedProject) {
          throw new Error(
            "Project not found."
          );
        }


        const [
          loadedUpdates,
          loadedRoadmap,
        ] =
          await Promise.all([
            getDevUpdates(
              loadedProject.id
            ),

            getDevRoadmapItems(
              loadedProject.id
            ),
          ]);


        if (!alive) {
          return;
        }


        setProject(
          loadedProject
        );

        setUpdates(
          loadedUpdates
        );

        setRoadmapItems(
          loadedRoadmap
        );
      } catch (
        error
      ) {
        console.error(
          error
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
  }, [
    params.project,
  ]);


  function assignedItems(
    updateId: string
  ) {
    return roadmapItems.filter(
      (
        item
      ) =>
        item.update_id ===
        updateId
    );
  }


  function calculateAutoProgress(
    update:
      DevUpdate
  ) {
    if (
      update.status ===
      "released"
    ) {
      return 100;
    }


    const assigned =
      assignedItems(
        update.id
      );


    if (
      assigned.length ===
      0
    ) {
      return 0;
    }


    return Math.round(
      assigned.reduce(
        (
          total,
          item
        ) =>
          total +
          item.progress,
        0
      ) /
        assigned.length
    );
  }


  function effectiveProgress(
    update:
      DevUpdate
  ) {
    return update.auto_progress
      ? calculateAutoProgress(
          update
        )
      : update.status ===
        "released"
      ? 100
      : update.progress;
  }


  const overallProgress =
    useMemo(
      () => {
        if (
          updates.length ===
          0
        ) {
          return 0;
        }


        return Math.round(
          updates.reduce(
            (
              total,
              update
            ) =>
              total +
              effectiveProgress(
                update
              ),
            0
          ) /
            updates.length
        );
      },
      [
        updates,
        roadmapItems,
      ]
    );


  function openCreate() {
    setEditingUpdate(
      null
    );

    setForm(
      emptyForm
    );

    setFormError(
      null
    );

    setModalOpen(
      true
    );
  }


  function openEdit(
    update:
      DevUpdate
  ) {
    setEditingUpdate(
      update
    );


    setForm({
      title:
        update.title,

      code:
        update.code ??
        "",

      description:
        update.description ??
        "",

      type:
        update.type,

      status:
        update.status,

      progress:
        update.progress,

      autoProgress:
        update.auto_progress,

      targetDate:
        update.target_date ??
        "",

      releaseDate:
        update.release_date ??
        "",
    });


    setFormError(
      null
    );

    setModalOpen(
      true
    );
  }


  function closeModal() {
    if (saving) {
      return;
    }


    setModalOpen(
      false
    );

    setEditingUpdate(
      null
    );

    setForm(
      emptyForm
    );
  }


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    if (!project) {
      return;
    }


    const input:
      DevUpdateInput = {
      title:
        form.title,

      code:
        form.code,

      description:
        form.description,

      type:
        form.type,

      status:
        form.status,

      progress:
        form.progress,

      auto_progress:
        form.autoProgress,

      target_date:
        form.targetDate,

      release_date:
        form.releaseDate,
    };


    try {
      setSaving(
        true
      );


      if (
        editingUpdate
      ) {
        const updated =
          await updateDevUpdate(
            editingUpdate.id,
            input
          );


        setUpdates(
          (
            previous
          ) =>
            previous.map(
              (
                item
              ) =>
                item.id ===
                updated.id
                  ? updated
                  : item
            )
        );
      } else {
        const created =
          await createDevUpdate(
            project.id,
            input
          );


        setUpdates(
          (
            previous
          ) => [
            ...previous,
            created,
          ]
        );
      }


      setModalOpen(
        false
      );

      setEditingUpdate(
        null
      );

      setForm(
        emptyForm
      );
    } catch (
      error
    ) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not save update."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  async function handleDelete(
    update:
      DevUpdate
  ) {
    if (
      !window.confirm(
        `Delete "${update.title}"?`
      )
    ) {
      return;
    }


    try {
      await deleteDevUpdate(
        update.id
      );


      setUpdates(
        (
          previous
        ) =>
          previous.filter(
            (
              item
            ) =>
              item.id !==
              update.id
          )
      );


      setRoadmapItems(
        (
          previous
        ) =>
          previous.map(
            (
              item
            ) =>
              item.update_id ===
              update.id
                ? {
                    ...item,

                    update_id:
                      null,
                  }
                : item
          )
      );
    } catch (
      error
    ) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not delete update."
      );
    }
  }


  if (
    loading ||
    !project
  ) {
    return (
      <DevPageGuard>
        <main className="devUpdatesPage">
          Loading Update Planner...
        </main>
      </DevPageGuard>
    );
  }


  return (
    <DevPageGuard>
      <main
        className="devUpdatesPage"
        style={
          {
            "--update-accent":
              project.accent,
          } as CSSProperties
        }
      >
        <div className="devUpdatesBreadcrumbs">
          <Link href="/dev">
            Development Hub
          </Link>

          <span>/</span>

          <Link
            href={`/dev/${project.slug}`}
          >
            {project.name}
          </Link>

          <span>/</span>

          <strong>
            Updates
          </strong>
        </div>


        <section className="devUpdatesHero">
          <div>
            <span>
              {project.short_name} RELEASE PLANNING
            </span>

            <h1>
              Updates & Seasons
            </h1>

            <p>
              Plan releases and automatically
              calculate update progress from the
              assigned roadmap.
            </p>
          </div>


          <button
            type="button"
            onClick={
              openCreate
            }
          >
            + Create Update
          </button>
        </section>


        <section className="devUpdatesSummary">
          <article>
            <span>
              UPDATES
            </span>

            <strong>
              {updates.length}
            </strong>
          </article>

          <article>
            <span>
              ROADMAP ITEMS
            </span>

            <strong>
              {
                roadmapItems.length
              }
            </strong>
          </article>

          <article>
            <span>
              AUTO PROGRESS
            </span>

            <strong>
              {
                updates.filter(
                  (
                    update
                  ) =>
                    update.auto_progress
                ).length
              }
            </strong>
          </article>

          <article>
            <span>
              OVERALL
            </span>

            <strong>
              {overallProgress}%
            </strong>
          </article>
        </section>


        <section className="devUpdatesGrid">
          {updates.map(
            (
              update
            ) => {
              const assigned =
                assignedItems(
                  update.id
                );


              const progress =
                effectiveProgress(
                  update
                );


              return (
                <article
                  key={
                    update.id
                  }
                  className="devUpdateCard"
                >
                  <div className="devUpdateCardTop">
                    <div>
                      <span className="devUpdateType">
                        {typeLabel(
                          update.type
                        )}
                      </span>

                      <span className="devUpdateStatus">
                        {statusLabel(
                          update.status
                        )}
                      </span>
                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        openEdit(
                          update
                        )
                      }
                    >
                      Edit
                    </button>
                  </div>


                  {update.code ? (
                    <span className="devUpdateCode">
                      {
                        update.code
                      }
                    </span>
                  ) : null}


                  <h2>
                    {
                      update.title
                    }
                  </h2>


                  {update.description ? (
                    <p>
                      {
                        update.description
                      }
                    </p>
                  ) : null}


                  <div className="devUpdateProgressMode">
                    <span>
                      PROGRESS MODE
                    </span>

                    <strong>
                      {update.auto_progress
                        ? "AUTO"
                        : "MANUAL"}
                    </strong>
                  </div>


                  <div className="devUpdateProgress">
                    <div>
                      <span>
                        Progress
                      </span>

                      <strong>
                        {progress}%
                      </strong>
                    </div>

                    <div className="track">
                      <div
                        style={{
                          width:
                            `${progress}%`,
                        }}
                      />
                    </div>
                  </div>


                  <div className="devUpdateDates">
                    <div>
                      <span>
                        TARGET
                      </span>

                      <strong>
                        {formatDate(
                          update.target_date
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        RELEASE
                      </span>

                      <strong>
                        {formatDate(
                          update.release_date
                        )}
                      </strong>
                    </div>
                  </div>


                  <div className="devUpdateRoadmap">
                    <header>
                      <span>
                        ASSIGNED ROADMAP
                      </span>

                      <strong>
                        {
                          assigned.length
                        }
                      </strong>
                    </header>


                    {assigned.length ===
                    0 ? (
                      <div className="devUpdateNoRoadmap">
                        No roadmap items assigned.
                      </div>
                    ) : (
                      assigned.map(
                        (
                          item
                        ) => (
                          <Link
                            key={
                              item.id
                            }
                            href={`/dev/${project.slug}/roadmap`}
                            className="devUpdateRoadmapItem"
                          >
                            <div>
                              <strong>
                                {
                                  item.title
                                }
                              </strong>

                              <span>
                                {
                                  item.status
                                }
                              </span>
                            </div>

                            <strong>
                              {
                                item.progress
                              }
                              %
                            </strong>
                          </Link>
                        )
                      )
                    )}
                  </div>


                  <footer>
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          update
                        )
                      }
                    >
                      Delete Update
                    </button>
                  </footer>
                </article>
              );
            }
          )}
        </section>


        {modalOpen ? (
          <div className="devUpdateModalBackdrop">
            <div className="devUpdateModal">
              <header>
                <div>
                  <span>
                    UPDATE / SEASON
                  </span>

                  <h2>
                    {editingUpdate
                      ? "Edit Update"
                      : "Create Update"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                >
                  ×
                </button>
              </header>


              <form
                onSubmit={
                  handleSubmit
                }
              >
                <label>
                  <span>
                    Title
                  </span>

                  <input
                    value={
                      form.title
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        title:
                          event.target.value,
                      })
                    }
                    required
                  />
                </label>


                <div className="devUpdateFormRow">
                  <label>
                    <span>
                      Code / Version
                    </span>

                    <input
                      value={
                        form.code
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          code:
                            event.target.value,
                        })
                      }
                    />
                  </label>


                  <label>
                    <span>
                      Type
                    </span>

                    <select
                      value={
                        form.type
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          type:
                            event.target
                              .value as DevUpdateType,
                        })
                      }
                    >
                      <option value="season">
                        Season
                      </option>

                      <option value="update">
                        Update
                      </option>

                      <option value="release">
                        Release
                      </option>

                      <option value="hotfix">
                        Hotfix
                      </option>

                      <option value="milestone">
                        Milestone
                      </option>
                    </select>
                  </label>
                </div>


                <label>
                  <span>
                    Description
                  </span>

                  <textarea
                    rows={
                      4
                    }
                    value={
                      form.description
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        description:
                          event.target.value,
                      })
                    }
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
                      setForm({
                        ...form,

                        status:
                          event.target
                            .value as DevUpdateStatus,
                      })
                    }
                  >
                    <option value="planning">
                      Planning
                    </option>

                    <option value="in_development">
                      In Development
                    </option>

                    <option value="testing">
                      Testing
                    </option>

                    <option value="ready">
                      Ready
                    </option>

                    <option value="released">
                      Released
                    </option>

                    <option value="paused">
                      Paused
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </label>


                <label className="devAutoProgressToggle">
                  <div>
                    <strong>
                      Auto Progress
                    </strong>

                    <span>
                      Calculate progress from all
                      assigned roadmap items.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      form.autoProgress
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        autoProgress:
                          event.target.checked,
                      })
                    }
                  />
                </label>


                {!form.autoProgress ? (
                  <label>
                    <div className="devUpdateRangeHeader">
                      <span>
                        Manual Progress
                      </span>

                      <strong>
                        {
                          form.progress
                        }
                        %
                      </strong>
                    </div>

                    <input
                      type="range"
                      min={
                        0
                      }
                      max={
                        100
                      }
                      step={
                        5
                      }
                      value={
                        form.progress
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          progress:
                            Number(
                              event.target.value
                            ),
                        })
                      }
                    />
                  </label>
                ) : (
                  <div className="devAutoProgressInfo">
                    The displayed progress will be
                    calculated automatically from
                    assigned roadmap items.
                  </div>
                )}


                <div className="devUpdateFormRow">
                  <label>
                    <span>
                      Target Date
                    </span>

                    <input
                      type="date"
                      value={
                        form.targetDate
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          targetDate:
                            event.target.value,
                        })
                      }
                    />
                  </label>


                  <label>
                    <span>
                      Release Date
                    </span>

                    <input
                      type="date"
                      value={
                        form.releaseDate
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          releaseDate:
                            event.target.value,
                        })
                      }
                    />
                  </label>
                </div>


                {formError ? (
                  <div className="devUpdateFormError">
                    {
                      formError
                    }
                  </div>
                ) : null}


                <div className="devUpdateFormActions">
                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? "Saving..."
                      : "Save Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}


        <style jsx global>{`
          .devUpdatesPage {
            --update-accent:
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

          .devUpdatesBreadcrumbs {
            display:
              flex;

            flex-wrap:
              wrap;

            gap:
              9px;

            margin-bottom:
              16px;

            color:
              #7186a7;

            font-size:
              11px;
          }

          .devUpdatesBreadcrumbs a {
            color:
              #93a7c6;

            text-decoration:
              none;
          }

          .devUpdatesHero {
            display:
              flex;

            align-items:
              flex-end;

            justify-content:
              space-between;

            gap:
              25px;

            padding:
              42px;

            border:
              1px solid
              color-mix(
                in srgb,
                var(
                  --update-accent
                )
                25%,
                transparent
              );

            border-radius:
              26px;

            background:
              rgba(
                8,
                17,
                33,
                0.94
              );
          }

          .devUpdatesHero > div > span {
            color:
              var(
                --update-accent
              );

            font-size:
              10px;

            font-weight:
              900;
          }

          .devUpdatesHero h1 {
            margin:
              8px
              0
              0;

            font-size:
              52px;
          }

          .devUpdatesHero p {
            color:
              #91a5c2;
          }

          .devUpdatesHero button {
            padding:
              11px
              15px;

            border:
              1px solid
              color-mix(
                in srgb,
                var(
                  --update-accent
                )
                35%,
                transparent
              );

            border-radius:
              11px;

            background:
              color-mix(
                in srgb,
                var(
                  --update-accent
                )
                13%,
                transparent
              );

            color:
              white;

            cursor:
              pointer;

            font-weight:
              800;
          }

          .devUpdatesSummary {
            display:
              grid;

            grid-template-columns:
              repeat(
                4,
                1fr
              );

            gap:
              12px;

            margin-top:
              16px;
          }

          .devUpdatesSummary article {
            padding:
              17px;

            border:
              1px solid
              rgba(
                130,
                158,
                205,
                0.13
              );

            border-radius:
              15px;

            background:
              rgba(
                8,
                17,
                33,
                0.88
              );
          }

          .devUpdatesSummary span {
            color:
              #7185a4;

            font-size:
              9px;

            font-weight:
              900;
          }

          .devUpdatesSummary strong {
            display:
              block;

            margin-top:
              7px;

            font-size:
              25px;
          }

          .devUpdatesGrid {
            display:
              grid;

            grid-template-columns:
              repeat(
                2,
                1fr
              );

            gap:
              15px;

            margin-top:
              18px;
          }

          .devUpdateCard {
            padding:
              22px;

            border:
              1px solid
              rgba(
                130,
                158,
                205,
                0.13
              );

            border-radius:
              19px;

            background:
              rgba(
                8,
                17,
                33,
                0.91
              );
          }

          .devUpdateCardTop {
            display:
              flex;

            justify-content:
              space-between;
          }

          .devUpdateCardTop > div {
            display:
              flex;

            gap:
              7px;
          }

          .devUpdateCardTop button {
            border:
              0;

            background:
              transparent;

            color:
              #91a5c2;

            cursor:
              pointer;
          }

          .devUpdateType,
          .devUpdateStatus {
            padding:
              5px
              7px;

            border-radius:
              7px;

            background:
              rgba(
                255,
                255,
                255,
                0.04
              );

            color:
              #94a8c5;

            font-size:
              8px;

            font-weight:
              900;
          }

          .devUpdateCode {
            display:
              block;

            margin-top:
              18px;

            color:
              var(
                --update-accent
              );

            font-size:
              10px;

            font-weight:
              900;
          }

          .devUpdateCard h2 {
            margin:
              6px
              0
              0;

            font-size:
              27px;
          }

          .devUpdateCard > p {
            color:
              #8296b4;

            font-size:
              12px;

            line-height:
              1.6;
          }

          .devUpdateProgressMode {
            display:
              flex;

            justify-content:
              space-between;

            margin-top:
              17px;

            padding:
              9px
              10px;

            border-radius:
              9px;

            background:
              rgba(
                255,
                255,
                255,
                0.025
              );
          }

          .devUpdateProgressMode span {
            color:
              #687d9b;

            font-size:
              8px;

            font-weight:
              900;
          }

          .devUpdateProgressMode strong {
            color:
              var(
                --update-accent
              );

            font-size:
              9px;
          }

          .devUpdateProgress {
            margin-top:
              14px;
          }

          .devUpdateProgress > div:first-child {
            display:
              flex;

            justify-content:
              space-between;

            color:
              #7488a6;

            font-size:
              9px;
          }

          .track {
            overflow:
              hidden;

            height:
              5px;

            margin-top:
              7px;

            border-radius:
              999px;

            background:
              rgba(
                255,
                255,
                255,
                0.06
              );
          }

          .track div {
            height:
              100%;

            background:
              var(
                --update-accent
              );
          }

          .devUpdateDates {
            display:
              grid;

            grid-template-columns:
              1fr
              1fr;

            gap:
              10px;

            margin-top:
              16px;
          }

          .devUpdateDates > div {
            padding:
              10px;

            border-radius:
              9px;

            background:
              rgba(
                255,
                255,
                255,
                0.025
              );
          }

          .devUpdateDates span,
          .devUpdateDates strong {
            display:
              block;
          }

          .devUpdateDates span {
            color:
              #617695;

            font-size:
              7px;

            font-weight:
              900;
          }

          .devUpdateDates strong {
            margin-top:
              4px;

            color:
              #a2b4cd;

            font-size:
              10px;
          }

          .devUpdateRoadmap {
            margin-top:
              18px;

            border-top:
              1px solid
              rgba(
                130,
                158,
                205,
                0.08
              );

            padding-top:
              15px;
          }

          .devUpdateRoadmap > header {
            display:
              flex;

            justify-content:
              space-between;

            margin-bottom:
              9px;
          }

          .devUpdateRoadmap > header span {
            color:
              #657a99;

            font-size:
              8px;

            font-weight:
              900;
          }

          .devUpdateRoadmap > header strong {
            color:
              var(
                --update-accent
              );

            font-size:
              10px;
          }

          .devUpdateRoadmapItem {
            display:
              flex;

            align-items:
              center;

            justify-content:
              space-between;

            gap:
              12px;

            margin-top:
              7px;

            padding:
              10px;

            border:
              1px solid
              rgba(
                130,
                158,
                205,
                0.1
              );

            border-radius:
              9px;

            background:
              rgba(
                255,
                255,
                255,
                0.02
              );

            color:
              white;

            text-decoration:
              none;
          }

          .devUpdateRoadmapItem > div strong,
          .devUpdateRoadmapItem > div span {
            display:
              block;
          }

          .devUpdateRoadmapItem > div strong {
            font-size:
              11px;
          }

          .devUpdateRoadmapItem > div span {
            margin-top:
              3px;

            color:
              #6d829f;

            font-size:
              8px;
          }

          .devUpdateRoadmapItem > strong {
            color:
              var(
                --update-accent
              );

            font-size:
              11px;
          }

          .devUpdateNoRoadmap {
            padding:
              10px;

            color:
              #607593;

            font-size:
              10px;
          }

          .devUpdateCard > footer {
            margin-top:
              15px;

            text-align:
              right;
          }

          .devUpdateCard > footer button {
            border:
              0;

            background:
              transparent;

            color:
              #b26d79;

            cursor:
              pointer;

            font-size:
              9px;
          }

          .devUpdateModalBackdrop {
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
                0.8
              );
          }

          .devUpdateModal {
            width:
              min(
                620px,
                100%
              );

            max-height:
              90vh;

            overflow-y:
              auto;

            padding:
              25px;

            border:
              1px solid
              rgba(
                185,
                133,
                255,
                0.24
              );

            border-radius:
              22px;

            background:
              #091223;
          }

          .devUpdateModal > header {
            display:
              flex;

            justify-content:
              space-between;
          }

          .devUpdateModal > header span {
            color:
              var(
                --update-accent
              );

            font-size:
              9px;

            font-weight:
              900;
          }

          .devUpdateModal > header button {
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
              10px;

            background:
              transparent;

            color:
              white;
          }

          .devUpdateModal form {
            display:
              grid;

            gap:
              15px;

            margin-top:
              20px;
          }

          .devUpdateModal label {
            display:
              grid;

            gap:
              7px;
          }

          .devUpdateModal label > span {
            color:
              #9fb1cc;

            font-size:
              11px;

            font-weight:
              800;
          }

          .devUpdateModal input,
          .devUpdateModal textarea,
          .devUpdateModal select {
            width:
              100%;

            padding:
              10px;

            border:
              1px solid
              rgba(
                130,
                158,
                205,
                0.17
              );

            border-radius:
              10px;

            background:
              rgba(
                255,
                255,
                255,
                0.035
              );

            color:
              white;
          }

          .devUpdateFormRow {
            display:
              grid;

            grid-template-columns:
              1fr
              1fr;

            gap:
              12px;
          }

          .devAutoProgressToggle {
            display:
              flex !important;

            align-items:
              center;

            justify-content:
              space-between;

            padding:
              13px;

            border:
              1px solid
              rgba(
                130,
                158,
                205,
                0.13
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
          }

          .devAutoProgressToggle div span {
            display:
              block;

            margin-top:
              4px;

            color:
              #7085a3;

            font-size:
              9px;
          }

          .devAutoProgressToggle input {
            width:
              auto;
          }

          .devUpdateRangeHeader {
            display:
              flex;

            justify-content:
              space-between;
          }

          .devAutoProgressInfo {
            padding:
              10px;

            border:
              1px solid
              rgba(
                110,
                231,
                168,
                0.13
              );

            border-radius:
              9px;

            color:
              #82d5aa;

            font-size:
              10px;
          }

          .devUpdateFormError {
            color:
              #ff9dad;
          }

          .devUpdateFormActions {
            display:
              flex;

            justify-content:
              flex-end;

            gap:
              10px;
          }

          .devUpdateFormActions button {
            padding:
              10px
              14px;

            border:
              1px solid
              rgba(
                130,
                158,
                205,
                0.17
              );

            border-radius:
              10px;

            background:
              rgba(
                255,
                255,
                255,
                0.04
              );

            color:
              white;
          }

          @media (
            max-width:
              850px
          ) {
            .devUpdatesGrid {
              grid-template-columns:
                1fr;
            }

            .devUpdatesSummary {
              grid-template-columns:
                1fr
                1fr;
            }

            .devUpdatesHero {
              align-items:
                flex-start;

              flex-direction:
                column;

              padding:
                25px;
            }

            .devUpdateFormRow {
              grid-template-columns:
                1fr;
            }
          }
        `}</style>
      </main>
    </DevPageGuard>
  );
}