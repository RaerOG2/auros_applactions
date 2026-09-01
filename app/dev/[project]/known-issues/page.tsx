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
  getDevUpdates,
} from "../../../../services/dev-update.service";

import {
  getDevRoadmapItems,
} from "../../../../services/dev-roadmap.service";

import {
  getDevTasks,
} from "../../../../services/dev-task.service";

import {
  getAssignableDevUsers,
} from "../../../../services/dev-user.service";

import {
  createDevKnownIssue,
  deleteDevKnownIssue,
  getDevKnownIssues,
  updateDevKnownIssue,
  updateDevKnownIssueStatus,
} from "../../../../services/dev-known-issue.service";

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
} from "../../../../types/dev-tasks";

import type {
  DevKnownIssue,
  DevKnownIssueInput,
  DevKnownIssueSeverity,
  DevKnownIssueStatus,
} from "../../../../types/dev-known-issues";


type IssueForm = {
  title: string;

  description: string;

  category: string;

  affectedVersion: string;

  internalNotes: string;

  status: DevKnownIssueStatus;

  severity: DevKnownIssueSeverity;

  assignedDevId: string;

  updateId: string;

  roadmapItemId: string;

  taskId: string;
};


type IssueStatusFilter =
  | "all"
  | "open"
  | DevKnownIssueStatus;


type IssueSeverityFilter =
  | "all"
  | DevKnownIssueSeverity;


const emptyForm: IssueForm = {
  title: "",

  description: "",

  category: "",

  affectedVersion: "",

  internalNotes: "",

  status:
    "investigating",

  severity:
    "medium",

  assignedDevId: "",

  updateId: "",

  roadmapItemId: "",

  taskId: "",
};


const statuses: {
  value: DevKnownIssueStatus;

  label: string;
}[] = [
  {
    value:
      "investigating",

    label:
      "Investigating",
  },

  {
    value:
      "identified",

    label:
      "Identified",
  },

  {
    value:
      "fix_in_progress",

    label:
      "Fix In Progress",
  },

  {
    value:
      "testing",

    label:
      "Testing",
  },

  {
    value:
      "resolved",

    label:
      "Resolved",
  },

  {
    value:
      "wont_fix",

    label:
      "Won't Fix",
  },
];


const severities: {
  value: DevKnownIssueSeverity;

  label: string;
}[] = [
  {
    value:
      "low",

    label:
      "Low",
  },

  {
    value:
      "medium",

    label:
      "Medium",
  },

  {
    value:
      "high",

    label:
      "High",
  },

  {
    value:
      "critical",

    label:
      "Critical",
  },
];


function statusLabel(
  value: DevKnownIssueStatus
) {
  return (
    statuses.find(
      (
        status
      ) =>
        status.value ===
        value
    )?.label ??
    value
  );
}


function severityLabel(
  value: DevKnownIssueSeverity
) {
  return (
    severities.find(
      (
        severity
      ) =>
        severity.value ===
        value
    )?.label ??
    value
  );
}


function formatTimestamp(
  value: string
) {
  const date =
    new Date(
      value
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

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    date
  );
}


function isOpenIssue(
  issue: DevKnownIssue
) {
  return (
    issue.status !==
      "resolved" &&
    issue.status !==
      "wont_fix"
  );
}


function severityWeight(
  severity: DevKnownIssueSeverity
) {
  switch (severity) {
    case "critical":
      return 4;

    case "high":
      return 3;

    case "medium":
      return 2;

    default:
      return 1;
  }
}


export default function DevKnownIssuesPage() {
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
    issues,
    setIssues,
  ] =
    useState<
      DevKnownIssue[]
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
    tasks,
    setTasks,
  ] =
    useState<
      DevTask[]
    >([]);


  const [
    devUsers,
    setDevUsers,
  ] =
    useState<
      AssignableDevUser[]
    >([]);


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
    >(null);


  const [
    search,
    setSearch,
  ] =
    useState(
      ""
    );


  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      IssueStatusFilter
    >(
      "all"
    );


  const [
    severityFilter,
    setSeverityFilter,
  ] =
    useState<
      IssueSeverityFilter
    >(
      "all"
    );


  const [
    developerFilter,
    setDeveloperFilter,
  ] =
    useState(
      "all"
    );


  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(
      false
    );


  const [
    editingIssue,
    setEditingIssue,
  ] =
    useState<
      DevKnownIssue | null
    >(
      null
    );


  const [
    form,
    setForm,
  ] =
    useState<IssueForm>(
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
    useState<
      string | null
    >(
      null
    );


  const [
    savingIssueIds,
    setSavingIssueIds,
  ] =
    useState<
      string[]
    >(
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


          if (!loadedProject) {
            throw new Error(
              "Development project not found."
            );
          }


          const [
            loadedIssues,
            loadedUpdates,
            loadedRoadmap,
            loadedTasks,
            loadedDevUsers,
          ] =
            await Promise.all([
              getDevKnownIssues(
                loadedProject.id
              ),

              getDevUpdates(
                loadedProject.id
              ),

              getDevRoadmapItems(
                loadedProject.id
              ),

              getDevTasks(
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

          setIssues(
            loadedIssues
          );

          setUpdates(
            loadedUpdates
          );

          setRoadmapItems(
            loadedRoadmap
          );

          setTasks(
            loadedTasks
          );

          setDevUsers(
            loadedDevUsers
          );
        } catch (
          loadError
        ) {
          console.error(
            "KNOWN ISSUES LOAD ERROR:",
            loadError
          );


          if (!alive) {
            return;
          }


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load known issues."
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


  const visibleIssues =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        return issues
          .filter(
            (
              issue
            ) => {
              if (
                statusFilter ===
                "open"
              ) {
                if (
                  !isOpenIssue(
                    issue
                  )
                ) {
                  return false;
                }
              } else if (
                statusFilter !==
                  "all" &&
                issue.status !==
                  statusFilter
              ) {
                return false;
              }


              if (
                severityFilter !==
                  "all" &&
                issue.severity !==
                  severityFilter
              ) {
                return false;
              }


              if (
                developerFilter ===
                "unassigned"
              ) {
                if (
                  issue.assigned_dev_id
                ) {
                  return false;
                }
              } else if (
                developerFilter !==
                  "all" &&
                issue.assigned_dev_id !==
                  developerFilter
              ) {
                return false;
              }


              if (!query) {
                return true;
              }


              const haystack = [
                issue.title,

                issue.description ??
                  "",

                issue.category ??
                  "",

                issue.affected_version ??
                  "",

                issue.internal_notes ??
                  "",
              ]
                .join(
                  " "
                )
                .toLowerCase();


              return haystack.includes(
                query
              );
            }
          )
          .sort(
            (
              first,
              second
            ) => {
              const firstClosed =
                !isOpenIssue(
                  first
                );

              const secondClosed =
                !isOpenIssue(
                  second
                );


              if (
                firstClosed !==
                secondClosed
              ) {
                return firstClosed
                  ? 1
                  : -1;
              }


              const severityDifference =
                severityWeight(
                  second.severity
                ) -
                severityWeight(
                  first.severity
                );


              if (
                severityDifference !==
                0
              ) {
                return severityDifference;
              }


              return (
                new Date(
                  second.updated_at
                ).getTime() -
                new Date(
                  first.updated_at
                ).getTime()
              );
            }
          );
      },
      [
        issues,
        search,
        statusFilter,
        severityFilter,
        developerFilter,
      ]
    );


  const openCount =
    issues.filter(
      isOpenIssue
    ).length;


  const criticalCount =
    issues.filter(
      (
        issue
      ) =>
        isOpenIssue(
          issue
        ) &&
        issue.severity ===
          "critical"
    ).length;


  const fixingCount =
    issues.filter(
      (
        issue
      ) =>
        issue.status ===
        "fix_in_progress"
    ).length;


  const resolvedCount =
    issues.filter(
      (
        issue
      ) =>
        issue.status ===
        "resolved"
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


  function getTask(
    id: string | null
  ) {
    if (!id) {
      return null;
    }


    return (
      tasks.find(
        (
          task
        ) =>
          task.id ===
          id
      ) ??
      null
    );
  }


  function setIssueSaving(
    issueId: string,
    value: boolean
  ) {
    setSavingIssueIds(
      (
        previous
      ) => {
        if (value) {
          if (
            previous.includes(
              issueId
            )
          ) {
            return previous;
          }


          return [
            ...previous,
            issueId,
          ];
        }


        return previous.filter(
          (
            id
          ) =>
            id !==
            issueId
        );
      }
    );
  }


  function openCreate() {
    setEditingIssue(
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
    issue: DevKnownIssue
  ) {
    setEditingIssue(
      issue
    );


    setForm({
      title:
        issue.title,

      description:
        issue.description ??
        "",

      category:
        issue.category ??
        "",

      affectedVersion:
        issue.affected_version ??
        "",

      internalNotes:
        issue.internal_notes ??
        "",

      status:
        issue.status,

      severity:
        issue.severity,

      assignedDevId:
        issue.assigned_dev_id ??
        "",

      updateId:
        issue.update_id ??
        "",

      roadmapItemId:
        issue.roadmap_item_id ??
        "",

      taskId:
        issue.task_id ??
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

    setEditingIssue(
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
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    if (!project) {
      return;
    }


    if (
      !form.title.trim()
    ) {
      setFormError(
        "Issue title is required."
      );

      return;
    }


    const input: DevKnownIssueInput = {
      title:
        form.title,

      description:
        form.description,

      category:
        form.category,

      affected_version:
        form.affectedVersion,

      internal_notes:
        form.internalNotes,

      status:
        form.status,

      severity:
        form.severity,

      assigned_dev_id:
        form.assignedDevId ||
        null,

      update_id:
        form.updateId ||
        null,

      roadmap_item_id:
        form.roadmapItemId ||
        null,

      task_id:
        form.taskId ||
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
        editingIssue
      ) {
        const updated =
          await updateDevKnownIssue(
            editingIssue.id,
            input
          );


        setIssues(
          (
            previous
          ) =>
            previous.map(
              (
                issue
              ) =>
                issue.id ===
                updated.id
                  ? updated
                  : issue
            )
        );
      } else {
        const created =
          await createDevKnownIssue(
            project.id,
            input
          );


        setIssues(
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

      setEditingIssue(
        null
      );

      setForm(
        emptyForm
      );
    } catch (
      saveError
    ) {
      console.error(
        "KNOWN ISSUE SAVE ERROR:",
        saveError
      );


      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save known issue."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  async function handleStatusChange(
    issue: DevKnownIssue,
    status: DevKnownIssueStatus
  ) {
    if (
      issue.status ===
        status ||
      savingIssueIds.includes(
        issue.id
      )
    ) {
      return;
    }


    const previousStatus =
      issue.status;


    setIssueSaving(
      issue.id,
      true
    );


    setIssues(
      (
        previous
      ) =>
        previous.map(
          (
            current
          ) =>
            current.id ===
            issue.id
              ? {
                  ...current,

                  status,

                  updated_at:
                    new Date().toISOString(),
                }
              : current
        )
    );


    try {
      const updated =
        await updateDevKnownIssueStatus(
          issue,
          status
        );


      setIssues(
        (
          previous
        ) =>
          previous.map(
            (
              current
            ) =>
              current.id ===
              updated.id
                ? updated
                : current
          )
      );
    } catch (
      statusError
    ) {
      setIssues(
        (
          previous
        ) =>
          previous.map(
            (
              current
            ) =>
              current.id ===
              issue.id
                ? {
                    ...current,

                    status:
                      previousStatus,
                  }
                : current
          )
      );


      window.alert(
        statusError instanceof Error
          ? statusError.message
          : "Could not update issue status."
      );
    } finally {
      setIssueSaving(
        issue.id,
        false
      );
    }
  }


  async function handleDelete(
    issue: DevKnownIssue
  ) {
    const confirmed =
      window.confirm(
        `Delete known issue "${issue.title}"?`
      );


    if (!confirmed) {
      return;
    }


    try {
      await deleteDevKnownIssue(
        issue.id
      );


      setIssues(
        (
          previous
        ) =>
          previous.filter(
            (
              current
            ) =>
              current.id !==
              issue.id
          )
      );
    } catch (
      deleteError
    ) {
      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete known issue."
      );
    }
  }


  if (loading) {
    return (
      <DevPageGuard>
        <main className="knownIssuesPage">
          <div className="knownIssuesState">
            Loading Known Issues...
          </div>

          <KnownIssueStyles />
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
        <main className="knownIssuesPage">
          <div className="knownIssuesState error">
            {error ||
              "Project not found."}
          </div>

          <KnownIssueStyles />
        </main>
      </DevPageGuard>
    );
  }


  return (
    <DevPageGuard>
      <main
        className="knownIssuesPage"
        style={
          {
            "--issue-accent":
              project.accent,
          } as CSSProperties
        }
      >
        <div className="knownIssuesBreadcrumbs">
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
            Known Issues
          </strong>
        </div>


        <section className="knownIssuesHero">
          <div>
            <span>
              {project.short_name}
              {" "}
              ISSUE TRACKER
            </span>

            <h1>
              Known Issues
            </h1>

            <p>
              Track bugs, technical problems,
              investigations and active fixes
              across the development project.
            </p>
          </div>


          <button
            type="button"
            onClick={
              openCreate
            }
          >
            + Report Issue
          </button>
        </section>


        <section className="knownIssuesStats">
          <article>
            <span>
              OPEN
            </span>

            <strong>
              {openCount}
            </strong>
          </article>


          <article className="critical">
            <span>
              CRITICAL
            </span>

            <strong>
              {criticalCount}
            </strong>
          </article>


          <article>
            <span>
              FIX IN PROGRESS
            </span>

            <strong>
              {fixingCount}
            </strong>
          </article>


          <article>
            <span>
              RESOLVED
            </span>

            <strong>
              {resolvedCount}
            </strong>
          </article>
        </section>


        <section className="knownIssuesToolbar">
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
            placeholder="Search known issues..."
          />


          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target.value as IssueStatusFilter
              )
            }
          >
            <option value="all">
              All Statuses
            </option>

            <option value="open">
              All Open
            </option>

            {statuses.map(
              (
                status
              ) => (
                <option
                  key={
                    status.value
                  }
                  value={
                    status.value
                  }
                >
                  {
                    status.label
                  }
                </option>
              )
            )}
          </select>


          <select
            value={
              severityFilter
            }
            onChange={(
              event
            ) =>
              setSeverityFilter(
                event.target.value as IssueSeverityFilter
              )
            }
          >
            <option value="all">
              All Severities
            </option>

            {severities.map(
              (
                severity
              ) => (
                <option
                  key={
                    severity.value
                  }
                  value={
                    severity.value
                  }
                >
                  {
                    severity.label
                  }
                </option>
              )
            )}
          </select>


          <select
            value={
              developerFilter
            }
            onChange={(
              event
            ) =>
              setDeveloperFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Developers
            </option>

            <option value="unassigned">
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
                </option>
              )
            )}
          </select>
        </section>


        <div className="knownIssuesResults">
          <span>
            {
              visibleIssues.length
            }
            {" "}
            issue
            {visibleIssues.length ===
            1
              ? ""
              : "s"}
          </span>


          {(search ||
            statusFilter !==
              "all" ||
            severityFilter !==
              "all" ||
            developerFilter !==
              "all") ? (
            <button
              type="button"
              onClick={() => {
                setSearch(
                  ""
                );

                setStatusFilter(
                  "all"
                );

                setSeverityFilter(
                  "all"
                );

                setDeveloperFilter(
                  "all"
                );
              }}
            >
              Clear Filters
            </button>
          ) : null}
        </div>


        <section className="knownIssuesGrid">
          {visibleIssues.map(
            (
              issue
            ) => {
              const developer =
                getDevUser(
                  issue.assigned_dev_id
                );


              const update =
                getUpdate(
                  issue.update_id
                );


              const roadmap =
                getRoadmapItem(
                  issue.roadmap_item_id
                );


              const task =
                getTask(
                  issue.task_id
                );


              const isSaving =
                savingIssueIds.includes(
                  issue.id
                );


              return (
                <article
                  key={
                    issue.id
                  }
                  className={`knownIssueCard severity-${issue.severity} ${
                    !isOpenIssue(
                      issue
                    )
                      ? "closed"
                      : ""
                  }`}
                >
                  <div className="knownIssueCardHeader">
                    <div>
                      <span
                        className={`knownIssueSeverity severity-${issue.severity}`}
                      >
                        {severityLabel(
                          issue.severity
                        )}
                      </span>

                      <span
                        className={`knownIssueStatus status-${issue.status}`}
                      >
                        {statusLabel(
                          issue.status
                        )}
                      </span>
                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        openEdit(
                          issue
                        )
                      }
                    >
                      Edit
                    </button>
                  </div>


                  <h2>
                    {
                      issue.title
                    }
                  </h2>


                  {issue.description ? (
                    <p className="knownIssueDescription">
                      {
                        issue.description
                      }
                    </p>
                  ) : null}


                  <div className="knownIssueMeta">
                    <div>
                      <span>
                        CATEGORY
                      </span>

                      <strong>
                        {issue.category ||
                          "Uncategorized"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        AFFECTED
                      </span>

                      <strong>
                        {issue.affected_version ||
                          "Not specified"}
                      </strong>
                    </div>
                  </div>


                  <div className="knownIssueAssignee">
                    <span>
                      ASSIGNED DEV
                    </span>


                    {developer ? (
                      <div>
                        <div className="knownIssueAvatar">
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


                  {(update ||
                    roadmap ||
                    task) ? (
                    <div className="knownIssueRelations">
                      {update ? (
                        <div>
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
                        <div>
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


                      {task ? (
                        <div>
                          <span>
                            TASK
                          </span>

                          <strong>
                            {
                              task.title
                            }
                          </strong>
                        </div>
                      ) : null}
                    </div>
                  ) : null}


                  {issue.internal_notes ? (
                    <details className="knownIssueNotes">
                      <summary>
                        Internal Notes
                      </summary>

                      <p>
                        {
                          issue.internal_notes
                        }
                      </p>
                    </details>
                  ) : null}


                  <div className="knownIssueStatusChanger">
                    <span>
                      STATUS
                    </span>

                    <select
                      value={
                        issue.status
                      }
                      disabled={
                        isSaving
                      }
                      onChange={(
                        event
                      ) =>
                        handleStatusChange(
                          issue,
                          event.target.value as DevKnownIssueStatus
                        )
                      }
                    >
                      {statuses.map(
                        (
                          status
                        ) => (
                          <option
                            key={
                              status.value
                            }
                            value={
                              status.value
                            }
                          >
                            {
                              status.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>


                  <footer>
                    <span>
                      Updated
                      {" "}
                      {formatTimestamp(
                        issue.updated_at
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          issue
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


          {visibleIssues.length ===
          0 ? (
            <div className="knownIssuesEmpty">
              <strong>
                No matching issues
              </strong>

              <p>
                There are currently no known
                issues matching these filters.
              </p>
            </div>
          ) : null}
        </section>


        {modalOpen ? (
          <div
            className="knownIssueModalBackdrop"
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
            <div className="knownIssueModal">
              <header>
                <div>
                  <span>
                    ISSUE TRACKER
                  </span>

                  <h2>
                    {editingIssue
                      ? "Edit Known Issue"
                      : "Report Known Issue"}
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
                    Issue Title
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
                    placeholder="Describe the problem briefly"
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
                      setForm({
                        ...form,

                        description:
                          event.target.value,
                      })
                    }
                    placeholder="What is happening and how does the issue affect the project?"
                  />
                </label>


                <div className="knownIssueFormRow">
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
                            event.target.value as DevKnownIssueStatus,
                        })
                      }
                    >
                      {statuses.map(
                        (
                          status
                        ) => (
                          <option
                            key={
                              status.value
                            }
                            value={
                              status.value
                            }
                          >
                            {
                              status.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>


                  <label>
                    <span>
                      Severity
                    </span>

                    <select
                      value={
                        form.severity
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          severity:
                            event.target.value as DevKnownIssueSeverity,
                        })
                      }
                    >
                      {severities.map(
                        (
                          severity
                        ) => (
                          <option
                            key={
                              severity.value
                            }
                            value={
                              severity.value
                            }
                          >
                            {
                              severity.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>


                <div className="knownIssueFormRow">
                  <label>
                    <span>
                      Category / Area
                    </span>

                    <input
                      value={
                        form.category
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          category:
                            event.target.value,
                        })
                      }
                      placeholder="Gameplay, Map, Mobile, API..."
                    />
                  </label>


                  <label>
                    <span>
                      Affected Version / Season
                    </span>

                    <input
                      value={
                        form.affectedVersion
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          affectedVersion:
                            event.target.value,
                        })
                      }
                      placeholder="1.2.1 or Season 1"
                    />
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
                      setForm({
                        ...form,

                        assignedDevId:
                          event.target.value,
                      })
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

                  <small className="knownIssueFieldHint">
                    Only accounts with DEV
                    access are available.
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
                        event.target.value;


                      const selectedRoadmap =
                        roadmapItems.find(
                          (
                            item
                          ) =>
                            item.id ===
                            form.roadmapItemId
                        );


                      const selectedTask =
                        tasks.find(
                          (
                            task
                          ) =>
                            task.id ===
                            form.taskId
                        );


                      setForm({
                        ...form,

                        updateId,

                        roadmapItemId:
                          selectedRoadmap &&
                          updateId &&
                          selectedRoadmap.update_id &&
                          selectedRoadmap.update_id !==
                            updateId
                            ? ""
                            : form.roadmapItemId,

                        taskId:
                          selectedTask &&
                          updateId &&
                          selectedTask.update_id &&
                          selectedTask.update_id !==
                            updateId
                            ? ""
                            : form.taskId,
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
                        event.target.value;


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
                        ) => (
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
                          </option>
                        )
                      )}
                  </select>
                </label>


                <label>
                  <span>
                    Related Task
                  </span>

                  <select
                    value={
                      form.taskId
                    }
                    onChange={(
                      event
                    ) => {
                      const taskId =
                        event.target.value;


                      const selectedTask =
                        tasks.find(
                          (
                            task
                          ) =>
                            task.id ===
                            taskId
                        );


                      setForm({
                        ...form,

                        taskId,

                        updateId:
                          selectedTask?.update_id ??
                          form.updateId,

                        roadmapItemId:
                          selectedTask?.roadmap_item_id ??
                          form.roadmapItemId,
                      });
                    }}
                  >
                    <option value="">
                      No Related Task
                    </option>

                    {tasks
                      .filter(
                        (
                          task
                        ) =>
                          !form.updateId ||
                          !task.update_id ||
                          task.update_id ===
                            form.updateId
                      )
                      .filter(
                        (
                          task
                        ) =>
                          !form.roadmapItemId ||
                          !task.roadmap_item_id ||
                          task.roadmap_item_id ===
                            form.roadmapItemId
                      )
                      .map(
                        (
                          task
                        ) => (
                          <option
                            key={
                              task.id
                            }
                            value={
                              task.id
                            }
                          >
                            {
                              task.title
                            }
                          </option>
                        )
                      )}
                  </select>
                </label>


                <label>
                  <span>
                    Internal Notes
                  </span>

                  <textarea
                    rows={
                      5
                    }
                    value={
                      form.internalNotes
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        internalNotes:
                          event.target.value,
                      })
                    }
                    placeholder="Investigation, possible causes, workarounds, technical notes..."
                  />
                </label>


                {formError ? (
                  <div className="knownIssueFormError">
                    {
                      formError
                    }
                  </div>
                ) : null}


                <div className="knownIssueFormActions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={
                      closeModal
                    }
                    disabled={
                      saving
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
                      : editingIssue
                      ? "Save Changes"
                      : "Report Issue"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}


        <KnownIssueStyles />
      </main>
    </DevPageGuard>
  );
}


function KnownIssueStyles() {
  return (
    <style jsx global>{`
      .knownIssuesPage {
        --issue-accent:
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

      .knownIssuesBreadcrumbs {
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

      .knownIssuesBreadcrumbs a {
        color:
          #93a7c6;

        text-decoration:
          none;
      }

      .knownIssuesBreadcrumbs strong {
        color:
          var(
            --issue-accent
          );
      }

      .knownIssuesHero {
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
              --issue-accent
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
            15%,
            color-mix(
              in srgb,
              var(
                --issue-accent
              )
              16%,
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

      .knownIssuesHero > div > span {
        color:
          var(
            --issue-accent
          );

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          0.13em;
      }

      .knownIssuesHero h1 {
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

      .knownIssuesHero p {
        max-width:
          690px;

        margin:
          16px
          0
          0;

        color:
          #93a6c3;

        line-height:
          1.7;
      }

      .knownIssuesHero button {
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
              --issue-accent
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
              --issue-accent
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

      .knownIssuesStats {
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

      .knownIssuesStats article {
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

      .knownIssuesStats article.critical {
        border-color:
          rgba(
            255,
            92,
            117,
            0.18
          );

        background:
          rgba(
            61,
            13,
            26,
            0.25
          );
      }

      .knownIssuesStats span {
        color:
          #6d82a1;

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.1em;
      }

      .knownIssuesStats article.critical span {
        color:
          #ff879b;
      }

      .knownIssuesStats strong {
        display:
          block;

        margin-top:
          7px;

        font-size:
          25px;
      }

      .knownIssuesToolbar {
        display:
          grid;

        grid-template-columns:
          minmax(
            230px,
            1.5fr
          )
          repeat(
            3,
            minmax(
              150px,
              0.65fr
            )
          );

        gap:
          9px;

        margin-top:
          18px;
      }

      .knownIssuesToolbar input,
      .knownIssuesToolbar select {
        width:
          100%;

        min-height:
          41px;

        padding:
          8px
          11px;

        border:
          1px solid
          rgba(
            128,
            154,
            198,
            0.14
          );

        border-radius:
          10px;

        outline:
          none;

        background:
          rgba(
            8,
            17,
            33,
            0.9
          );

        color:
          #a5b6ce;

        font:
          inherit;

        font-size:
          10px;
      }

      .knownIssuesToolbar select option {
        background:
          #091223;
      }

      .knownIssuesResults {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          10px;

        margin:
          13px
          2px
          0;

        color:
          #667b99;

        font-size:
          9px;

        font-weight:
          750;
      }

      .knownIssuesResults button {
        border:
          0;

        background:
          transparent;

        color:
          var(
            --issue-accent
          );

        cursor:
          pointer;

        font:
          inherit;

        font-size:
          9px;

        font-weight:
          800;
      }

      .knownIssuesGrid {
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
          14px;

        margin-top:
          15px;
      }

      .knownIssueCard {
        position:
          relative;

        overflow:
          hidden;

        padding:
          20px;

        border:
          1px solid
          rgba(
            128,
            154,
            198,
            0.13
          );

        border-radius:
          18px;

        background:
          rgba(
            8,
            17,
            33,
            0.91
          );
      }

      .knownIssueCard::before {
        position:
          absolute;

        top:
          0;

        right:
          0;

        left:
          0;

        height:
          2px;

        content:
          "";

        opacity:
          0.85;
      }

      .knownIssueCard.severity-low::before {
        background:
          #88a1c4;
      }

      .knownIssueCard.severity-medium::before {
        background:
          #64cffc;
      }

      .knownIssueCard.severity-high::before {
        background:
          #ffc46d;
      }

      .knownIssueCard.severity-critical::before {
        background:
          #ff6680;

        box-shadow:
          0
          0
          20px
          rgba(
            255,
            77,
            108,
            0.55
          );
      }

      .knownIssueCard.severity-critical {
        border-color:
          rgba(
            255,
            86,
            116,
            0.22
          );
      }

      .knownIssueCard.closed {
        opacity:
          0.72;
      }

      .knownIssueCardHeader {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          12px;
      }

      .knownIssueCardHeader > div {
        display:
          flex;

        flex-wrap:
          wrap;

        gap:
          6px;
      }

      .knownIssueCardHeader > button {
        border:
          0;

        background:
          transparent;

        color:
          #8498b6;

        cursor:
          pointer;

        font:
          inherit;

        font-size:
          9px;

        font-weight:
          800;
      }

      .knownIssueSeverity,
      .knownIssueStatus {
        display:
          inline-flex;

        align-items:
          center;

        min-height:
          24px;

        padding:
          4px
          7px;

        border-radius:
          7px;

        background:
          rgba(
            255,
            255,
            255,
            0.035
          );

        font-size:
          7px;

        font-weight:
          950;

        letter-spacing:
          0.06em;

        text-transform:
          uppercase;
      }

      .knownIssueSeverity.severity-low {
        color:
          #9fb0c9;
      }

      .knownIssueSeverity.severity-medium {
        color:
          #71d5ff;
      }

      .knownIssueSeverity.severity-high {
        color:
          #ffc876;
      }

      .knownIssueSeverity.severity-critical {
        color:
          #ff879a;
      }

      .knownIssueStatus {
        color:
          #94a8c6;
      }

      .knownIssueStatus.status-fix_in_progress {
        color:
          #b995ff;
      }

      .knownIssueStatus.status-testing {
        color:
          #68d9ff;
      }

      .knownIssueStatus.status-resolved {
        color:
          #71e0a8;
      }

      .knownIssueStatus.status-wont_fix {
        color:
          #8c9bb1;
      }

      .knownIssueCard h2 {
        margin:
          17px
          0
          0;

        font-size:
          23px;

        line-height:
          1.18;

        letter-spacing:
          -0.03em;
      }

      .knownIssueDescription {
        margin:
          10px
          0
          0;

        color:
          #8296b4;

        font-size:
          11px;

        line-height:
          1.65;
      }

      .knownIssueMeta {
        display:
          grid;

        grid-template-columns:
          1fr
          1fr;

        gap:
          8px;

        margin-top:
          16px;
      }

      .knownIssueMeta > div {
        padding:
          9px;

        border-radius:
          9px;

        background:
          rgba(
            255,
            255,
            255,
            0.022
          );
      }

      .knownIssueMeta span,
      .knownIssueRelations span,
      .knownIssueAssignee > span,
      .knownIssueStatusChanger > span {
        display:
          block;

        color:
          #5f7493;

        font-size:
          7px;

        font-weight:
          900;

        letter-spacing:
          0.08em;
      }

      .knownIssueMeta strong {
        display:
          block;

        margin-top:
          4px;

        color:
          #9badc6;

        font-size:
          9px;
      }

      .knownIssueAssignee {
        margin-top:
          9px;

        padding:
          10px;

        border-radius:
          9px;

        background:
          rgba(
            255,
            255,
            255,
            0.022
          );
      }

      .knownIssueAssignee > div {
        display:
          flex;

        align-items:
          center;

        gap:
          8px;

        margin-top:
          7px;
      }

      .knownIssueAvatar {
        width:
          29px;

        height:
          29px;

        overflow:
          hidden;

        display:
          grid;

        flex:
          0
          0
          auto;

        place-items:
          center;

        border-radius:
          50%;

        background:
          color-mix(
            in srgb,
            var(
              --issue-accent
            )
            13%,
            transparent
          );

        color:
          var(
            --issue-accent
          );

        font-size:
          10px;

        font-weight:
          900;
      }

      .knownIssueAvatar img {
        width:
          100%;

        height:
          100%;

        object-fit:
          cover;
      }

      .knownIssueAssignee > div strong {
        display:
          block;

        font-size:
          10px;
      }

      .knownIssueAssignee small {
        display:
          block;

        margin-top:
          2px;

        color:
          #647a99;

        font-size:
          8px;
      }

      .knownIssueAssignee .unassigned {
        display:
          block;

        margin-top:
          7px;

        color:
          #7084a2;

        font-size:
          10px;
      }

      .knownIssueRelations {
        display:
          grid;

        gap:
          7px;

        margin-top:
          9px;
      }

      .knownIssueRelations > div {
        padding:
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
          9px;

        background:
          rgba(
            255,
            255,
            255,
            0.015
          );
      }

      .knownIssueRelations strong {
        display:
          block;

        margin-top:
          4px;

        color:
          var(
            --issue-accent
          );

        font-size:
          9px;
      }

      .knownIssueNotes {
        margin-top:
          10px;

        padding:
          10px;

        border:
          1px solid
          rgba(
            128,
            154,
            198,
            0.08
          );

        border-radius:
          9px;

        background:
          rgba(
            255,
            255,
            255,
            0.017
          );
      }

      .knownIssueNotes summary {
        color:
          #8296b5;

        cursor:
          pointer;

        font-size:
          9px;

        font-weight:
          800;
      }

      .knownIssueNotes p {
        margin:
          9px
          0
          0;

        color:
          #7488a7;

        white-space:
          pre-wrap;

        font-size:
          10px;

        line-height:
          1.6;
      }

      .knownIssueStatusChanger {
        display:
          grid;

        gap:
          5px;

        margin-top:
          12px;
      }

      .knownIssueStatusChanger select {
        width:
          100%;

        min-height:
          35px;

        padding:
          7px
          9px;

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
          #9eafc7;

        font-size:
          9px;
      }

      .knownIssueCard footer {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          10px;

        margin-top:
          13px;

        padding-top:
          10px;

        border-top:
          1px solid
          rgba(
            128,
            154,
            198,
            0.07
          );
      }

      .knownIssueCard footer span {
        color:
          #566b89;

        font-size:
          8px;
      }

      .knownIssueCard footer button {
        border:
          0;

        background:
          transparent;

        color:
          #bc7480;

        cursor:
          pointer;

        font:
          inherit;

        font-size:
          8px;

        font-weight:
          800;
      }

      .knownIssuesEmpty {
        grid-column:
          1 /
          -1;

        padding:
          50px
          20px;

        border:
          1px dashed
          rgba(
            128,
            154,
            198,
            0.14
          );

        border-radius:
          18px;

        color:
          #7186a5;

        text-align:
          center;
      }

      .knownIssuesEmpty strong {
        color:
          #a3b4cc;

        font-size:
          15px;
      }

      .knownIssuesEmpty p {
        margin:
          6px
          0
          0;

        font-size:
          10px;
      }

      .knownIssueModalBackdrop {
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
            0.82
          );

        backdrop-filter:
          blur(
            8px
          );
      }

      .knownIssueModal {
        width:
          min(
            680px,
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
              --issue-accent
            )
            27%,
            transparent
          );

        border-radius:
          22px;

        background:
          #091223;
      }

      .knownIssueModal > header {
        display:
          flex;

        align-items:
          flex-start;

        justify-content:
          space-between;

        gap:
          20px;
      }

      .knownIssueModal > header span {
        color:
          var(
            --issue-accent
          );

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.13em;
      }

      .knownIssueModal > header h2 {
        margin:
          6px
          0
          0;

        font-size:
          29px;
      }

      .knownIssueModal > header button {
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

      .knownIssueModal form {
        display:
          grid;

        gap:
          15px;

        margin-top:
          22px;
      }

      .knownIssueModal label {
        display:
          grid;

        gap:
          7px;
      }

      .knownIssueModal label > span {
        color:
          #9db0ca;

        font-size:
          10px;

        font-weight:
          800;
      }

      .knownIssueModal input,
      .knownIssueModal textarea,
      .knownIssueModal select {
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

      .knownIssueModal textarea {
        resize:
          vertical;
      }

      .knownIssueModal select option {
        background:
          #091223;
      }

      .knownIssueFormRow {
        display:
          grid;

        grid-template-columns:
          1fr
          1fr;

        gap:
          11px;
      }

      .knownIssueFieldHint {
        color:
          #607594;

        font-size:
          8px;
      }

      .knownIssueFormError {
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

      .knownIssueFormActions {
        display:
          flex;

        justify-content:
          flex-end;

        gap:
          9px;
      }

      .knownIssueFormActions button {
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

      .knownIssueFormActions .secondary {
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

      .knownIssueFormActions .primary {
        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --issue-accent
            )
            34%,
            transparent
          );

        background:
          color-mix(
            in srgb,
            var(
              --issue-accent
            )
            14%,
            transparent
          );

        color:
          white;
      }

      .knownIssuesState {
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

      .knownIssuesState.error {
        color:
          #ff9dac;
      }

      @media (
        max-width:
          950px
      ) {
        .knownIssuesToolbar {
          grid-template-columns:
            1fr
            1fr;
        }
      }

      @media (
        max-width:
          800px
      ) {
        .knownIssuesStats {
          grid-template-columns:
            1fr
            1fr;
        }

        .knownIssuesGrid {
          grid-template-columns:
            1fr;
        }
      }

      @media (
        max-width:
          650px
      ) {
        .knownIssuesHero {
          align-items:
            flex-start;

          flex-direction:
            column;

          padding:
            25px
            21px;
        }

        .knownIssuesHero button {
          width:
            100%;
        }

        .knownIssuesToolbar {
          grid-template-columns:
            1fr;
        }

        .knownIssueFormRow {
          grid-template-columns:
            1fr;
        }
      }

      @media (
        max-width:
          450px
      ) {
        .knownIssuesStats {
          grid-template-columns:
            1fr;
        }

        .knownIssueMeta {
          grid-template-columns:
            1fr;
        }
      }
    `}</style>
  );
}