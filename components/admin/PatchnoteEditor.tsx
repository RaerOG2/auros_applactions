"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";

import PatchnoteContentRenderer from "../patchnotes/PatchnoteContentRenderer";

import {
  createPatchnote,
  getAdminPatchnoteById,
  updatePatchnote,
  uploadPatchnoteImage,
} from "../../services/patchnotes-admin.service";

import {
  emptyPatchnoteEditorForm,
} from "../../types/admin";

import type {
  PatchnoteContentBlock,
  PatchnoteEditorForm,
  PatchnoteGalleryBlock,
  PatchnoteGalleryImage,
  PatchnoteHighlightBlock,
  PatchnoteSplitBlock,
  PatchnoteSplitRatio,
} from "../../types/admin";

import type {
  ContentBlock,
} from "../../types/community";


type BlockTemplateType =
  | "simple-section"
  | "feature-spotlight"
  | "media-showcase"
  | "release-section";


type DraftRecord = {
  savedAt: string;

  form: PatchnoteEditorForm;
};


const HISTORY_LIMIT =
  80;


function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}


function cloneForm(
  value: PatchnoteEditorForm
): PatchnoteEditorForm {
  return JSON.parse(
    JSON.stringify(
      value
    )
  ) as PatchnoteEditorForm;
}


function makeSlug(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}


function cloneBlock(
  block:
    PatchnoteContentBlock
): PatchnoteContentBlock {
  const cloned = {
    ...block,

    id:
      createId(),
  } as PatchnoteContentBlock;


  if (
    cloned.type ===
    "gallery"
  ) {
    return {
      ...cloned,

      images:
        cloned.images.map(
          (
            image
          ) => ({
            ...image,

            id:
              createId(),
          })
        ),
    };
  }


  return cloned;
}


function createBlock(
  type:
    PatchnoteContentBlock["type"]
): PatchnoteContentBlock {
  if (
    type ===
    "heading"
  ) {
    return {
      id:
        createId(),

      type:
        "heading",

      text:
        "",
    };
  }


  if (
    type ===
    "text"
  ) {
    return {
      id:
        createId(),

      type:
        "text",

      text:
        "",
    };
  }


  if (
    type ===
    "image"
  ) {
    return {
      id:
        createId(),

      type:
        "image",

      url:
        "",

      alt:
        "",

      caption:
        "",
    };
  }


  if (
    type ===
    "split"
  ) {
    return {
      id:
        createId(),

      type:
        "split",

      ratio:
        "40-60",

      imagePosition:
        "left",

      heading:
        "",

      text:
        "",

      imageUrl:
        "",

      imageAlt:
        "",

      imageCaption:
        "",
    };
  }


  if (
    type ===
    "highlight"
  ) {
    return {
      id:
        createId(),

      type:
        "highlight",

      eyebrow:
        "HIGHLIGHT",

      heading:
        "",

      text:
        "",

      tone:
        "cyan",
    };
  }


  if (
    type ===
    "gallery"
  ) {
    return {
      id:
        createId(),

      type:
        "gallery",

      columns:
        2,

      images:
        [],
    };
  }


  if (
    type ===
    "divider"
  ) {
    return {
      id:
        createId(),

      type:
        "divider",
    };
  }


  return {
    id:
      createId(),

    type:
      "spacer",

    size:
      "medium",
  };
}


function createTemplate(
  template:
    BlockTemplateType
): PatchnoteContentBlock[] {
  if (
    template ===
    "simple-section"
  ) {
    return [
      {
        id:
          createId(),

        type:
          "heading",

        text:
          "Section Heading",
      },

      {
        id:
          createId(),

        type:
          "text",

        text:
          "",
      },
    ];
  }


  if (
    template ===
    "feature-spotlight"
  ) {
    return [
      {
        id:
          createId(),

        type:
          "heading",

        text:
          "Feature Spotlight",
      },

      {
        id:
          createId(),

        type:
          "split",

        ratio:
          "40-60",

        imagePosition:
          "left",

        heading:
          "Feature Name",

        text:
          "",

        imageUrl:
          "",

        imageAlt:
          "",

        imageCaption:
          "",
      },

      {
        id:
          createId(),

        type:
          "highlight",

        eyebrow:
          "GOOD TO KNOW",

        heading:
          "Important Information",

        text:
          "",

        tone:
          "cyan",
      },
    ];
  }


  if (
    template ===
    "media-showcase"
  ) {
    return [
      {
        id:
          createId(),

        type:
          "heading",

        text:
          "Gallery",
      },

      {
        id:
          createId(),

        type:
          "text",

        text:
          "",
      },

      {
        id:
          createId(),

        type:
          "gallery",

        columns:
          2,

        images:
          [
            {
              id:
                createId(),

              url:
                "",

              alt:
                "",

              caption:
                "",
            },

            {
              id:
                createId(),

              url:
                "",

              alt:
                "",

              caption:
                "",
            },
          ],
      },
    ];
  }


  return [
    {
      id:
        createId(),

      type:
        "divider",
    },

    {
      id:
        createId(),

      type:
        "highlight",

      eyebrow:
        "UPDATE",

      heading:
        "Release Information",

      text:
        "",

      tone:
        "green",
    },

    {
      id:
        createId(),

      type:
        "spacer",

      size:
        "medium",
    },
  ];
}


function normalizeLoadedBlocks(
  blocks:
    PatchnoteContentBlock[]
) {
  return blocks.map(
    (
      block
    ) => {
      const normalized = {
        ...block,

        id:
          block.id ||
          createId(),
      } as PatchnoteContentBlock;


      if (
        normalized.type ===
        "gallery"
      ) {
        normalized.images =
          normalized.images.map(
            (
              image
            ) => ({
              ...image,

              id:
                image.id ||
                createId(),
            })
          );
      }


      return normalized;
    }
  );
}


function normalizeEditorForm(
  input:
    PatchnoteEditorForm
): PatchnoteEditorForm {
  return {
    version:
      input.version ??
      "",

    title:
      input.title ??
      "",

    slug:
      input.slug ??
      "",

    summary:
      input.summary ??
      "",

    cover_url:
      input.cover_url ??
      "",

    published:
      !!input.published,

    blocks:
      normalizeLoadedBlocks(
        input.blocks ??
        []
      ),
  };
}


function blockReady(
  block:
    PatchnoteContentBlock
) {
  if (
    block.type ===
      "heading" ||
    block.type ===
      "text"
  ) {
    return !!block.text.trim();
  }


  if (
    block.type ===
    "image"
  ) {
    return !!block.url;
  }


  if (
    block.type ===
    "split"
  ) {
    return !!(
      block.imageUrl &&
      (
        block.heading.trim() ||
        block.text.trim()
      )
    );
  }


  if (
    block.type ===
    "highlight"
  ) {
    return !!(
      block.heading.trim() ||
      block.text.trim()
    );
  }


  if (
    block.type ===
    "gallery"
  ) {
    return block.images.some(
      (
        image
      ) =>
        !!image.url
    );
  }


  return true;
}


function blockName(
  block:
    PatchnoteContentBlock
) {
  switch (
    block.type
  ) {
    case "heading":
      return [
        "Heading",
        "Section title",
        "H",
      ] as const;


    case "text":
      return [
        "Text",
        "Article paragraph",
        "T",
      ] as const;


    case "image":
      return [
        "Image",
        "Full-width media",
        "▧",
      ] as const;


    case "split":
      return [
        "Split Layout",
        "Image + text columns",
        "◫",
      ] as const;


    case "highlight":
      return [
        "Highlight",
        "Important information",
        "!",
      ] as const;


    case "gallery":
      return [
        "Gallery",
        "Multiple images",
        "▦",
      ] as const;


    case "divider":
      return [
        "Divider",
        "Section separator",
        "—",
      ] as const;


    case "spacer":
      return [
        "Spacer",
        "Vertical spacing",
        "↕",
      ] as const;
  }
}


function formatDraftTime(
  value:
    string | null
) {
  if (
    !value
  ) {
    return null;
  }


  const date =
    new Date(
      value
    );


  return date.toLocaleTimeString(
    [],
    {
      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );
}


export default function PatchnoteEditor({
  patchnoteId,
}: {
  patchnoteId?:
    string;
}) {
  const [
    form,
    setForm,
  ] =
    useState<PatchnoteEditorForm>(
      emptyPatchnoteEditorForm
    );


  const formRef =
    useRef<PatchnoteEditorForm>(
      emptyPatchnoteEditorForm
    );


  const undoStackRef =
    useRef<
      PatchnoteEditorForm[]
    >([]);


  const redoStackRef =
    useRef<
      PatchnoteEditorForm[]
    >([]);


  const serverUpdatedAtRef =
    useRef<
      string | null
    >(
      null
    );


  const [
    historyVersion,
    setHistoryVersion,
  ] =
    useState(
      0
    );


  const [
    baselineSignature,
    setBaselineSignature,
  ] =
    useState(
      JSON.stringify(
        emptyPatchnoteEditorForm
      )
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      !!patchnoteId
    );


  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );


  const [
    uploadingCover,
    setUploadingCover,
  ] =
    useState(
      false
    );


  const [
    uploadingBlockId,
    setUploadingBlockId,
  ] =
    useState<
      string | null
    >(
      null
    );


  const [
    uploadingGalleryImageId,
    setUploadingGalleryImageId,
  ] =
    useState<
      string | null
    >(
      null
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
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(
      null
    );


  const [
    previewMode,
    setPreviewMode,
  ] =
    useState<
      | "desktop"
      | "mobile"
      | "card"
    >(
      "desktop"
    );


  const [
    draggedBlockId,
    setDraggedBlockId,
  ] =
    useState<
      string | null
    >(
      null
    );


  const [
    dragOverIndex,
    setDragOverIndex,
  ] =
    useState<
      number | null
    >(
      null
    );


  const [
    collapsedBlockIds,
    setCollapsedBlockIds,
  ] =
    useState<
      string[]
    >([]);


  const [
    insertMenuIndex,
    setInsertMenuIndex,
  ] =
    useState<
      number | null
    >(
      null
    );


  const [
    draftChecked,
    setDraftChecked,
  ] =
    useState(
      false
    );


  const [
    draftCandidate,
    setDraftCandidate,
  ] =
    useState<
      DraftRecord | null
    >(
      null
    );


  const [
    lastDraftSavedAt,
    setLastDraftSavedAt,
  ] =
    useState<
      string | null
    >(
      null
    );


  const draftKey =
    useMemo(
      () =>
        `auros-patchnote-editor-3:${
          patchnoteId ??
          "new"
        }`,

      [
        patchnoteId,
      ]
    );


  const formSignature =
    useMemo(
      () =>
        JSON.stringify(
          form
        ),

      [
        form,
      ]
    );


  const isDirty =
    formSignature !==
    baselineSignature;


  const canUndo =
    undoStackRef.current.length >
    0;


  const canRedo =
    redoStackRef.current.length >
    0;


  function resetHistory() {
    undoStackRef.current =
      [];

    redoStackRef.current =
      [];

    setHistoryVersion(
      (
        value
      ) =>
        value +
        1
    );
  }


  function replaceForm(
    nextForm:
      PatchnoteEditorForm,

    options?: {
      resetHistory?:
        boolean;

      setBaseline?:
        boolean;
    }
  ) {
    const normalized =
      normalizeEditorForm(
        nextForm
      );


    formRef.current =
      normalized;

    setForm(
      normalized
    );


    if (
      options?.resetHistory
    ) {
      resetHistory();
    }


    if (
      options?.setBaseline
    ) {
      setBaselineSignature(
        JSON.stringify(
          normalized
        )
      );
    }
  }


  function commitForm(
    updater:
      | PatchnoteEditorForm
      | ((
          current:
            PatchnoteEditorForm
        ) =>
          PatchnoteEditorForm)
  ) {
    const previous =
      formRef.current;


    const next =
      typeof updater ===
      "function"
        ? updater(
            previous
          )
        : updater;


    const previousSignature =
      JSON.stringify(
        previous
      );


    const nextSignature =
      JSON.stringify(
        next
      );


    if (
      previousSignature ===
      nextSignature
    ) {
      return;
    }


    undoStackRef.current =
      [
        ...undoStackRef.current.slice(
          -(
            HISTORY_LIMIT -
            1
          )
        ),

        cloneForm(
          previous
        ),
      ];


    redoStackRef.current =
      [];


    formRef.current =
      next;

    setForm(
      next
    );


    setHistoryVersion(
      (
        value
      ) =>
        value +
        1
    );
  }


  function undo() {
    const stack =
      undoStackRef.current;


    if (
      stack.length ===
      0
    ) {
      return;
    }


    const previous =
      stack[
        stack.length -
        1
      ];


    undoStackRef.current =
      stack.slice(
        0,
        -1
      );


    redoStackRef.current =
      [
        ...redoStackRef.current.slice(
          -(
            HISTORY_LIMIT -
            1
          )
        ),

        cloneForm(
          formRef.current
        ),
      ];


    const next =
      cloneForm(
        previous
      );


    formRef.current =
      next;

    setForm(
      next
    );


    setHistoryVersion(
      (
        value
      ) =>
        value +
        1
    );
  }


  function redo() {
    const stack =
      redoStackRef.current;


    if (
      stack.length ===
      0
    ) {
      return;
    }


    const next =
      stack[
        stack.length -
        1
      ];


    redoStackRef.current =
      stack.slice(
        0,
        -1
      );


    undoStackRef.current =
      [
        ...undoStackRef.current.slice(
          -(
            HISTORY_LIMIT -
            1
          )
        ),

        cloneForm(
          formRef.current
        ),
      ];


    const restored =
      cloneForm(
        next
      );


    formRef.current =
      restored;

    setForm(
      restored
    );


    setHistoryVersion(
      (
        value
      ) =>
        value +
        1
    );
  }


  useEffect(
    () => {
      if (
        !patchnoteId
      ) {
        const initial =
          normalizeEditorForm(
            emptyPatchnoteEditorForm
          );


        replaceForm(
          initial,
          {
            resetHistory:
              true,

            setBaseline:
              true,
          }
        );


        setLoading(
          false
        );

        return;
      }


      getAdminPatchnoteById(
        patchnoteId
      )
        .then(
          (
            note
          ) => {
            if (
              !note
            ) {
              setError(
                "Patchnote not found."
              );

              return;
            }


            serverUpdatedAtRef.current =
              note.updated_at ??
              note.created_at ??
              null;


            const loadedBlocks =
              note.content_blocks ??
              (
                note.content
                  ? [
                      {
                        id:
                          createId(),

                        type:
                          "text" as const,

                        text:
                          note.content,
                      },
                    ]
                  : []
              );


            const loadedForm:
              PatchnoteEditorForm =
              {
                version:
                  note.version ??
                  "",

                title:
                  note.title ??
                  "",

                slug:
                  note.slug ??
                  "",

                summary:
                  note.summary ??
                  "",

                cover_url:
                  note.cover_url ??
                  "",

                published:
                  note.published ??
                  false,

                blocks:
                  normalizeLoadedBlocks(
                    loadedBlocks
                  ),
              };


            replaceForm(
              loadedForm,
              {
                resetHistory:
                  true,

                setBaseline:
                  true,
              }
            );
          }
        )
        .catch(
          (
            loadError
          ) => {
            console.error(
              loadError
            );


            setError(
              loadError instanceof Error
                ? loadError.message
                : "Could not load patchnote."
            );
          }
        )
        .finally(
          () => {
            setLoading(
              false
            );
          }
        );
    },
    [
      patchnoteId,
    ]
  );


  useEffect(
    () => {
      if (
        loading ||
        draftChecked
      ) {
        return;
      }


      try {
        const raw =
          localStorage.getItem(
            draftKey
          );


        if (
          !raw
        ) {
          setDraftChecked(
            true
          );

          return;
        }


        const parsed =
          JSON.parse(
            raw
          ) as DraftRecord;


        if (
          !parsed?.form ||
          !parsed.savedAt
        ) {
          localStorage.removeItem(
            draftKey
          );

          setDraftChecked(
            true
          );

          return;
        }


        const normalizedDraft =
          normalizeEditorForm(
            parsed.form
          );


        const draftSignature =
          JSON.stringify(
            normalizedDraft
          );


        const currentSignature =
          JSON.stringify(
            formRef.current
          );


        const draftTime =
          new Date(
            parsed.savedAt
          ).getTime();


        const serverTime =
          serverUpdatedAtRef.current
            ? new Date(
                serverUpdatedAtRef.current
              ).getTime()
            : 0;


        const isDifferent =
          draftSignature !==
          currentSignature;


        const isNewer =
          !patchnoteId ||
          draftTime >
            serverTime;


        if (
          isDifferent &&
          isNewer
        ) {
          setDraftCandidate({
            savedAt:
              parsed.savedAt,

            form:
              normalizedDraft,
          });
        } else {
          localStorage.removeItem(
            draftKey
          );
        }
      } catch (
        draftError
      ) {
        console.error(
          "PATCHNOTE DRAFT LOAD ERROR:",
          draftError
        );


        localStorage.removeItem(
          draftKey
        );
      } finally {
        setDraftChecked(
          true
        );
      }
    },
    [
      loading,
      draftChecked,
      draftKey,
      patchnoteId,
    ]
  );


  useEffect(
    () => {
      if (
        !draftChecked ||
        loading ||
        !isDirty
      ) {
        return;
      }


      const timer =
        window.setTimeout(
          () => {
            try {
              const now =
                new Date().toISOString();


              const record:
                DraftRecord =
                {
                  savedAt:
                    now,

                  form:
                    cloneForm(
                      form
                    ),
                };


              localStorage.setItem(
                draftKey,

                JSON.stringify(
                  record
                )
              );


              setLastDraftSavedAt(
                now
              );
            } catch (
              saveDraftError
            ) {
              console.error(
                "PATCHNOTE AUTO SAVE ERROR:",
                saveDraftError
              );
            }
          },
          900
        );


      return () =>
        window.clearTimeout(
          timer
        );
    },
    [
      form,
      draftChecked,
      loading,
      isDirty,
      draftKey,
    ]
  );


  useEffect(
    () => {
      function handleKeyDown(
        event:
          KeyboardEvent
      ) {
        const modifier =
          event.ctrlKey ||
          event.metaKey;


        if (
          !modifier
        ) {
          return;
        }


        const key =
          event.key.toLowerCase();


        if (
          key ===
          "z"
        ) {
          event.preventDefault();


          if (
            event.shiftKey
          ) {
            redo();
          } else {
            undo();
          }


          return;
        }


        if (
          key ===
          "y"
        ) {
          event.preventDefault();

          redo();
        }
      }


      window.addEventListener(
        "keydown",
        handleKeyDown
      );


      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown
        );
      };
    },
    [
      historyVersion,
    ]
  );


  useEffect(
    () => {
      function beforeUnload(
        event:
          BeforeUnloadEvent
      ) {
        if (
          !isDirty
        ) {
          return;
        }


        event.preventDefault();

        event.returnValue =
          "";
      }


      window.addEventListener(
        "beforeunload",
        beforeUnload
      );


      return () => {
        window.removeEventListener(
          "beforeunload",
          beforeUnload
        );
      };
    },
    [
      isDirty,
    ]
  );


  function updateForm<
    Key extends keyof PatchnoteEditorForm
  >(
    key:
      Key,

    value:
      PatchnoteEditorForm[Key]
  ) {
    commitForm(
      (
        previous
      ) => ({
        ...previous,

        [key]:
          value,
      })
    );
  }


  function changeTitle(
    title:
      string
  ) {
    commitForm(
      (
        previous
      ) => {
        const previousAutoSlug =
          makeSlug(
            previous.title
          );


        const shouldUpdateSlug =
          !previous.slug ||
          previous.slug ===
            previousAutoSlug;


        return {
          ...previous,

          title,

          slug:
            shouldUpdateSlug
              ? makeSlug(
                  title
                )
              : previous.slug,
        };
      }
    );
  }


  function addBlock(
    type:
      PatchnoteContentBlock["type"]
  ) {
    insertBlockAt(
      formRef.current.blocks.length,

      type
    );
  }


  function insertBlockAt(
    index:
      number,

    type:
      PatchnoteContentBlock["type"]
  ) {
    commitForm(
      (
        previous
      ) => {
        const blocks =
          [
            ...previous.blocks,
          ];


        blocks.splice(
          index,
          0,
          createBlock(
            type
          )
        );


        return {
          ...previous,

          blocks,
        };
      }
    );


    setInsertMenuIndex(
      null
    );
  }


  function addTemplate(
    template:
      BlockTemplateType
  ) {
    insertTemplateAt(
      formRef.current.blocks.length,

      template
    );
  }


  function insertTemplateAt(
    index:
      number,

    template:
      BlockTemplateType
  ) {
    commitForm(
      (
        previous
      ) => {
        const blocks =
          [
            ...previous.blocks,
          ];


        blocks.splice(
          index,
          0,
          ...createTemplate(
            template
          )
        );


        return {
          ...previous,

          blocks,
        };
      }
    );


    setInsertMenuIndex(
      null
    );
  }


  function updateBlock(
    id:
      string,

    updater:
      (
        block:
          PatchnoteContentBlock
      ) =>
        PatchnoteContentBlock
  ) {
    commitForm(
      (
        previous
      ) => ({
        ...previous,

        blocks:
          previous.blocks.map(
            (
              block
            ) =>
              block.id ===
              id
                ? updater(
                    block
                  )
                : block
          ),
      })
    );
  }


  function removeBlock(
    id:
      string
  ) {
    commitForm(
      (
        previous
      ) => ({
        ...previous,

        blocks:
          previous.blocks.filter(
            (
              block
            ) =>
              block.id !==
              id
          ),
      })
    );


    setCollapsedBlockIds(
      (
        previous
      ) =>
        previous.filter(
          (
            blockId
          ) =>
            blockId !==
            id
        )
    );
  }


  function duplicateBlock(
    index:
      number
  ) {
    commitForm(
      (
        previous
      ) => {
        const blocks =
          [
            ...previous.blocks,
          ];


        blocks.splice(
          index +
            1,
          0,
          cloneBlock(
            blocks[
              index
            ]
          )
        );


        return {
          ...previous,

          blocks,
        };
      }
    );
  }


  function moveBlock(
    index:
      number,

    direction:
      | -1
      | 1
  ) {
    const target =
      index +
      direction;


    if (
      target <
        0 ||
      target >=
        formRef.current.blocks.length
    ) {
      return;
    }


    commitForm(
      (
        previous
      ) => {
        const blocks =
          [
            ...previous.blocks,
          ];


        [
          blocks[
            index
          ],
          blocks[
            target
          ],
        ] =
          [
            blocks[
              target
            ],
            blocks[
              index
            ],
          ];


        return {
          ...previous,

          blocks,
        };
      }
    );
  }


  function toggleBlockCollapse(
    blockId:
      string
  ) {
    setCollapsedBlockIds(
      (
        previous
      ) =>
        previous.includes(
          blockId
        )
          ? previous.filter(
              (
                id
              ) =>
                id !==
                blockId
            )
          : [
              ...previous,
              blockId,
            ]
    );
  }


  function collapseAllBlocks() {
    setCollapsedBlockIds(
      formRef.current.blocks.map(
        (
          block
        ) =>
          block.id
      )
    );
  }


  function expandAllBlocks() {
    setCollapsedBlockIds(
      []
    );
  }


  function handleBlockDragStart(
    event:
      DragEvent<HTMLElement>,

    blockId:
      string
  ) {
    setDraggedBlockId(
      blockId
    );

    setDragOverIndex(
      null
    );


    event.dataTransfer.effectAllowed =
      "move";


    event.dataTransfer.setData(
      "text/plain",

      blockId
    );
  }


  function handleDropZoneDragOver(
    event:
      DragEvent<HTMLDivElement>,

    index:
      number
  ) {
    event.preventDefault();


    event.dataTransfer.dropEffect =
      "move";


    if (
      draggedBlockId
    ) {
      setDragOverIndex(
        index
      );
    }
  }


  function handleDropAtIndex(
    event:
      DragEvent<HTMLDivElement>,

    targetIndex:
      number
  ) {
    event.preventDefault();


    const sourceBlockId =
      draggedBlockId ||
      event.dataTransfer.getData(
        "text/plain"
      );


    if (
      !sourceBlockId
    ) {
      return;
    }


    commitForm(
      (
        previous
      ) => {
        const sourceIndex =
          previous.blocks.findIndex(
            (
              block
            ) =>
              block.id ===
              sourceBlockId
          );


        if (
          sourceIndex <
          0
        ) {
          return previous;
        }


        const blocks =
          [
            ...previous.blocks,
          ];


        const [
          movedBlock,
        ] =
          blocks.splice(
            sourceIndex,
            1
          );


        let adjustedTarget =
          targetIndex;


        if (
          sourceIndex <
          targetIndex
        ) {
          adjustedTarget -=
            1;
        }


        adjustedTarget =
          Math.max(
            0,
            Math.min(
              adjustedTarget,
              blocks.length
            )
          );


        blocks.splice(
          adjustedTarget,
          0,
          movedBlock
        );


        return {
          ...previous,

          blocks,
        };
      }
    );


    setDraggedBlockId(
      null
    );

    setDragOverIndex(
      null
    );
  }


  function handleBlockDragEnd() {
    setDraggedBlockId(
      null
    );

    setDragOverIndex(
      null
    );
  }


  async function uploadCover(
    file?:
      File
  ) {
    if (
      !file
    ) {
      return;
    }


    try {
      setUploadingCover(
        true
      );

      setError(
        null
      );


      const url =
        await uploadPatchnoteImage(
          file,
          "covers"
        );


      updateForm(
        "cover_url",
        url
      );
    } catch (
      uploadError
    ) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Cover upload failed."
      );
    } finally {
      setUploadingCover(
        false
      );
    }
  }


  async function uploadBlockImage(
    blockId:
      string,

    file?:
      File
  ) {
    if (
      !file
    ) {
      return;
    }


    try {
      setUploadingBlockId(
        blockId
      );

      setError(
        null
      );


      const url =
        await uploadPatchnoteImage(
          file,
          "content"
        );


      updateBlock(
        blockId,
        (
          block
        ) => {
          if (
            block.type ===
            "image"
          ) {
            return {
              ...block,
              url,
            };
          }


          if (
            block.type ===
            "split"
          ) {
            return {
              ...block,
              imageUrl:
                url,
            };
          }


          return block;
        }
      );
    } catch (
      uploadError
    ) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed."
      );
    } finally {
      setUploadingBlockId(
        null
      );
    }
  }


  function addGalleryImage(
    blockId:
      string
  ) {
    updateBlock(
      blockId,
      (
        block
      ) => {
        if (
          block.type !==
          "gallery"
        ) {
          return block;
        }


        const image:
          PatchnoteGalleryImage =
          {
            id:
              createId(),

            url:
              "",

            alt:
              "",

            caption:
              "",
          };


        return {
          ...block,

          images:
            [
              ...block.images,
              image,
            ],
        };
      }
    );
  }


  function updateGalleryImage(
    blockId:
      string,

    imageId:
      string,

    patch:
      Partial<PatchnoteGalleryImage>
  ) {
    updateBlock(
      blockId,
      (
        block
      ) => {
        if (
          block.type !==
          "gallery"
        ) {
          return block;
        }


        return {
          ...block,

          images:
            block.images.map(
              (
                image
              ) =>
                image.id ===
                imageId
                  ? {
                      ...image,
                      ...patch,
                    }
                  : image
            ),
        };
      }
    );
  }


  function removeGalleryImage(
    blockId:
      string,

    imageId:
      string
  ) {
    updateBlock(
      blockId,
      (
        block
      ) => {
        if (
          block.type !==
          "gallery"
        ) {
          return block;
        }


        return {
          ...block,

          images:
            block.images.filter(
              (
                image
              ) =>
                image.id !==
                imageId
            ),
        };
      }
    );
  }


  async function uploadGalleryImage(
    blockId:
      string,

    imageId:
      string,

    file?:
      File
  ) {
    if (
      !file
    ) {
      return;
    }


    try {
      setUploadingGalleryImageId(
        imageId
      );

      setError(
        null
      );


      const url =
        await uploadPatchnoteImage(
          file,
          "content"
        );


      updateGalleryImage(
        blockId,
        imageId,
        {
          url,
        }
      );
    } catch (
      uploadError
    ) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Gallery image upload failed."
      );
    } finally {
      setUploadingGalleryImageId(
        null
      );
    }
  }


  function restoreDraft() {
    if (
      !draftCandidate
    ) {
      return;
    }


    commitForm(
      normalizeEditorForm(
        draftCandidate.form
      )
    );


    setLastDraftSavedAt(
      draftCandidate.savedAt
    );


    setDraftCandidate(
      null
    );
  }


  function discardDraft() {
    try {
      localStorage.removeItem(
        draftKey
      );
    } catch {
      // Ignore localStorage errors.
    }


    setDraftCandidate(
      null
    );

    setLastDraftSavedAt(
      null
    );
  }


  async function save() {
    setError(
      null
    );

    setSuccess(
      null
    );


    const current =
      formRef.current;


    if (
      !current.version.trim()
    ) {
      setError(
        "Please enter a version."
      );

      return;
    }


    if (
      !current.title.trim()
    ) {
      setError(
        "Please enter a title."
      );

      return;
    }


    if (
      !current.slug.trim()
    ) {
      setError(
        "Please enter a slug."
      );

      return;
    }


    try {
      setSaving(
        true
      );


      if (
        patchnoteId
      ) {
        const updated =
          await updatePatchnote(
            patchnoteId,
            current
          );


        serverUpdatedAtRef.current =
          updated.updated_at ??
          new Date().toISOString();


        setBaselineSignature(
          JSON.stringify(
            current
          )
        );


        try {
          localStorage.removeItem(
            draftKey
          );
        } catch {
          // Ignore.
        }


        setLastDraftSavedAt(
          null
        );


        setSuccess(
          "Patchnote saved successfully."
        );
      } else {
        const created =
          await createPatchnote(
            current
          );


        try {
          localStorage.removeItem(
            draftKey
          );
        } catch {
          // Ignore.
        }


        window.location.href =
          `/admin/patchnotes/${created.id}/edit`;
      }
    } catch (
      saveError
    ) {
      console.error(
        saveError
      );


      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save patchnote."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  const completedBlocks =
    useMemo(
      () =>
        form.blocks.filter(
          blockReady
        ).length,

      [
        form.blocks,
      ]
    );


  if (
    loading
  ) {
    return (
      <div className="patchEditorLoading">
        Loading Patchnotes Editor 3.0...
      </div>
    );
  }


  return (
    <>
      <div className="patchEditorPage">
        <header className="patchEditorHeader">
          <div className="headerMain">
            <Link
              href="/admin/patchnotes"
              className="backLink"
            >
              ← Patchnotes
            </Link>


            <div className="editorEyebrow">
              AUROS PATCHNOTES EDITOR 3.0
            </div>


            <h1>
              {patchnoteId
                ? "Edit Patchnote"
                : "Create Patchnote"}
            </h1>


            <p>
              Build, organize and safely edit complete Auros
              patchnotes with reusable content blocks and
              automatic local draft recovery.
            </p>
          </div>


          <div className="headerRight">
            <div className="historyToolbar">
              <button
                type="button"
                disabled={
                  !canUndo
                }
                title="Undo · Ctrl/Cmd + Z"
                onClick={
                  undo
                }
              >
                ↶
                <span>
                  Undo
                </span>
              </button>


              <button
                type="button"
                disabled={
                  !canRedo
                }
                title="Redo · Ctrl/Cmd + Shift + Z"
                onClick={
                  redo
                }
              >
                ↷
                <span>
                  Redo
                </span>
              </button>
            </div>


            <div className="headerActions">
              <div
                className={
                  isDirty
                    ? "saveState dirty"
                    : "saveState saved"
                }
              >
                <span />

                {isDirty
                  ? "Unsaved Changes"
                  : "Saved"}
              </div>


              <div
                className={
                  form.published
                    ? "publishStatus published"
                    : "publishStatus draft"
                }
              >
                <span />

                {form.published
                  ? "Published"
                  : "Draft"}
              </div>


              <button
                type="button"
                className="saveButton"
                disabled={
                  saving
                }
                onClick={
                  save
                }
              >
                {saving
                  ? "Saving..."
                  : patchnoteId
                  ? "Save Changes"
                  : "Create Patchnote"}
              </button>
            </div>
          </div>
        </header>


        {draftCandidate ? (
          <section className="draftRecovery">
            <div className="draftRecoveryIcon">
              ↻
            </div>


            <div>
              <strong>
                Unsaved local draft found
              </strong>

              <p>
                A newer version of this patchnote was saved
                locally at{" "}
                {formatDraftTime(
                  draftCandidate.savedAt
                ) ?? "an earlier time"}.
              </p>
            </div>


            <div className="draftRecoveryActions">
              <button
                type="button"
                className="secondaryButton"
                onClick={
                  discardDraft
                }
              >
                Discard Draft
              </button>


              <button
                type="button"
                className="restoreDraftButton"
                onClick={
                  restoreDraft
                }
              >
                Restore Draft
              </button>
            </div>
          </section>
        ) : null}


        {error ? (
          <div className="editorMessage error">
            {
              error
            }
          </div>
        ) : null}


        {success ? (
          <div className="editorMessage success">
            {
              success
            }
          </div>
        ) : null}


        <div className="editorLayout">
          <main className="editorContent">
            <EditorPanel
              number="01"
              title="Patchnote Details"
              description="General information shown across the Auros website."
            >
              <div className="detailsGrid">
                <EditorField
                  label="Version"
                  hint="Example: 1.2.0"
                >
                  <input
                    value={
                      form.version
                    }
                    placeholder="1.2.0"
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "version",
                        event.target.value
                      )
                    }
                  />
                </EditorField>


                <EditorField
                  label="Title"
                  hint="Main update name"
                >
                  <input
                    value={
                      form.title
                    }
                    placeholder="Community Update"
                    onChange={(
                      event
                    ) =>
                      changeTitle(
                        event.target.value
                      )
                    }
                  />
                </EditorField>


                <EditorField
                  label="Slug"
                  hint="Public URL"
                  wide
                >
                  <div className="slugInput">
                    <span>
                      /patchnotes/
                    </span>


                    <input
                      value={
                        form.slug
                      }
                      placeholder="community-update"
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "slug",
                          makeSlug(
                            event.target.value
                          )
                        )
                      }
                    />
                  </div>
                </EditorField>


                <EditorField
                  label="Summary"
                  hint="Shown below the title and on patchnote cards"
                  wide
                >
                  <textarea
                    rows={
                      5
                    }
                    maxLength={
                      400
                    }
                    value={
                      form.summary
                    }
                    placeholder="Describe the most important parts of this update..."
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "summary",
                        event.target.value
                      )
                    }
                  />


                  <div className="characterCount">
                    {
                      form.summary.length
                    }
                    /400
                  </div>
                </EditorField>
              </div>
            </EditorPanel>


            <EditorPanel
              number="02"
              title="Cover Artwork"
              description="Main image used on cards and at the top of the article."
            >
              {form.cover_url ? (
                <div className="coverEditor">
                  <div className="coverImage">
                    <img
                      src={
                        form.cover_url
                      }
                      alt="Patchnote cover"
                    />


                    <div className="coverOverlay">
                      PATCHNOTE COVER
                    </div>
                  </div>


                  <div className="coverControls">
                    <label className="secondaryButton fileButton">
                      Replace Cover

                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(
                          event
                        ) =>
                          uploadCover(
                            event.target.files?.[
                              0
                            ]
                          )
                        }
                      />
                    </label>


                    <button
                      type="button"
                      className="dangerButton"
                      onClick={() =>
                        updateForm(
                          "cover_url",
                          ""
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="uploadZone coverUpload">
                  <div className="uploadIcon">
                    ↑
                  </div>


                  <strong>
                    {uploadingCover
                      ? "Uploading cover..."
                      : "Upload Cover Artwork"}
                  </strong>


                  <p>
                    PNG, JPG or WEBP · Maximum 15 MB
                  </p>


                  <span>
                    Recommended: 1920 × 1080
                  </span>


                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    disabled={
                      uploadingCover
                    }
                    onChange={(
                      event
                    ) =>
                      uploadCover(
                        event.target.files?.[
                          0
                        ]
                      )
                    }
                  />
                </label>
              )}
            </EditorPanel>


            <EditorPanel
              number="03"
              title="Content Builder 3.0"
              description="Create, reorder and organize every part of the patchnote."
              right={
                <div className="blockCounter">
                  {
                    completedBlocks
                  }
                  /
                  {
                    form.blocks.length
                  }
                  {" "}
                  READY
                </div>
              }
            >
              <div className="builderTools">
                <div className="builderToolGroup">
                  <span>
                    BLOCK LIBRARY
                  </span>

                  <div className="blockLibrary">
                    <BlockLibraryButton
                      icon="H"
                      title="Heading"
                      description="Section title"
                      onClick={() =>
                        addBlock(
                          "heading"
                        )
                      }
                    />


                    <BlockLibraryButton
                      icon="T"
                      title="Text"
                      description="Paragraph"
                      onClick={() =>
                        addBlock(
                          "text"
                        )
                      }
                    />


                    <BlockLibraryButton
                      icon="▧"
                      title="Image"
                      description="Full width media"
                      onClick={() =>
                        addBlock(
                          "image"
                        )
                      }
                    />


                    <BlockLibraryButton
                      icon="◫"
                      title="Split Layout"
                      description="Image + text"
                      onClick={() =>
                        addBlock(
                          "split"
                        )
                      }
                    />


                    <BlockLibraryButton
                      icon="!"
                      title="Highlight"
                      description="Important information"
                      onClick={() =>
                        addBlock(
                          "highlight"
                        )
                      }
                    />


                    <BlockLibraryButton
                      icon="▦"
                      title="Gallery"
                      description="Multiple images"
                      onClick={() =>
                        addBlock(
                          "gallery"
                        )
                      }
                    />


                    <BlockLibraryButton
                      icon="—"
                      title="Divider"
                      description="Section separator"
                      onClick={() =>
                        addBlock(
                          "divider"
                        )
                      }
                    />


                    <BlockLibraryButton
                      icon="↕"
                      title="Spacer"
                      description="Vertical spacing"
                      onClick={() =>
                        addBlock(
                          "spacer"
                        )
                      }
                    />
                  </div>
                </div>


                <div className="builderToolGroup">
                  <span>
                    BLOCK TEMPLATES
                  </span>

                  <div className="templateLibrary">
                    <TemplateButton
                      title="Simple Section"
                      description="Heading + text"
                      icon="01"
                      onClick={() =>
                        addTemplate(
                          "simple-section"
                        )
                      }
                    />


                    <TemplateButton
                      title="Feature Spotlight"
                      description="Heading + split + highlight"
                      icon="02"
                      onClick={() =>
                        addTemplate(
                          "feature-spotlight"
                        )
                      }
                    />


                    <TemplateButton
                      title="Media Showcase"
                      description="Heading + text + gallery"
                      icon="03"
                      onClick={() =>
                        addTemplate(
                          "media-showcase"
                        )
                      }
                    />


                    <TemplateButton
                      title="Release Section"
                      description="Divider + highlight + spacing"
                      icon="04"
                      onClick={() =>
                        addTemplate(
                          "release-section"
                        )
                      }
                    />
                  </div>
                </div>


                {form.blocks.length >
                0 ? (
                  <div className="builderUtilityBar">
                    <div>
                      <strong>
                        {
                          form.blocks.length
                        }
                        {" "}
                        Blocks
                      </strong>

                      <span>
                        Drag between sections or use ↑ ↓ as fallback.
                      </span>
                    </div>


                    <div>
                      <button
                        type="button"
                        onClick={
                          collapseAllBlocks
                        }
                      >
                        Collapse All
                      </button>

                      <button
                        type="button"
                        onClick={
                          expandAllBlocks
                        }
                      >
                        Expand All
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>


              {form.blocks.length ===
              0 ? (
                <div className="emptyBuilder">
                  <div className="emptyBuilderIcon">
                    +
                  </div>


                  <h3>
                    Start building your patchnote
                  </h3>


                  <p>
                    Choose a block or use one of the ready-made
                    templates above.
                  </p>
                </div>
              ) : (
                <div className="blocks">
                  <BlockDropZone
                    index={
                      0
                    }
                    active={
                      dragOverIndex ===
                      0
                    }
                    menuOpen={
                      insertMenuIndex ===
                      0
                    }
                    onDragOver={
                      handleDropZoneDragOver
                    }
                    onDrop={
                      handleDropAtIndex
                    }
                    onToggleMenu={() =>
                      setInsertMenuIndex(
                        insertMenuIndex ===
                        0
                          ? null
                          : 0
                      )
                    }
                    onInsertBlock={
                      insertBlockAt
                    }
                    onInsertTemplate={
                      insertTemplateAt
                    }
                  />


                  {form.blocks.map(
                    (
                      block,
                      index
                    ) => {
                      const [
                        blockTitle,
                        blockDescription,
                        blockIcon,
                      ] =
                        blockName(
                          block
                        );


                      const collapsed =
                        collapsedBlockIds.includes(
                          block.id
                        );


                      return (
                        <div
                          key={
                            block.id
                          }
                          className="blockWrapper"
                        >
                          <article
                            className={`contentBlock block-${block.type}${
                              draggedBlockId ===
                              block.id
                                ? " dragging"
                                : ""
                            }${
                              collapsed
                                ? " collapsed"
                                : ""
                            }`}
                          >
                            <header className="blockHeader">
                              <div className="blockIdentity">
                                <span
                                  className="dragHandle"
                                  title="Drag to reorder"
                                  draggable
                                  onDragStart={(
                                    event
                                  ) =>
                                    handleBlockDragStart(
                                      event,
                                      block.id
                                    )
                                  }
                                  onDragEnd={
                                    handleBlockDragEnd
                                  }
                                >
                                  ⋮⋮
                                </span>


                                <span className="blockNumber">
                                  {String(
                                    index +
                                      1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                                </span>


                                <span className="blockTypeIcon">
                                  {
                                    blockIcon
                                  }
                                </span>


                                <div className="blockTitleArea">
                                  <strong>
                                    {
                                      blockTitle
                                    }
                                  </strong>


                                  <small>
                                    {
                                      blockDescription
                                    }
                                  </small>
                                </div>


                                <span
                                  className={
                                    blockReady(
                                      block
                                    )
                                      ? "readyBadge ready"
                                      : "readyBadge"
                                  }
                                >
                                  {blockReady(
                                    block
                                  )
                                    ? "READY"
                                    : "INCOMPLETE"}
                                </span>
                              </div>


                              <div className="blockActions">
                                <button
                                  title={
                                    collapsed
                                      ? "Expand block"
                                      : "Collapse block"
                                  }
                                  type="button"
                                  className="collapseButton"
                                  onClick={() =>
                                    toggleBlockCollapse(
                                      block.id
                                    )
                                  }
                                >
                                  {collapsed
                                    ? "▸"
                                    : "▾"}
                                </button>


                                <button
                                  title="Move up"
                                  type="button"
                                  disabled={
                                    index ===
                                    0
                                  }
                                  onClick={() =>
                                    moveBlock(
                                      index,
                                      -1
                                    )
                                  }
                                >
                                  ↑
                                </button>


                                <button
                                  title="Move down"
                                  type="button"
                                  disabled={
                                    index ===
                                    form.blocks.length -
                                      1
                                  }
                                  onClick={() =>
                                    moveBlock(
                                      index,
                                      1
                                    )
                                  }
                                >
                                  ↓
                                </button>


                                <button
                                  title="Duplicate"
                                  type="button"
                                  onClick={() =>
                                    duplicateBlock(
                                      index
                                    )
                                  }
                                >
                                  ⧉
                                </button>


                                <button
                                  title="Delete"
                                  type="button"
                                  className="deleteBlock"
                                  onClick={() =>
                                    removeBlock(
                                      block.id
                                    )
                                  }
                                >
                                  ×
                                </button>
                              </div>
                            </header>


                            {!collapsed ? (
                              <div className="blockContent">
                                <BlockEditor
                                  block={
                                    block
                                  }
                                  uploadingBlockId={
                                    uploadingBlockId
                                  }
                                  uploadingGalleryImageId={
                                    uploadingGalleryImageId
                                  }
                                  onUpdate={(
                                    updater
                                  ) =>
                                    updateBlock(
                                      block.id,
                                      updater
                                    )
                                  }
                                  onBlockImageUpload={(
                                    file
                                  ) =>
                                    uploadBlockImage(
                                      block.id,
                                      file
                                    )
                                  }
                                  onAddGalleryImage={() =>
                                    addGalleryImage(
                                      block.id
                                    )
                                  }
                                  onUpdateGalleryImage={(
                                    imageId,
                                    patch
                                  ) =>
                                    updateGalleryImage(
                                      block.id,
                                      imageId,
                                      patch
                                    )
                                  }
                                  onRemoveGalleryImage={(
                                    imageId
                                  ) =>
                                    removeGalleryImage(
                                      block.id,
                                      imageId
                                    )
                                  }
                                  onUploadGalleryImage={(
                                    imageId,
                                    file
                                  ) =>
                                    uploadGalleryImage(
                                      block.id,
                                      imageId,
                                      file
                                    )
                                  }
                                />
                              </div>
                            ) : (
                              <div className="collapsedBlockSummary">
                                <span>
                                  Block collapsed
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleBlockCollapse(
                                      block.id
                                    )
                                  }
                                >
                                  Open
                                </button>
                              </div>
                            )}
                          </article>


                          <BlockDropZone
                            index={
                              index +
                              1
                            }
                            active={
                              dragOverIndex ===
                              index +
                                1
                            }
                            menuOpen={
                              insertMenuIndex ===
                              index +
                                1
                            }
                            onDragOver={
                              handleDropZoneDragOver
                            }
                            onDrop={
                              handleDropAtIndex
                            }
                            onToggleMenu={() =>
                              setInsertMenuIndex(
                                insertMenuIndex ===
                                index +
                                  1
                                  ? null
                                  : index +
                                    1
                              )
                            }
                            onInsertBlock={
                              insertBlockAt
                            }
                            onInsertTemplate={
                              insertTemplateAt
                            }
                          />
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </EditorPanel>
          </main>


          <aside className="editorSidebar">
            <div className="sidebarSticky">
              <section className="sidebarPanel">
                <div className="sidebarTitle">
                  <span>
                    PUBLICATION
                  </span>

                  <strong>
                    Publishing
                  </strong>
                </div>


                <div className="publishControl">
                  <div>
                    <strong>
                      Public Patchnote
                    </strong>

                    <small>
                      Visible on the public website
                    </small>
                  </div>


                  <button
                    type="button"
                    className={
                      form.published
                        ? "toggle active"
                        : "toggle"
                    }
                    onClick={() =>
                      updateForm(
                        "published",
                        !form.published
                      )
                    }
                  >
                    <span />
                  </button>
                </div>


                <div className="publishInfo">
                  <span>
                    Version
                  </span>

                  <strong>
                    {form.version ||
                      "—"}
                  </strong>
                </div>


                <div className="publishInfo">
                  <span>
                    Blocks
                  </span>

                  <strong>
                    {
                      form.blocks.length
                    }
                  </strong>
                </div>


                <div className="publishInfo">
                  <span>
                    Ready Blocks
                  </span>

                  <strong>
                    {
                      completedBlocks
                    }
                  </strong>
                </div>


                <div className="publishInfo">
                  <span>
                    Editor State
                  </span>

                  <strong
                    className={
                      isDirty
                        ? "sidebarDirty"
                        : "sidebarSaved"
                    }
                  >
                    {isDirty
                      ? "Unsaved"
                      : "Saved"}
                  </strong>
                </div>


                <div className="publishInfo">
                  <span>
                    Local Draft
                  </span>

                  <strong>
                    {lastDraftSavedAt
                      ? `Saved ${formatDraftTime(
                          lastDraftSavedAt
                        )}`
                      : isDirty
                      ? "Waiting..."
                      : "Clean"}
                  </strong>
                </div>


                <div className="sidebarHistory">
                  <button
                    type="button"
                    disabled={
                      !canUndo
                    }
                    onClick={
                      undo
                    }
                  >
                    ↶ Undo
                  </button>


                  <button
                    type="button"
                    disabled={
                      !canRedo
                    }
                    onClick={
                      redo
                    }
                  >
                    ↷ Redo
                  </button>
                </div>


                <button
                  type="button"
                  className="sidebarSaveButton"
                  disabled={
                    saving
                  }
                  onClick={
                    save
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save Patchnote"}
                </button>
              </section>


              <section className="previewPanel">
                <div className="previewToolbar">
                  <div>
                    <span>
                      LIVE PREVIEW
                    </span>

                    <strong>
                      Article Preview
                    </strong>
                  </div>


                  <div className="previewMode">
                    <button
                      type="button"
                      className={
                        previewMode ===
                        "desktop"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setPreviewMode(
                          "desktop"
                        )
                      }
                    >
                      Desktop
                    </button>


                    <button
                      type="button"
                      className={
                        previewMode ===
                        "mobile"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setPreviewMode(
                          "mobile"
                        )
                      }
                    >
                      Mobile
                    </button>


                    <button
                      type="button"
                      className={
                        previewMode ===
                        "card"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setPreviewMode(
                          "card"
                        )
                      }
                    >
                      Card
                    </button>
                  </div>
                </div>


                {previewMode ===
                "card" ? (
                  <PatchnoteCardPreview
                    form={
                      form
                    }
                  />
                ) : (
                  <div
                    className={
                      previewMode ===
                      "mobile"
                        ? "previewDevice mobile"
                        : "previewDevice desktop"
                    }
                  >
                    <div className="articlePreview">
                      {form.cover_url ? (
                        <img
                          className="previewCover"
                          src={
                            form.cover_url
                          }
                          alt=""
                        />
                      ) : (
                        <div className="previewCoverPlaceholder">
                          COVER
                        </div>
                      )}


                      <div className="articlePreviewContent">
                        <span className="previewVersion">
                          VERSION
                          {" "}
                          {
                            form.version ||
                            "0.0.0"
                          }
                        </span>


                        <h2>
                          {form.title ||
                            "Patchnote Title"}
                        </h2>


                        {form.summary ? (
                          <p className="previewSummary">
                            {
                              form.summary
                            }
                          </p>
                        ) : null}


                        <PatchnoteContentRenderer
                          blocks={
                            form.blocks as ContentBlock[]
                          }
                          compact
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>


              <section className="keyboardPanel">
                <span>
                  EDITOR SHORTCUTS
                </span>


                <div>
                  <strong>
                    Undo
                  </strong>

                  <kbd>
                    Ctrl
                  </kbd>
                  <span>
                    +
                  </span>
                  <kbd>
                    Z
                  </kbd>
                </div>


                <div>
                  <strong>
                    Redo
                  </strong>

                  <kbd>
                    Ctrl
                  </kbd>
                  <span>
                    +
                  </span>
                  <kbd>
                    Shift
                  </kbd>
                  <span>
                    +
                  </span>
                  <kbd>
                    Z
                  </kbd>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>


      <EditorStyles />
    </>
  );
}


/* =========================================================
   INSERT / DROP ZONE
   ========================================================= */

function BlockDropZone({
  index,

  active,

  menuOpen,

  onDragOver,

  onDrop,

  onToggleMenu,

  onInsertBlock,

  onInsertTemplate,
}: {
  index:
    number;

  active:
    boolean;

  menuOpen:
    boolean;

  onDragOver:
    (
      event:
        DragEvent<HTMLDivElement>,
      index:
        number
    ) =>
      void;

  onDrop:
    (
      event:
        DragEvent<HTMLDivElement>,
      index:
        number
    ) =>
      void;

  onToggleMenu:
    () =>
      void;

  onInsertBlock:
    (
      index:
        number,
      type:
        PatchnoteContentBlock["type"]
    ) =>
      void;

  onInsertTemplate:
    (
      index:
        number,
      template:
        BlockTemplateType
    ) =>
      void;
}) {
  return (
    <div
      className={
        active
          ? "blockDropZone active"
          : menuOpen
          ? "blockDropZone menuOpen"
          : "blockDropZone"
      }
      onDragOver={(
        event
      ) =>
        onDragOver(
          event,
          index
        )
      }
      onDrop={(
        event
      ) =>
        onDrop(
          event,
          index
        )
      }
    >
      <div className="dropZoneLine" />


      <button
        type="button"
        className="insertButton"
        title="Insert block here"
        onClick={
          onToggleMenu
        }
      >
        +
      </button>


      {menuOpen ? (
        <div className="insertMenu">
          <div className="insertMenuHeader">
            <strong>
              Insert here
            </strong>

            <span>
              Position
              {" "}
              {index +
                1}
            </span>
          </div>


          <div className="insertMenuSection">
            <span>
              BLOCK
            </span>


            <div className="insertMenuGrid">
              <InsertMenuButton
                icon="H"
                title="Heading"
                onClick={() =>
                  onInsertBlock(
                    index,
                    "heading"
                  )
                }
              />

              <InsertMenuButton
                icon="T"
                title="Text"
                onClick={() =>
                  onInsertBlock(
                    index,
                    "text"
                  )
                }
              />

              <InsertMenuButton
                icon="▧"
                title="Image"
                onClick={() =>
                  onInsertBlock(
                    index,
                    "image"
                  )
                }
              />

              <InsertMenuButton
                icon="◫"
                title="Split"
                onClick={() =>
                  onInsertBlock(
                    index,
                    "split"
                  )
                }
              />

              <InsertMenuButton
                icon="!"
                title="Highlight"
                onClick={() =>
                  onInsertBlock(
                    index,
                    "highlight"
                  )
                }
              />

              <InsertMenuButton
                icon="▦"
                title="Gallery"
                onClick={() =>
                  onInsertBlock(
                    index,
                    "gallery"
                  )
                }
              />

              <InsertMenuButton
                icon="—"
                title="Divider"
                onClick={() =>
                  onInsertBlock(
                    index,
                    "divider"
                  )
                }
              />

              <InsertMenuButton
                icon="↕"
                title="Spacer"
                onClick={() =>
                  onInsertBlock(
                    index,
                    "spacer"
                  )
                }
              />
            </div>
          </div>


          <div className="insertMenuSection">
            <span>
              TEMPLATE
            </span>


            <div className="insertTemplateGrid">
              <button
                type="button"
                onClick={() =>
                  onInsertTemplate(
                    index,
                    "simple-section"
                  )
                }
              >
                Simple Section
              </button>

              <button
                type="button"
                onClick={() =>
                  onInsertTemplate(
                    index,
                    "feature-spotlight"
                  )
                }
              >
                Feature Spotlight
              </button>

              <button
                type="button"
                onClick={() =>
                  onInsertTemplate(
                    index,
                    "media-showcase"
                  )
                }
              >
                Media Showcase
              </button>

              <button
                type="button"
                onClick={() =>
                  onInsertTemplate(
                    index,
                    "release-section"
                  )
                }
              >
                Release Section
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


function InsertMenuButton({
  icon,

  title,

  onClick,
}: {
  icon:
    string;

  title:
    string;

  onClick:
    () =>
      void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
    >
      <span>
        {
          icon
        }
      </span>

      <strong>
        {
          title
        }
      </strong>
    </button>
  );
}


/* =========================================================
   BLOCK EDITOR
   ========================================================= */

function BlockEditor({
  block,

  uploadingBlockId,

  uploadingGalleryImageId,

  onUpdate,

  onBlockImageUpload,

  onAddGalleryImage,

  onUpdateGalleryImage,

  onRemoveGalleryImage,

  onUploadGalleryImage,
}: {
  block:
    PatchnoteContentBlock;

  uploadingBlockId:
    string | null;

  uploadingGalleryImageId:
    string | null;

  onUpdate:
    (
      updater:
        (
          current:
            PatchnoteContentBlock
        ) =>
          PatchnoteContentBlock
    ) =>
      void;

  onBlockImageUpload:
    (
      file?:
        File
    ) =>
      void;

  onAddGalleryImage:
    () =>
      void;

  onUpdateGalleryImage:
    (
      imageId:
        string,

      patch:
        Partial<PatchnoteGalleryImage>
    ) =>
      void;

  onRemoveGalleryImage:
    (
      imageId:
        string
    ) =>
      void;

  onUploadGalleryImage:
    (
      imageId:
        string,

      file?:
        File
    ) =>
      void;
}) {
  if (
    block.type ===
    "heading"
  ) {
    return (
      <input
        className="headingInput"
        value={
          block.text
        }
        placeholder="Section heading..."
        onChange={(
          event
        ) =>
          onUpdate(
            (
              current
            ) =>
              current.type ===
              "heading"
                ? {
                    ...current,
                    text:
                      event.target.value,
                  }
                : current
          )
        }
      />
    );
  }


  if (
    block.type ===
    "text"
  ) {
    return (
      <textarea
        rows={
          9
        }
        value={
          block.text
        }
        placeholder="Write your patchnote content..."
        onChange={(
          event
        ) =>
          onUpdate(
            (
              current
            ) =>
              current.type ===
              "text"
                ? {
                    ...current,
                    text:
                      event.target.value,
                  }
                : current
          )
        }
      />
    );
  }


  if (
    block.type ===
    "image"
  ) {
    return (
      <ImageBlockEditor
        block={
          block
        }
        uploading={
          uploadingBlockId ===
          block.id
        }
        onUpload={
          onBlockImageUpload
        }
        onChange={(
          patch
        ) =>
          onUpdate(
            (
              current
            ) =>
              current.type ===
              "image"
                ? {
                    ...current,
                    ...patch,
                  }
                : current
          )
        }
      />
    );
  }


  if (
    block.type ===
    "split"
  ) {
    return (
      <SplitBlockEditor
        block={
          block
        }
        uploading={
          uploadingBlockId ===
          block.id
        }
        onUpload={
          onBlockImageUpload
        }
        onChange={(
          patch
        ) =>
          onUpdate(
            (
              current
            ) =>
              current.type ===
              "split"
                ? {
                    ...current,
                    ...patch,
                  }
                : current
          )
        }
      />
    );
  }


  if (
    block.type ===
    "highlight"
  ) {
    return (
      <HighlightBlockEditor
        block={
          block
        }
        onChange={(
          patch
        ) =>
          onUpdate(
            (
              current
            ) =>
              current.type ===
              "highlight"
                ? {
                    ...current,
                    ...patch,
                  }
                : current
          )
        }
      />
    );
  }


  if (
    block.type ===
    "gallery"
  ) {
    return (
      <GalleryBlockEditor
        block={
          block
        }
        uploadingGalleryImageId={
          uploadingGalleryImageId
        }
        onChange={(
          patch
        ) =>
          onUpdate(
            (
              current
            ) =>
              current.type ===
              "gallery"
                ? {
                    ...current,
                    ...patch,
                  }
                : current
          )
        }
        onAddImage={
          onAddGalleryImage
        }
        onUpdateImage={
          onUpdateGalleryImage
        }
        onRemoveImage={
          onRemoveGalleryImage
        }
        onUploadImage={
          onUploadGalleryImage
        }
      />
    );
  }


  if (
    block.type ===
    "divider"
  ) {
    return (
      <div className="dividerEditorPreview">
        <span />

        <small>
          Divider will create a visual separation between sections.
        </small>
      </div>
    );
  }


  return (
    <SpacerBlockEditor
      size={
        block.size
      }
      onChange={(
        size
      ) =>
        onUpdate(
          (
            current
          ) =>
            current.type ===
            "spacer"
              ? {
                  ...current,
                  size,
                }
              : current
        )
      }
    />
  );
}


/* =========================================================
   IMAGE
   ========================================================= */

function ImageBlockEditor({
  block,

  uploading,

  onUpload,

  onChange,
}: {
  block:
    Extract<
      PatchnoteContentBlock,
      {
        type:
          "image";
      }
    >;

  uploading:
    boolean;

  onUpload:
    (
      file?:
        File
    ) =>
      void;

  onChange:
    (
      patch:
        Partial<
          Extract<
            PatchnoteContentBlock,
            {
              type:
                "image";
            }
          >
        >
    ) =>
      void;
}) {
  return (
    <div className="imageEditor">
      {block.url ? (
        <>
          <div className="blockImagePreview">
            <img
              src={
                block.url
              }
              alt={
                block.alt ||
                ""
              }
            />
          </div>


          <div className="imageActions">
            <label className="secondaryButton fileButton">
              Replace Image

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(
                  event
                ) =>
                  onUpload(
                    event.target.files?.[
                      0
                    ]
                  )
                }
              />
            </label>


            <button
              type="button"
              className="dangerButton"
              onClick={() =>
                onChange({
                  url:
                    "",
                })
              }
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <label className="uploadZone imageUpload">
          <div className="uploadIcon">
            ↑
          </div>


          <strong>
            {uploading
              ? "Uploading..."
              : "Upload Image"}
          </strong>


          <span>
            Screenshot, artwork or promotional image
          </span>


          <input
            hidden
            type="file"
            accept="image/*"
            disabled={
              uploading
            }
            onChange={(
              event
            ) =>
              onUpload(
                event.target.files?.[
                  0
                ]
              )
            }
          />
        </label>
      )}


      <div className="imageMetaGrid">
        <EditorField
          label="Alt Text"
          hint="Accessibility"
        >
          <input
            value={
              block.alt ??
              ""
            }
            placeholder="Describe the image..."
            onChange={(
              event
            ) =>
              onChange({
                alt:
                  event.target.value,
              })
            }
          />
        </EditorField>


        <EditorField
          label="Caption"
          hint="Optional"
        >
          <input
            value={
              block.caption ??
              ""
            }
            placeholder="Image caption..."
            onChange={(
              event
            ) =>
              onChange({
                caption:
                  event.target.value,
              })
            }
          />
        </EditorField>
      </div>
    </div>
  );
}


/* =========================================================
   SPLIT
   ========================================================= */

function SplitBlockEditor({
  block,

  uploading,

  onUpload,

  onChange,
}: {
  block:
    PatchnoteSplitBlock;

  uploading:
    boolean;

  onUpload:
    (
      file?:
        File
    ) =>
      void;

  onChange:
    (
      patch:
        Partial<PatchnoteSplitBlock>
    ) =>
      void;
}) {
  const ratios:
    PatchnoteSplitRatio[] =
      [
        "30-70",
        "40-60",
        "50-50",
        "60-40",
        "70-30",
      ];


  return (
    <div className="splitEditor">
      <div className="splitControls">
        <EditorField
          label="Layout Ratio"
          hint="Column width"
        >
          <select
            value={
              block.ratio
            }
            onChange={(
              event
            ) =>
              onChange({
                ratio:
                  event.target.value as PatchnoteSplitRatio,
              })
            }
          >
            {ratios.map(
              (
                ratio
              ) => (
                <option
                  key={
                    ratio
                  }
                  value={
                    ratio
                  }
                >
                  {
                    ratio.replace(
                      "-",
                      " / "
                    )
                  }
                </option>
              )
            )}
          </select>
        </EditorField>


        <EditorField
          label="Image Position"
          hint="Desktop"
        >
          <div className="segmentedControl">
            <button
              type="button"
              className={
                block.imagePosition ===
                "left"
                  ? "active"
                  : ""
              }
              onClick={() =>
                onChange({
                  imagePosition:
                    "left",
                })
              }
            >
              Image Left
            </button>


            <button
              type="button"
              className={
                block.imagePosition ===
                "right"
                  ? "active"
                  : ""
              }
              onClick={() =>
                onChange({
                  imagePosition:
                    "right",
                })
              }
            >
              Image Right
            </button>
          </div>
        </EditorField>
      </div>


      <div className="splitEditorGrid">
        <div className="splitImageEditor">
          {block.imageUrl ? (
            <>
              <div className="blockImagePreview">
                <img
                  src={
                    block.imageUrl
                  }
                  alt={
                    block.imageAlt ||
                    ""
                  }
                />
              </div>


              <div className="imageActions">
                <label className="secondaryButton fileButton">
                  Replace Image

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(
                      event
                    ) =>
                      onUpload(
                        event.target.files?.[
                          0
                        ]
                      )
                    }
                  />
                </label>


                <button
                  type="button"
                  className="dangerButton"
                  onClick={() =>
                    onChange({
                      imageUrl:
                        "",
                    })
                  }
                >
                  Remove
                </button>
              </div>
            </>
          ) : (
            <label className="uploadZone splitUpload">
              <div className="uploadIcon">
                ↑
              </div>


              <strong>
                {uploading
                  ? "Uploading..."
                  : "Upload Split Image"}
              </strong>


              <span>
                Recommended landscape image
              </span>


              <input
                hidden
                type="file"
                accept="image/*"
                disabled={
                  uploading
                }
                onChange={(
                  event
                ) =>
                  onUpload(
                    event.target.files?.[
                      0
                    ]
                  )
                }
              />
            </label>
          )}


          <EditorField
            label="Image Alt"
            hint="Accessibility"
          >
            <input
              value={
                block.imageAlt ??
                ""
              }
              placeholder="Describe the image..."
              onChange={(
                event
              ) =>
                onChange({
                  imageAlt:
                    event.target.value,
                })
              }
            />
          </EditorField>


          <EditorField
            label="Image Caption"
            hint="Optional"
          >
            <input
              value={
                block.imageCaption ??
                ""
              }
              placeholder="Caption..."
              onChange={(
                event
              ) =>
                onChange({
                  imageCaption:
                    event.target.value,
                })
              }
            />
          </EditorField>
        </div>


        <div className="splitTextEditor">
          <EditorField
            label="Heading"
            hint="Optional"
          >
            <input
              value={
                block.heading
              }
              placeholder="Feature heading..."
              onChange={(
                event
              ) =>
                onChange({
                  heading:
                    event.target.value,
                })
              }
            />
          </EditorField>


          <EditorField
            label="Text"
            hint="Split content"
          >
            <textarea
              rows={
                11
              }
              value={
                block.text
              }
              placeholder="Explain this feature or update..."
              onChange={(
                event
              ) =>
                onChange({
                  text:
                    event.target.value,
                })
              }
            />
          </EditorField>
        </div>
      </div>


      <div className="splitMobileNotice">
        <strong>
          MOBILE BEHAVIOUR
        </strong>

        <span>
          On mobile the image automatically moves above the text.
        </span>
      </div>
    </div>
  );
}


/* =========================================================
   HIGHLIGHT
   ========================================================= */

function HighlightBlockEditor({
  block,

  onChange,
}: {
  block:
    PatchnoteHighlightBlock;

  onChange:
    (
      patch:
        Partial<PatchnoteHighlightBlock>
    ) =>
      void;
}) {
  return (
    <div className="highlightEditor">
      <div className="highlightTopRow">
        <EditorField
          label="Label"
          hint="Optional"
        >
          <input
            value={
              block.eyebrow ??
              ""
            }
            placeholder="HIGHLIGHT"
            onChange={(
              event
            ) =>
              onChange({
                eyebrow:
                  event.target.value,
              })
            }
          />
        </EditorField>


        <EditorField
          label="Tone"
          hint="Highlight color"
        >
          <select
            value={
              block.tone ??
              "cyan"
            }
            onChange={(
              event
            ) =>
              onChange({
                tone:
                  event.target.value as PatchnoteHighlightBlock["tone"],
              })
            }
          >
            <option value="cyan">
              Cyan
            </option>

            <option value="purple">
              Purple
            </option>

            <option value="green">
              Green
            </option>

            <option value="amber">
              Amber
            </option>
          </select>
        </EditorField>
      </div>


      <EditorField
        label="Heading"
        hint="Highlight title"
      >
        <input
          value={
            block.heading
          }
          placeholder="Important Change"
          onChange={(
            event
          ) =>
            onChange({
              heading:
                event.target.value,
            })
          }
        />
      </EditorField>


      <EditorField
        label="Text"
        hint="Highlighted information"
      >
        <textarea
          rows={
            6
          }
          value={
            block.text
          }
          placeholder="Explain the highlighted information..."
          onChange={(
            event
          ) =>
            onChange({
              text:
                event.target.value,
            })
          }
        />
      </EditorField>
    </div>
  );
}


/* =========================================================
   GALLERY
   ========================================================= */

function GalleryBlockEditor({
  block,

  uploadingGalleryImageId,

  onChange,

  onAddImage,

  onUpdateImage,

  onRemoveImage,

  onUploadImage,
}: {
  block:
    PatchnoteGalleryBlock;

  uploadingGalleryImageId:
    string | null;

  onChange:
    (
      patch:
        Partial<PatchnoteGalleryBlock>
    ) =>
      void;

  onAddImage:
    () =>
      void;

  onUpdateImage:
    (
      imageId:
        string,

      patch:
        Partial<PatchnoteGalleryImage>
    ) =>
      void;

  onRemoveImage:
    (
      imageId:
        string
    ) =>
      void;

  onUploadImage:
    (
      imageId:
        string,

      file?:
        File
    ) =>
      void;
}) {
  return (
    <div className="galleryEditor">
      <div className="galleryEditorTop">
        <EditorField
          label="Columns"
          hint="Desktop layout"
        >
          <select
            value={
              block.columns ??
              2
            }
            onChange={(
              event
            ) =>
              onChange({
                columns:
                  Number(
                    event.target.value
                  ) as
                    | 2
                    | 3,
              })
            }
          >
            <option value="2">
              2 Columns
            </option>

            <option value="3">
              3 Columns
            </option>
          </select>
        </EditorField>


        <button
          type="button"
          className="secondaryButton galleryAddButton"
          onClick={
            onAddImage
          }
        >
          + Add Image
        </button>
      </div>


      {block.images.length ===
      0 ? (
        <div className="galleryEmpty">
          Add images to start the gallery.
        </div>
      ) : (
        <div className="galleryItems">
          {block.images.map(
            (
              image,
              imageIndex
            ) => (
              <article
                key={
                  image.id
                }
                className="galleryItemEditor"
              >
                <header>
                  <strong>
                    IMAGE
                    {" "}
                    {
                      imageIndex +
                      1
                    }
                  </strong>


                  <button
                    type="button"
                    onClick={() =>
                      onRemoveImage(
                        image.id
                      )
                    }
                  >
                    Remove
                  </button>
                </header>


                {image.url ? (
                  <div className="galleryImagePreview">
                    <img
                      src={
                        image.url
                      }
                      alt={
                        image.alt ||
                        ""
                      }
                    />


                    <label className="galleryReplace">
                      Replace

                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(
                          event
                        ) =>
                          onUploadImage(
                            image.id,
                            event.target.files?.[
                              0
                            ]
                          )
                        }
                      />
                    </label>
                  </div>
                ) : (
                  <label className="uploadZone galleryUpload">
                    <div className="uploadIcon">
                      ↑
                    </div>


                    <strong>
                      {uploadingGalleryImageId ===
                      image.id
                        ? "Uploading..."
                        : "Upload Image"}
                    </strong>


                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      disabled={
                        uploadingGalleryImageId ===
                        image.id
                      }
                      onChange={(
                        event
                      ) =>
                        onUploadImage(
                          image.id,
                          event.target.files?.[
                            0
                          ]
                        )
                      }
                    />
                  </label>
                )}


                <EditorField
                  label="Alt Text"
                  hint="Accessibility"
                >
                  <input
                    value={
                      image.alt ??
                      ""
                    }
                    placeholder="Describe the image..."
                    onChange={(
                      event
                    ) =>
                      onUpdateImage(
                        image.id,
                        {
                          alt:
                            event.target.value,
                        }
                      )
                    }
                  />
                </EditorField>


                <EditorField
                  label="Caption"
                  hint="Optional"
                >
                  <input
                    value={
                      image.caption ??
                      ""
                    }
                    placeholder="Caption..."
                    onChange={(
                      event
                    ) =>
                      onUpdateImage(
                        image.id,
                        {
                          caption:
                            event.target.value,
                        }
                      )
                    }
                  />
                </EditorField>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   SPACER
   ========================================================= */

function SpacerBlockEditor({
  size,

  onChange,
}: {
  size:
    | "small"
    | "medium"
    | "large";

  onChange:
    (
      size:
        | "small"
        | "medium"
        | "large"
    ) =>
      void;
}) {
  return (
    <div className="spacerEditor">
      <EditorField
        label="Spacing Size"
        hint="Vertical distance"
      >
        <div className="segmentedControl spacerControl">
          <button
            type="button"
            className={
              size ===
              "small"
                ? "active"
                : ""
            }
            onClick={() =>
              onChange(
                "small"
              )
            }
          >
            Small
          </button>


          <button
            type="button"
            className={
              size ===
              "medium"
                ? "active"
                : ""
            }
            onClick={() =>
              onChange(
                "medium"
              )
            }
          >
            Medium
          </button>


          <button
            type="button"
            className={
              size ===
              "large"
                ? "active"
                : ""
            }
            onClick={() =>
              onChange(
                "large"
              )
            }
          >
            Large
          </button>
        </div>
      </EditorField>


      <div className={`spacerVisual size-${size}`}>
        <span>
          {
            size.toUpperCase()
          }
          {" "}
          SPACING
        </span>
      </div>
    </div>
  );
}


/* =========================================================
   CARD PREVIEW
   ========================================================= */

function PatchnoteCardPreview({
  form,
}: {
  form:
    PatchnoteEditorForm;
}) {
  return (
    <div className="cardPreview">
      {form.cover_url ? (
        <img
          src={
            form.cover_url
          }
          alt=""
        />
      ) : (
        <div className="cardPreviewPlaceholder">
          COVER ARTWORK
        </div>
      )}


      <div className="cardPreviewContent">
        <span>
          VERSION
          {" "}
          {
            form.version ||
            "0.0.0"
          }
        </span>


        <h3>
          {form.title ||
            "Patchnote Title"}
        </h3>


        <p>
          {form.summary ||
            "Patchnote summary will appear here."}
        </p>
      </div>
    </div>
  );
}


/* =========================================================
   SHARED COMPONENTS
   ========================================================= */

function EditorPanel({
  number,

  title,

  description,

  right,

  children,
}: {
  number:
    string;

  title:
    string;

  description:
    string;

  right?:
    ReactNode;

  children:
    ReactNode;
}) {
  return (
    <section className="editorPanel">
      <header className="editorPanelHeader">
        <div className="panelNumber">
          {
            number
          }
        </div>


        <div className="panelHeading">
          <h2>
            {
              title
            }
          </h2>

          <p>
            {
              description
            }
          </p>
        </div>


        {right ? (
          <div className="panelRight">
            {
              right
            }
          </div>
        ) : null}
      </header>


      <div className="editorPanelContent">
        {
          children
        }
      </div>
    </section>
  );
}


function EditorField({
  label,

  hint,

  wide,

  children,
}: {
  label:
    string;

  hint?:
    string;

  wide?:
    boolean;

  children:
    ReactNode;
}) {
  return (
    <label
      className={
        wide
          ? "editorField wide"
          : "editorField"
      }
    >
      <div className="fieldTitle">
        <span>
          {
            label
          }
        </span>


        {hint ? (
          <small>
            {
              hint
            }
          </small>
        ) : null}
      </div>


      {
        children
      }
    </label>
  );
}


function BlockLibraryButton({
  icon,

  title,

  description,

  onClick,
}: {
  icon:
    string;

  title:
    string;

  description:
    string;

  onClick:
    () =>
      void;
}) {
  return (
    <button
      type="button"
      className="libraryButton"
      onClick={
        onClick
      }
    >
      <span className="libraryIcon">
        {
          icon
        }
      </span>


      <div>
        <strong>
          {
            title
          }
        </strong>

        <small>
          {
            description
          }
        </small>
      </div>
    </button>
  );
}


function TemplateButton({
  title,

  description,

  icon,

  onClick,
}: {
  title:
    string;

  description:
    string;

  icon:
    string;

  onClick:
    () =>
      void;
}) {
  return (
    <button
      type="button"
      className="templateButton"
      onClick={
        onClick
      }
    >
      <span>
        {
          icon
        }
      </span>


      <div>
        <strong>
          {
            title
          }
        </strong>

        <small>
          {
            description
          }
        </small>
      </div>


      <b>
        +
      </b>
    </button>
  );
}


/* =========================================================
   STYLES
   ========================================================= */

function EditorStyles() {
  return (
    <style jsx global>{`
      .patchEditorPage {
        width: 100%;
        padding: 20px 0 80px;
        color: white;
      }

      .patchEditorHeader {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 25px;
        margin-bottom: 20px;
      }

      .backLink {
        display: inline-flex;
        margin-bottom: 14px;
        color: #8195b4;
        font-size: 10px;
        font-weight: 800;
        text-decoration: none;
      }

      .editorEyebrow {
        color: #63ddff;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 0.14em;
      }

      .patchEditorHeader h1 {
        margin: 7px 0 0;
        font-size: clamp(34px, 5vw, 50px);
        line-height: 1;
        letter-spacing: -0.045em;
      }

      .patchEditorHeader p {
        max-width: 650px;
        margin: 11px 0 0;
        color: #8fa2bf;
        font-size: 12px;
        line-height: 1.6;
      }

      .headerRight {
        display: grid;
        justify-items: end;
        gap: 8px;
      }

      .historyToolbar {
        display: flex;
        gap: 6px;
      }

      .historyToolbar button {
        min-height: 31px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 9px;
        border: 1px solid rgba(125, 153, 196, 0.11);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.018);
        color: #8499b6;
        cursor: pointer;
        font: inherit;
        font-size: 11px;
      }

      .historyToolbar button span {
        font-size: 7px;
        font-weight: 800;
      }

      .historyToolbar button:disabled {
        opacity: 0.28;
        cursor: default;
      }

      .headerActions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .publishStatus,
      .saveState {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 40px;
        padding: 8px 11px;
        border: 1px solid rgba(125, 153, 196, 0.12);
        border-radius: 10px;
        color: #8295b2;
        font-size: 7px;
        font-weight: 900;
        letter-spacing: 0.05em;
      }

      .publishStatus span,
      .saveState span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #6e7f98;
      }

      .publishStatus.published {
        color: #73dfa9;
      }

      .publishStatus.published span {
        background: #66dda4;
        box-shadow: 0 0 12px rgba(102, 221, 164, 0.45);
      }

      .saveState.dirty {
        color: #ffc676;
      }

      .saveState.dirty span {
        background: #ffc676;
        box-shadow: 0 0 10px rgba(255, 198, 118, 0.25);
      }

      .saveState.saved {
        color: #77dba8;
      }

      .saveState.saved span {
        background: #68d89f;
      }

      .saveButton,
      .sidebarSaveButton {
        min-height: 40px;
        padding: 9px 14px;
        border: 1px solid rgba(99, 221, 255, 0.28);
        border-radius: 10px;
        background: rgba(99, 221, 255, 0.09);
        color: #d9f8ff;
        cursor: pointer;
        font: inherit;
        font-size: 9px;
        font-weight: 900;
      }

      .saveButton:disabled,
      .sidebarSaveButton:disabled {
        opacity: 0.5;
        cursor: default;
      }

      .draftRecovery {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 14px;
        margin-bottom: 15px;
        padding: 14px 16px;
        border: 1px solid rgba(255, 192, 105, 0.2);
        border-radius: 13px;
        background:
          radial-gradient(
            circle at 5% 50%,
            rgba(255, 192, 105, 0.07),
            transparent 35%
          ),
          rgba(8, 17, 33, 0.94);
      }

      .draftRecoveryIcon {
        width: 39px;
        height: 39px;
        display: grid;
        place-items: center;
        border-radius: 11px;
        background: rgba(255, 192, 105, 0.07);
        color: #ffc878;
        font-size: 18px;
      }

      .draftRecovery strong {
        font-size: 10px;
      }

      .draftRecovery p {
        margin: 4px 0 0;
        color: #8194b1;
        font-size: 8px;
      }

      .draftRecoveryActions {
        display: flex;
        gap: 7px;
      }

      .restoreDraftButton {
        min-height: 36px;
        padding: 8px 11px;
        border: 1px solid rgba(255, 192, 105, 0.22);
        border-radius: 9px;
        background: rgba(255, 192, 105, 0.07);
        color: #ffd497;
        cursor: pointer;
        font: inherit;
        font-size: 8px;
        font-weight: 850;
      }

      .editorMessage {
        margin-bottom: 15px;
        padding: 11px 13px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 700;
      }

      .editorMessage.error {
        border: 1px solid rgba(255, 103, 126, 0.2);
        background: rgba(255, 103, 126, 0.05);
        color: #ff9bab;
      }

      .editorMessage.success {
        border: 1px solid rgba(95, 223, 160, 0.18);
        background: rgba(95, 223, 160, 0.05);
        color: #7fe0ad;
      }

      .editorLayout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 390px;
        gap: 18px;
        align-items: start;
      }

      .editorContent {
        min-width: 0;
        display: grid;
        gap: 17px;
      }

      .editorPanel,
      .sidebarPanel,
      .previewPanel,
      .keyboardPanel {
        overflow: hidden;
        border: 1px solid rgba(125, 153, 196, 0.12);
        border-radius: 17px;
        background: rgba(8, 17, 33, 0.91);
      }

      .editorPanelHeader {
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 16px 18px;
        border-bottom: 1px solid rgba(125, 153, 196, 0.07);
      }

      .panelNumber {
        flex: 0 0 auto;
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(99, 221, 255, 0.14);
        border-radius: 10px;
        background: rgba(99, 221, 255, 0.04);
        color: #63ddff;
        font-size: 8px;
        font-weight: 950;
      }

      .panelHeading {
        min-width: 0;
      }

      .panelHeading h2 {
        margin: 0;
        font-size: 14px;
      }

      .panelHeading p {
        margin: 4px 0 0;
        color: #697e9d;
        font-size: 8px;
      }

      .panelRight {
        margin-left: auto;
      }

      .blockCounter {
        padding: 6px 8px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.025);
        color: #7990ad;
        font-size: 7px;
        font-weight: 900;
      }

      .editorPanelContent {
        padding: 18px;
      }

      .detailsGrid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 13px;
      }

      .editorField {
        min-width: 0;
        display: grid;
        gap: 7px;
      }

      .editorField.wide {
        grid-column: 1 / -1;
      }

      .fieldTitle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .fieldTitle > span {
        color: #a6b6cc;
        font-size: 9px;
        font-weight: 800;
      }

      .fieldTitle small {
        color: #5e7391;
        font-size: 7px;
      }

      .editorField input,
      .editorField textarea,
      .editorField select,
      .blockContent > input,
      .blockContent > textarea {
        width: 100%;
        min-height: 41px;
        padding: 10px 11px;
        border: 1px solid rgba(125, 153, 196, 0.13);
        border-radius: 9px;
        outline: none;
        background: rgba(255, 255, 255, 0.025);
        color: white;
        font: inherit;
        font-size: 10px;
      }

      .editorField textarea,
      .blockContent > textarea {
        resize: vertical;
      }

      .editorField select option {
        background: #091426;
      }

      .editorField input:focus,
      .editorField textarea:focus,
      .editorField select:focus,
      .blockContent > input:focus,
      .blockContent > textarea:focus {
        border-color: rgba(99, 221, 255, 0.32);
      }

      .headingInput {
        font-size: 17px !important;
        font-weight: 800 !important;
      }

      .slugInput {
        display: flex;
        align-items: center;
        overflow: hidden;
        border: 1px solid rgba(125, 153, 196, 0.13);
        border-radius: 9px;
        background: rgba(255, 255, 255, 0.025);
      }

      .slugInput > span {
        padding-left: 11px;
        color: #5f7492;
        font-size: 9px;
      }

      .slugInput input {
        border: 0;
        background: transparent;
      }

      .characterCount {
        color: #5c718f;
        font-size: 7px;
        text-align: right;
      }

      .coverEditor {
        display: grid;
        gap: 12px;
      }

      .coverImage,
      .blockImagePreview,
      .galleryImagePreview {
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(125, 153, 196, 0.1);
        border-radius: 13px;
        background: rgba(255, 255, 255, 0.018);
      }

      .coverImage {
        aspect-ratio: 16 / 7;
      }

      .coverImage img,
      .blockImagePreview img,
      .galleryImagePreview img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .blockImagePreview {
        max-height: 350px;
      }

      .blockImagePreview img {
        max-height: 350px;
        object-fit: contain;
      }

      .galleryImagePreview {
        aspect-ratio: 16 / 10;
      }

      .galleryReplace {
        position: absolute;
        right: 8px;
        bottom: 8px;
        padding: 6px 8px;
        border-radius: 7px;
        background: rgba(4, 10, 20, 0.8);
        color: white;
        cursor: pointer;
        font-size: 7px;
        font-weight: 800;
      }

      .coverOverlay {
        position: absolute;
        right: 10px;
        bottom: 10px;
        padding: 5px 7px;
        border-radius: 7px;
        background: rgba(4, 10, 20, 0.75);
        color: #9fb3cf;
        font-size: 7px;
        font-weight: 900;
      }

      .coverControls,
      .imageActions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .secondaryButton,
      .dangerButton {
        min-height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 11px;
        border-radius: 9px;
        cursor: pointer;
        font: inherit;
        font-size: 8px;
        font-weight: 800;
      }

      .secondaryButton {
        border: 1px solid rgba(125, 153, 196, 0.13);
        background: rgba(255, 255, 255, 0.025);
        color: #9cafc8;
      }

      .dangerButton {
        border: 1px solid rgba(255, 103, 126, 0.12);
        background: rgba(255, 103, 126, 0.03);
        color: #c57886;
      }

      .fileButton {
        cursor: pointer;
      }

      .uploadZone {
        min-height: 180px;
        display: grid;
        place-items: center;
        align-content: center;
        gap: 7px;
        padding: 22px;
        border: 1px dashed rgba(99, 221, 255, 0.2);
        border-radius: 13px;
        background: rgba(99, 221, 255, 0.018);
        cursor: pointer;
        text-align: center;
      }

      .uploadZone strong {
        font-size: 10px;
      }

      .uploadZone p,
      .uploadZone span {
        margin: 0;
        color: #687d9c;
        font-size: 8px;
      }

      .uploadIcon {
        width: 35px;
        height: 35px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        background: rgba(99, 221, 255, 0.06);
        color: #63ddff;
        font-size: 17px;
      }

      .builderTools {
        display: grid;
        gap: 16px;
        margin-bottom: 15px;
      }

      .builderToolGroup > span {
        display: block;
        margin-bottom: 7px;
        color: #647b99;
        font-size: 7px;
        font-weight: 950;
        letter-spacing: 0.1em;
      }

      .blockLibrary {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }

      .libraryButton {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        border: 1px solid rgba(125, 153, 196, 0.1);
        border-radius: 11px;
        background: rgba(255, 255, 255, 0.018);
        color: white;
        cursor: pointer;
        text-align: left;
      }

      .libraryIcon {
        flex: 0 0 auto;
        width: 31px;
        height: 31px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        background: rgba(99, 221, 255, 0.05);
        color: #63ddff;
        font-size: 11px;
        font-weight: 900;
      }

      .libraryButton > div {
        min-width: 0;
      }

      .libraryButton strong {
        display: block;
        font-size: 8px;
      }

      .libraryButton small {
        display: block;
        margin-top: 3px;
        color: #647997;
        font-size: 7px;
      }

      .templateLibrary {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .templateButton {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 10px;
        min-width: 0;
        padding: 12px;
        border: 1px solid rgba(185, 133, 255, 0.13);
        border-radius: 11px;
        background:
          linear-gradient(
            135deg,
            rgba(185, 133, 255, 0.035),
            rgba(255, 255, 255, 0.012)
          );
        color: white;
        cursor: pointer;
        text-align: left;
      }

      .templateButton > span {
        width: 30px;
        height: 30px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        background: rgba(185, 133, 255, 0.07);
        color: #c5a3f9;
        font-size: 7px;
        font-weight: 950;
      }

      .templateButton strong {
        display: block;
        font-size: 8px;
      }

      .templateButton small {
        display: block;
        margin-top: 3px;
        color: #657a99;
        font-size: 7px;
      }

      .templateButton b {
        color: #ae8ce1;
        font-size: 15px;
      }

      .builderUtilityBar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 11px;
        border: 1px solid rgba(125, 153, 196, 0.08);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.012);
      }

      .builderUtilityBar strong {
        display: block;
        font-size: 8px;
      }

      .builderUtilityBar span {
        display: block;
        margin-top: 3px;
        color: #617693;
        font-size: 7px;
      }

      .builderUtilityBar > div:last-child {
        display: flex;
        gap: 6px;
      }

      .builderUtilityBar button {
        min-height: 30px;
        padding: 5px 8px;
        border: 1px solid rgba(125, 153, 196, 0.1);
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.018);
        color: #8196b3;
        cursor: pointer;
        font: inherit;
        font-size: 7px;
        font-weight: 800;
      }

      .emptyBuilder {
        padding: 44px 20px;
        border: 1px dashed rgba(125, 153, 196, 0.1);
        border-radius: 13px;
        text-align: center;
      }

      .emptyBuilderIcon {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        margin: 0 auto;
        border-radius: 12px;
        background: rgba(99, 221, 255, 0.05);
        color: #63ddff;
        font-size: 19px;
      }

      .emptyBuilder h3 {
        margin: 12px 0 5px;
        font-size: 13px;
      }

      .emptyBuilder p {
        max-width: 390px;
        margin: 0 auto;
        color: #687d9b;
        font-size: 8px;
        line-height: 1.6;
      }

      .blocks {
        display: grid;
      }

      .blockWrapper {
        min-width: 0;
      }

      .contentBlock {
        overflow: hidden;
        border: 1px solid rgba(125, 153, 196, 0.1);
        border-radius: 13px;
        background: rgba(255, 255, 255, 0.012);
        transition:
          opacity 140ms ease,
          transform 140ms ease,
          border-color 140ms ease,
          box-shadow 140ms ease;
      }

      .contentBlock.block-split,
      .contentBlock.block-highlight,
      .contentBlock.block-gallery {
        border-color: rgba(185, 133, 255, 0.17);
      }

      .contentBlock.dragging {
        opacity: 0.42;
        transform: scale(0.992);
      }

      .contentBlock.collapsed {
        background: rgba(255, 255, 255, 0.008);
      }

      .dragHandle {
        flex: 0 0 auto;
        width: 25px;
        height: 30px;
        display: grid;
        place-items: center;
        border-radius: 7px;
        color: #58708f;
        cursor: grab;
        user-select: none;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: -0.28em;
      }

      .dragHandle:hover {
        background: rgba(99, 221, 255, 0.05);
        color: #63ddff;
      }

      .dragHandle:active {
        cursor: grabbing;
      }

      .blockHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 10px 12px;
        border-bottom: 1px solid rgba(125, 153, 196, 0.06);
        background: rgba(255, 255, 255, 0.012);
      }

      .contentBlock.collapsed .blockHeader {
        border-bottom: 0;
      }

      .blockIdentity {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .blockTitleArea {
        min-width: 0;
      }

      .blockNumber {
        color: #566c8b;
        font-size: 7px;
        font-weight: 900;
      }

      .blockTypeIcon {
        width: 27px;
        height: 27px;
        display: grid;
        flex: 0 0 auto;
        place-items: center;
        border-radius: 7px;
        background: rgba(99, 221, 255, 0.04);
        color: #63ddff;
        font-size: 8px;
        font-weight: 900;
      }

      .blockIdentity strong {
        display: block;
        font-size: 9px;
      }

      .blockIdentity small {
        display: block;
        margin-top: 2px;
        color: #617693;
        font-size: 7px;
      }

      .readyBadge {
        margin-left: 4px;
        padding: 4px 6px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.025);
        color: #687c99;
        font-size: 6px;
        font-weight: 900;
      }

      .readyBadge.ready {
        background: rgba(95, 223, 160, 0.06);
        color: #72dca7;
      }

      .blockActions {
        display: flex;
        gap: 5px;
      }

      .blockActions button {
        width: 30px;
        height: 30px;
        border: 1px solid rgba(125, 153, 196, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.018);
        color: #8498b5;
        cursor: pointer;
      }

      .blockActions button:disabled {
        opacity: 0.3;
        cursor: default;
      }

      .blockActions button.deleteBlock {
        color: #cc7888;
      }

      .collapseButton {
        color: #b794ed !important;
      }

      .blockContent {
        padding: 14px;
      }

      .collapsedBlockSummary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 12px;
        border-top: 1px solid rgba(125, 153, 196, 0.04);
        color: #586d8a;
        font-size: 7px;
      }

      .collapsedBlockSummary button {
        border: 0;
        background: transparent;
        color: #9d81cd;
        cursor: pointer;
        font: inherit;
        font-size: 7px;
        font-weight: 800;
      }

      .blockDropZone {
        position: relative;
        min-height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          min-height 120ms ease,
          background 120ms ease;
      }

      .blockDropZone.active {
        min-height: 50px;
        border-radius: 10px;
        background: rgba(99, 221, 255, 0.025);
      }

      .dropZoneLine {
        position: absolute;
        right: 15px;
        left: 15px;
        height: 1px;
        background: transparent;
      }

      .blockDropZone.active .dropZoneLine {
        background: #63ddff;
        box-shadow: 0 0 14px rgba(99, 221, 255, 0.3);
      }

      .insertButton {
        position: relative;
        z-index: 3;
        width: 24px;
        height: 24px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(125, 153, 196, 0.1);
        border-radius: 50%;
        background: #091426;
        color: #607592;
        cursor: pointer;
        opacity: 0;
        transform: scale(0.85);
        font: inherit;
        font-size: 13px;
        transition:
          opacity 120ms ease,
          transform 120ms ease,
          border-color 120ms ease,
          color 120ms ease;
      }

      .blockDropZone:hover .insertButton,
      .blockDropZone.menuOpen .insertButton {
        opacity: 1;
        transform: scale(1);
        border-color: rgba(99, 221, 255, 0.22);
        color: #63ddff;
      }

      .insertMenu {
        position: absolute;
        z-index: 50;
        top: 31px;
        left: 50%;
        width: min(520px, calc(100vw - 60px));
        transform: translateX(-50%);
        padding: 12px;
        border: 1px solid rgba(99, 221, 255, 0.15);
        border-radius: 13px;
        background: #091426;
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.4);
      }

      .insertMenuHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 9px;
        border-bottom: 1px solid rgba(125, 153, 196, 0.07);
      }

      .insertMenuHeader strong {
        font-size: 9px;
      }

      .insertMenuHeader span {
        color: #607592;
        font-size: 7px;
      }

      .insertMenuSection {
        margin-top: 10px;
      }

      .insertMenuSection > span {
        display: block;
        margin-bottom: 6px;
        color: #5c7391;
        font-size: 6px;
        font-weight: 950;
        letter-spacing: 0.1em;
      }

      .insertMenuGrid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
      }

      .insertMenuGrid button {
        display: grid;
        justify-items: center;
        gap: 5px;
        min-height: 60px;
        padding: 8px;
        border: 1px solid rgba(125, 153, 196, 0.08);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.015);
        color: white;
        cursor: pointer;
        font: inherit;
      }

      .insertMenuGrid button span {
        color: #63ddff;
        font-size: 12px;
        font-weight: 900;
      }

      .insertMenuGrid button strong {
        font-size: 7px;
      }

      .insertTemplateGrid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }

      .insertTemplateGrid button {
        min-height: 32px;
        padding: 6px 8px;
        border: 1px solid rgba(185, 133, 255, 0.1);
        border-radius: 7px;
        background: rgba(185, 133, 255, 0.025);
        color: #a98bcf;
        cursor: pointer;
        font: inherit;
        font-size: 7px;
        font-weight: 800;
      }

      .imageEditor,
      .splitEditor,
      .splitImageEditor,
      .splitTextEditor,
      .highlightEditor,
      .galleryEditor,
      .spacerEditor {
        display: grid;
        gap: 12px;
      }

      .imageMetaGrid,
      .splitControls,
      .highlightTopRow {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 11px;
      }

      .splitEditorGrid {
        display: grid;
        grid-template-columns:
          minmax(0, 0.9fr)
          minmax(0, 1.1fr);
        gap: 14px;
        align-items: start;
      }

      .segmentedControl {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 3px;
        border: 1px solid rgba(125, 153, 196, 0.12);
        border-radius: 9px;
        background: rgba(255, 255, 255, 0.018);
      }

      .segmentedControl button {
        min-height: 34px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: #7185a3;
        cursor: pointer;
        font: inherit;
        font-size: 8px;
        font-weight: 800;
      }

      .segmentedControl button.active {
        background: rgba(185, 133, 255, 0.1);
        color: #c4a4f8;
      }

      .spacerControl {
        grid-template-columns: repeat(3, 1fr);
      }

      .splitMobileNotice {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 10px;
        border: 1px solid rgba(99, 221, 255, 0.08);
        border-radius: 9px;
        background: rgba(99, 221, 255, 0.018);
      }

      .splitMobileNotice strong {
        color: #63ddff;
        font-size: 6px;
        font-weight: 950;
        letter-spacing: 0.08em;
      }

      .splitMobileNotice span {
        color: #687d9c;
        font-size: 7px;
      }

      .galleryEditorTop {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
      }

      .galleryEditorTop .editorField {
        min-width: 180px;
      }

      .galleryEmpty {
        padding: 35px 16px;
        border: 1px dashed rgba(125, 153, 196, 0.12);
        border-radius: 11px;
        color: #687d9a;
        font-size: 9px;
        text-align: center;
      }

      .galleryItems {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .galleryItemEditor {
        min-width: 0;
        display: grid;
        gap: 10px;
        padding: 11px;
        border: 1px solid rgba(125, 153, 196, 0.09);
        border-radius: 11px;
        background: rgba(255, 255, 255, 0.014);
      }

      .galleryItemEditor > header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .galleryItemEditor > header strong {
        color: #8498b5;
        font-size: 9px;
      }

      .galleryItemEditor > header button {
        border: 0;
        background: transparent;
        color: #c47b88;
        cursor: pointer;
        font: inherit;
        font-size: 8px;
      }

      .galleryUpload {
        min-height: 150px;
      }

      .dividerEditorPreview {
        display: grid;
        gap: 10px;
        padding: 20px 5px;
        text-align: center;
      }

      .dividerEditorPreview > span {
        width: 100%;
        height: 1px;
        display: block;
        background:
          linear-gradient(
            90deg,
            transparent,
            rgba(99, 221, 255, 0.26),
            transparent
          );
      }

      .dividerEditorPreview small {
        color: #647997;
        font-size: 8px;
      }

      .spacerVisual {
        display: grid;
        place-items: center;
        border: 1px dashed rgba(125, 153, 196, 0.1);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.01);
        color: #5d7391;
        font-size: 7px;
        font-weight: 900;
        transition: height 160ms ease;
      }

      .spacerVisual.size-small {
        height: 35px;
      }

      .spacerVisual.size-medium {
        height: 60px;
      }

      .spacerVisual.size-large {
        height: 95px;
      }

      .editorSidebar {
        min-width: 0;
      }

      .sidebarSticky {
        position: sticky;
        top: 92px;
        display: grid;
        gap: 14px;
      }

      .sidebarPanel {
        padding: 18px;
      }

      .sidebarTitle span,
      .previewToolbar span,
      .keyboardPanel > span {
        display: block;
        color: #63ddff;
        font-size: 7px;
        font-weight: 900;
        letter-spacing: 0.13em;
      }

      .sidebarTitle strong,
      .previewToolbar strong {
        display: block;
        margin-top: 4px;
        font-size: 13px;
      }

      .publishControl {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        margin: 15px 0;
        padding: 12px;
        border-radius: 11px;
        background: rgba(255, 255, 255, 0.022);
      }

      .publishControl strong {
        display: block;
        font-size: 10px;
      }

      .publishControl small {
        display: block;
        margin-top: 3px;
        color: #657a99;
        font-size: 7px;
      }

      .toggle {
        width: 42px;
        height: 24px;
        padding: 3px;
        border: 1px solid rgba(125, 153, 196, 0.12);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.025);
        cursor: pointer;
      }

      .toggle span {
        display: block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #6b7e98;
        transition:
          transform 160ms ease,
          background 160ms ease;
      }

      .toggle.active span {
        transform: translateX(16px);
        background: #63ddff;
      }

      .publishInfo {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 0;
        border-top: 1px solid rgba(125, 153, 196, 0.06);
      }

      .publishInfo span {
        color: #687d9d;
        font-size: 8px;
      }

      .publishInfo strong {
        color: #a4b5cd;
        font-size: 9px;
      }

      .sidebarDirty {
        color: #ffc676 !important;
      }

      .sidebarSaved {
        color: #72dca7 !important;
      }

      .sidebarHistory {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-top: 10px;
      }

      .sidebarHistory button {
        min-height: 33px;
        border: 1px solid rgba(125, 153, 196, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.018);
        color: #8297b4;
        cursor: pointer;
        font: inherit;
        font-size: 7px;
        font-weight: 800;
      }

      .sidebarHistory button:disabled {
        opacity: 0.28;
        cursor: default;
      }

      .sidebarSaveButton {
        width: 100%;
        margin-top: 9px;
      }

      .previewPanel {
        overflow: hidden;
      }

      .previewToolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 14px;
        border-bottom: 1px solid rgba(125, 153, 196, 0.07);
      }

      .previewMode {
        display: flex;
        gap: 3px;
        padding: 3px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.025);
      }

      .previewMode button {
        min-height: 28px;
        padding: 5px 7px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #6d82a1;
        cursor: pointer;
        font: inherit;
        font-size: 7px;
        font-weight: 800;
      }

      .previewMode button.active {
        background: rgba(99, 221, 255, 0.09);
        color: #9cecff;
      }

      .previewDevice {
        padding: 13px;
        overflow: auto;
      }

      .previewDevice.mobile {
        display: flex;
        justify-content: center;
      }

      .previewDevice.mobile .articlePreview {
        width: 270px;
      }

      .previewDevice.mobile .patchSplit {
        grid-template-columns: 1fr !important;
      }

      .previewDevice.mobile .patchSplitImage {
        order: 1;
      }

      .previewDevice.mobile .patchSplitContent {
        order: 2;
      }

      .previewDevice.mobile .patchGallery {
        grid-template-columns: 1fr !important;
      }

      .articlePreview,
      .cardPreview {
        overflow: hidden;
        border: 1px solid rgba(125, 153, 196, 0.1);
        border-radius: 14px;
        background: #081426;
      }

      .previewCover,
      .previewCoverPlaceholder,
      .cardPreview > img,
      .cardPreviewPlaceholder {
        width: 100%;
        aspect-ratio: 16 / 8;
      }

      .previewCover,
      .cardPreview > img {
        display: block;
        object-fit: cover;
      }

      .previewCoverPlaceholder,
      .cardPreviewPlaceholder {
        display: grid;
        place-items: center;
        background: rgba(255, 255, 255, 0.02);
        color: #536985;
        font-size: 8px;
        font-weight: 900;
      }

      .articlePreviewContent,
      .cardPreviewContent {
        padding: 15px;
      }

      .previewVersion,
      .cardPreviewContent > span {
        color: #63ddff;
        font-size: 7px;
        font-weight: 900;
        letter-spacing: 0.08em;
      }

      .articlePreviewContent > h2 {
        margin: 6px 0 8px;
        font-size: 24px;
        line-height: 1;
        letter-spacing: -0.04em;
      }

      .previewSummary {
        margin: 0 0 14px;
        color: #8fa3bf;
        font-size: 9px;
        line-height: 1.55;
      }

      .cardPreview {
        margin: 13px;
      }

      .cardPreviewContent h3 {
        margin: 6px 0;
        font-size: 15px;
      }

      .cardPreviewContent p {
        margin: 0;
        color: #8296b3;
        font-size: 9px;
        line-height: 1.5;
      }

      .keyboardPanel {
        padding: 14px;
      }

      .keyboardPanel > div {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 9px;
      }

      .keyboardPanel > div strong {
        min-width: 65px;
        color: #8095b3;
        font-size: 7px;
      }

      .keyboardPanel > div > span {
        color: #4f6480;
        font-size: 7px;
      }

      .keyboardPanel kbd {
        min-width: 23px;
        min-height: 22px;
        display: inline-grid;
        place-items: center;
        padding: 3px 6px;
        border: 1px solid rgba(125, 153, 196, 0.12);
        border-bottom-color: rgba(125, 153, 196, 0.22);
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.025);
        color: #9aacc5;
        font-family: inherit;
        font-size: 6px;
        font-weight: 850;
      }

      .patchEditorLoading {
        padding: 28px;
        border: 1px solid rgba(125, 153, 196, 0.13);
        border-radius: 18px;
        background: rgba(8, 17, 33, 0.9);
        color: #8fa3c0;
      }

      @media (hover: hover) and (pointer: fine) {
        .libraryButton:hover,
        .templateButton:hover,
        .secondaryButton:hover,
        .blockActions button:not(:disabled):hover,
        .insertMenuGrid button:hover,
        .insertTemplateGrid button:hover {
          border-color: rgba(99, 221, 255, 0.25);
        }
      }

      @media (max-width: 1250px) {
        .editorLayout {
          grid-template-columns: 1fr;
        }

        .sidebarSticky {
          position: static;
          grid-template-columns:
            minmax(260px, 0.45fr)
            minmax(0, 1fr);
        }

        .keyboardPanel {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 850px) {
        .blockLibrary {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .templateLibrary {
          grid-template-columns: 1fr;
        }

        .splitEditorGrid {
          grid-template-columns: 1fr;
        }

        .galleryItems {
          grid-template-columns: 1fr;
        }

        .sidebarSticky {
          grid-template-columns: 1fr;
        }

        .keyboardPanel {
          grid-column: auto;
        }
      }

      @media (max-width: 700px) {
        .draftRecovery {
          grid-template-columns: auto 1fr;
        }

        .draftRecoveryActions {
          grid-column: 1 / -1;
          justify-content: flex-end;
        }
      }

      @media (max-width: 620px) {
        .patchEditorHeader {
          align-items: flex-start;
          flex-direction: column;
        }

        .headerRight {
          width: 100%;
          justify-items: stretch;
        }

        .historyToolbar {
          justify-content: flex-end;
        }

        .headerActions {
          width: 100%;
          flex-wrap: wrap;
        }

        .saveButton {
          flex: 1;
        }

        .editorPanelHeader,
        .editorPanelContent {
          padding-left: 15px;
          padding-right: 15px;
        }

        .detailsGrid,
        .imageMetaGrid,
        .splitControls,
        .highlightTopRow {
          grid-template-columns: 1fr;
        }

        .editorField.wide {
          grid-column: auto;
        }

        .galleryEditorTop,
        .builderUtilityBar {
          align-items: stretch;
          flex-direction: column;
        }

        .galleryEditorTop .editorField {
          min-width: 0;
        }

        .blockHeader {
          align-items: flex-start;
          flex-direction: column;
        }

        .blockIdentity {
          width: 100%;
          flex-wrap: wrap;
        }

        .blockActions {
          width: 100%;
          justify-content: flex-end;
        }

        .dragHandle {
          display: none;
        }

        .previewToolbar {
          align-items: flex-start;
          flex-direction: column;
        }

        .insertMenuGrid {
          grid-template-columns: repeat(2, 1fr);
        }

        .insertTemplateGrid {
          grid-template-columns: 1fr;
        }

        .insertButton {
          opacity: 1;
          transform: scale(1);
        }
      }

      @media (max-width: 430px) {
        .blockLibrary {
          grid-template-columns: 1fr;
        }

        .saveState,
        .publishStatus {
          min-height: 34px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .toggle span,
        .contentBlock,
        .spacerVisual,
        .blockDropZone,
        .insertButton {
          transition: none;
        }
      }
    `}</style>
  );
}