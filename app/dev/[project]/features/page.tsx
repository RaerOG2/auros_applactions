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
  getAssignableDevUsers,
} from "../../../../services/dev-user.service";

import {
  createDevFeature,
  deleteDevFeature,
  getDevFeatures,
  updateDevFeature,
  updateDevFeatureStatus,
} from "../../../../services/dev-feature.service";

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
} from "../../../../types/dev-tasks";

import type {
  DevFeature,
  DevFeatureInput,
  DevFeaturePriority,
  DevFeatureStatus,
} from "../../../../types/dev-features";


type FeatureForm = {
  title: string;

  description: string;

  category: string;

  status: DevFeatureStatus;

  priority: DevFeaturePriority;

  progress: number;

  targetDate: string;

  releaseDate: string;

  internalNotes: string;

  assignedDevId: string;

  updateId: string;

  roadmapItemId: string;
};


type FeatureStatusFilter =
  | "all"
  | "active"
  | DevFeatureStatus;


type FeaturePriorityFilter =
  | "all"
  | DevFeaturePriority;


const emptyForm: FeatureForm = {
  title: "",

  description: "",

  category: "",

  status:
    "idea",

  priority:
    "medium",

  progress:
    0,

  targetDate: "",

  releaseDate: "",

  internalNotes: "",

  assignedDevId: "",

  updateId: "",

  roadmapItemId: "",
};


const statuses: {
  value: DevFeatureStatus;

  label: string;
}[] = [
  {
    value:
      "idea",

    label:
      "Idea",
  },

  {
    value:
      "planned",

    label:
      "Planned",
  },

  {
    value:
      "in_development",

    label:
      "In Development",
  },

  {
    value:
      "testing",

    label:
      "Testing",
  },

  {
    value:
      "ready",

    label:
      "Ready",
  },

  {
    value:
      "released",

    label:
      "Released",
  },

  {
    value:
      "cancelled",

    label:
      "Cancelled",
  },
];


const priorities: {
  value: DevFeaturePriority;

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
  status: DevFeatureStatus
) {
  return (
    statuses.find(
      (
        item
      ) =>
        item.value ===
        status
    )?.label ??
    status
  );
}


function priorityLabel(
  priority: DevFeaturePriority
) {
  return priority.toUpperCase();
}


function formatDate(
  value: string | null
) {
  if (!value) {
    return "Not set";
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
      `${value}T12:00:00`
    )
  );
}


function isActiveFeature(
  feature: DevFeature
) {
  return (
    feature.status !==
      "released" &&
    feature.status !==
      "cancelled"
  );
}


export default function DevFeaturesPage() {
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
    features,
    setFeatures,
  ] =
    useState<
      DevFeature[]
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
      FeatureStatusFilter
    >(
      "all"
    );


  const [
    priorityFilter,
    setPriorityFilter,
  ] =
    useState<
      FeaturePriorityFilter
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
    updateFilter,
    setUpdateFilter,
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
    editingFeature,
    setEditingFeature,
  ] =
    useState<
      DevFeature | null
    >(
      null
    );


  const [
    form,
    setForm,
  ] =
    useState<FeatureForm>(
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
    statusSavingIds,
    setStatusSavingIds,
  ] =
    useState<
      string[]
    >([]);


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
            loadedFeatures,
            loadedUpdates,
            loadedRoadmap,
            loadedDevUsers,
          ] =
            await Promise.all([
              getDevFeatures(
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

          setFeatures(
            loadedFeatures
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
        } catch (
          loadError
        ) {
          console.error(
            "DEV FEATURES LOAD ERROR:",
            loadError
          );


          if (!alive) {
            return;
          }


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load features."
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


  const categories =
    useMemo(
      () => {
        const values =
          features
            .map(
              (
                feature
              ) =>
                feature.category?.trim()
            )
            .filter(
              (
                category
              ): category is string =>
                !!category
            );


        return Array.from(
          new Set(
            values
          )
        ).sort(
          (
            first,
            second
          ) =>
            first.localeCompare(
              second
            )
        );
      },
      [
        features,
      ]
    );


  const visibleFeatures =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        return features
          .filter(
            (
              feature
            ) => {
              if (
                statusFilter ===
                "active"
              ) {
                if (
                  !isActiveFeature(
                    feature
                  )
                ) {
                  return false;
                }
              } else if (
                statusFilter !==
                  "all" &&
                feature.status !==
                  statusFilter
              ) {
                return false;
              }


              if (
                priorityFilter !==
                  "all" &&
                feature.priority !==
                  priorityFilter
              ) {
                return false;
              }


              if (
                developerFilter ===
                "unassigned"
              ) {
                if (
                  feature.assigned_dev_id
                ) {
                  return false;
                }
              } else if (
                developerFilter !==
                  "all" &&
                feature.assigned_dev_id !==
                  developerFilter
              ) {
                return false;
              }


              if (
                updateFilter ===
                "unassigned"
              ) {
                if (
                  feature.update_id
                ) {
                  return false;
                }
              } else if (
                updateFilter !==
                  "all" &&
                feature.update_id !==
                  updateFilter
              ) {
                return false;
              }


              if (!query) {
                return true;
              }


              const haystack =
                [
                  feature.title,

                  feature.description ??
                    "",

                  feature.category ??
                    "",

                  feature.internal_notes ??
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
              if (
                first.status ===
                  "released" &&
                second.status !==
                  "released"
              ) {
                return 1;
              }


              if (
                second.status ===
                  "released" &&
                first.status !==
                  "released"
              ) {
                return -1;
              }


              return (
                second.progress -
                first.progress
              );
            }
          );
      },
      [
        features,
        search,
        statusFilter,
        priorityFilter,
        developerFilter,
        updateFilter,
      ]
    );


  const activeCount =
    features.filter(
      isActiveFeature
    ).length;


  const developmentCount =
    features.filter(
      (
        feature
      ) =>
        feature.status ===
        "in_development"
    ).length;


  const testingCount =
    features.filter(
      (
        feature
      ) =>
        feature.status ===
        "testing"
    ).length;


  const releasedCount =
    features.filter(
      (
        feature
      ) =>
        feature.status ===
        "released"
    ).length;


  function getDeveloper(
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


  function openCreate() {
    setEditingFeature(
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
    feature: DevFeature
  ) {
    setEditingFeature(
      feature
    );


    setForm({
      title:
        feature.title,

      description:
        feature.description ??
        "",

      category:
        feature.category ??
        "",

      status:
        feature.status,

      priority:
        feature.priority,

      progress:
        feature.progress,

      targetDate:
        feature.target_date ??
        "",

      releaseDate:
        feature.release_date ??
        "",

      internalNotes:
        feature.internal_notes ??
        "",

      assignedDevId:
        feature.assigned_dev_id ??
        "",

      updateId:
        feature.update_id ??
        "",

      roadmapItemId:
        feature.roadmap_item_id ??
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

    setEditingFeature(
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
        "Feature title is required."
      );

      return;
    }


    const input:
      DevFeatureInput = {
      title:
        form.title,

      description:
        form.description,

      category:
        form.category,

      status:
        form.status,

      priority:
        form.priority,

      progress:
        form.status ===
        "released"
          ? 100
          : form.progress,

      target_date:
        form.targetDate,

      release_date:
        form.releaseDate,

      internal_notes:
        form.internalNotes,

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
        editingFeature
      ) {
        const updated =
          await updateDevFeature(
            editingFeature.id,
            input
          );


        setFeatures(
          (
            previous
          ) =>
            previous.map(
              (
                feature
              ) =>
                feature.id ===
                updated.id
                  ? updated
                  : feature
            )
        );
      } else {
        const created =
          await createDevFeature(
            project.id,
            input
          );


        setFeatures(
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

      setEditingFeature(
        null
      );

      setForm(
        emptyForm
      );
    } catch (
      saveError
    ) {
      console.error(
        "DEV FEATURE SAVE ERROR:",
        saveError
      );


      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save feature."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  async function handleStatusChange(
    feature: DevFeature,
    status: DevFeatureStatus
  ) {
    if (
      feature.status ===
        status ||
      statusSavingIds.includes(
        feature.id
      )
    ) {
      return;
    }


    const original =
      feature;


    setStatusSavingIds(
      (
        previous
      ) => [
        ...previous,
        feature.id,
      ]
    );


    setFeatures(
      (
        previous
      ) =>
        previous.map(
          (
            current
          ) =>
            current.id ===
            feature.id
              ? {
                  ...current,

                  status,

                  progress:
                    status ===
                    "released"
                      ? 100
                      : current.progress,
                }
              : current
        )
    );


    try {
      const updated =
        await updateDevFeatureStatus(
          feature,
          status
        );


      setFeatures(
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
      setFeatures(
        (
          previous
        ) =>
          previous.map(
            (
              current
            ) =>
              current.id ===
              original.id
                ? original
                : current
          )
      );


      window.alert(
        statusError instanceof Error
          ? statusError.message
          : "Could not update feature status."
      );
    } finally {
      setStatusSavingIds(
        (
          previous
        ) =>
          previous.filter(
            (
              id
            ) =>
              id !==
              feature.id
          )
      );
    }
  }


  async function handleDelete(
    feature: DevFeature
  ) {
    const confirmed =
      window.confirm(
        `Delete feature "${feature.title}"?`
      );


    if (!confirmed) {
      return;
    }


    try {
      await deleteDevFeature(
        feature.id
      );


      setFeatures(
        (
          previous
        ) =>
          previous.filter(
            (
              current
            ) =>
              current.id !==
              feature.id
          )
      );
    } catch (
      deleteError
    ) {
      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete feature."
      );
    }
  }


  if (loading) {
    return (
      <DevPageGuard>
        <main className="devFeaturesPage">
          <div className="devFeaturesState">
            Loading Features...
          </div>

          <FeatureStyles />
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
        <main className="devFeaturesPage">
          <div className="devFeaturesState error">
            {error ||
              "Project not found."}
          </div>

          <FeatureStyles />
        </main>
      </DevPageGuard>
    );
  }


  return (
    <DevPageGuard>
      <main
        className="devFeaturesPage"
        style={
          {
            "--feature-accent":
              project.accent,
          } as CSSProperties
        }
      >
        <div className="devFeaturesBreadcrumbs">
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
            Features
          </strong>
        </div>


        <section className="devFeaturesHero">
          <div>
            <span>
              {project.short_name}
              {" "}
              FEATURE TRACKER
            </span>

            <h1>
              Features
            </h1>

            <p>
              Track project features from the
              first idea through development,
              testing and final release.
            </p>
          </div>


          <button
            type="button"
            onClick={
              openCreate
            }
          >
            + Create Feature
          </button>
        </section>


        <section className="devFeaturesStats">
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
              DEVELOPMENT
            </span>

            <strong>
              {developmentCount}
            </strong>
          </article>


          <article>
            <span>
              TESTING
            </span>

            <strong>
              {testingCount}
            </strong>
          </article>


          <article>
            <span>
              RELEASED
            </span>

            <strong>
              {releasedCount}
            </strong>
          </article>
        </section>


        <section className="devFeaturesToolbar">
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
            placeholder="Search features..."
          />


          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target.value as FeatureStatusFilter
              )
            }
          >
            <option value="all">
              All Statuses
            </option>

            <option value="active">
              Active
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
              priorityFilter
            }
            onChange={(
              event
            ) =>
              setPriorityFilter(
                event.target.value as FeaturePriorityFilter
              )
            }
          >
            <option value="all">
              All Priorities
            </option>

            {priorities.map(
              (
                priority
              ) => (
                <option
                  key={
                    priority.value
                  }
                  value={
                    priority.value
                  }
                >
                  {
                    priority.label
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


          <select
            value={
              updateFilter
            }
            onChange={(
              event
            ) =>
              setUpdateFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Updates
            </option>

            <option value="unassigned">
              No Update
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
        </section>


        <div className="devFeaturesResults">
          <span>
            {
              visibleFeatures.length
            }
            {" "}
            feature
            {visibleFeatures.length ===
            1
              ? ""
              : "s"}
          </span>


          {(search ||
            statusFilter !==
              "all" ||
            priorityFilter !==
              "all" ||
            developerFilter !==
              "all" ||
            updateFilter !==
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

                setPriorityFilter(
                  "all"
                );

                setDeveloperFilter(
                  "all"
                );

                setUpdateFilter(
                  "all"
                );
              }}
            >
              Clear Filters
            </button>
          ) : null}
        </div>


        <section className="devFeaturesGrid">
          {visibleFeatures.map(
            (
              feature
            ) => {
              const developer =
                getDeveloper(
                  feature.assigned_dev_id
                );


              const update =
                getUpdate(
                  feature.update_id
                );


              const roadmap =
                getRoadmapItem(
                  feature.roadmap_item_id
                );


              const isSaving =
                statusSavingIds.includes(
                  feature.id
                );


              return (
                <article
                  key={
                    feature.id
                  }
                  className={`devFeatureCard status-${feature.status}`}
                >
                  <header>
                    <div>
                      <span
                        className={`devFeaturePriority priority-${feature.priority}`}
                      >
                        {priorityLabel(
                          feature.priority
                        )}
                      </span>

                      <span
                        className={`devFeatureStatus status-${feature.status}`}
                      >
                        {statusLabel(
                          feature.status
                        )}
                      </span>
                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        openEdit(
                          feature
                        )
                      }
                    >
                      Edit
                    </button>
                  </header>


                  <h2>
                    {
                      feature.title
                    }
                  </h2>


                  {feature.description ? (
                    <p className="devFeatureDescription">
                      {
                        feature.description
                      }
                    </p>
                  ) : null}


                  {feature.category ? (
                    <div className="devFeatureCategory">
                      {
                        feature.category
                      }
                    </div>
                  ) : null}


                  <div className="devFeatureProgress">
                    <div>
                      <span>
                        PROGRESS
                      </span>

                      <strong>
                        {
                          feature.progress
                        }
                        %
                      </strong>
                    </div>


                    <div className="devFeatureProgressTrack">
                      <div
                        style={{
                          width:
                            `${feature.progress}%`,
                        }}
                      />
                    </div>
                  </div>


                  <div className="devFeatureAssignee">
                    <span>
                      ASSIGNED DEV
                    </span>


                    {developer ? (
                      <div>
                        <div className="devFeatureAvatar">
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


                  <div className="devFeatureDates">
                    <div>
                      <span>
                        TARGET
                      </span>

                      <strong>
                        {formatDate(
                          feature.target_date
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        RELEASE
                      </span>

                      <strong>
                        {formatDate(
                          feature.release_date
                        )}
                      </strong>
                    </div>
                  </div>


                  {(update ||
                    roadmap) ? (
                    <div className="devFeatureRelations">
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
                    </div>
                  ) : null}


                  {feature.internal_notes ? (
                    <details className="devFeatureNotes">
                      <summary>
                        Internal Notes
                      </summary>

                      <p>
                        {
                          feature.internal_notes
                        }
                      </p>
                    </details>
                  ) : null}


                  <label className="devFeatureStatusChanger">
                    <span>
                      STATUS
                    </span>

                    <select
                      value={
                        feature.status
                      }
                      disabled={
                        isSaving
                      }
                      onChange={(
                        event
                      ) =>
                        handleStatusChange(
                          feature,
                          event.target.value as DevFeatureStatus
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
                  </label>


                  <footer>
                    <span>
                      {isSaving
                        ? "Saving..."
                        : `Updated ${formatDate(
                            feature.updated_at.slice(
                              0,
                              10
                            )
                          )}`}
                    </span>


                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          feature
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


          {visibleFeatures.length ===
          0 ? (
            <div className="devFeaturesEmpty">
              <strong>
                No features found
              </strong>

              <p>
                Create a feature or adjust
                the current filters.
              </p>
            </div>
          ) : null}
        </section>


        {modalOpen ? (
          <div
            className="devFeatureModalBackdrop"
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
            <div className="devFeatureModal">
              <header>
                <div>
                  <span>
                    FEATURE TRACKER
                  </span>

                  <h2>
                    {editingFeature
                      ? "Edit Feature"
                      : "Create Feature"}
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
                    Feature Name
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
                    placeholder="Override System"
                    required
                  />
                </label>


                <label>
                  <span>
                    Description
                  </span>

                  <textarea
                    rows={
                      5
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
                    placeholder="Describe what this feature does..."
                  />
                </label>


                <div className="devFeatureFormRow">
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
                          event.target.value as DevFeatureStatus;


                        setForm({
                          ...form,

                          status,

                          progress:
                            status ===
                            "released"
                              ? 100
                              : form.progress,
                        });
                      }}
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
                            event.target.value as DevFeaturePriority,
                        })
                      }
                    >
                      {priorities.map(
                        (
                          priority
                        ) => (
                          <option
                            key={
                              priority.value
                            }
                            value={
                              priority.value
                            }
                          >
                            {
                              priority.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>


                <label>
                  <span>
                    Category / Area
                  </span>

                  <input
                    list="devFeatureCategories"
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
                    placeholder="Gameplay, Map, Website..."
                  />

                  <datalist id="devFeatureCategories">
                    {categories.map(
                      (
                        category
                      ) => (
                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        />
                      )
                    )}
                  </datalist>
                </label>


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

                  <small className="devFeatureHint">
                    Only DEV accounts can be
                    assigned.
                  </small>
                </label>


                <label>
                  <span>
                    Progress
                  </span>

                  <div className="devFeatureProgressEditor">
                    <input
                      type="range"
                      min={
                        0
                      }
                      max={
                        100
                      }
                      value={
                        form.status ===
                        "released"
                          ? 100
                          : form.progress
                      }
                      disabled={
                        form.status ===
                        "released"
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

                    <strong>
                      {form.status ===
                      "released"
                        ? 100
                        : form.progress}
                      %
                    </strong>
                  </div>
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


                      const roadmap =
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
                          roadmap &&
                          updateId &&
                          roadmap.update_id &&
                          roadmap.update_id !==
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
                        event.target.value;


                      const roadmap =
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
                          roadmap?.update_id ??
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


                <div className="devFeatureFormRow">
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
                    placeholder="Technical notes, design decisions, dependencies..."
                  />
                </label>


                {formError ? (
                  <div className="devFeatureFormError">
                    {
                      formError
                    }
                  </div>
                ) : null}


                <div className="devFeatureFormActions">
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
                      : editingFeature
                      ? "Save Changes"
                      : "Create Feature"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}


        <FeatureStyles />
      </main>
    </DevPageGuard>
  );
}


function FeatureStyles() {
  return (
    <style jsx global>{`
      .devFeaturesPage {
        --feature-accent:
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

      .devFeaturesBreadcrumbs {
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

      .devFeaturesBreadcrumbs a {
        color:
          #93a7c6;

        text-decoration:
          none;
      }

      .devFeaturesBreadcrumbs strong {
        color:
          var(
            --feature-accent
          );
      }

      .devFeaturesHero {
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
              --feature-accent
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
                --feature-accent
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

      .devFeaturesHero > div > span {
        color:
          var(
            --feature-accent
          );

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          0.13em;
      }

      .devFeaturesHero h1 {
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

      .devFeaturesHero p {
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

      .devFeaturesHero button {
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
              --feature-accent
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
              --feature-accent
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

      .devFeaturesStats {
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

      .devFeaturesStats article {
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

      .devFeaturesStats span {
        color:
          #6d82a1;

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.1em;
      }

      .devFeaturesStats strong {
        display:
          block;

        margin-top:
          7px;

        font-size:
          25px;
      }

      .devFeaturesToolbar {
        display:
          grid;

        grid-template-columns:
          minmax(
            220px,
            1.4fr
          )
          repeat(
            4,
            minmax(
              130px,
              0.65fr
            )
          );

        gap:
          8px;

        margin-top:
          18px;
      }

      .devFeaturesToolbar input,
      .devFeaturesToolbar select {
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

      .devFeaturesToolbar select option {
        background:
          #091223;
      }

      .devFeaturesResults {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          10px;

        margin:
          12px
          2px
          0;

        color:
          #667b99;

        font-size:
          9px;
      }

      .devFeaturesResults button {
        border:
          0;

        background:
          transparent;

        color:
          var(
            --feature-accent
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

      .devFeaturesGrid {
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

      .devFeatureCard {
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

      .devFeatureCard::before {
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

        background:
          var(
            --feature-accent
          );

        opacity:
          0.5;
      }

      .devFeatureCard.status-released::before {
        background:
          #68dea3;
      }

      .devFeatureCard.status-cancelled {
        opacity:
          0.6;
      }

      .devFeatureCard > header {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          10px;
      }

      .devFeatureCard > header > div {
        display:
          flex;

        flex-wrap:
          wrap;

        gap:
          6px;
      }

      .devFeatureCard > header > button {
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

      .devFeaturePriority,
      .devFeatureStatus {
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

      .devFeaturePriority.priority-low {
        color:
          #9dafc8;
      }

      .devFeaturePriority.priority-medium {
        color:
          #6bd3ff;
      }

      .devFeaturePriority.priority-high {
        color:
          #ffc971;
      }

      .devFeaturePriority.priority-critical {
        color:
          #ff899b;
      }

      .devFeatureStatus {
        color:
          #99acc7;
      }

      .devFeatureStatus.status-in_development {
        color:
          #bc97ff;
      }

      .devFeatureStatus.status-testing {
        color:
          #66d8ff;
      }

      .devFeatureStatus.status-ready {
        color:
          #f4dc77;
      }

      .devFeatureStatus.status-released {
        color:
          #73dfa9;
      }

      .devFeatureStatus.status-cancelled {
        color:
          #8190a7;
      }

      .devFeatureCard h2 {
        margin:
          17px
          0
          0;

        font-size:
          23px;

        line-height:
          1.2;

        letter-spacing:
          -0.03em;
      }

      .devFeatureDescription {
        margin:
          9px
          0
          0;

        color:
          #8498b6;

        font-size:
          11px;

        line-height:
          1.65;
      }

      .devFeatureCategory {
        display:
          inline-flex;

        margin-top:
          11px;

        padding:
          6px
          8px;

        border-radius:
          8px;

        background:
          rgba(
            255,
            255,
            255,
            0.025
          );

        color:
          #879bb8;

        font-size:
          8px;

        font-weight:
          800;
      }

      .devFeatureProgress {
        margin-top:
          16px;
      }

      .devFeatureProgress > div:first-child {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          10px;
      }

      .devFeatureProgress span {
        color:
          #5f7493;

        font-size:
          7px;

        font-weight:
          900;

        letter-spacing:
          0.08em;
      }

      .devFeatureProgress strong {
        color:
          #a7b8cf;

        font-size:
          10px;
      }

      .devFeatureProgressTrack {
        height:
          5px;

        overflow:
          hidden;

        margin-top:
          7px;

        border-radius:
          999px;

        background:
          rgba(
            255,
            255,
            255,
            0.05
          );
      }

      .devFeatureProgressTrack > div {
        height:
          100%;

        border-radius:
          inherit;

        background:
          var(
            --feature-accent
          );

        transition:
          width
          180ms
          ease;
      }

      .devFeatureAssignee {
        margin-top:
          14px;

        padding:
          10px;

        border-radius:
          9px;

        background:
          rgba(
            255,
            255,
            255,
            0.02
          );
      }

      .devFeatureAssignee > span,
      .devFeatureDates span,
      .devFeatureRelations span,
      .devFeatureStatusChanger > span {
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

      .devFeatureAssignee > div {
        display:
          flex;

        align-items:
          center;

        gap:
          8px;

        margin-top:
          7px;
      }

      .devFeatureAvatar {
        width:
          29px;

        height:
          29px;

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
              --feature-accent
            )
            13%,
            transparent
          );

        color:
          var(
            --feature-accent
          );

        font-size:
          10px;

        font-weight:
          900;
      }

      .devFeatureAvatar img {
        width:
          100%;

        height:
          100%;

        object-fit:
          cover;
      }

      .devFeatureAssignee strong {
        display:
          block;

        font-size:
          10px;
      }

      .devFeatureAssignee small {
        display:
          block;

        margin-top:
          2px;

        color:
          #647a99;

        font-size:
          8px;
      }

      .devFeatureAssignee .unassigned {
        margin-top:
          7px;

        color:
          #7185a3;
      }

      .devFeatureDates {
        display:
          grid;

        grid-template-columns:
          1fr
          1fr;

        gap:
          8px;

        margin-top:
          9px;
      }

      .devFeatureDates > div,
      .devFeatureRelations > div {
        padding:
          9px;

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

      .devFeatureDates strong,
      .devFeatureRelations strong {
        display:
          block;

        margin-top:
          4px;

        color:
          #9cafc8;

        font-size:
          9px;
      }

      .devFeatureRelations {
        display:
          grid;

        gap:
          7px;

        margin-top:
          9px;
      }

      .devFeatureRelations strong {
        color:
          var(
            --feature-accent
          );
      }

      .devFeatureNotes {
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
      }

      .devFeatureNotes summary {
        color:
          #8498b5;

        cursor:
          pointer;

        font-size:
          9px;

        font-weight:
          800;
      }

      .devFeatureNotes p {
        margin:
          9px
          0
          0;

        color:
          #7388a7;

        white-space:
          pre-wrap;

        font-size:
          10px;

        line-height:
          1.6;
      }

      .devFeatureStatusChanger {
        display:
          grid;

        gap:
          5px;

        margin-top:
          12px;
      }

      .devFeatureStatusChanger select {
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

      .devFeatureCard footer {
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

      .devFeatureCard footer span {
        color:
          #566b89;

        font-size:
          8px;
      }

      .devFeatureCard footer button {
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

      .devFeaturesEmpty {
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

      .devFeatureModalBackdrop {
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

      .devFeatureModal {
        width:
          min(
            700px,
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
              --feature-accent
            )
            27%,
            transparent
          );

        border-radius:
          22px;

        background:
          #091223;
      }

      .devFeatureModal > header {
        display:
          flex;

        align-items:
          flex-start;

        justify-content:
          space-between;

        gap:
          20px;
      }

      .devFeatureModal > header span {
        color:
          var(
            --feature-accent
          );

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.13em;
      }

      .devFeatureModal > header h2 {
        margin:
          6px
          0
          0;

        font-size:
          29px;
      }

      .devFeatureModal > header button {
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

      .devFeatureModal form {
        display:
          grid;

        gap:
          15px;

        margin-top:
          22px;
      }

      .devFeatureModal label {
        display:
          grid;

        gap:
          7px;
      }

      .devFeatureModal label > span {
        color:
          #9db0ca;

        font-size:
          10px;

        font-weight:
          800;
      }

      .devFeatureModal input,
      .devFeatureModal textarea,
      .devFeatureModal select {
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

      .devFeatureModal textarea {
        resize:
          vertical;
      }

      .devFeatureModal select option {
        background:
          #091223;
      }

      .devFeatureFormRow {
        display:
          grid;

        grid-template-columns:
          1fr
          1fr;

        gap:
          11px;
      }

      .devFeatureProgressEditor {
        display:
          grid;

        grid-template-columns:
          1fr
          52px;

        align-items:
          center;

        gap:
          12px;
      }

      .devFeatureProgressEditor input {
        min-height:
          auto;

        padding:
          0;

        border:
          0;

        background:
          transparent;
      }

      .devFeatureProgressEditor strong {
        text-align:
          right;

        color:
          var(
            --feature-accent
          );

        font-size:
          12px;
      }

      .devFeatureHint {
        color:
          #607594;

        font-size:
          8px;
      }

      .devFeatureFormError {
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

      .devFeatureFormActions {
        display:
          flex;

        justify-content:
          flex-end;

        gap:
          9px;
      }

      .devFeatureFormActions button {
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

      .devFeatureFormActions .secondary {
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

      .devFeatureFormActions .primary {
        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --feature-accent
            )
            34%,
            transparent
          );

        background:
          color-mix(
            in srgb,
            var(
              --feature-accent
            )
            14%,
            transparent
          );

        color:
          white;
      }

      .devFeaturesState {
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

      .devFeaturesState.error {
        color:
          #ff9dac;
      }

      @media (
        max-width:
          1000px
      ) {
        .devFeaturesToolbar {
          grid-template-columns:
            1fr
            1fr;
        }
      }

      @media (
        max-width:
          800px
      ) {
        .devFeaturesStats {
          grid-template-columns:
            1fr
            1fr;
        }

        .devFeaturesGrid {
          grid-template-columns:
            1fr;
        }
      }

      @media (
        max-width:
          650px
      ) {
        .devFeaturesHero {
          align-items:
            flex-start;

          flex-direction:
            column;

          padding:
            25px
            21px;
        }

        .devFeaturesHero button {
          width:
            100%;
        }

        .devFeaturesToolbar {
          grid-template-columns:
            1fr;
        }

        .devFeatureFormRow {
          grid-template-columns:
            1fr;
        }
      }

      @media (
        max-width:
          450px
      ) {
        .devFeaturesStats {
          grid-template-columns:
            1fr;
        }

        .devFeatureDates {
          grid-template-columns:
            1fr;
        }
      }

      @media (
        prefers-reduced-motion:
          reduce
      ) {
        .devFeatureProgressTrack > div {
          transition:
            none;
        }
      }
    `}</style>
  );
}