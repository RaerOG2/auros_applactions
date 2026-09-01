"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type DragEvent,
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
  createDevRoadmapItem,
  deleteDevRoadmapItem,
  getDevRoadmapItems,
  updateDevRoadmapItem,
  updateDevRoadmapItemStatus,
} from "../../../../services/dev-roadmap.service";

import {
  getDevUpdates,
} from "../../../../services/dev-update.service";

import type {
  DevProject,
} from "../../../../types/dev-projects";

import type {
  DevRoadmapItem,
  DevRoadmapItemInput,
  DevRoadmapPriority,
  DevRoadmapStatus,
} from "../../../../types/dev-roadmap";

import type {
  DevUpdate,
} from "../../../../types/dev-updates";


type RoadmapForm = {
  title: string;

  description: string;

  status: DevRoadmapStatus;

  priority: DevRoadmapPriority;

  progress: number;

  target: string;

  updateId: string;
};


const emptyForm:
  RoadmapForm = {
  title: "",

  description: "",

  status:
    "planned",

  priority:
    "medium",

  progress:
    0,

  target: "",

  updateId: "",
};


const columns: {
  status: DevRoadmapStatus;

  title: string;

  description: string;
}[] = [
  {
    status:
      "planned",

    title:
      "Planned",

    description:
      "Scheduled or planned work",
  },

  {
    status:
      "in_progress",

    title:
      "In Progress",

    description:
      "Currently being developed",
  },

  {
    status:
      "testing",

    title:
      "Testing",

    description:
      "Implementation under testing",
  },

  {
    status:
      "done",

    title:
      "Done",

    description:
      "Completed development",
  },

  {
    status:
      "blocked",

    title:
      "Blocked",

    description:
      "Currently blocked",
  },
];


function priorityLabel(
  priority:
    DevRoadmapPriority
) {
  return priority.toUpperCase();
}


function statusLabel(
  status:
    DevRoadmapStatus
) {
  switch (status) {
    case "in_progress":
      return "In Progress";

    case "testing":
      return "Testing";

    case "done":
      return "Done";

    case "blocked":
      return "Blocked";

    default:
      return "Planned";
  }
}


export default function DevRoadmapPage() {
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
    items,
    setItems,
  ] =
    useState<
      DevRoadmapItem[]
    >([]);


  const [
    updates,
    setUpdates,
  ] =
    useState<
      DevUpdate[]
    >([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);


  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);


  const [
    editingItem,
    setEditingItem,
  ] =
    useState<
      DevRoadmapItem | null
    >(null);


  const [
    form,
    setForm,
  ] =
    useState<RoadmapForm>(
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


  const [
    draggedItemId,
    setDraggedItemId,
  ] =
    useState<
      string | null
    >(null);


  const [
    dragOverStatus,
    setDragOverStatus,
  ] =
    useState<
      DevRoadmapStatus | null
    >(null);


  const [
    savingItemIds,
    setSavingItemIds,
  ] =
    useState<
      string[]
    >([]);


  useEffect(() => {
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


        const loadedProject =
          await getDevProjectBySlug(
            params.project
          );


        if (!loadedProject) {
          throw new Error(
            "Development project not found."
          );
        }


        const [
          loadedItems,
          loadedUpdates,
        ] =
          await Promise.all([
            getDevRoadmapItems(
              loadedProject.id
            ),

            getDevUpdates(
              loadedProject.id
            ),
          ]);


        if (!alive) {
          return;
        }


        setProject(
          loadedProject
        );

        setItems(
          loadedItems
        );

        setUpdates(
          loadedUpdates
        );
      } catch (
        loadError
      ) {
        console.error(
          "ROADMAP LOAD ERROR:",
          loadError
        );


        if (!alive) {
          return;
        }


        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load roadmap."
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


  const overallProgress =
    useMemo(
      () => {
        if (
          items.length ===
          0
        ) {
          return 0;
        }


        return Math.round(
          items.reduce(
            (
              total,
              item
            ) =>
              total +
              item.progress,
            0
          ) /
            items.length
        );
      },
      [
        items,
      ]
    );


  const completedCount =
    items.filter(
      (
        item
      ) =>
        item.status ===
        "done"
    ).length;


  const activeCount =
    items.filter(
      (
        item
      ) =>
        item.status ===
          "in_progress" ||
        item.status ===
          "testing"
    ).length;


  function findUpdate(
    updateId:
      string | null
  ) {
    if (!updateId) {
      return null;
    }


    return (
      updates.find(
        (
          update
        ) =>
          update.id ===
          updateId
      ) ??
      null
    );
  }


  function setItemSaving(
    itemId: string,
    value: boolean
  ) {
    setSavingItemIds(
      (
        previous
      ) =>
        value
          ? previous.includes(
              itemId
            )
            ? previous
            : [
                ...previous,
                itemId,
              ]
          : previous.filter(
              (
                id
              ) =>
                id !==
                itemId
            )
    );
  }


  function openCreate() {
    setEditingItem(
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
    item:
      DevRoadmapItem
  ) {
    setEditingItem(
      item
    );


    setForm({
      title:
        item.title,

      description:
        item.description ??
        "",

      status:
        item.status,

      priority:
        item.priority,

      progress:
        item.progress,

      target:
        item.target ??
        "",

      updateId:
        item.update_id ??
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

    setEditingItem(
      null
    );

    setForm(
      emptyForm
    );

    setFormError(
      null
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


    if (
      !form.title.trim()
    ) {
      setFormError(
        "Title is required."
      );

      return;
    }


    const input:
      DevRoadmapItemInput = {
      title:
        form.title,

      description:
        form.description,

      status:
        form.status,

      priority:
        form.priority,

      progress:
        form.status ===
        "done"
          ? 100
          : form.progress,

      target:
        form.target,

      update_id:
        form.updateId ||
        null,
    };


    try {
      setSaving(
        true
      );

      setFormError(
        null
      );


      if (
        editingItem
      ) {
        const updated =
          await updateDevRoadmapItem(
            editingItem.id,
            input
          );


        setItems(
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
          await createDevRoadmapItem(
            project.id,
            input
          );


        setItems(
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

      setEditingItem(
        null
      );

      setForm(
        emptyForm
      );
    } catch (
      saveError
    ) {
      console.error(
        "ROADMAP SAVE ERROR:",
        saveError
      );


      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save roadmap item."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  async function moveItem(
    item:
      DevRoadmapItem,

    status:
      DevRoadmapStatus
  ) {
    if (
      item.status ===
        status ||
      savingItemIds.includes(
        item.id
      )
    ) {
      return;
    }


    const original =
      item;


    const optimistic:
      DevRoadmapItem = {
      ...item,

      status,

      progress:
        status ===
        "done"
          ? 100
          : item.progress,
    };


    setItemSaving(
      item.id,
      true
    );


    setItems(
      (
        previous
      ) =>
        previous.map(
          (
            existing
          ) =>
            existing.id ===
            item.id
              ? optimistic
              : existing
        )
    );


    try {
      const updated =
        await updateDevRoadmapItemStatus(
          item,
          status
        );


      setItems(
        (
          previous
        ) =>
          previous.map(
            (
              existing
            ) =>
              existing.id ===
              updated.id
                ? updated
                : existing
          )
      );
    } catch (
      moveError
    ) {
      setItems(
        (
          previous
        ) =>
          previous.map(
            (
              existing
            ) =>
              existing.id ===
              original.id
                ? original
                : existing
          )
      );


      window.alert(
        moveError instanceof Error
          ? moveError.message
          : "Could not move item."
      );
    } finally {
      setItemSaving(
        item.id,
        false
      );
    }
  }


  async function handleDelete(
    item:
      DevRoadmapItem
  ) {
    if (
      !window.confirm(
        `Delete "${item.title}"?`
      )
    ) {
      return;
    }


    try {
      await deleteDevRoadmapItem(
        item.id
      );


      setItems(
        (
          previous
        ) =>
          previous.filter(
            (
              existing
            ) =>
              existing.id !==
              item.id
          )
      );
    } catch (
      deleteError
    ) {
      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete item."
      );
    }
  }


  if (loading) {
    return (
      <DevPageGuard>
        <main className="devRoadmapPage">
          Loading Roadmap...
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
        <main className="devRoadmapPage">
          {error ||
            "Project not found."}
        </main>
      </DevPageGuard>
    );
  }


  return (
    <DevPageGuard>
      <main
        className="devRoadmapPage"
        style={
          {
            "--roadmap-accent":
              project.accent,
          } as CSSProperties
        }
      >
        <div className="devRoadmapBreadcrumbs">
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
            Roadmap
          </strong>
        </div>


        <section className="devRoadmapHero">
          <div>
            <span>
              {project.short_name} DEVELOPMENT
            </span>

            <h1>
              Roadmap
            </h1>

            <p>
              Plan development work and assign
              roadmap items directly to a season,
              update or release.
            </p>
          </div>


          <button
            type="button"
            onClick={
              openCreate
            }
          >
            + Add Roadmap Item
          </button>
        </section>


        <section className="devRoadmapStats">
          <article>
            <span>
              ITEMS
            </span>

            <strong>
              {items.length}
            </strong>
          </article>

          <article>
            <span>
              ACTIVE
            </span>

            <strong>
              {activeCount}
            </strong>
          </article>

          <article>
            <span>
              DONE
            </span>

            <strong>
              {completedCount}
            </strong>
          </article>

          <article>
            <span>
              PROGRESS
            </span>

            <strong>
              {overallProgress}%
            </strong>
          </article>
        </section>


        <section className="devRoadmapBoard">
          {columns.map(
            (
              column
            ) => {
              const columnItems =
                items.filter(
                  (
                    item
                  ) =>
                    item.status ===
                    column.status
                );


              return (
                <div
                  key={
                    column.status
                  }
                  className={`devRoadmapColumn ${
                    dragOverStatus ===
                    column.status
                      ? "dragOver"
                      : ""
                  }`}
                  onDragOver={(
                    event
                  ) => {
                    event.preventDefault();

                    setDragOverStatus(
                      column.status
                    );
                  }}
                  onDragLeave={() =>
                    setDragOverStatus(
                      null
                    )
                  }
                  onDrop={async (
                    event
                  ) => {
                    event.preventDefault();

                    const id =
                      event.dataTransfer.getData(
                        "text/plain"
                      ) ||
                      draggedItemId;


                    setDragOverStatus(
                      null
                    );

                    setDraggedItemId(
                      null
                    );


                    const item =
                      items.find(
                        (
                          existing
                        ) =>
                          existing.id ===
                          id
                      );


                    if (item) {
                      await moveItem(
                        item,
                        column.status
                      );
                    }
                  }}
                >
                  <header>
                    <div>
                      <strong>
                        {
                          column.title
                        }
                      </strong>

                      <span>
                        {
                          columnItems.length
                        }
                      </span>
                    </div>

                    <p>
                      {
                        column.description
                      }
                    </p>
                  </header>


                  <div className="devRoadmapColumnItems">
                    {columnItems.map(
                      (
                        item
                      ) => {
                        const assignedUpdate =
                          findUpdate(
                            item.update_id
                          );


                        const isSaving =
                          savingItemIds.includes(
                            item.id
                          );


                        return (
                          <article
                            key={
                              item.id
                            }
                            className={`devRoadmapCard ${
                              isSaving
                                ? "saving"
                                : ""
                            }`}
                            draggable={
                              !isSaving
                            }
                            onDragStart={(
                              event
                            ) => {
                              setDraggedItemId(
                                item.id
                              );

                              event.dataTransfer.setData(
                                "text/plain",
                                item.id
                              );
                            }}
                            onDragEnd={() => {
                              setDraggedItemId(
                                null
                              );

                              setDragOverStatus(
                                null
                              );
                            }}
                          >
                            <div className="devRoadmapCardTop">
                              <span
                                className={`priority priority-${item.priority}`}
                              >
                                {priorityLabel(
                                  item.priority
                                )}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    item
                                  )
                                }
                              >
                                Edit
                              </button>
                            </div>


                            <h3>
                              {
                                item.title
                              }
                            </h3>


                            {item.description ? (
                              <p>
                                {
                                  item.description
                                }
                              </p>
                            ) : null}


                            {assignedUpdate ? (
                              <Link
                                href={`/dev/${project.slug}/updates`}
                                className="devRoadmapAssignment"
                              >
                                <span>
                                  ASSIGNED TO
                                </span>

                                <strong>
                                  {assignedUpdate.code
                                    ? `${assignedUpdate.code} · `
                                    : ""}

                                  {
                                    assignedUpdate.title
                                  }
                                </strong>
                              </Link>
                            ) : (
                              <div className="devRoadmapAssignment empty">
                                <span>
                                  ASSIGNED TO
                                </span>

                                <strong>
                                  Not assigned
                                </strong>
                              </div>
                            )}


                            <div className="devRoadmapProgress">
                              <div>
                                <span>
                                  Progress
                                </span>

                                <strong>
                                  {
                                    item.progress
                                  }
                                  %
                                </strong>
                              </div>

                              <div className="track">
                                <div
                                  style={{
                                    width:
                                      `${item.progress}%`,
                                  }}
                                />
                              </div>
                            </div>


                            <select
                              value={
                                item.status
                              }
                              disabled={
                                isSaving
                              }
                              onChange={(
                                event
                              ) =>
                                moveItem(
                                  item,
                                  event.target
                                    .value as DevRoadmapStatus
                                )
                              }
                            >
                              {columns.map(
                                (
                                  option
                                ) => (
                                  <option
                                    key={
                                      option.status
                                    }
                                    value={
                                      option.status
                                    }
                                  >
                                    {
                                      option.title
                                    }
                                  </option>
                                )
                              )}
                            </select>


                            <footer>
                              <span>
                                {statusLabel(
                                  item.status
                                )}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    item
                                  )
                                }
                              >
                                Delete
                              </button>
                            </footer>
                          </article>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            }
          )}
        </section>


        {modalOpen ? (
          <div className="devRoadmapModalBackdrop">
            <div className="devRoadmapModal">
              <header>
                <div>
                  <span>
                    ROADMAP ITEM
                  </span>

                  <h2>
                    {editingItem
                      ? "Edit Item"
                      : "Add Item"}
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
                      setForm({
                        ...form,

                        description:
                          event.target.value,
                      })
                    }
                    rows={
                      4
                    }
                  />
                </label>


                <div className="devRoadmapFormRow">
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
                      ) => {
                        const status =
                          event.target
                            .value as DevRoadmapStatus;


                        setForm({
                          ...form,

                          status,

                          progress:
                            status ===
                            "done"
                              ? 100
                              : form.progress,
                        });
                      }}
                    >
                      {columns.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option.status
                            }
                            value={
                              option.status
                            }
                          >
                            {
                              option.title
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>


                  <label>
                    <span>
                      Priority
                    </span>

                    <select
                      value={
                        form.priority
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          priority:
                            event.target
                              .value as DevRoadmapPriority,
                        })
                      }
                    >
                      <option value="low">
                        Low
                      </option>

                      <option value="medium">
                        Medium
                      </option>

                      <option value="high">
                        High
                      </option>

                      <option value="critical">
                        Critical
                      </option>
                    </select>
                  </label>
                </div>


                <label>
                  <span>
                    Assigned Update / Season
                  </span>

                  <select
                    value={
                      form.updateId
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        updateId:
                          event.target.value,
                      })
                    }
                  >
                    <option value="">
                      Not assigned
                    </option>

                    {updates.map(
                      (
                        update
                      ) => (
                        <option
                          key={
                            update.id
                          }
                          value={
                            update.id
                          }
                        >
                          {update.code
                            ? `${update.code} · `
                            : ""}

                          {
                            update.title
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>


                <label>
                  <span>
                    Target
                  </span>

                  <input
                    value={
                      form.target
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        target:
                          event.target.value,
                      })
                    }
                    placeholder="October 2026"
                  />
                </label>


                <label>
                  <div className="devRoadmapRangeHeader">
                    <span>
                      Progress
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
                    disabled={
                      form.status ===
                      "done"
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


                {formError ? (
                  <div className="devRoadmapFormError">
                    {
                      formError
                    }
                  </div>
                ) : null}


                <div className="devRoadmapFormActions">
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
                      : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}


        <style jsx global>{`
          .devRoadmapPage {
            --roadmap-accent:
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

          .devRoadmapBreadcrumbs {
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

          .devRoadmapBreadcrumbs a {
            color:
              #93a7c6;

            text-decoration:
              none;
          }

          .devRoadmapHero {
            display:
              flex;

            align-items:
              flex-end;

            justify-content:
              space-between;

            gap:
              30px;

            padding:
              42px;

            border:
              1px solid
              color-mix(
                in srgb,
                var(
                  --roadmap-accent
                )
                24%,
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

          .devRoadmapHero > div > span {
            color:
              var(
                --roadmap-accent
              );

            font-size:
              10px;

            font-weight:
              900;
          }

          .devRoadmapHero h1 {
            margin:
              8px
              0
              0;

            font-size:
              54px;
          }

          .devRoadmapHero p {
            max-width:
              650px;

            color:
              #91a5c2;
          }

          .devRoadmapHero button {
            padding:
              11px
              15px;

            border:
              1px solid
              color-mix(
                in srgb,
                var(
                  --roadmap-accent
                )
                35%,
                transparent
              );

            border-radius:
              12px;

            background:
              color-mix(
                in srgb,
                var(
                  --roadmap-accent
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

          .devRoadmapStats {
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

          .devRoadmapStats article {
            padding:
              18px;

            border:
              1px solid
              rgba(
                130,
                158,
                205,
                0.13
              );

            border-radius:
              16px;

            background:
              rgba(
                8,
                17,
                33,
                0.88
              );
          }

          .devRoadmapStats span {
            color:
              #7084a3;

            font-size:
              9px;

            font-weight:
              900;
          }

          .devRoadmapStats strong {
            display:
              block;

            margin-top:
              7px;

            font-size:
              25px;
          }

          .devRoadmapBoard {
            display:
              grid;

            grid-template-columns:
              repeat(
                5,
                minmax(
                  250px,
                  1fr
                )
              );

            gap:
              12px;

            margin-top:
              20px;

            overflow-x:
              auto;
          }

          .devRoadmapColumn {
            min-height:
              400px;

            border:
              1px solid
              rgba(
                130,
                158,
                205,
                0.12
              );

            border-radius:
              17px;

            background:
              rgba(
                6,
                14,
                28,
                0.78
              );
          }

          .devRoadmapColumn.dragOver {
            border-color:
              var(
                --roadmap-accent
              );
          }

          .devRoadmapColumn > header {
            padding:
              15px;

            border-bottom:
              1px solid
              rgba(
                130,
                158,
                205,
                0.08
              );
          }

          .devRoadmapColumn > header > div {
            display:
              flex;

            justify-content:
              space-between;
          }

          .devRoadmapColumn > header p {
            margin:
              6px
              0
              0;

            color:
              #687d9c;

            font-size:
              10px;
          }

          .devRoadmapColumnItems {
            display:
              grid;

            gap:
              10px;

            padding:
              10px;
          }

          .devRoadmapCard {
            padding:
              14px;

            border:
              1px solid
              rgba(
                130,
                158,
                205,
                0.12
              );

            border-radius:
              13px;

            background:
              rgba(
                12,
                24,
                44,
                0.94
              );
          }

          .devRoadmapCard.saving {
            opacity:
              0.6;
          }

          .devRoadmapCardTop {
            display:
              flex;

            justify-content:
              space-between;
          }

          .devRoadmapCardTop button,
          .devRoadmapCard footer button {
            border:
              0;

            background:
              transparent;

            color:
              #91a5c2;

            cursor:
              pointer;
          }

          .priority {
            padding:
              5px
              7px;

            border-radius:
              7px;

            font-size:
              8px;

            font-weight:
              900;
          }

          .priority-critical {
            color:
              #ff92a3;
          }

          .priority-high {
            color:
              #ffc16e;
          }

          .priority-medium {
            color:
              #6bd4ff;
          }

          .priority-low {
            color:
              #9cafc9;
          }

          .devRoadmapCard h3 {
            margin:
              14px
              0
              0;

            font-size:
              15px;
          }

          .devRoadmapCard p {
            color:
              #8296b4;

            font-size:
              11px;

            line-height:
              1.55;
          }

          .devRoadmapAssignment {
            display:
              block;

            margin-top:
              13px;

            padding:
              9px;

            border:
              1px solid
              color-mix(
                in srgb,
                var(
                  --roadmap-accent
                )
                17%,
                transparent
              );

            border-radius:
              9px;

            background:
              color-mix(
                in srgb,
                var(
                  --roadmap-accent
                )
                5%,
                transparent
              );

            text-decoration:
              none;
          }

          .devRoadmapAssignment span,
          .devRoadmapAssignment strong {
            display:
              block;
          }

          .devRoadmapAssignment span {
            color:
              #657a99;

            font-size:
              7px;

            font-weight:
              900;
          }

          .devRoadmapAssignment strong {
            margin-top:
              4px;

            color:
              var(
                --roadmap-accent
              );

            font-size:
              9px;
          }

          .devRoadmapAssignment.empty strong {
            color:
              #7287a5;
          }

          .devRoadmapProgress {
            margin-top:
              14px;
          }

          .devRoadmapProgress > div:first-child {
            display:
              flex;

            justify-content:
              space-between;

            color:
              #7286a4;

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
                --roadmap-accent
              );
          }

          .devRoadmapCard > select {
            width:
              100%;

            margin-top:
              13px;

            padding:
              7px;

            border:
              1px solid
              rgba(
                130,
                158,
                205,
                0.13
              );

            border-radius:
              8px;

            background:
              #0a172b;

            color:
              #a3b5ce;
          }

          .devRoadmapCard footer {
            display:
              flex;

            justify-content:
              space-between;

            margin-top:
              12px;

            padding-top:
              10px;

            border-top:
              1px solid
              rgba(
                130,
                158,
                205,
                0.08
              );

            color:
              #647997;

            font-size:
              9px;
          }

          .devRoadmapModalBackdrop {
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

          .devRoadmapModal {
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

          .devRoadmapModal > header {
            display:
              flex;

            justify-content:
              space-between;
          }

          .devRoadmapModal > header span {
            color:
              var(
                --roadmap-accent
              );

            font-size:
              9px;

            font-weight:
              900;
          }

          .devRoadmapModal > header h2 {
            margin:
              6px
              0
              0;
          }

          .devRoadmapModal > header button {
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

          .devRoadmapModal form {
            display:
              grid;

            gap:
              15px;

            margin-top:
              22px;
          }

          .devRoadmapModal label {
            display:
              grid;

            gap:
              7px;
          }

          .devRoadmapModal label > span {
            color:
              #9fb1cc;

            font-size:
              11px;

            font-weight:
              800;
          }

          .devRoadmapModal input,
          .devRoadmapModal textarea,
          .devRoadmapModal select {
            width:
              100%;

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

          .devRoadmapFormRow {
            display:
              grid;

            grid-template-columns:
              1fr
              1fr;

            gap:
              12px;
          }

          .devRoadmapRangeHeader {
            display:
              flex;

            justify-content:
              space-between;
          }

          .devRoadmapFormError {
            color:
              #ff9dad;
          }

          .devRoadmapFormActions {
            display:
              flex;

            justify-content:
              flex-end;

            gap:
              10px;
          }

          .devRoadmapFormActions button {
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
              800px
          ) {
            .devRoadmapHero {
              align-items:
                flex-start;

              flex-direction:
                column;

              padding:
                25px;
            }

            .devRoadmapStats {
              grid-template-columns:
                1fr
                1fr;
            }

            .devRoadmapFormRow {
              grid-template-columns:
                1fr;
            }
          }
        `}</style>
      </main>
    </DevPageGuard>
  );
}