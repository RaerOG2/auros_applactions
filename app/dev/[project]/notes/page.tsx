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
  getDevKnownIssues,
} from "../../../../services/dev-known-issue.service";

import {
  createDevNote,
  deleteDevNote,
  getDevNotes,
  setDevNotePinned,
  updateDevNote,
} from "../../../../services/dev-note.service";

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
  DevTask,
} from "../../../../types/dev-tasks";

import type {
  DevKnownIssue,
} from "../../../../types/dev-known-issues";

import type {
  DevNote,
  DevNoteInput,
} from "../../../../types/dev-notes";


type NoteForm = {
  title: string;

  content: string;

  category: string;

  pinned: boolean;

  updateId: string;

  roadmapItemId: string;

  taskId: string;

  knownIssueId: string;
};


const emptyForm: NoteForm = {
  title: "",

  content: "",

  category: "",

  pinned: false,

  updateId: "",

  roadmapItemId: "",

  taskId: "",

  knownIssueId: "",
};


function formatTimestamp(
  value: string
) {
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
    new Date(
      value
    )
  );
}


export default function DevNotesPage() {
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
    notes,
    setNotes,
  ] =
    useState<
      DevNote[]
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
    knownIssues,
    setKnownIssues,
  ] =
    useState<
      DevKnownIssue[]
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
    categoryFilter,
    setCategoryFilter,
  ] =
    useState(
      "all"
    );


  const [
    pinnedOnly,
    setPinnedOnly,
  ] =
    useState(
      false
    );


  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(
      false
    );


  const [
    editingNote,
    setEditingNote,
  ] =
    useState<
      DevNote | null
    >(
      null
    );


  const [
    form,
    setForm,
  ] =
    useState<NoteForm>(
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
    pinSavingIds,
    setPinSavingIds,
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
            loadedNotes,
            loadedUpdates,
            loadedRoadmap,
            loadedTasks,
            loadedKnownIssues,
          ] =
            await Promise.all([
              getDevNotes(
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

              getDevKnownIssues(
                loadedProject.id
              ),
            ]);


          if (!alive) {
            return;
          }


          setProject(
            loadedProject
          );

          setNotes(
            loadedNotes
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

          setKnownIssues(
            loadedKnownIssues
          );
        } catch (
          loadError
        ) {
          console.error(
            "DEV NOTES LOAD ERROR:",
            loadError
          );


          if (!alive) {
            return;
          }


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load notes."
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
          notes
            .map(
              (
                note
              ) =>
                note.category?.trim()
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
            a,
            b
          ) =>
            a.localeCompare(
              b
            )
        );
      },
      [
        notes,
      ]
    );


  const visibleNotes =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        return notes
          .filter(
            (
              note
            ) => {
              if (
                pinnedOnly &&
                !note.pinned
              ) {
                return false;
              }


              if (
                categoryFilter !==
                  "all" &&
                note.category !==
                  categoryFilter
              ) {
                return false;
              }


              if (!query) {
                return true;
              }


              const haystack =
                [
                  note.title,

                  note.content ??
                    "",

                  note.category ??
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
                first.pinned !==
                second.pinned
              ) {
                return first.pinned
                  ? -1
                  : 1;
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
        notes,
        search,
        categoryFilter,
        pinnedOnly,
      ]
    );


  const pinnedCount =
    notes.filter(
      (
        note
      ) =>
        note.pinned
    ).length;


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


  function getKnownIssue(
    id: string | null
  ) {
    if (!id) {
      return null;
    }


    return (
      knownIssues.find(
        (
          issue
        ) =>
          issue.id ===
          id
      ) ??
      null
    );
  }


  function openCreate() {
    setEditingNote(
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
    note: DevNote
  ) {
    setEditingNote(
      note
    );


    setForm({
      title:
        note.title,

      content:
        note.content ??
        "",

      category:
        note.category ??
        "",

      pinned:
        note.pinned,

      updateId:
        note.update_id ??
        "",

      roadmapItemId:
        note.roadmap_item_id ??
        "",

      taskId:
        note.task_id ??
        "",

      knownIssueId:
        note.known_issue_id ??
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

    setEditingNote(
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
        "Note title is required."
      );

      return;
    }


    const input: DevNoteInput = {
      title:
        form.title,

      content:
        form.content,

      category:
        form.category,

      pinned:
        form.pinned,

      update_id:
        form.updateId ||
        null,

      roadmap_item_id:
        form.roadmapItemId ||
        null,

      task_id:
        form.taskId ||
        null,

      known_issue_id:
        form.knownIssueId ||
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
        editingNote
      ) {
        const updated =
          await updateDevNote(
            editingNote.id,
            input
          );


        setNotes(
          (
            previous
          ) =>
            previous.map(
              (
                note
              ) =>
                note.id ===
                updated.id
                  ? updated
                  : note
            )
        );
      } else {
        const created =
          await createDevNote(
            project.id,
            input
          );


        setNotes(
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

      setEditingNote(
        null
      );

      setForm(
        emptyForm
      );
    } catch (
      saveError
    ) {
      console.error(
        "DEV NOTE SAVE ERROR:",
        saveError
      );


      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save note."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  async function handlePin(
    note: DevNote
  ) {
    if (
      pinSavingIds.includes(
        note.id
      )
    ) {
      return;
    }


    setPinSavingIds(
      (
        previous
      ) => [
        ...previous,
        note.id,
      ]
    );


    try {
      const updated =
        await setDevNotePinned(
          note,
          !note.pinned
        );


      setNotes(
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
      pinError
    ) {
      window.alert(
        pinError instanceof Error
          ? pinError.message
          : "Could not update pin."
      );
    } finally {
      setPinSavingIds(
        (
          previous
        ) =>
          previous.filter(
            (
              id
            ) =>
              id !==
              note.id
          )
      );
    }
  }


  async function handleDelete(
    note: DevNote
  ) {
    const confirmed =
      window.confirm(
        `Delete note "${note.title}"?`
      );


    if (!confirmed) {
      return;
    }


    try {
      await deleteDevNote(
        note.id
      );


      setNotes(
        (
          previous
        ) =>
          previous.filter(
            (
              current
            ) =>
              current.id !==
              note.id
          )
      );
    } catch (
      deleteError
    ) {
      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete note."
      );
    }
  }


  if (loading) {
    return (
      <DevPageGuard>
        <main className="devNotesPage">
          <div className="devNotesState">
            Loading Notes...
          </div>

          <DevNotesStyles />
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
        <main className="devNotesPage">
          <div className="devNotesState error">
            {error ||
              "Project not found."}
          </div>

          <DevNotesStyles />
        </main>
      </DevPageGuard>
    );
  }


  return (
    <DevPageGuard>
      <main
        className="devNotesPage"
        style={
          {
            "--notes-accent":
              project.accent,
          } as CSSProperties
        }
      >
        <div className="devNotesBreadcrumbs">
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
            Notes
          </strong>
        </div>


        <section className="devNotesHero">
          <div>
            <span>
              {project.short_name}
              {" "}
              KNOWLEDGE BASE
            </span>

            <h1>
              Notes
            </h1>

            <p>
              Internal ideas, decisions,
              documentation and development
              information for {project.name}.
            </p>
          </div>


          <button
            type="button"
            onClick={
              openCreate
            }
          >
            + New Note
          </button>
        </section>


        <section className="devNotesStats">
          <article>
            <span>
              NOTES
            </span>

            <strong>
              {notes.length}
            </strong>
          </article>


          <article>
            <span>
              PINNED
            </span>

            <strong>
              {pinnedCount}
            </strong>
          </article>


          <article>
            <span>
              CATEGORIES
            </span>

            <strong>
              {categories.length}
            </strong>
          </article>


          <article>
            <span>
              LINKED
            </span>

            <strong>
              {
                notes.filter(
                  (
                    note
                  ) =>
                    !!note.update_id ||
                    !!note.roadmap_item_id ||
                    !!note.task_id ||
                    !!note.known_issue_id
                ).length
              }
            </strong>
          </article>
        </section>


        <section className="devNotesToolbar">
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
            placeholder="Search notes..."
          />


          <select
            value={
              categoryFilter
            }
            onChange={(
              event
            ) =>
              setCategoryFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Categories
            </option>

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
                >
                  {
                    category
                  }
                </option>
              )
            )}
          </select>


          <button
            type="button"
            className={
              pinnedOnly
                ? "active"
                : ""
            }
            onClick={() =>
              setPinnedOnly(
                (
                  previous
                ) =>
                  !previous
              )
            }
          >
            {pinnedOnly
              ? "✓ Pinned Only"
              : "Pinned Only"}
          </button>
        </section>


        <div className="devNotesResultCount">
          {visibleNotes.length}
          {" "}
          note
          {visibleNotes.length ===
          1
            ? ""
            : "s"}
        </div>


        <section className="devNotesGrid">
          {visibleNotes.map(
            (
              note
            ) => {
              const update =
                getUpdate(
                  note.update_id
                );


              const roadmap =
                getRoadmapItem(
                  note.roadmap_item_id
                );


              const task =
                getTask(
                  note.task_id
                );


              const knownIssue =
                getKnownIssue(
                  note.known_issue_id
                );


              return (
                <article
                  key={
                    note.id
                  }
                  className={`devNoteCard ${
                    note.pinned
                      ? "pinned"
                      : ""
                  }`}
                >
                  <header>
                    <div className="devNoteBadges">
                      {note.pinned ? (
                        <span className="devNotePinnedBadge">
                          PINNED
                        </span>
                      ) : null}


                      {note.category ? (
                        <span className="devNoteCategoryBadge">
                          {
                            note.category
                          }
                        </span>
                      ) : null}
                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        handlePin(
                          note
                        )
                      }
                      disabled={
                        pinSavingIds.includes(
                          note.id
                        )
                      }
                    >
                      {pinSavingIds.includes(
                        note.id
                      )
                        ? "..."
                        : note.pinned
                        ? "Unpin"
                        : "Pin"}
                    </button>
                  </header>


                  <h2>
                    {
                      note.title
                    }
                  </h2>


                  {note.content ? (
                    <p className="devNoteContent">
                      {
                        note.content
                      }
                    </p>
                  ) : (
                    <p className="devNoteContent empty">
                      No note content.
                    </p>
                  )}


                  {(update ||
                    roadmap ||
                    task ||
                    knownIssue) ? (
                    <div className="devNoteRelations">
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


                      {knownIssue ? (
                        <div>
                          <span>
                            KNOWN ISSUE
                          </span>

                          <strong>
                            {
                              knownIssue.title
                            }
                          </strong>
                        </div>
                      ) : null}
                    </div>
                  ) : null}


                  <footer>
                    <span>
                      Updated
                      {" "}
                      {formatTimestamp(
                        note.updated_at
                      )}
                    </span>


                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            note
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete"
                        onClick={() =>
                          handleDelete(
                            note
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </footer>
                </article>
              );
            }
          )}


          {visibleNotes.length ===
          0 ? (
            <div className="devNotesEmpty">
              <strong>
                No notes found
              </strong>

              <p>
                Create a note or change
                the current filters.
              </p>
            </div>
          ) : null}
        </section>


        {modalOpen ? (
          <div
            className="devNotesModalBackdrop"
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
            <div className="devNotesModal">
              <header>
                <div>
                  <span>
                    INTERNAL NOTE
                  </span>

                  <h2>
                    {editingNote
                      ? "Edit Note"
                      : "New Note"}
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
                    placeholder="Note title"
                    required
                  />
                </label>


                <label>
                  <span>
                    Content
                  </span>

                  <textarea
                    rows={
                      10
                    }
                    value={
                      form.content
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        content:
                          event.target.value,
                      })
                    }
                    placeholder="Write your internal note..."
                  />
                </label>


                <div className="devNotesFormRow">
                  <label>
                    <span>
                      Category
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
                      placeholder="Story, Gameplay, Website..."
                    />
                  </label>


                  <label className="devNotesPinField">
                    <span>
                      Pinned
                    </span>

                    <button
                      type="button"
                      className={
                        form.pinned
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setForm({
                          ...form,

                          pinned:
                            !form.pinned,
                        })
                      }
                    >
                      {form.pinned
                        ? "✓ Pinned"
                        : "Pin Note"}
                    </button>
                  </label>
                </div>


                <div className="devNotesRelationsTitle">
                  <span>
                    OPTIONAL LINKS
                  </span>

                  <p>
                    Connect this note to
                    existing development content.
                  </p>
                </div>


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
                    ) =>
                      setForm({
                        ...form,

                        updateId:
                          event.target.value,
                      })
                    }
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
                    ) =>
                      setForm({
                        ...form,

                        roadmapItemId:
                          event.target.value,
                      })
                    }
                  >
                    <option value="">
                      No Roadmap Item
                    </option>

                    {roadmapItems.map(
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
                    Task
                  </span>

                  <select
                    value={
                      form.taskId
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        taskId:
                          event.target.value,
                      })
                    }
                  >
                    <option value="">
                      No Task
                    </option>

                    {tasks.map(
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
                    Known Issue
                  </span>

                  <select
                    value={
                      form.knownIssueId
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        knownIssueId:
                          event.target.value,
                      })
                    }
                  >
                    <option value="">
                      No Known Issue
                    </option>

                    {knownIssues.map(
                      (
                        issue
                      ) => (
                        <option
                          key={
                            issue.id
                          }
                          value={
                            issue.id
                          }
                        >
                          {
                            issue.title
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>


                {formError ? (
                  <div className="devNotesFormError">
                    {
                      formError
                    }
                  </div>
                ) : null}


                <div className="devNotesFormActions">
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
                      : editingNote
                      ? "Save Changes"
                      : "Create Note"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}


        <DevNotesStyles />
      </main>
    </DevPageGuard>
  );
}


function DevNotesStyles() {
  return (
    <style jsx global>{`
      .devNotesPage {
        --notes-accent:
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

      .devNotesBreadcrumbs {
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

      .devNotesBreadcrumbs a {
        color:
          #93a7c6;

        text-decoration:
          none;
      }

      .devNotesBreadcrumbs strong {
        color:
          var(
            --notes-accent
          );
      }

      .devNotesHero {
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
              --notes-accent
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
                --notes-accent
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

      .devNotesHero > div > span {
        color:
          var(
            --notes-accent
          );

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          0.13em;
      }

      .devNotesHero h1 {
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

      .devNotesHero p {
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

      .devNotesHero button {
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
              --notes-accent
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
              --notes-accent
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

      .devNotesStats {
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

      .devNotesStats article {
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

      .devNotesStats span {
        color:
          #6d82a1;

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.1em;
      }

      .devNotesStats strong {
        display:
          block;

        margin-top:
          7px;

        font-size:
          25px;
      }

      .devNotesToolbar {
        display:
          grid;

        grid-template-columns:
          minmax(
            220px,
            1fr
          )
          minmax(
            160px,
            0.35fr
          )
          auto;

        gap:
          9px;

        margin-top:
          18px;
      }

      .devNotesToolbar input,
      .devNotesToolbar select,
      .devNotesToolbar button {
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

      .devNotesToolbar button {
        cursor:
          pointer;

        font-weight:
          800;
      }

      .devNotesToolbar button.active {
        border-color:
          color-mix(
            in srgb,
            var(
              --notes-accent
            )
            35%,
            transparent
          );

        color:
          var(
            --notes-accent
          );
      }

      .devNotesToolbar select option {
        background:
          #091223;
      }

      .devNotesResultCount {
        margin:
          12px
          2px
          0;

        color:
          #667b99;

        font-size:
          9px;

        font-weight:
          750;
      }

      .devNotesGrid {
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

      .devNoteCard {
        position:
          relative;

        overflow:
          hidden;

        display:
          flex;

        flex-direction:
          column;

        min-height:
          280px;

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

      .devNoteCard.pinned {
        border-color:
          color-mix(
            in srgb,
            var(
              --notes-accent
            )
            25%,
            transparent
          );

        background:
          linear-gradient(
            145deg,
            color-mix(
              in srgb,
              var(
                --notes-accent
              )
              5%,
              rgba(
                8,
                17,
                33,
                0.94
              )
            ),
            rgba(
              8,
              17,
              33,
              0.94
            )
          );
      }

      .devNoteCard.pinned::before {
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
            --notes-accent
          );

        opacity:
          0.8;
      }

      .devNoteCard > header {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          10px;
      }

      .devNoteBadges {
        display:
          flex;

        flex-wrap:
          wrap;

        gap:
          6px;
      }

      .devNotePinnedBadge,
      .devNoteCategoryBadge {
        display:
          inline-flex;

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

        color:
          #8599b7;

        font-size:
          7px;

        font-weight:
          900;

        letter-spacing:
          0.07em;

        text-transform:
          uppercase;
      }

      .devNotePinnedBadge {
        color:
          var(
            --notes-accent
          );
      }

      .devNoteCard > header > button {
        border:
          0;

        background:
          transparent;

        color:
          #7d91ae;

        cursor:
          pointer;

        font:
          inherit;

        font-size:
          9px;

        font-weight:
          800;
      }

      .devNoteCard h2 {
        margin:
          18px
          0
          0;

        font-size:
          23px;

        line-height:
          1.2;

        letter-spacing:
          -0.03em;
      }

      .devNoteContent {
        display:
          -webkit-box;

        overflow:
          hidden;

        margin:
          11px
          0
          0;

        color:
          #879ab7;

        white-space:
          pre-wrap;

        font-size:
          11px;

        line-height:
          1.7;

        -webkit-line-clamp:
          7;

        -webkit-box-orient:
          vertical;
      }

      .devNoteContent.empty {
        color:
          #5d718f;

        font-style:
          italic;
      }

      .devNoteRelations {
        display:
          grid;

        gap:
          6px;

        margin-top:
          15px;
      }

      .devNoteRelations > div {
        padding:
          8px
          9px;

        border-radius:
          8px;

        background:
          rgba(
            255,
            255,
            255,
            0.02
          );
      }

      .devNoteRelations span {
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

      .devNoteRelations strong {
        display:
          block;

        margin-top:
          4px;

        color:
          var(
            --notes-accent
          );

        font-size:
          9px;
      }

      .devNoteCard footer {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          12px;

        margin-top:
          auto;

        padding-top:
          17px;
      }

      .devNoteCard footer > span {
        color:
          #566b89;

        font-size:
          8px;
      }

      .devNoteCard footer > div {
        display:
          flex;

        gap:
          9px;
      }

      .devNoteCard footer button {
        border:
          0;

        background:
          transparent;

        color:
          #8ca1bf;

        cursor:
          pointer;

        font:
          inherit;

        font-size:
          8px;

        font-weight:
          800;
      }

      .devNoteCard footer button.delete {
        color:
          #bc7480;
      }

      .devNotesEmpty {
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

      .devNotesEmpty strong {
        color:
          #a3b4cc;
      }

      .devNotesEmpty p {
        margin:
          6px
          0
          0;

        font-size:
          10px;
      }

      .devNotesModalBackdrop {
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

      .devNotesModal {
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
              --notes-accent
            )
            27%,
            transparent
          );

        border-radius:
          22px;

        background:
          #091223;
      }

      .devNotesModal > header {
        display:
          flex;

        align-items:
          flex-start;

        justify-content:
          space-between;

        gap:
          20px;
      }

      .devNotesModal > header span {
        color:
          var(
            --notes-accent
          );

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.13em;
      }

      .devNotesModal > header h2 {
        margin:
          6px
          0
          0;

        font-size:
          29px;
      }

      .devNotesModal > header button {
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

      .devNotesModal form {
        display:
          grid;

        gap:
          15px;

        margin-top:
          22px;
      }

      .devNotesModal label {
        display:
          grid;

        gap:
          7px;
      }

      .devNotesModal label > span {
        color:
          #9db0ca;

        font-size:
          10px;

        font-weight:
          800;
      }

      .devNotesModal input,
      .devNotesModal textarea,
      .devNotesModal select {
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

      .devNotesModal textarea {
        resize:
          vertical;
      }

      .devNotesModal select option {
        background:
          #091223;
      }

      .devNotesFormRow {
        display:
          grid;

        grid-template-columns:
          1fr
          170px;

        gap:
          11px;
      }

      .devNotesPinField button {
        min-height:
          42px;

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

        background:
          rgba(
            255,
            255,
            255,
            0.03
          );

        color:
          #8ea2bf;

        cursor:
          pointer;

        font:
          inherit;

        font-size:
          10px;

        font-weight:
          800;
      }

      .devNotesPinField button.active {
        border-color:
          color-mix(
            in srgb,
            var(
              --notes-accent
            )
            35%,
            transparent
          );

        color:
          var(
            --notes-accent
          );
      }

      .devNotesRelationsTitle {
        margin-top:
          5px;

        padding-top:
          15px;

        border-top:
          1px solid
          rgba(
            128,
            154,
            198,
            0.09
          );
      }

      .devNotesRelationsTitle span {
        color:
          var(
            --notes-accent
          );

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          0.1em;
      }

      .devNotesRelationsTitle p {
        margin:
          5px
          0
          0;

        color:
          #617695;

        font-size:
          9px;
      }

      .devNotesFormError {
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

      .devNotesFormActions {
        display:
          flex;

        justify-content:
          flex-end;

        gap:
          9px;
      }

      .devNotesFormActions button {
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

      .devNotesFormActions .secondary {
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

      .devNotesFormActions .primary {
        border:
          1px solid
          color-mix(
            in srgb,
            var(
              --notes-accent
            )
            34%,
            transparent
          );

        background:
          color-mix(
            in srgb,
            var(
              --notes-accent
            )
            14%,
            transparent
          );

        color:
          white;
      }

      .devNotesState {
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

      .devNotesState.error {
        color:
          #ff9dac;
      }

      @media (
        max-width:
          800px
      ) {
        .devNotesStats {
          grid-template-columns:
            1fr
            1fr;
        }

        .devNotesGrid {
          grid-template-columns:
            1fr;
        }
      }

      @media (
        max-width:
          650px
      ) {
        .devNotesHero {
          align-items:
            flex-start;

          flex-direction:
            column;

          padding:
            25px
            21px;
        }

        .devNotesHero button {
          width:
            100%;
        }

        .devNotesToolbar {
          grid-template-columns:
            1fr;
        }

        .devNotesFormRow {
          grid-template-columns:
            1fr;
        }
      }

      @media (
        max-width:
          450px
      ) {
        .devNotesStats {
          grid-template-columns:
            1fr;
        }
      }
    `}</style>
  );
}