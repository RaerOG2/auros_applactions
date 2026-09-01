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
  getDevUpdates,
} from "../../../../services/dev-update.service";

import {
  getDevRoadmapItems,
} from "../../../../services/dev-roadmap.service";

import {
  getAssignableDevUsers,
} from "../../../../services/dev-user.service";

import {
  createDevTask,
  deleteDevTask,
  getDevTasks,
  updateDevTask,
  updateDevTaskStatus,
} from "../../../../services/dev-task.service";

import {
  supabase,
} from "../../../../lib/supabase";

import type {
  DevProject,
} from "../../../../types/dev-projects";

import type {
  DevUpdate,
} from "../../../../types/dev-updates";

import type {
  DevRoadmapItem,
} from "../../../../types/dev-roadmap";

import type {
  AssignableDevUser,
  DevTask,
  DevTaskInput,
  DevTaskPriority,
  DevTaskStatus,
} from "../../../../types/dev-tasks";


type TaskFilter =
  | "all"
  | "mine"
  | "unassigned";


type TaskForm = {
  title: string;

  description: string;

  status: DevTaskStatus;

  priority: DevTaskPriority;

  dueDate: string;

  assignedDevId: string;

  updateId: string;

  roadmapItemId: string;
};


const emptyForm:
  TaskForm = {
  title: "",

  description: "",

  status:
    "planned",

  priority:
    "medium",

  dueDate: "",

  assignedDevId: "",

  updateId: "",

  roadmapItemId: "",
};


const columns: {
  status: DevTaskStatus;

  title: string;

  description: string;
}[] = [
  {
    status:
      "planned",

    title:
      "Planned",

    description:
      "Waiting to be started",
  },

  {
    status:
      "in_progress",

    title:
      "In Progress",

    description:
      "Currently being worked on",
  },

  {
    status:
      "review",

    title:
      "Review",

    description:
      "Ready for review or testing",
  },

  {
    status:
      "done",

    title:
      "Done",

    description:
      "Completed tasks",
  },

  {
    status:
      "blocked",

    title:
      "Blocked",

    description:
      "Waiting on another dependency",
  },
];


function priorityLabel(
  priority: DevTaskPriority
) {
  switch (priority) {
    case "critical":
      return "CRITICAL";

    case "high":
      return "HIGH";

    case "low":
      return "LOW";

    default:
      return "MEDIUM";
  }
}


function formatDate(
  value: string | null
) {
  if (!value) {
    return "No deadline";
  }


  const date =
    new Date(
      `${value}T12:00:00`
    );


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
    date
  );
}


export default function DevTasksPage() {
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
    tasks,
    setTasks,
  ] =
    useState<
      DevTask[]
    >([]);


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
    devUsers,
    setDevUsers,
  ] =
    useState<
      AssignableDevUser[]
    >([]);


  const [
    currentUserId,
    setCurrentUserId,
  ] =
    useState<
      string | null
    >(null);


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
    search,
    setSearch,
  ] =
    useState("");


  const [
    filter,
    setFilter,
  ] =
    useState<TaskFilter>(
      "all"
    );


  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);


  const [
    editingTask,
    setEditingTask,
  ] =
    useState<
      DevTask | null
    >(null);


  const [
    form,
    setForm,
  ] =
    useState<TaskForm>(
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
    draggedTaskId,
    setDraggedTaskId,
  ] =
    useState<
      string | null
    >(null);


  const [
    dragOverStatus,
    setDragOverStatus,
  ] =
    useState<
      DevTaskStatus | null
    >(null);


  const [
    savingTaskIds,
    setSavingTaskIds,
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


        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();


        const [
          loadedTasks,
          loadedUpdates,
          loadedRoadmap,
          loadedDevUsers,
        ] =
          await Promise.all([
            getDevTasks(
              loadedProject.id
            ),

            getDevUpdates(
              loadedProject.id
            ),

            getDevRoadmapItems(
              loadedProject.id
            ),

            getAssignableDevUsers(),
          ]);


        if (!alive) {
          return;
        }


        setProject(
          loadedProject
        );

        setTasks(
          loadedTasks
        );

        setUpdates(
          loadedUpdates
        );

        setRoadmapItems(
          loadedRoadmap
        );

        setDevUsers(
          loadedDevUsers
        );

        setCurrentUserId(
          user?.id ??
          null
        );
      } catch (
        loadError
      ) {
        console.error(
          "DEV TASKS LOAD ERROR:",
          loadError
        );


        if (!alive) {
          return;
        }


        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load tasks."
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


  const visibleTasks =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        return tasks.filter(
          (
            task
          ) => {
            if (
              filter ===
                "mine" &&
              task.assigned_dev_id !==
                currentUserId
            ) {
              return false;
            }


            if (
              filter ===
                "unassigned" &&
              task.assigned_dev_id
            ) {
              return false;
            }


            if (!query) {
              return true;
            }


            return (
              task.title
                .toLowerCase()
                .includes(
                  query
                ) ||
              (
                task.description ??
                ""
              )
                .toLowerCase()
                .includes(
                  query
                )
            );
          }
        );
      },
      [
        tasks,
        search,
        filter,
        currentUserId,
      ]
    );


  const completedCount =
    tasks.filter(
      (
        task
      ) =>
        task.status ===
        "done"
    ).length;


  const activeCount =
    tasks.filter(
      (
        task
      ) =>
        task.status ===
          "in_progress" ||
        task.status ===
          "review"
    ).length;


  const blockedCount =
    tasks.filter(
      (
        task
      ) =>
        task.status ===
        "blocked"
    ).length;


  function getDevUser(
    id: string | null
  ) {
    if (!id) {
      return null;
    }


    return (
      devUsers.find(
        (
          user
        ) =>
          user.id ===
          id
      ) ??
      null
    );
  }


  function getUpdate(
    id: string | null
  ) {
    if (!id) {
      return null;
    }


    return (
      updates.find(
        (
          update
        ) =>
          update.id ===
          id
      ) ??
      null
    );
  }


  function getRoadmapItem(
    id: string | null
  ) {
    if (!id) {
      return null;
    }


    return (
      roadmapItems.find(
        (
          item
        ) =>
          item.id ===
          id
      ) ??
      null
    );
  }


  function setTaskSaving(
    id: string,
    value: boolean
  ) {
    setSavingTaskIds(
      (
        previous
      ) => {
        if (value) {
          if (
            previous.includes(
              id
            )
          ) {
            return previous;
          }


          return [
            ...previous,
            id,
          ];
        }


        return previous.filter(
          (
            existing
          ) =>
            existing !==
            id
        );
      }
    );
  }


  function openCreate() {
    setEditingTask(
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
    task: DevTask
  ) {
    setEditingTask(
      task
    );


    setForm({
      title:
        task.title,

      description:
        task.description ??
        "",

      status:
        task.status,

      priority:
        task.priority,

      dueDate:
        task.due_date ??
        "",

      assignedDevId:
        task.assigned_dev_id ??
        "",

      updateId:
        task.update_id ??
        "",

      roadmapItemId:
        task.roadmap_item_id ??
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

    setEditingTask(
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
        "Task title is required."
      );

      return;
    }


    const input:
      DevTaskInput = {
      title:
        form.title,

      description:
        form.description,

      status:
        form.status,

      priority:
        form.priority,

      due_date:
        form.dueDate,

      assigned_dev_id:
        form.assignedDevId ||
        null,

      update_id:
        form.updateId ||
        null,

      roadmap_item_id:
        form.roadmapItemId ||
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
        editingTask
      ) {
        const updated =
          await updateDevTask(
            editingTask.id,
            input
          );


        setTasks(
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
      } else {
        const created =
          await createDevTask(
            project.id,
            input
          );


        setTasks(
          (
            previous
          ) => [
            ...previous,
            created,
          ]
        );
      }


      closeModal();
    } catch (
      saveError
    ) {
      console.error(
        "DEV TASK SAVE ERROR:",
        saveError
      );


      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save task."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  async function moveTask(
    task: DevTask,
    status: DevTaskStatus
  ) {
    if (
      task.status ===
        status ||
      savingTaskIds.includes(
        task.id
      )
    ) {
      return;
    }


    const originalTask =
      task;


    const optimisticTask:
      DevTask = {
      ...task,

      status,
    };


    setTaskSaving(
      task.id,
      true
    );


    setTasks(
      (
        previous
      ) =>
        previous.map(
          (
            existing
          ) =>
            existing.id ===
            task.id
              ? optimisticTask
              : existing
        )
    );


    try {
      const updated =
        await updateDevTaskStatus(
          task,
          status
        );


      setTasks(
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
      setTasks(
        (
          previous
        ) =>
          previous.map(
            (
              existing
            ) =>
              existing.id ===
              originalTask.id
                ? originalTask
                : existing
          )
      );


      window.alert(
        moveError instanceof Error
          ? moveError.message
          : "Could not move task."
      );
    } finally {
      setTaskSaving(
        task.id,
        false
      );
    }
  }


  async function handleDelete(
    task: DevTask
  ) {
    const accepted =
      window.confirm(
        `Delete "${task.title}"?`
      );


    if (!accepted) {
      return;
    }


    try {
      await deleteDevTask(
        task.id
      );


      setTasks(
        (
          previous
        ) =>
          previous.filter(
            (
              existing
            ) =>
              existing.id !==
              task.id
          )
      );
    } catch (
      deleteError
    ) {
      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete task."
      );
    }
  }


  function handleDragStart(
    event:
      DragEvent<HTMLElement>,
    task:
      DevTask
  ) {
    setDraggedTaskId(
      task.id
    );


    event.dataTransfer.effectAllowed =
      "move";


    event.dataTransfer.setData(
      "text/plain",
      task.id
    );
  }


  async function handleDrop(
    event:
      DragEvent<HTMLDivElement>,
    status:
      DevTaskStatus
  ) {
    event.preventDefault();


    const taskId =
      event.dataTransfer.getData(
        "text/plain"
      ) ||
      draggedTaskId;


    setDragOverStatus(
      null
    );

    setDraggedTaskId(
      null
    );


    const task =
      tasks.find(
        (
          existing
        ) =>
          existing.id ===
          taskId
      );


    if (!task) {
      return;
    }


    await moveTask(
      task,
      status
    );
  }


  if (loading) {
    return (
      <DevPageGuard>
        <main className="devTasksPage">
          <div className="devTasksState">
            Loading Tasks...
          </div>

          <TaskStyles />
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
        <main className="devTasksPage">
          <div className="devTasksState error">
            {error ||
              "Project not found."}
          </div>

          <TaskStyles />
        </main>
      </DevPageGuard>
    );
  }


  return (
    <DevPageGuard>
      <main
        className="devTasksPage"
        style={
          {
            "--task-accent":
              project.accent,
          } as CSSProperties
        }
      >
        <div className="devTasksBreadcrumbs">
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

          <strong>
            Tasks
          </strong>
        </div>


        <section className="devTasksHero">
          <div>
            <span>
              {project.short_name}
              {" "}
              DEVELOPMENT WORKSPACE
            </span>

            <h1>
              Tasks
            </h1>

            <p>
              Organize development work,
              assign tasks to Auros DEVs and
              connect work directly to the
              Roadmap and Update Planner.
            </p>
          </div>


          <button
            type="button"
            onClick={
              openCreate
            }
          >
            + Create Task
          </button>
        </section>


        <section className="devTasksStats">
          <article>
            <span>
              TOTAL
            </span>

            <strong>
              {tasks.length}
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
              COMPLETED
            </span>

            <strong>
              {completedCount}
            </strong>
          </article>


          <article>
            <span>
              BLOCKED
            </span>

            <strong>
              {blockedCount}
            </strong>
          </article>
        </section>


        <section className="devTasksToolbar">
          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search tasks..."
          />


          <div className="devTaskFilters">
            {(
              [
                [
                  "all",
                  "All Tasks",
                ],

                [
                  "mine",
                  "My Tasks",
                ],

                [
                  "unassigned",
                  "Unassigned",
                ],
              ] as [
                TaskFilter,
                string
              ][]
            ).map(
              (
                [
                  value,
                  label,
                ]
              ) => (
                <button
                  key={
                    value
                  }
                  type="button"
                  className={
                    filter ===
                    value
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter(
                      value
                    )
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>
        </section>


        <div className="devTasksHint">
          Desktop: drag tasks between
          columns. On touch devices use the
          Move selector inside the task.
        </div>


        <section className="devTasksBoard">
          {columns.map(
            (
              column
            ) => {
              const columnTasks =
                visibleTasks.filter(
                  (
                    task
                  ) =>
                    task.status ===
                    column.status
                );


              return (
                <div
                  key={
                    column.status
                  }
                  className={`devTasksColumn ${
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
                  onDrop={(
                    event
                  ) =>
                    handleDrop(
                      event,
                      column.status
                    )
                  }
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
                          columnTasks.length
                        }
                      </span>
                    </div>

                    <p>
                      {
                        column.description
                      }
                    </p>
                  </header>


                  <div className="devTasksColumnContent">
                    {columnTasks.map(
                      (
                        task
                      ) => {
                        const developer =
                          getDevUser(
                            task.assigned_dev_id
                          );


                        const update =
                          getUpdate(
                            task.update_id
                          );


                        const roadmap =
                          getRoadmapItem(
                            task.roadmap_item_id
                          );


                        const isSaving =
                          savingTaskIds.includes(
                            task.id
                          );


                        return (
                          <article
                            key={
                              task.id
                            }
                            className={`devTaskCard ${
                              isSaving
                                ? "saving"
                                : ""
                            } ${
                              draggedTaskId ===
                              task.id
                                ? "dragging"
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
                                task
                              )
                            }
                            onDragEnd={() => {
                              setDraggedTaskId(
                                null
                              );

                              setDragOverStatus(
                                null
                              );
                            }}
                          >
                            <div className="devTaskCardTop">
                              <span
                                className={`taskPriority priority-${task.priority}`}
                              >
                                {priorityLabel(
                                  task.priority
                                )}
                              </span>


                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    task
                                  )
                                }
                              >
                                Edit
                              </button>
                            </div>


                            <h3>
                              {
                                task.title
                              }
                            </h3>


                            {task.description ? (
                              <p className="devTaskDescription">
                                {
                                  task.description
                                }
                              </p>
                            ) : null}


                            <div className="devTaskAssignee">
                              <span>
                                ASSIGNED DEV
                              </span>


                              {developer ? (
                                <div>
                                  <div className="devTaskAvatar">
                                    {developer.avatarUrl ? (
                                      <img
                                        src={
                                          developer.avatarUrl
                                        }
                                        alt=""
                                      />
                                    ) : (
                                      developer.displayName
                                        .slice(
                                          0,
                                          1
                                        )
                                        .toUpperCase()
                                    )}
                                  </div>

                                  <div>
                                    <strong>
                                      {
                                        developer.displayName
                                      }
                                    </strong>

                                    {developer.username ? (
                                      <small>
                                        @
                                        {
                                          developer.username
                                        }
                                      </small>
                                    ) : null}
                                  </div>
                                </div>
                              ) : (
                                <strong className="unassigned">
                                  Unassigned
                                </strong>
                              )}
                            </div>


                            {update ? (
                              <div className="devTaskRelation">
                                <span>
                                  UPDATE / SEASON
                                </span>

                                <strong>
                                  {update.code
                                    ? `${update.code} · `
                                    : ""}

                                  {
                                    update.title
                                  }
                                </strong>
                              </div>
                            ) : null}


                            {roadmap ? (
                              <div className="devTaskRelation">
                                <span>
                                  ROADMAP
                                </span>

                                <strong>
                                  {
                                    roadmap.title
                                  }
                                </strong>
                              </div>
                            ) : null}


                            <div className="devTaskDeadline">
                              <span>
                                DEADLINE
                              </span>

                              <strong>
                                {formatDate(
                                  task.due_date
                                )}
                              </strong>
                            </div>


                            <label className="devTaskMove">
                              <span>
                                MOVE
                              </span>

                              <select
                                value={
                                  task.status
                                }
                                disabled={
                                  isSaving
                                }
                                onChange={(
                                  event
                                ) =>
                                  moveTask(
                                    task,
                                    event
                                      .target
                                      .value as DevTaskStatus
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
                            </label>


                            <footer>
                              <span>
                                {isSaving
                                  ? "SAVING"
                                  : "DRAG"}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    task
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


                    {columnTasks.length ===
                    0 ? (
                      <div className="devTasksColumnEmpty">
                        No tasks
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            }
          )}
        </section>


        {modalOpen ? (
          <div
            className="devTaskModalBackdrop"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <div className="devTaskModal">
              <header>
                <div>
                  <span>
                    DEVELOPMENT TASK
                  </span>

                  <h2>
                    {editingTask
                      ? "Edit Task"
                      : "Create Task"}
                  </h2>
                </div>


                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
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
                    Task Title
                  </span>

                  <input
                    value={
                      form.title
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        {
                          ...form,

                          title:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                    placeholder="Build Battle Bus system"
                    required
                  />
                </label>


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
                      setForm(
                        {
                          ...form,

                          description:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                    placeholder="Describe the work that needs to be completed..."
                  />
                </label>


                <div className="devTaskFormRow">
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
                          {
                            ...form,

                            status:
                              event
                                .target
                                .value as DevTaskStatus,
                          }
                        )
                      }
                    >
                      {columns.map(
                        (
                          column
                        ) => (
                          <option
                            key={
                              column.status
                            }
                            value={
                              column.status
                            }
                          >
                            {
                              column.title
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
                        setForm(
                          {
                            ...form,

                            priority:
                              event
                                .target
                                .value as DevTaskPriority,
                          }
                        )
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
                    Assigned Developer
                  </span>

                  <select
                    value={
                      form.assignedDevId
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        {
                          ...form,

                          assignedDevId:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {devUsers.map(
                      (
                        user
                      ) => (
                        <option
                          key={
                            user.id
                          }
                          value={
                            user.id
                          }
                        >
                          {
                            user.displayName
                          }

                          {user.username
                            ? ` (@${user.username})`
                            : ""}

                          {user.isAdmin
                            ? " · Admin + DEV"
                            : " · DEV"}
                        </option>
                      )
                    )}
                  </select>


                  <small className="devTaskFieldHint">
                    Only accounts with DEV
                    access can be assigned.
                  </small>
                </label>


                <label>
                  <span>
                    Update / Season
                  </span>

                  <select
                    value={
                      form.updateId
                    }
                    onChange={(
                      event
                    ) => {
                      const updateId =
                        event
                          .target
                          .value;


                      const currentRoadmap =
                        roadmapItems.find(
                          (
                            item
                          ) =>
                            item.id ===
                            form.roadmapItemId
                        );


                      setForm({
                        ...form,

                        updateId,

                        roadmapItemId:
                          currentRoadmap &&
                          updateId &&
                          currentRoadmap.update_id &&
                          currentRoadmap.update_id !==
                            updateId
                            ? ""
                            : form.roadmapItemId,
                      });
                    }}
                  >
                    <option value="">
                      No Update / Season
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
                    Roadmap Item
                  </span>

                  <select
                    value={
                      form.roadmapItemId
                    }
                    onChange={(
                      event
                    ) => {
                      const roadmapItemId =
                        event
                          .target
                          .value;


                      const selectedRoadmap =
                        roadmapItems.find(
                          (
                            item
                          ) =>
                            item.id ===
                            roadmapItemId
                        );


                      setForm({
                        ...form,

                        roadmapItemId,

                        updateId:
                          selectedRoadmap?.update_id ??
                          form.updateId,
                      });
                    }}
                  >
                    <option value="">
                      No Roadmap Item
                    </option>

                    {roadmapItems
                      .filter(
                        (
                          item
                        ) =>
                          !form.updateId ||
                          !item.update_id ||
                          item.update_id ===
                            form.updateId
                      )
                      .map(
                        (
                          item
                        ) => {
                          const linkedUpdate =
                            getUpdate(
                              item.update_id
                            );


                          return (
                            <option
                              key={
                                item.id
                              }
                              value={
                                item.id
                              }
                            >
                              {
                                item.title
                              }

                              {linkedUpdate
                                ? ` · ${linkedUpdate.code || linkedUpdate.title}`
                                : ""}
                            </option>
                          );
                        }
                      )}
                  </select>
                </label>


                <label>
                  <span>
                    Deadline
                  </span>

                  <input
                    type="date"
                    value={
                      form.dueDate
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        {
                          ...form,

                          dueDate:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                  />
                </label>


                {formError ? (
                  <div className="devTaskFormError">
                    {
                      formError
                    }
                  </div>
                ) : null}


                <div className="devTaskFormActions">
                  <button
                    type="button"
                    className="secondary"
                    disabled={
                      saving
                    }
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
                      : editingTask
                      ? "Save Changes"
                      : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        <TaskStyles />
      </main>
    </DevPageGuard>
  );
}


function TaskStyles() {
  return (
    <style jsx global>{`
      .devTasksPage {
        --task-accent:
          #b985ff;

        min-height:
          100vh;

        padding:
          18px
          0
          80px;

        color:
          white;
      }

      .devTasksBreadcrumbs {
        display:
          flex;

        flex-wrap:
          wrap;

        align-items:
          center;

        gap:
          8px;

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

      .devTasksBreadcrumbs a {
        color:
          #93a7c6;

        text-decoration:
          none;
      }

      .devTasksBreadcrumbs strong {
        color:
          var(
            --task-accent
          );
      }

      .devTasksHero {
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
            48px
          );

        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --task-accent
            )
            24%,
            transparent
          );

        border-radius:
          27px;

        background:
          radial-gradient(
            circle
            at
            85%
            10%,
            color-mix(
              in srgb,
              var(
                --task-accent
              )
              17%,
              transparent
            ),
            transparent
            38%
          ),
          rgba(
            8,
            17,
            33,
            0.94
          );
      }

      .devTasksHero > div > span {
        color:
          var(
            --task-accent
          );

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          0.13em;
      }

      .devTasksHero h1 {
        margin:
          9px
          0
          0;

        font-size:
          clamp(
            40px,
            6vw,
            62px
          );

        line-height:
          1;

        letter-spacing:
          -0.045em;
      }

      .devTasksHero p {
        max-width:
          700px;

        margin:
          16px
          0
          0;

        color:
          #93a6c3;

        line-height:
          1.7;
      }

      .devTasksHero button {
        flex-shrink:
          0;

        min-height:
          44px;

        padding:
          10px
          16px;

        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --task-accent
            )
            36%,
            transparent
          );

        border-radius:
          12px;

        background:
          color-mix(
            in srgb,
            var(
              --task-accent
            )
            13%,
            transparent
          );

        color:
          white;

        cursor:
          pointer;

        font:
          inherit;

        font-size:
          11px;

        font-weight:
          850;
      }

      .devTasksStats {
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

      .devTasksStats article {
        padding:
          17px;

        border:
          1px solid
          rgba(
            128,
            154,
            198,
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

      .devTasksStats span {
        color:
          #6d82a1;

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.1em;
      }

      .devTasksStats strong {
        display:
          block;

        margin-top:
          7px;

        font-size:
          25px;
      }

      .devTasksToolbar {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          14px;

        margin-top:
          18px;
      }

      .devTasksToolbar > input {
        width:
          min(
            360px,
            100%
          );

        min-height:
          39px;

        padding:
          8px
          12px;

        border:
          1px solid
          rgba(
            128,
            154,
            198,
            0.14
          );

        border-radius:
          11px;

        outline:
          none;

        background:
          rgba(
            8,
            17,
            33,
            0.85
          );

        color:
          white;
      }

      .devTaskFilters {
        display:
          flex;

        flex-wrap:
          wrap;

        gap:
          7px;
      }

      .devTaskFilters button {
        padding:
          8px
          11px;

        border:
          1px solid
          rgba(
            128,
            154,
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
          #8296b4;

        cursor:
          pointer;

        font:
          inherit;

        font-size:
          9px;

        font-weight:
          800;
      }

      .devTaskFilters button.active {
        border-color:
          color-mix(
            in srgb,
            var(
              --task-accent
            )
            34%,
            transparent
          );

        background:
          color-mix(
            in srgb,
            var(
              --task-accent
            )
            10%,
            transparent
          );

        color:
          white;
      }

      .devTasksHint {
        margin:
          12px
          2px
          0;

        color:
          #657a99;

        font-size:
          9px;
      }

      .devTasksBoard {
        display:
          grid;

        grid-template-columns:
          repeat(
            5,
            minmax(
              260px,
              1fr
            )
          );

        gap:
          11px;

        margin-top:
          14px;

        overflow-x:
          auto;

        padding-bottom:
          8px;
      }

      .devTasksColumn {
        min-height:
          480px;

        overflow:
          hidden;

        border:
          1px solid
          rgba(
            128,
            154,
            198,
            0.12
          );

        border-radius:
          17px;

        background:
          rgba(
            6,
            14,
            28,
            0.72
          );

        transition:
          border-color
          140ms
          ease,
          background
          140ms
          ease;
      }

      .devTasksColumn.dragOver {
        border-color:
          var(
            --task-accent
          );

        background:
          color-mix(
            in srgb,
            var(
              --task-accent
            )
            5%,
            rgba(
              6,
              14,
              28,
              0.8
            )
          );
      }

      .devTasksColumn > header {
        padding:
          15px;

        border-bottom:
          1px solid
          rgba(
            128,
            154,
            198,
            0.08
          );
      }

      .devTasksColumn > header > div {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          10px;
      }

      .devTasksColumn > header strong {
        font-size:
          12px;
      }

      .devTasksColumn > header span {
        min-width:
          24px;

        padding:
          4px
          6px;

        border-radius:
          999px;

        background:
          rgba(
            255,
            255,
            255,
            0.04
          );

        color:
          #8196b5;

        text-align:
          center;

        font-size:
          8px;
      }

      .devTasksColumn > header p {
        margin:
          5px
          0
          0;

        color:
          #627795;

        font-size:
          9px;
      }

      .devTasksColumnContent {
        display:
          grid;

        align-content:
          start;

        gap:
          9px;

        padding:
          10px;
      }

      .devTaskCard {
        padding:
          14px;

        border:
          1px solid
          rgba(
            128,
            154,
            198,
            0.12
          );

        border-radius:
          13px;

        background:
          rgba(
            11,
            23,
            43,
            0.96
          );

        cursor:
          grab;

        transition:
          opacity
          140ms
          ease,
          transform
          140ms
          ease;
      }

      .devTaskCard.dragging {
        opacity:
          0.42;

        transform:
          scale(
            0.985
          );
      }

      .devTaskCard.saving {
        opacity:
          0.6;
      }

      .devTaskCardTop {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          10px;
      }

      .devTaskCardTop button,
      .devTaskCard footer button {
        border:
          0;

        background:
          transparent;

        color:
          #8397b5;

        cursor:
          pointer;

        font:
          inherit;

        font-size:
          9px;

        font-weight:
          750;
      }

      .taskPriority {
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
            0.03
          );

        font-size:
          7px;

        font-weight:
          950;

        letter-spacing:
          0.07em;
      }

      .taskPriority.priority-low {
        color:
          #98abc7;
      }

      .taskPriority.priority-medium {
        color:
          #69cefa;
      }

      .taskPriority.priority-high {
        color:
          #ffc76f;
      }

      .taskPriority.priority-critical {
        color:
          #ff879a;
      }

      .devTaskCard h3 {
        margin:
          13px
          0
          0;

        font-size:
          15px;

        letter-spacing:
          -0.02em;
      }

      .devTaskDescription {
        margin:
          8px
          0
          0;

        color:
          #7f93b1;

        font-size:
          10px;

        line-height:
          1.55;
      }

      .devTaskAssignee {
        margin-top:
          13px;

        padding:
          9px;

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

      .devTaskAssignee > span,
      .devTaskRelation > span,
      .devTaskDeadline > span {
        display:
          block;

        color:
          #5d7290;

        font-size:
          7px;

        font-weight:
          900;

        letter-spacing:
          0.08em;
      }

      .devTaskAssignee > div {
        display:
          flex;

        align-items:
          center;

        gap:
          8px;

        margin-top:
          7px;
      }

      .devTaskAvatar {
        width:
          28px;

        height:
          28px;

        overflow:
          hidden;

        display:
          grid;

        place-items:
          center;

        border-radius:
          50%;

        background:
          color-mix(
            in srgb,
            var(
              --task-accent
            )
            14%,
            transparent
          );

        color:
          var(
            --task-accent
          );

        font-size:
          10px;

        font-weight:
          900;
      }

      .devTaskAvatar img {
        width:
          100%;

        height:
          100%;

        object-fit:
          cover;
      }

      .devTaskAssignee strong {
        display:
          block;

        font-size:
          10px;
      }

      .devTaskAssignee small {
        display:
          block;

        margin-top:
          2px;

        color:
          #667c9b;

        font-size:
          8px;
      }

      .devTaskAssignee .unassigned {
        margin-top:
          6px;

        color:
          #7085a4;
      }

      .devTaskRelation,
      .devTaskDeadline {
        margin-top:
          8px;

        padding:
          8px
          9px;

        border:
          1px solid
          rgba(
            128,
            154,
            198,
            0.08
          );

        border-radius:
          8px;

        background:
          rgba(
            255,
            255,
            255,
            0.015
          );
      }

      .devTaskRelation strong,
      .devTaskDeadline strong {
        display:
          block;

        margin-top:
          4px;

        color:
          #9bacc4;

        font-size:
          9px;
      }

      .devTaskRelation strong {
        color:
          var(
            --task-accent
          );
      }

      .devTaskMove {
        display:
          grid;

        gap:
          5px;

        margin-top:
          11px;
      }

      .devTaskMove > span {
        color:
          #5f7492;

        font-size:
          7px;

        font-weight:
          900;
      }

      .devTaskMove select {
        width:
          100%;

        padding:
          7px;

        border:
          1px solid
          rgba(
            128,
            154,
            198,
            0.12
          );

        border-radius:
          8px;

        background:
          #09172a;

        color:
          #9eb0c9;

        font-size:
          9px;
      }

      .devTaskCard footer {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          10px;

        margin-top:
          11px;

        padding-top:
          9px;

        border-top:
          1px solid
          rgba(
            128,
            154,
            198,
            0.07
          );
      }

      .devTaskCard footer span {
        color:
          #536987;

        font-size:
          7px;

        font-weight:
          900;
      }

      .devTaskCard footer button {
        color:
          #b46e7b;
      }

      .devTasksColumnEmpty {
        padding:
          24px
          8px;

        color:
          #4f6482;

        text-align:
          center;

        font-size:
          9px;
      }

      .devTaskModalBackdrop {
        position:
          fixed;

        z-index:
          1100;

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

        backdrop-filter:
          blur(
            8px
          );
      }

      .devTaskModal {
        width:
          min(
            650px,
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
          25px;

        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --task-accent
            )
            27%,
            transparent
          );

        border-radius:
          22px;

        background:
          #091223;
      }

      .devTaskModal > header {
        display:
          flex;

        align-items:
          flex-start;

        justify-content:
          space-between;

        gap:
          20px;
      }

      .devTaskModal > header span {
        color:
          var(
            --task-accent
          );

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.13em;
      }

      .devTaskModal > header h2 {
        margin:
          6px
          0
          0;

        font-size:
          29px;
      }

      .devTaskModal > header button {
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
          rgba(
            255,
            255,
            255,
            0.03
          );

        color:
          white;

        cursor:
          pointer;

        font-size:
          21px;
      }

      .devTaskModal form {
        display:
          grid;

        gap:
          15px;

        margin-top:
          22px;
      }

      .devTaskModal label {
        display:
          grid;

        gap:
          7px;
      }

      .devTaskModal label > span {
        color:
          #9db0ca;

        font-size:
          10px;

        font-weight:
          800;
      }

      .devTaskModal input,
      .devTaskModal textarea,
      .devTaskModal select {
        width:
          100%;

        min-height:
          42px;

        padding:
          10px
          11px;

        border:
          1px solid
          rgba(
            128,
            154,
            198,
            0.16
          );

        border-radius:
          10px;

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

        font-size:
          11px;
      }

      .devTaskModal textarea {
        min-height:
          95px;

        resize:
          vertical;
      }

      .devTaskModal select option {
        background:
          #091223;
      }

      .devTaskFormRow {
        display:
          grid;

        grid-template-columns:
          1fr
          1fr;

        gap:
          11px;
      }

      .devTaskFieldHint {
        color:
          #607594;

        font-size:
          8px;
      }

      .devTaskFormError {
        padding:
          10px
          12px;

        border:
          1px solid
          rgba(
            255,
            110,
            130,
            0.2
          );

        border-radius:
          9px;

        background:
          rgba(
            255,
            110,
            130,
            0.06
          );

        color:
          #ffa0af;

        font-size:
          10px;
      }

      .devTaskFormActions {
        display:
          flex;

        justify-content:
          flex-end;

        gap:
          9px;
      }

      .devTaskFormActions button {
        min-height:
          41px;

        padding:
          9px
          14px;

        border-radius:
          10px;

        cursor:
          pointer;

        font:
          inherit;

        font-size:
          10px;

        font-weight:
          850;
      }

      .devTaskFormActions .secondary {
        border:
          1px solid
          rgba(
            128,
            154,
            198,
            0.14
          );

        background:
          transparent;

        color:
          #91a4c0;
      }

      .devTaskFormActions .primary {
        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --task-accent
            )
            34%,
            transparent
          );

        background:
          color-mix(
            in srgb,
            var(
              --task-accent
            )
            14%,
            transparent
          );

        color:
          white;
      }

      .devTasksState {
        padding:
          27px;

        border:
          1px solid
          rgba(
            128,
            154,
            198,
            0.14
          );

        border-radius:
          18px;

        background:
          rgba(
            8,
            17,
            33,
            0.9
          );

        color:
          #91a5c1;
      }

      .devTasksState.error {
        color:
          #ff9dac;
      }

      @media (
        max-width:
          900px
      ) {
        .devTasksStats {
          grid-template-columns:
            1fr
            1fr;
        }
      }

      @media (
        max-width:
          700px
      ) {
        .devTasksHero {
          align-items:
            flex-start;

          flex-direction:
            column;

          padding:
            25px
            21px;

          border-radius:
            22px;
        }

        .devTasksHero button {
          width:
            100%;
        }

        .devTasksToolbar {
          align-items:
            stretch;

          flex-direction:
            column;
        }

        .devTasksToolbar > input {
          width:
            100%;
        }

        .devTaskFormRow {
          grid-template-columns:
            1fr;
        }
      }

      @media (
        max-width:
          450px
      ) {
        .devTasksStats {
          grid-template-columns:
            1fr;
        }
      }

      @media (
        prefers-reduced-motion:
          reduce
      ) {
        .devTaskCard,
        .devTasksColumn {
          transition:
            none;
        }
      }
    `}</style>
  );
}