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
  useRouter,
  useSearchParams,
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

import {
  exportDevRoadmapPdf,
} from "../../../../lib/dev-pdf-export";

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
  DevUpdateStatus,
  DevUpdateType,
} from "../../../../types/dev-updates";


type RoadmapForm = {
  title: string;
  description: string;
  status: DevRoadmapStatus;
  priority: DevRoadmapPriority;
  progress: number;
  target: string;
};


type RoadmapColumn = {
  status: DevRoadmapStatus;
  title: string;
  description: string;
};


const UNASSIGNED_ROADMAP =
  "unassigned";


const emptyForm: RoadmapForm = {
  title: "",
  description: "",
  status: "planned",
  priority: "medium",
  progress: 0,
  target: "",
};


const columns: RoadmapColumn[] = [
  {
    status: "planned",
    title: "Planned",
    description: "Scheduled or planned work",
  },
  {
    status: "in_progress",
    title: "In Progress",
    description: "Currently being developed",
  },
  {
    status: "testing",
    title: "Testing",
    description: "Implementation under testing",
  },
  {
    status: "done",
    title: "Done",
    description: "Completed development",
  },
  {
    status: "blocked",
    title: "Blocked",
    description: "Currently blocked",
  },
];


function priorityLabel(
  priority: DevRoadmapPriority
) {
  return priority.toUpperCase();
}


function statusLabel(
  status: DevRoadmapStatus
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


function updateTypeLabel(
  type: DevUpdateType
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


function updateStatusLabel(
  status: DevUpdateStatus
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
  value: string | null
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


export default function DevRoadmapPage() {
  const params =
    useParams<{
      project: string;
    }>();

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const selectedRoadmapId =
    searchParams.get(
      "update"
    );


  const [
    project,
    setProject,
  ] =
    useState<DevProject | null>(
      null
    );


  const [
    items,
    setItems,
  ] =
    useState<DevRoadmapItem[]>(
      []
    );


  const [
    updates,
    setUpdates,
  ] =
    useState<DevUpdate[]>(
      []
    );


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
    useState<string | null>(
      null
    );


  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(
      false
    );


  const [
    editingItem,
    setEditingItem,
  ] =
    useState<DevRoadmapItem | null>(
      null
    );


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
    useState(
      false
    );


  const [
    formError,
    setFormError,
  ] =
    useState<string | null>(
      null
    );


  const [
    draggedItemId,
    setDraggedItemId,
  ] =
    useState<string | null>(
      null
    );


  const [
    dragOverStatus,
    setDragOverStatus,
  ] =
    useState<DevRoadmapStatus | null>(
      null
    );


  const [
    savingItemIds,
    setSavingItemIds,
  ] =
    useState<string[]>(
      []
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


          const loadedProject =
            await getDevProjectBySlug(
              params.project
            );


          if (
            !loadedProject
          ) {
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


          if (
            !alive
          ) {
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


          if (
            !alive
          ) {
            return;
          }


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load roadmap."
          );
        } finally {
          if (
            alive
          ) {
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


  const selectedUpdate =
    useMemo(
      () =>
        selectedRoadmapId &&
        selectedRoadmapId !==
          UNASSIGNED_ROADMAP
          ? updates.find(
              (
                update
              ) =>
                update.id ===
                selectedRoadmapId
            ) ??
            null
          : null,
      [
        selectedRoadmapId,
        updates,
      ]
    );


  const isUnassignedRoadmap =
    selectedRoadmapId ===
    UNASSIGNED_ROADMAP;


  const hasValidRoadmapSelection =
    !!selectedUpdate ||
    isUnassignedRoadmap;


  const roadmapItems =
    useMemo(
      () => {
        if (
          selectedUpdate
        ) {
          return items.filter(
            (
              item
            ) =>
              item.update_id ===
              selectedUpdate.id
          );
        }


        if (
          isUnassignedRoadmap
        ) {
          return items.filter(
            (
              item
            ) =>
              !item.update_id
          );
        }


        return [];
      },
      [
        items,
        selectedUpdate,
        isUnassignedRoadmap,
      ]
    );


  const unassignedItems =
    useMemo(
      () =>
        items.filter(
          (
            item
          ) =>
            !item.update_id
        ),
      [
        items,
      ]
    );


  const overallProgress =
    useMemo(
      () => {
        if (
          roadmapItems.length ===
          0
        ) {
          return 0;
        }


        return Math.round(
          roadmapItems.reduce(
            (
              total,
              item
            ) =>
              total +
              item.progress,
            0
          ) /
            roadmapItems.length
        );
      },
      [
        roadmapItems,
      ]
    );


  const completedCount =
    roadmapItems.filter(
      (
        item
      ) =>
        item.status ===
        "done"
    ).length;


  const activeCount =
    roadmapItems.filter(
      (
        item
      ) =>
        item.status ===
          "in_progress" ||
        item.status ===
          "testing"
    ).length;


  function countItemsForUpdate(
    updateId: string
  ) {
    return items.filter(
      (
        item
      ) =>
        item.update_id ===
        updateId
    ).length;
  }


  function progressForUpdate(
    updateId: string
  ) {
    const updateItems =
      items.filter(
        (
          item
        ) =>
          item.update_id ===
          updateId
      );


    if (
      !updateItems.length
    ) {
      return 0;
    }


    return Math.round(
      updateItems.reduce(
        (
          total,
          item
        ) =>
          total +
          item.progress,
        0
      ) /
        updateItems.length
    );
  }


  function selectRoadmap(
    updateId: string
  ) {
    router.replace(
      `/dev/${
        project?.slug ??
        params.project
      }/roadmap?update=${encodeURIComponent(
        updateId
      )}`
    );
  }


  function clearRoadmapSelection() {
    router.replace(
      `/dev/${
        project?.slug ??
        params.project
      }/roadmap`
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
    if (
      !hasValidRoadmapSelection
    ) {
      return;
    }


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
    item: DevRoadmapItem
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
    });


    setFormError(
      null
    );

    setModalOpen(
      true
    );
  }


  function closeModal() {
    if (
      saving
    ) {
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


    if (
      !project ||
      !hasValidRoadmapSelection
    ) {
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


    const roadmapUpdateId =
      selectedUpdate?.id ??
      null;


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
        roadmapUpdateId,
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


  function handleExportPdf() {
    if (
      !project ||
      !hasValidRoadmapSelection
    ) {
      return;
    }


    exportDevRoadmapPdf({
      projectName:
        project.name,

      projectShortName:
        project.short_name,

      roadmapTitle:
        selectedUpdate?.title ??
        "Unassigned",

      roadmapCode:
        selectedUpdate?.code ??
        null,

      roadmapType:
        selectedUpdate
          ? updateTypeLabel(
              selectedUpdate.type
            )
          : "General",

      roadmapStatus:
        selectedUpdate
          ? updateStatusLabel(
              selectedUpdate.status
            )
          : null,

      description:
        selectedUpdate?.description ??
        (isUnassignedRoadmap
          ? "Roadmap items that are not assigned to an update or season yet."
          : null),

      targetDate:
        selectedUpdate?.target_date ??
        null,

      releaseDate:
        selectedUpdate?.release_date ??
        null,

      overallProgress,

      itemCount:
        roadmapItems.length,

      activeCount,

      completedCount,

      groups:
        columns.map(
          (
            column
          ) => ({
            title:
              column.title,

            items:
              roadmapItems
                .filter(
                  (
                    item
                  ) =>
                    item.status ===
                    column.status
                )
                .map(
                  (
                    item
                  ) => ({
                    title:
                      item.title,

                    description:
                      item.description,

                    priority:
                      item.priority,

                    progress:
                      item.progress,

                    target:
                      item.target,

                    status:
                      item.status,
                  })
                ),
          })
        ),
    });
  }


  function handleDragStart(
    event:
      DragEvent<HTMLElement>,

    itemId:
      string
  ) {
    setDraggedItemId(
      itemId
    );


    event.dataTransfer.setData(
      "text/plain",
      itemId
    );


    event.dataTransfer.effectAllowed =
      "move";
  }


  if (
    loading
  ) {
    return (
      <DevPageGuard>
        <main className="devRoadmapPage devRoadmapStatePage">
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
        <main className="devRoadmapPage devRoadmapStatePage">
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


          <span>
            /
          </span>


          <Link
            href={`/dev/${project.slug}`}
          >
            {project.name}
          </Link>


          <span>
            /
          </span>


          {hasValidRoadmapSelection ? (
            <button
              type="button"
              onClick={
                clearRoadmapSelection
              }
            >
              Roadmap
            </button>
          ) : (
            <strong>
              Roadmap
            </strong>
          )}


          {hasValidRoadmapSelection ? (
            <>
              <span>
                /
              </span>

              <strong>
                {selectedUpdate
                  ? selectedUpdate.code
                    ? `${selectedUpdate.code} · ${selectedUpdate.title}`
                    : selectedUpdate.title
                  : "Unassigned"}
              </strong>
            </>
          ) : null}
        </div>


        {!hasValidRoadmapSelection ? (
          <RoadmapSelector
            project={
              project
            }
            updates={
              updates
            }
            items={
              items
            }
            unassignedItems={
              unassignedItems
            }
            onSelect={
              selectRoadmap
            }
            countItemsForUpdate={
              countItemsForUpdate
            }
            progressForUpdate={
              progressForUpdate
            }
          />
        ) : (
          <>
            <section className="devRoadmapHero">
              <div className="devRoadmapHeroCopy">
                <button
                  type="button"
                  className="devRoadmapBackButton"
                  onClick={
                    clearRoadmapSelection
                  }
                >
                  ← Change Update / Season
                </button>


                <span>
                  {selectedUpdate
                    ? `${updateTypeLabel(
                        selectedUpdate.type
                      ).toUpperCase()} ROADMAP`
                    : "GENERAL ROADMAP"}
                </span>


                <h1>
                  {selectedUpdate
                    ? selectedUpdate.code
                      ? `${selectedUpdate.code} · ${selectedUpdate.title}`
                      : selectedUpdate.title
                    : "Unassigned"}
                </h1>


                <p>
                  {selectedUpdate?.description ||
                    (isUnassignedRoadmap
                      ? "Roadmap items that are not assigned to an update or season yet."
                      : "Plan and track the development work for this update.")}
                </p>


                {selectedUpdate ? (
                  <div className="devRoadmapHeroMeta">
                    <span>
                      {updateStatusLabel(
                        selectedUpdate.status
                      )}
                    </span>


                    {selectedUpdate.target_date ? (
                      <span>
                        Target{" "}
                        {formatDate(
                          selectedUpdate.target_date
                        )}
                      </span>
                    ) : null}


                    {selectedUpdate.release_date ? (
                      <span>
                        Release{" "}
                        {formatDate(
                          selectedUpdate.release_date
                        )}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>


              <div className="devRoadmapHeroActions">
                <button
                  type="button"
                  onClick={
                    handleExportPdf
                  }
                >
                  ↓ Export PDF
                </button>


                <button
                  type="button"
                  className="primary"
                  onClick={
                    openCreate
                  }
                >
                  + Add Roadmap Item
                </button>
              </div>
            </section>


            <section className="devRoadmapStats">
              <article>
                <span>
                  ITEMS
                </span>

                <strong>
                  {roadmapItems.length}
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


            <section className="devRoadmapOverallProgress">
              <div>
                <span>
                  ROADMAP PROGRESS
                </span>

                <strong>
                  {overallProgress}%
                </strong>
              </div>


              <div className="track">
                <div
                  style={{
                    width:
                      `${overallProgress}%`,
                  }}
                />
              </div>
            </section>


            <section className="devRoadmapBoard">
              {columns.map(
                (
                  column
                ) => {
                  const columnItems =
                    roadmapItems.filter(
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

                        event.dataTransfer.dropEffect =
                          "move";

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
                          roadmapItems.find(
                            (
                              existing
                            ) =>
                              existing.id ===
                              id
                          );


                        if (
                          item
                        ) {
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
                            {column.title}
                          </strong>

                          <span>
                            {columnItems.length}
                          </span>
                        </div>

                        <p>
                          {column.description}
                        </p>
                      </header>


                      <div className="devRoadmapColumnItems">
                        {columnItems.length ===
                        0 ? (
                          <div className="devRoadmapColumnEmpty">
                            No items
                          </div>
                        ) : null}


                        {columnItems.map(
                          (
                            item
                          ) => {
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
                                ) =>
                                  handleDragStart(
                                    event,
                                    item.id
                                  )
                                }
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
                                  {item.title}
                                </h3>


                                {item.description ? (
                                  <p>
                                    {item.description}
                                  </p>
                                ) : null}


                                {item.target ? (
                                  <div className="devRoadmapTarget">
                                    <span>
                                      TARGET
                                    </span>

                                    <strong>
                                      {item.target}
                                    </strong>
                                  </div>
                                ) : null}


                                <div className="devRoadmapProgress">
                                  <div>
                                    <span>
                                      Progress
                                    </span>

                                    <strong>
                                      {item.progress}%
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
                                  className="devRoadmapSelect"
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
                                        {option.title}
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
          </>
        )}


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
                <div className="devRoadmapAssignedNotice">
                  <span>
                    ROADMAP
                  </span>

                  <strong>
                    {selectedUpdate
                      ? selectedUpdate.code
                        ? `${selectedUpdate.code} · ${selectedUpdate.title}`
                        : selectedUpdate.title
                      : "Unassigned"}
                  </strong>

                  <small>
                    The item is automatically
                    assigned to the roadmap you
                    currently opened.
                  </small>
                </div>


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
                      className="devRoadmapSelect"
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
                            {option.title}
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
                      className="devRoadmapSelect"
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
                      {form.progress}%
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
                    {formError}
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
                    className="primary"
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


        <RoadmapStyles />
      </main>
    </DevPageGuard>
  );
}


function RoadmapSelector({
  project,
  updates,
  items,
  unassignedItems,
  onSelect,
  countItemsForUpdate,
  progressForUpdate,
}: {
  project:
    DevProject;

  updates:
    DevUpdate[];

  items:
    DevRoadmapItem[];

  unassignedItems:
    DevRoadmapItem[];

  onSelect:
    (
      updateId:
        string
    ) => void;

  countItemsForUpdate:
    (
      updateId:
        string
    ) => number;

  progressForUpdate:
    (
      updateId:
        string
    ) => number;
}) {
  const seasonUpdates =
    updates.filter(
      (
        update
      ) =>
        update.type ===
        "season"
    );


  const otherUpdates =
    updates.filter(
      (
        update
      ) =>
        update.type !==
        "season"
    );


  return (
    <>
      <section className="devRoadmapSelectorHero">
        <span>
          {project.short_name} DEVELOPMENT
        </span>

        <h1>
          Roadmap
        </h1>

        <p>
          Select the season, update or
          release whose roadmap you want
          to open. The entries are loaded
          directly from the Updates
          module.
        </p>

        <div className="devRoadmapSelectorSummary">
          <span>
            {updates.length} Updates /
            Seasons
          </span>

          <span>
            {items.length} Roadmap Items
          </span>
        </div>
      </section>


      {updates.length ===
      0 ? (
        <section className="devRoadmapNoUpdates">
          <div>
            <span>
              NO UPDATES FOUND
            </span>

            <h2>
              Create an update first
            </h2>

            <p>
              Roadmaps are now organised
              by the entries from the
              Updates module. Create a
              season or update and it will
              automatically appear here.
            </p>
          </div>

          <Link
            href={`/dev/${project.slug}/updates`}
          >
            Open Updates →
          </Link>
        </section>
      ) : (
        <div className="devRoadmapSelectorSections">
          {seasonUpdates.length >
          0 ? (
            <RoadmapSelectorSection
              title="Seasons"
              description="Season based development roadmaps"
              updates={
                seasonUpdates
              }
              onSelect={
                onSelect
              }
              countItemsForUpdate={
                countItemsForUpdate
              }
              progressForUpdate={
                progressForUpdate
              }
            />
          ) : null}


          {otherUpdates.length >
          0 ? (
            <RoadmapSelectorSection
              title="Updates & Releases"
              description="Updates, releases, hotfixes and milestones"
              updates={
                otherUpdates
              }
              onSelect={
                onSelect
              }
              countItemsForUpdate={
                countItemsForUpdate
              }
              progressForUpdate={
                progressForUpdate
              }
            />
          ) : null}
        </div>
      )}


      {unassignedItems.length >
      0 ? (
        <section className="devRoadmapLegacySection">
          <div>
            <span>
              UNASSIGNED ITEMS
            </span>

            <h2>
              General / Unassigned
              Roadmap
            </h2>

            <p>
              These are existing roadmap
              items that are not assigned
              to a season or update yet.
              They stay accessible so no
              existing data is lost.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onSelect(
                UNASSIGNED_ROADMAP
              )
            }
          >
            Open{" "}
            {unassignedItems.length}{" "}
            Item
            {unassignedItems.length ===
            1
              ? ""
              : "s"}{" "}
            →
          </button>
        </section>
      ) : null}
    </>
  );
}


function RoadmapSelectorSection({
  title,
  description,
  updates,
  onSelect,
  countItemsForUpdate,
  progressForUpdate,
}: {
  title:
    string;

  description:
    string;

  updates:
    DevUpdate[];

  onSelect:
    (
      updateId:
        string
    ) => void;

  countItemsForUpdate:
    (
      updateId:
        string
    ) => number;

  progressForUpdate:
    (
      updateId:
        string
    ) => number;
}) {
  return (
    <section className="devRoadmapSelectorSection">
      <header>
        <div>
          <span>
            ROADMAP LIBRARY
          </span>

          <h2>
            {title}
          </h2>

          <p>
            {description}
          </p>
        </div>

        <strong>
          {updates.length}
        </strong>
      </header>


      <div className="devRoadmapSelectorGrid">
        {updates.map(
          (
            update
          ) => {
            const itemCount =
              countItemsForUpdate(
                update.id
              );


            const progress =
              progressForUpdate(
                update.id
              );


            return (
              <button
                key={
                  update.id
                }
                type="button"
                className="devRoadmapSelectorCard"
                onClick={() =>
                  onSelect(
                    update.id
                  )
                }
              >
                <div className="devRoadmapSelectorCardTop">
                  <span
                    className={`type type-${update.type}`}
                  >
                    {updateTypeLabel(
                      update.type
                    )}
                  </span>

                  <span
                    className={`status status-${update.status}`}
                  >
                    {updateStatusLabel(
                      update.status
                    )}
                  </span>
                </div>


                <div className="devRoadmapSelectorCardTitle">
                  {update.code ? (
                    <small>
                      {update.code}
                    </small>
                  ) : null}

                  <h3>
                    {update.title}
                  </h3>
                </div>


                {update.description ? (
                  <p>
                    {update.description}
                  </p>
                ) : (
                  <p className="muted">
                    No description added.
                  </p>
                )}


                <div className="devRoadmapSelectorProgress">
                  <div>
                    <span>
                      Roadmap Progress
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


                <footer>
                  <span>
                    {itemCount} Item
                    {itemCount ===
                    1
                      ? ""
                      : "s"}
                  </span>

                  <strong>
                    Open Roadmap →
                  </strong>
                </footer>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}


function RoadmapStyles() {
  return (
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


      .devRoadmapStatePage {
        padding-top:
          60px;

        color:
          #9fb0ca;
      }


      .devRoadmapBreadcrumbs {
        display:
          flex;

        flex-wrap:
          wrap;

        align-items:
          center;

        gap:
          9px;

        margin-bottom:
          16px;

        color:
          #7186a7;

        font-size:
          11px;
      }


      .devRoadmapBreadcrumbs
        a,
      .devRoadmapBreadcrumbs
        button {
        padding:
          0;

        border:
          0;

        background:
          transparent;

        color:
          #93a7c6;

        font:
          inherit;

        text-decoration:
          none;

        cursor:
          pointer;
      }


      .devRoadmapBreadcrumbs
        a:hover,
      .devRoadmapBreadcrumbs
        button:hover {
        color:
          white;
      }


      .devRoadmapSelectorHero,
      .devRoadmapHero {
        border:
          1px
          solid
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
          radial-gradient(
            circle
            at
            82%
            10%,
            color-mix(
              in srgb,
              var(
                --roadmap-accent
              )
              12%,
              transparent
            ),
            transparent
            32%
          ),
          rgba(
            8,
            17,
            33,
            0.94
          );

        box-shadow:
          0
          25px
          80px
          rgba(
            0,
            0,
            0,
            0.18
          );
      }


      .devRoadmapSelectorHero {
        padding:
          42px;
      }


      .devRoadmapSelectorHero
        > span,
      .devRoadmapHeroCopy
        > span,
      .devRoadmapSelectorSection
        > header
        > div
        > span,
      .devRoadmapLegacySection
        > div
        > span,
      .devRoadmapNoUpdates
        > div
        > span {
        color:
          var(
            --roadmap-accent
          );

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          0.08em;
      }


      .devRoadmapSelectorHero
        h1,
      .devRoadmapHero
        h1 {
        margin:
          8px
          0
          0;

        font-size:
          clamp(
            42px,
            6vw,
            58px
          );

        line-height:
          1;

        letter-spacing:
          -0.04em;
      }


      .devRoadmapSelectorHero
        p,
      .devRoadmapHero
        p {
        max-width:
          720px;

        margin:
          16px
          0
          0;

        color:
          #91a5c2;

        line-height:
          1.65;
      }


      .devRoadmapSelectorSummary,
      .devRoadmapHeroMeta {
        display:
          flex;

        flex-wrap:
          wrap;

        gap:
          8px;

        margin-top:
          22px;
      }


      .devRoadmapSelectorSummary
        span,
      .devRoadmapHeroMeta
        span {
        padding:
          7px
          10px;

        border:
          1px solid
          rgba(
            137,
            165,
            207,
            0.14
          );

        border-radius:
          999px;

        background:
          rgba(
            255,
            255,
            255,
            0.025
          );

        color:
          #92a7c5;

        font-size:
          10px;

        font-weight:
          800;
      }


      .devRoadmapSelectorSections {
        display:
          grid;

        gap:
          22px;

        margin-top:
          22px;
      }


      .devRoadmapSelectorSection {
        padding:
          24px;

        border:
          1px
          solid
          rgba(
            120,
            150,
            195,
            0.12
          );

        border-radius:
          22px;

        background:
          rgba(
            7,
            15,
            29,
            0.82
          );
      }


      .devRoadmapSelectorSection
        > header {
        display:
          flex;

        align-items:
          flex-start;

        justify-content:
          space-between;

        gap:
          20px;

        margin-bottom:
          18px;
      }


      .devRoadmapSelectorSection
        > header
        h2,
      .devRoadmapLegacySection
        h2,
      .devRoadmapNoUpdates
        h2 {
        margin:
          6px
          0
          0;

        font-size:
          24px;
      }


      .devRoadmapSelectorSection
        > header
        p,
      .devRoadmapLegacySection
        p,
      .devRoadmapNoUpdates
        p {
        margin:
          7px
          0
          0;

        color:
          #778eaf;

        line-height:
          1.55;
      }


      .devRoadmapSelectorSection
        > header
        > strong {
        min-width:
          40px;

        height:
          40px;

        display:
          grid;

        place-items:
          center;

        border:
          1px solid
          rgba(
            137,
            165,
            207,
            0.14
          );

        border-radius:
          12px;

        background:
          rgba(
            255,
            255,
            255,
            0.025
          );

        color:
          #a9bdd8;
      }


      .devRoadmapSelectorGrid {
        display:
          grid;

        grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              280px,
              1fr
            )
          );

        gap:
          14px;
      }


      .devRoadmapSelectorCard {
        width:
          100%;

        min-width:
          0;

        min-height:
          260px;

        display:
          flex;

        flex-direction:
          column;

        padding:
          20px;

        border:
          1px solid
          rgba(
            118,
            149,
            195,
            0.13
          );

        border-radius:
          18px;

        background:
          linear-gradient(
            145deg,
            rgba(
              18,
              31,
              53,
              0.84
            ),
            rgba(
              8,
              17,
              31,
              0.92
            )
          );

        color:
          white;

        text-align:
          left;

        cursor:
          pointer;

        transition:
          transform
            160ms
            ease,
          border-color
            160ms
            ease,
          background
            160ms
            ease,
          box-shadow
            160ms
            ease;
      }


      .devRoadmapSelectorCard:hover {
        transform:
          translateY(
            -3px
          );

        border-color:
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            42%,
            transparent
          );

        box-shadow:
          0
          18px
          50px
          rgba(
            0,
            0,
            0,
            0.24
          );
      }


      .devRoadmapSelectorCardTop {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          8px;
      }


      .devRoadmapSelectorCardTop
        .type,
      .devRoadmapSelectorCardTop
        .status {
        padding:
          5px
          8px;

        border-radius:
          999px;

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.05em;

        text-transform:
          uppercase;
      }


      .devRoadmapSelectorCardTop
        .type {
        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            28%,
            transparent
          );

        background:
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            10%,
            transparent
          );

        color:
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            72%,
            white
          );
      }


      .devRoadmapSelectorCardTop
        .status {
        border:
          1px solid
          rgba(
            114,
            147,
            194,
            0.12
          );

        background:
          rgba(
            255,
            255,
            255,
            0.025
          );

        color:
          #8196b6;
      }


      .devRoadmapSelectorCardTitle {
        margin-top:
          24px;
      }


      .devRoadmapSelectorCardTitle
        small {
        display:
          block;

        margin-bottom:
          5px;

        color:
          var(
            --roadmap-accent
          );

        font-size:
          9px;

        font-weight:
          900;
      }


      .devRoadmapSelectorCardTitle
        h3 {
        margin:
          0;

        font-size:
          22px;

        line-height:
          1.15;
      }


      .devRoadmapSelectorCard
        > p {
        display:
          -webkit-box;

        overflow:
          hidden;

        margin:
          10px
          0
          18px;

        color:
          #7f94b3;

        font-size:
          12px;

        line-height:
          1.55;

        -webkit-box-orient:
          vertical;

        -webkit-line-clamp:
          3;
      }


      .devRoadmapSelectorCard
        > p.muted {
        color:
          #536882;
      }


      .devRoadmapSelectorProgress {
        margin-top:
          auto;
      }


      .devRoadmapSelectorProgress
        > div:first-child,
      .devRoadmapOverallProgress
        > div:first-child,
      .devRoadmapProgress
        > div:first-child {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          10px;

        margin-bottom:
          7px;

        color:
          #7e93b2;

        font-size:
          10px;
      }


      .devRoadmapSelectorProgress
        .track,
      .devRoadmapOverallProgress
        .track,
      .devRoadmapProgress
        .track {
        height:
          6px;

        overflow:
          hidden;

        border-radius:
          999px;

        background:
          rgba(
            122,
            150,
            190,
            0.1
          );
      }


      .devRoadmapSelectorProgress
        .track
        > div,
      .devRoadmapOverallProgress
        .track
        > div,
      .devRoadmapProgress
        .track
        > div {
        height:
          100%;

        border-radius:
          inherit;

        background:
          linear-gradient(
            90deg,
            var(
              --roadmap-accent
            ),
            #57d4ff
          );
      }


      .devRoadmapSelectorCard
        footer {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          12px;

        margin-top:
          17px;

        padding-top:
          14px;

        border-top:
          1px solid
          rgba(
            120,
            150,
            195,
            0.09
          );

        color:
          #6f83a1;

        font-size:
          10px;
      }


      .devRoadmapSelectorCard
        footer
        strong {
        color:
          #b9c7db;
      }


      .devRoadmapLegacySection,
      .devRoadmapNoUpdates {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          26px;

        margin-top:
          22px;

        padding:
          24px;

        border:
          1px solid
          rgba(
            255,
            184,
            92,
            0.16
          );

        border-radius:
          20px;

        background:
          rgba(
            34,
            24,
            10,
            0.22
          );
      }


      .devRoadmapLegacySection
        button,
      .devRoadmapNoUpdates
        a {
        flex:
          0
          0
          auto;

        padding:
          11px
          14px;

        border:
          1px solid
          rgba(
            255,
            190,
            105,
            0.22
          );

        border-radius:
          10px;

        background:
          rgba(
            255,
            190,
            105,
            0.07
          );

        color:
          #ffd293;

        font-size:
          11px;

        font-weight:
          850;

        text-decoration:
          none;

        cursor:
          pointer;
      }


      .devRoadmapNoUpdates {
        border-color:
          rgba(
            137,
            165,
            207,
            0.14
          );

        background:
          rgba(
            8,
            17,
            31,
            0.72
          );
      }


      .devRoadmapNoUpdates
        a {
        border-color:
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            28%,
            transparent
          );

        background:
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            10%,
            transparent
          );

        color:
          white;
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
          34px
          38px;
      }


      .devRoadmapHeroCopy {
        min-width:
          0;
      }


      .devRoadmapBackButton {
        display:
          block;

        margin:
          0
          0
          20px;

        padding:
          0;

        border:
          0;

        background:
          transparent;

        color:
          #8da2bf;

        font-size:
          11px;

        font-weight:
          750;

        cursor:
          pointer;
      }


      .devRoadmapBackButton:hover {
        color:
          white;
      }


      .devRoadmapHeroActions {
        display:
          flex;

        align-items:
          center;

        gap:
          10px;

        flex:
          0
          0
          auto;
      }


      .devRoadmapHeroActions
        button,
      .devRoadmapFormActions
        button {
        min-height:
          42px;

        padding:
          0
          16px;

        border:
          1px solid
          rgba(
            132,
            160,
            202,
            0.16
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
          #c6d1e1;

        font-weight:
          850;

        cursor:
          pointer;
      }


      .devRoadmapHeroActions
        button.primary,
      .devRoadmapFormActions
        button.primary {
        border-color:
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            44%,
            transparent
          );

        background:
          linear-gradient(
            135deg,
            color-mix(
              in srgb,
              var(
                --roadmap-accent
              )
              70%,
              #432f83
            ),
            color-mix(
              in srgb,
              var(
                --roadmap-accent
              )
              42%,
              #144c76
            )
          );

        color:
          white;
      }


      .devRoadmapStats {
        display:
          grid;

        grid-template-columns:
          repeat(
            4,
            minmax(
              0,
              1fr
            )
          );

        gap:
          12px;

        margin-top:
          16px;
      }


      .devRoadmapStats
        article {
        padding:
          17px
          20px;

        border:
          1px solid
          rgba(
            122,
            151,
            193,
            0.11
          );

        border-radius:
          16px;

        background:
          rgba(
            8,
            17,
            31,
            0.76
          );
      }


      .devRoadmapStats
        span {
        display:
          block;

        color:
          #617694;

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.08em;
      }


      .devRoadmapStats
        strong {
        display:
          block;

        margin-top:
          7px;

        color:
          white;

        font-size:
          24px;
      }


      .devRoadmapOverallProgress {
        margin-top:
          12px;

        padding:
          15px
          18px;

        border:
          1px solid
          rgba(
            122,
            151,
            193,
            0.1
          );

        border-radius:
          14px;

        background:
          rgba(
            8,
            17,
            31,
            0.62
          );
      }


      .devRoadmapBoard {
        display:
          grid;

        grid-template-columns:
          repeat(
            5,
            minmax(
              240px,
              1fr
            )
          );

        gap:
          12px;

        margin-top:
          18px;

        overflow-x:
          auto;

        padding-bottom:
          12px;
      }


      .devRoadmapColumn {
        min-width:
          240px;

        padding:
          11px;

        border:
          1px solid
          rgba(
            120,
            149,
            190,
            0.1
          );

        border-radius:
          18px;

        background:
          rgba(
            7,
            15,
            28,
            0.7
          );

        transition:
          border-color
            140ms
            ease,
          background
            140ms
            ease;
      }


      .devRoadmapColumn.dragOver {
        border-color:
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            55%,
            transparent
          );
      }


      .devRoadmapColumn
        > header {
        padding:
          7px
          7px
          12px;
      }


      .devRoadmapColumn
        > header
        > div {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          8px;
      }


      .devRoadmapColumn
        > header
        > div
        > strong {
        font-size:
          12px;
      }


      .devRoadmapColumn
        > header
        > div
        > span {
        min-width:
          22px;

        height:
          22px;

        display:
          grid;

        place-items:
          center;

        border-radius:
          7px;

        background:
          rgba(
            255,
            255,
            255,
            0.03
          );

        color:
          #7f93b0;

        font-size:
          9px;

        font-weight:
          850;
      }


      .devRoadmapColumn
        > header
        p {
        margin:
          5px
          0
          0;

        color:
          #596e8c;

        font-size:
          9px;

        line-height:
          1.4;
      }


      .devRoadmapColumnItems {
        display:
          grid;

        gap:
          9px;

        min-height:
          90px;
      }


      .devRoadmapColumnEmpty {
        display:
          grid;

        min-height:
          74px;

        place-items:
          center;

        border:
          1px dashed
          rgba(
            125,
            151,
            190,
            0.1
          );

        border-radius:
          12px;

        color:
          #4f6380;

        font-size:
          9px;
      }


      .devRoadmapCard {
        position:
          relative;

        padding:
          14px;

        border:
          1px solid
          rgba(
            124,
            153,
            195,
            0.12
          );

        border-radius:
          14px;

        background:
          linear-gradient(
            145deg,
            rgba(
              15,
              27,
              46,
              0.96
            ),
            rgba(
              8,
              17,
              31,
              0.96
            )
          );

        box-shadow:
          0
          10px
          30px
          rgba(
            0,
            0,
            0,
            0.12
          );

        cursor:
          grab;
      }


      .devRoadmapCard.saving {
        opacity:
          0.58;

        cursor:
          wait;
      }


      .devRoadmapCardTop {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          8px;
      }


      .devRoadmapCardTop
        .priority {
        padding:
          4px
          7px;

        border-radius:
          999px;

        font-size:
          7px;

        font-weight:
          950;

        letter-spacing:
          0.07em;
      }


      .devRoadmapCardTop
        .priority-low {
        background:
          rgba(
            88,
            219,
            174,
            0.09
          );

        color:
          #66d9ae;
      }


      .devRoadmapCardTop
        .priority-medium {
        background:
          rgba(
            87,
            183,
            255,
            0.09
          );

        color:
          #76c5ff;
      }


      .devRoadmapCardTop
        .priority-high {
        background:
          rgba(
            255,
            183,
            77,
            0.09
          );

        color:
          #ffbe6b;
      }


      .devRoadmapCardTop
        .priority-critical {
        background:
          rgba(
            255,
            93,
            119,
            0.1
          );

        color:
          #ff8094;
      }


      .devRoadmapCardTop
        button,
      .devRoadmapCard
        footer
        button {
        padding:
          0;

        border:
          0;

        background:
          transparent;

        color:
          #6e83a1;

        font-size:
          9px;

        cursor:
          pointer;
      }


      .devRoadmapCardTop
        button:hover {
        color:
          white;
      }


      .devRoadmapCard
        h3 {
        margin:
          13px
          0
          0;

        font-size:
          15px;

        line-height:
          1.25;
      }


      .devRoadmapCard
        > p {
        margin:
          8px
          0
          0;

        color:
          #7489a8;

        font-size:
          10px;

        line-height:
          1.55;
      }


      .devRoadmapTarget {
        margin-top:
          12px;

        padding:
          9px
          10px;

        border:
          1px solid
          rgba(
            123,
            151,
            193,
            0.09
          );

        border-radius:
          9px;

        background:
          rgba(
            255,
            255,
            255,
            0.018
          );
      }


      .devRoadmapTarget
        span {
        display:
          block;

        color:
          #526781;

        font-size:
          7px;

        font-weight:
          900;
      }


      .devRoadmapTarget
        strong {
        display:
          block;

        margin-top:
          3px;

        color:
          #9bb0ca;

        font-size:
          9px;
      }


      .devRoadmapProgress {
        margin-top:
          13px;
      }


      /*
       * IMPORTANT:
       * Fix for the white native select/options
       * on Chromium/Windows.
       */

      .devRoadmapSelect,
      .devRoadmapModal
        select {
        color-scheme:
          dark;
      }


      .devRoadmapCard
        > select {
        width:
          100%;

        height:
          35px;

        margin-top:
          12px;

        padding:
          0
          9px;

        border:
          1px solid
          rgba(
            124,
            151,
            193,
            0.13
          );

        border-radius:
          9px;

        outline:
          none;

        background:
          #101a2d;

        color:
          #eef4ff;

        font-size:
          9px;

        font-weight:
          750;
      }


      .devRoadmapSelect
        option,
      .devRoadmapModal
        select
        option,
      .devRoadmapCard
        > select
        option {
        background:
          #101a2d
          !important;

        color:
          #f4f7ff
          !important;
      }


      .devRoadmapCard
        footer {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          8px;

        margin-top:
          11px;

        padding-top:
          10px;

        border-top:
          1px solid
          rgba(
            124,
            151,
            193,
            0.08
          );

        color:
          #617593;

        font-size:
          8px;

        font-weight:
          750;
      }


      .devRoadmapCard
        footer
        button:hover {
        color:
          #ff8194;
      }


      .devRoadmapModalBackdrop {
        position:
          fixed;

        z-index:
          5000;

        inset:
          0;

        display:
          grid;

        place-items:
          center;

        padding:
          20px;

        overflow-y:
          auto;

        background:
          rgba(
            2,
            7,
            15,
            0.76
          );

        backdrop-filter:
          blur(
            10px
          );
      }


      .devRoadmapModal {
        width:
          min(
            620px,
            100%
          );

        max-height:
          calc(
            100dvh -
            40px
          );

        overflow-y:
          auto;

        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            30%,
            rgba(
              119,
              150,
              193,
              0.15
            )
          );

        border-radius:
          22px;

        background:
          #071224;

        box-shadow:
          0
          30px
          100px
          rgba(
            0,
            0,
            0,
            0.46
          );
      }


      .devRoadmapModal
        > header {
        display:
          flex;

        align-items:
          flex-start;

        justify-content:
          space-between;

        gap:
          20px;

        padding:
          22px
          24px;

        border-bottom:
          1px solid
          rgba(
            124,
            151,
            193,
            0.1
          );
      }


      .devRoadmapModal
        > header
        span {
        color:
          var(
            --roadmap-accent
          );

        font-size:
          8px;

        font-weight:
          900;
      }


      .devRoadmapModal
        > header
        h2 {
        margin:
          5px
          0
          0;

        font-size:
          25px;
      }


      .devRoadmapModal
        > header
        > button {
        width:
          35px;

        height:
          35px;

        border:
          1px solid
          rgba(
            124,
            151,
            193,
            0.13
          );

        border-radius:
          10px;

        background:
          rgba(
            255,
            255,
            255,
            0.025
          );

        color:
          #93a7c3;

        font-size:
          20px;

        cursor:
          pointer;
      }


      .devRoadmapModal
        form {
        display:
          grid;

        gap:
          16px;

        padding:
          22px
          24px
          24px;
      }


      .devRoadmapAssignedNotice {
        padding:
          12px
          14px;

        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            22%,
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
            7%,
            transparent
          );
      }


      .devRoadmapAssignedNotice
        span,
      .devRoadmapAssignedNotice
        strong,
      .devRoadmapAssignedNotice
        small {
        display:
          block;
      }


      .devRoadmapAssignedNotice
        span {
        color:
          var(
            --roadmap-accent
          );

        font-size:
          7px;

        font-weight:
          900;
      }


      .devRoadmapAssignedNotice
        strong {
        margin-top:
          4px;

        color:
          #e6edf8;

        font-size:
          12px;
      }


      .devRoadmapAssignedNotice
        small {
        margin-top:
          4px;

        color:
          #758aa8;

        font-size:
          9px;

        line-height:
          1.45;
      }


      .devRoadmapModal
        label {
        display:
          grid;

        gap:
          7px;
      }


      .devRoadmapModal
        label
        > span,
      .devRoadmapRangeHeader
        > span {
        color:
          #9fb2cd;

        font-size:
          10px;

        font-weight:
          800;
      }


      .devRoadmapModal
        input:not(
          [type="range"]
        ),
      .devRoadmapModal
        textarea,
      .devRoadmapModal
        select {
        width:
          100%;

        box-sizing:
          border-box;

        border:
          1px solid
          rgba(
            124,
            151,
            193,
            0.18
          );

        border-radius:
          10px;

        outline:
          none;

        background:
          #101a2d;

        color:
          #f4f7ff;

        font:
          inherit;
      }


      .devRoadmapModal
        input:not(
          [type="range"]
        ),
      .devRoadmapModal
        select {
        min-height:
          42px;

        padding:
          0
          12px;
      }


      .devRoadmapModal
        textarea {
        min-height:
          94px;

        padding:
          11px
          12px;

        resize:
          vertical;
      }


      .devRoadmapModal
        input:focus,
      .devRoadmapModal
        textarea:focus,
      .devRoadmapModal
        select:focus {
        border-color:
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            58%,
            transparent
          );

        box-shadow:
          0
          0
          0
          3px
          color-mix(
            in srgb,
            var(
              --roadmap-accent
            )
            10%,
            transparent
          );
      }


      .devRoadmapFormRow {
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
          12px;
      }


      .devRoadmapRangeHeader {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          10px;
      }


      .devRoadmapRangeHeader
        strong {
        color:
          white;
      }


      .devRoadmapModal
        input[type="range"] {
        width:
          100%;

        accent-color:
          var(
            --roadmap-accent
          );
      }


      .devRoadmapFormError {
        padding:
          10px
          12px;

        border:
          1px solid
          rgba(
            255,
            93,
            119,
            0.2
          );

        border-radius:
          9px;

        background:
          rgba(
            255,
            93,
            119,
            0.06
          );

        color:
          #ff91a3;

        font-size:
          10px;
      }


      .devRoadmapFormActions {
        display:
          flex;

        justify-content:
          flex-end;

        gap:
          9px;

        margin-top:
          4px;
      }


      .devRoadmapFormActions
        button:disabled {
        opacity:
          0.55;

        cursor:
          wait;
      }


      @media (
        max-width:
          900px
      ) {
        .devRoadmapSelectorHero,
        .devRoadmapHero {
          padding:
            28px;
        }


        .devRoadmapHero {
          align-items:
            flex-start;

          flex-direction:
            column;
        }


        .devRoadmapStats {
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
          620px
      ) {
        .devRoadmapPage {
          padding-top:
            8px;
        }


        .devRoadmapSelectorHero,
        .devRoadmapHero {
          padding:
            22px;

          border-radius:
            20px;
        }


        .devRoadmapSelectorHero
          h1,
        .devRoadmapHero
          h1 {
          font-size:
            39px;
        }


        .devRoadmapSelectorSection {
          padding:
            16px;
        }


        .devRoadmapSelectorGrid {
          grid-template-columns:
            1fr;
        }


        .devRoadmapLegacySection,
        .devRoadmapNoUpdates {
          align-items:
            flex-start;

          flex-direction:
            column;
        }


        .devRoadmapLegacySection
          button,
        .devRoadmapNoUpdates
          a {
          width:
            100%;

          box-sizing:
            border-box;

          text-align:
            center;
        }


        .devRoadmapStats {
          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );
        }


        .devRoadmapFormRow {
          grid-template-columns:
            1fr;
        }


        .devRoadmapModalBackdrop {
          padding:
            10px;
        }


        .devRoadmapModal {
          max-height:
            calc(
              100dvh -
              20px
            );

          border-radius:
            17px;
        }
      }


      @media (
        prefers-reduced-motion:
          reduce
      ) {
        .devRoadmapSelectorCard,
        .devRoadmapColumn {
          transition:
            none;
        }
      }
    `}</style>
  );
}