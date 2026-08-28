"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
} from "../../types/admin";

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cloneBlock(
  block: PatchnoteContentBlock
): PatchnoteContentBlock {
  return {
    ...block,
    id: createId(),
  };
}

export default function PatchnoteEditor({
  patchnoteId,
}: {
  patchnoteId?: string;
}) {
  const [form, setForm] =
    useState<PatchnoteEditorForm>(
      emptyPatchnoteEditorForm
    );

  const [loading, setLoading] =
    useState(!!patchnoteId);

  const [saving, setSaving] =
    useState(false);

  const [uploadingCover, setUploadingCover] =
    useState(false);

  const [uploadingBlockId, setUploadingBlockId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [previewMode, setPreviewMode] =
    useState<"article" | "card">("article");

  useEffect(() => {
    if (!patchnoteId) {
      return;
    }

    getAdminPatchnoteById(patchnoteId)
      .then((note) => {
        if (!note) {
          setError("Patchnote not found.");
          return;
        }

        setForm({
          version: note.version ?? "",
          title: note.title ?? "",
          slug: note.slug ?? "",
          summary: note.summary ?? "",
          cover_url: note.cover_url ?? "",
          published: note.published ?? false,

          blocks:
            note.content_blocks ??
            (note.content
              ? [
                  {
                    id: createId(),
                    type: "text",
                    text: note.content,
                  },
                ]
              : []),
        });
      })
      .catch((err) => {
        console.error(err);

        setError(
          err?.message ||
            "Could not load patchnote."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [patchnoteId]);

  function updateForm<
    K extends keyof PatchnoteEditorForm
  >(
    key: K,
    value: PatchnoteEditorForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function changeTitle(title: string) {
    setForm((previous) => {
      const previousAutoSlug =
        makeSlug(previous.title);

      const shouldUpdateSlug =
        !previous.slug ||
        previous.slug ===
          previousAutoSlug;

      return {
        ...previous,
        title,
        slug: shouldUpdateSlug
          ? makeSlug(title)
          : previous.slug,
      };
    });
  }

  function addBlock(
    type: PatchnoteContentBlock["type"]
  ) {
    let block: PatchnoteContentBlock;

    if (type === "heading") {
      block = {
        id: createId(),
        type: "heading",
        text: "",
      };
    } else if (type === "text") {
      block = {
        id: createId(),
        type: "text",
        text: "",
      };
    } else {
      block = {
        id: createId(),
        type: "image",
        url: "",
        alt: "",
        caption: "",
      };
    }

    updateForm("blocks", [
      ...form.blocks,
      block,
    ]);
  }

  function updateBlock(
    id: string,
    patch: Partial<PatchnoteContentBlock>
  ) {
    updateForm(
      "blocks",
      form.blocks.map((block) =>
        block.id === id
          ? ({
              ...block,
              ...patch,
            } as PatchnoteContentBlock)
          : block
      )
    );
  }

  function removeBlock(id: string) {
    updateForm(
      "blocks",
      form.blocks.filter(
        (block) => block.id !== id
      )
    );
  }

  function duplicateBlock(
    index: number
  ) {
    const blocks = [...form.blocks];

    const duplicated = cloneBlock(
      blocks[index]
    );

    blocks.splice(
      index + 1,
      0,
      duplicated
    );

    updateForm("blocks", blocks);
  }

  function moveBlock(
    index: number,
    direction: -1 | 1
  ) {
    const target =
      index + direction;

    if (
      target < 0 ||
      target >= form.blocks.length
    ) {
      return;
    }

    const blocks = [...form.blocks];

    [
      blocks[index],
      blocks[target],
    ] = [
      blocks[target],
      blocks[index],
    ];

    updateForm("blocks", blocks);
  }

  async function uploadCover(
    file?: File
  ) {
    if (!file) {
      return;
    }

    try {
      setUploadingCover(true);
      setError(null);

      const url =
        await uploadPatchnoteImage(
          file,
          "covers"
        );

      updateForm("cover_url", url);
    } catch (err: any) {
      setError(
        err?.message ||
          "Cover upload failed."
      );
    } finally {
      setUploadingCover(false);
    }
  }

  async function uploadBlockImage(
    blockId: string,
    file?: File
  ) {
    if (!file) {
      return;
    }

    try {
      setUploadingBlockId(blockId);
      setError(null);

      const url =
        await uploadPatchnoteImage(
          file,
          "content"
        );

      updateBlock(blockId, {
        url,
      });
    } catch (err: any) {
      setError(
        err?.message ||
          "Image upload failed."
      );
    } finally {
      setUploadingBlockId(null);
    }
  }

  async function save() {
    setError(null);
    setSuccess(null);

    if (!form.version.trim()) {
      setError(
        "Please enter a version."
      );
      return;
    }

    if (!form.title.trim()) {
      setError(
        "Please enter a title."
      );
      return;
    }

    if (!form.slug.trim()) {
      setError(
        "Please enter a slug."
      );
      return;
    }

    try {
      setSaving(true);

      if (patchnoteId) {
        await updatePatchnote(
          patchnoteId,
          form
        );

        setSuccess(
          "Patchnote saved successfully."
        );
      } else {
        const created =
          await createPatchnote(form);

        window.location.href =
          `/admin/patchnotes/${created.id}/edit`;
      }
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Could not save patchnote."
      );
    } finally {
      setSaving(false);
    }
  }

  const completedBlocks =
    useMemo(() => {
      return form.blocks.filter(
        (block) => {
          if (block.type === "image") {
            return !!block.url;
          }

          return !!block.text.trim();
        }
      ).length;
    }, [form.blocks]);

  if (loading) {
    return (
      <div className="patchEditorLoading">
        Loading Patchnote Editor...
      </div>
    );
  }

  return (
    <>
      <div className="patchEditorPage">
        {/* HEADER */}

        <header className="patchEditorHeader">
          <div className="headerMain">
            <Link
              href="/admin/patchnotes"
              className="backLink"
            >
              ← Patchnotes
            </Link>

            <div className="editorEyebrow">
              AUROS CONTENT MANAGEMENT
            </div>

            <h1>
              {patchnoteId
                ? "Edit Patchnote"
                : "Create Patchnote"}
            </h1>

            <p>
              Build, preview and publish
              a complete Auros update.
            </p>
          </div>

          <div className="headerActions">
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
              disabled={saving}
              onClick={save}
            >
              {saving
                ? "Saving..."
                : patchnoteId
                ? "Save Changes"
                : "Create Patchnote"}
            </button>
          </div>
        </header>

        {error && (
          <div className="editorMessage error">
            {error}
          </div>
        )}

        {success && (
          <div className="editorMessage success">
            {success}
          </div>
        )}

        {/* EDITOR LAYOUT */}

        <div className="editorLayout">
          {/* MAIN CONTENT */}

          <main className="editorContent">
            {/* DETAILS */}

            <EditorPanel
              number="01"
              title="Patchnote Details"
              description="Main information used across the Auros website."
            >
              <div className="detailsGrid">
                <EditorField
                  label="Version"
                  hint="Example: 1.2.0"
                >
                  <input
                    value={form.version}
                    placeholder="1.2.0"
                    onChange={(event) =>
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
                    value={form.title}
                    placeholder="Community Update"
                    onChange={(event) =>
                      changeTitle(
                        event.target.value
                      )
                    }
                  />
                </EditorField>

                <EditorField
                  label="Slug"
                  hint="URL path"
                  wide
                >
                  <div className="slugInput">
                    <span>
                      /patchnotes/
                    </span>

                    <input
                      value={form.slug}
                      placeholder="community-update"
                      onChange={(event) =>
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
                  hint="Displayed on cards and below the title"
                  wide
                >
                  <textarea
                    rows={5}
                    maxLength={400}
                    value={form.summary}
                    placeholder="Describe the most important parts of this update..."
                    onChange={(event) =>
                      updateForm(
                        "summary",
                        event.target.value
                      )
                    }
                  />

                  <div className="characterCount">
                    {form.summary.length}/400
                  </div>
                </EditorField>
              </div>
            </EditorPanel>

            {/* COVER */}

            <EditorPanel
              number="02"
              title="Cover Artwork"
              description="The main visual used for the patchnote card and article."
            >
              {form.cover_url ? (
                <div className="coverEditor">
                  <div className="coverImage">
                    <img
                      src={form.cover_url}
                      alt="Patchnote cover"
                    />

                    <div className="coverOverlay">
                      Patchnote Cover
                    </div>
                  </div>

                  <div className="coverControls">
                    <label className="secondaryButton fileButton">
                      Replace Cover

                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          uploadCover(
                            event.target
                              .files?.[0]
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
                    PNG, JPG or WEBP ·
                    Maximum 15 MB
                  </p>

                  <span>
                    Recommended:
                    1920 × 1080
                  </span>

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    disabled={
                      uploadingCover
                    }
                    onChange={(event) =>
                      uploadCover(
                        event.target
                          .files?.[0]
                      )
                    }
                  />
                </label>
              )}
            </EditorPanel>

            {/* CONTENT BUILDER */}

            <EditorPanel
              number="03"
              title="Content Builder"
              description="Build the actual patchnote article using content blocks."
              right={
                <div className="blockCounter">
                  {completedBlocks}/
                  {form.blocks.length} READY
                </div>
              }
            >
              <div className="contentToolbar">
                <button
                  type="button"
                  onClick={() =>
                    addBlock("heading")
                  }
                >
                  <span className="toolbarIcon">
                    H
                  </span>

                  <div>
                    <strong>
                      Heading
                    </strong>

                    <small>
                      New section
                    </small>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    addBlock("text")
                  }
                >
                  <span className="toolbarIcon">
                    T
                  </span>

                  <div>
                    <strong>
                      Text
                    </strong>

                    <small>
                      Paragraph
                    </small>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    addBlock("image")
                  }
                >
                  <span className="toolbarIcon">
                    ▧
                  </span>

                  <div>
                    <strong>
                      Image
                    </strong>

                    <small>
                      Screenshot
                    </small>
                  </div>
                </button>
              </div>

              {form.blocks.length === 0 ? (
                <div className="emptyBuilder">
                  <div className="emptyBuilderIcon">
                    +
                  </div>

                  <h3>
                    Start building your
                    patchnote
                  </h3>

                  <p>
                    Add a heading, text or
                    image block above.
                  </p>
                </div>
              ) : (
                <div className="blocks">
                  {form.blocks.map(
                    (block, index) => (
                      <article
                        key={block.id}
                        className="contentBlock"
                      >
                        <header className="blockHeader">
                          <div className="blockIdentity">
                            <span className="blockNumber">
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <div>
                              <strong>
                                {block.type ===
                                "heading"
                                  ? "Heading"
                                  : block.type ===
                                    "text"
                                  ? "Text Block"
                                  : "Image Block"}
                              </strong>

                              <small>
                                {block.type ===
                                "heading"
                                  ? "Section title"
                                  : block.type ===
                                    "text"
                                  ? "Article content"
                                  : "Media content"}
                              </small>
                            </div>
                          </div>

                          <div className="blockActions">
                            <button
                              title="Move up"
                              type="button"
                              disabled={
                                index === 0
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
                                form.blocks
                                  .length -
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

                        <div className="blockContent">
                          {block.type ===
                            "heading" && (
                            <input
                              className="headingInput"
                              value={
                                block.text
                              }
                              placeholder="Section heading..."
                              onChange={(
                                event
                              ) =>
                                updateBlock(
                                  block.id,
                                  {
                                    text:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                            />
                          )}

                          {block.type ===
                            "text" && (
                            <textarea
                              className="textBlockInput"
                              rows={9}
                              value={
                                block.text
                              }
                              placeholder="Write your patchnote content here..."
                              onChange={(
                                event
                              ) =>
                                updateBlock(
                                  block.id,
                                  {
                                    text:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                            />
                          )}

                          {block.type ===
                            "image" && (
                            <div className="imageEditor">
                              {block.url ? (
                                <div className="blockImagePreview">
                                  <img
                                    src={
                                      block.url
                                    }
                                    alt={
                                      block.alt ??
                                      ""
                                    }
                                  />
                                </div>
                              ) : (
                                <label className="uploadZone imageUpload">
                                  <div className="uploadIcon">
                                    ↑
                                  </div>

                                  <strong>
                                    {uploadingBlockId ===
                                    block.id
                                      ? "Uploading..."
                                      : "Upload Image"}
                                  </strong>

                                  <span>
                                    Screenshot,
                                    artwork or
                                    promotional
                                    image
                                  </span>

                                  <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    disabled={
                                      uploadingBlockId ===
                                      block.id
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      uploadBlockImage(
                                        block.id,
                                        event
                                          .target
                                          .files?.[0]
                                      )
                                    }
                                  />
                                </label>
                              )}

                              {block.url && (
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
                                        uploadBlockImage(
                                          block.id,
                                          event
                                            .target
                                            .files?.[0]
                                        )
                                      }
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    className="dangerButton"
                                    onClick={() =>
                                      updateBlock(
                                        block.id,
                                        {
                                          url: "",
                                        }
                                      )
                                    }
                                  >
                                    Remove Image
                                  </button>
                                </div>
                              )}

                              <div className="imageMetaGrid">
                                <EditorField
                                  label="Alternative Text"
                                  hint="Accessibility"
                                >
                                  <input
                                    value={
                                      block.alt ??
                                      ""
                                    }
                                    placeholder="Auros City at night"
                                    onChange={(
                                      event
                                    ) =>
                                      updateBlock(
                                        block.id,
                                        {
                                          alt:
                                            event
                                              .target
                                              .value,
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
                                      block.caption ??
                                      ""
                                    }
                                    placeholder="Auros City · Season 1"
                                    onChange={(
                                      event
                                    ) =>
                                      updateBlock(
                                        block.id,
                                        {
                                          caption:
                                            event
                                              .target
                                              .value,
                                        }
                                      )
                                    }
                                  />
                                </EditorField>
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </EditorPanel>
          </main>

          {/* RIGHT SIDEBAR */}

          <aside className="editorSidebar">
            <div className="sidebarSticky">
              {/* PUBLISH */}

              <section className="sidebarPanel">
                <div className="sidebarTitle">
                  <span>
                    PUBLISH
                  </span>

                  <strong>
                    Status
                  </strong>
                </div>

                <label className="publishControl">
                  <div>
                    <strong>
                      Publish update
                    </strong>

                    <small>
                      Visible publicly
                      on the website
                    </small>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      form.published
                    }
                    onChange={(event) =>
                      updateForm(
                        "published",
                        event.target
                          .checked
                      )
                    }
                  />
                </label>

                <div className="publishInfo">
                  <span>
                    Version
                  </span>

                  <strong>
                    {form.version ||
                      "Not set"}
                  </strong>
                </div>

                <div className="publishInfo">
                  <span>
                    Content blocks
                  </span>

                  <strong>
                    {form.blocks.length}
                  </strong>
                </div>

                <div className="publishInfo">
                  <span>
                    Cover
                  </span>

                  <strong>
                    {form.cover_url
                      ? "Added"
                      : "Missing"}
                  </strong>
                </div>
              </section>

              {/* PREVIEW */}

              <section className="previewPanel">
                <div className="previewToolbar">
                  <div>
                    <span>
                      LIVE PREVIEW
                    </span>

                    <strong>
                      Website
                    </strong>
                  </div>

                  <div className="previewMode">
                    <button
                      type="button"
                      className={
                        previewMode ===
                        "article"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setPreviewMode(
                          "article"
                        )
                      }
                    >
                      Article
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
                "article" ? (
                  <ArticlePreview
                    form={form}
                  />
                ) : (
                  <CardPreview
                    form={form}
                  />
                )}
              </section>
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .patchEditorPage {
          width: 100%;
          max-width: 1540px;
          margin: 0 auto;
          padding-bottom: 80px;
        }

        /* HEADER */

        .patchEditorHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          flex-wrap: wrap;
          margin-bottom: 26px;
        }

        .backLink {
          display: inline-block;
          margin-bottom: 21px;
          color: #8299bb;
          font-size: 12px;
          text-decoration: none;
        }

        .backLink:hover {
          color: #63ddff;
        }

        .editorEyebrow {
          color: #63ddff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }

        .patchEditorHeader h1 {
          margin: 7px 0 8px;
          font-size: clamp(
            40px,
            5vw,
            60px
          );
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .patchEditorHeader p {
          margin: 0;
          color: #8599ba;
          font-size: 14px;
        }

        .headerActions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .publishStatus {
          min-height: 44px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 15px;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.16
            );
          border-radius: 13px;
          background: rgba(
            8,
            17,
            34,
            0.88
          );
          font-size: 11px;
          font-weight: 800;
        }

        .publishStatus span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .publishStatus.published
          span {
          background: #58e0a1;
          box-shadow: 0 0 12px
            rgba(
              88,
              224,
              161,
              0.5
            );
        }

        .publishStatus.draft
          span {
          background: #8d7aaa;
        }

        .saveButton {
          min-height: 44px;
          padding: 0 19px;
          border: 0;
          border-radius: 13px;
          background: linear-gradient(
            100deg,
            #63ddff,
            #8a81ff
          );
          color: #04101a;
          font-size: 12px;
          font-weight: 950;
          cursor: pointer;
        }

        .saveButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* MAIN GRID */

        .editorLayout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(360px, 470px);
          align-items: start;
          gap: 20px;
        }

        .editorContent {
          min-width: 0;
          display: grid;
          gap: 18px;
        }

        /* PANELS */

        .editorPanel {
          overflow: hidden;
          border: 1px solid
            rgba(
              116,
              151,
              210,
              0.15
            );
          border-radius: 21px;
          background: rgba(
            8,
            17,
            34,
            0.91
          );
        }

        .editorPanelHeader {
          display: flex;
          justify-content:
            space-between;
          align-items: center;
          gap: 14px;
          padding: 18px 21px;
          border-bottom: 1px solid
            rgba(
              116,
              151,
              210,
              0.1
            );
          background: rgba(
            12,
            23,
            45,
            0.54
          );
        }

        .editorPanelTitle {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .panelNumber {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 10px;
          color: #63ddff;
          border: 1px solid
            rgba(
              99,
              221,
              255,
              0.16
            );
          background: rgba(
            99,
            221,
            255,
            0.05
          );
          font-size: 9px;
          font-weight: 900;
        }

        .editorPanelTitle h2 {
          margin: 0 0 3px;
          font-size: 16px;
        }

        .editorPanelTitle p {
          margin: 0;
          color: #6f85a7;
          font-size: 10px;
        }

        .editorPanelContent {
          padding: 21px;
        }

        /* DETAILS */

        .detailsGrid {
          display: grid;
          grid-template-columns:
            minmax(150px, 0.35fr)
            minmax(300px, 0.65fr);
          gap: 16px;
        }

        .editorField {
          position: relative;
          display: grid;
          align-content: start;
          gap: 7px;
          min-width: 0;
        }

        .editorField.wide {
          grid-column: 1 / -1;
        }

        .fieldTop {
          display: flex;
          justify-content:
            space-between;
          gap: 10px;
          align-items: center;
        }

        .fieldTop label,
        .fieldTop > span:first-child {
          color: #b4c3d9;
          font-size: 10px;
          font-weight: 850;
        }

        .fieldHint {
          color: #526987;
          font-size: 9px;
        }

        .editorField input,
        .editorField textarea,
        .headingInput,
        .textBlockInput {
          width: 100%;
          outline: none;
          color: #edf4ff;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.15
            );
          border-radius: 12px;
          background: rgba(
            4,
            11,
            24,
            0.86
          );
        }

        .editorField input {
          height: 46px;
          padding: 0 13px;
        }

        .editorField textarea {
          padding: 13px;
          resize: vertical;
          line-height: 1.6;
        }

        .editorField input:focus,
        .editorField textarea:focus,
        .headingInput:focus,
        .textBlockInput:focus {
          border-color:
            rgba(
              99,
              221,
              255,
              0.5
            );
          box-shadow: 0 0 0 3px
            rgba(
              99,
              221,
              255,
              0.05
            );
        }

        .characterCount {
          justify-self: end;
          color: #526987;
          font-size: 9px;
        }

        .slugInput {
          display: flex;
          align-items: center;
          overflow: hidden;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.15
            );
          border-radius: 12px;
          background: rgba(
            4,
            11,
            24,
            0.86
          );
        }

        .slugInput span {
          padding-left: 13px;
          color: #59708f;
          font-size: 11px;
          white-space: nowrap;
        }

        .slugInput input {
          border: 0;
          background: transparent;
        }

        .slugInput:focus-within {
          border-color:
            rgba(
              99,
              221,
              255,
              0.5
            );
          box-shadow: 0 0 0 3px
            rgba(
              99,
              221,
              255,
              0.05
            );
        }

        /* UPLOAD */

        .uploadZone {
          display: grid;
          place-items: center;
          align-content: center;
          text-align: center;
          gap: 7px;
          min-height: 180px;
          cursor: pointer;
          border: 1px dashed
            rgba(
              99,
              221,
              255,
              0.3
            );
          border-radius: 16px;
          background: rgba(
            99,
            221,
            255,
            0.025
          );
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .uploadZone:hover {
          border-color:
            rgba(
              99,
              221,
              255,
              0.5
            );
          background: rgba(
            99,
            221,
            255,
            0.05
          );
        }

        .uploadIcon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: #63ddff;
          background: rgba(
            99,
            221,
            255,
            0.08
          );
          font-size: 20px;
        }

        .uploadZone strong {
          font-size: 13px;
        }

        .uploadZone p,
        .uploadZone span {
          margin: 0;
          color: #657c9e;
          font-size: 10px;
        }

        .coverUpload {
          min-height: 225px;
        }

        .coverEditor {
          display: grid;
          gap: 12px;
        }

        .coverImage {
          position: relative;
          overflow: hidden;
          border-radius: 15px;
          background: #030812;
        }

        .coverImage img {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 8;
          object-fit: cover;
        }

        .coverOverlay {
          position: absolute;
          left: 12px;
          bottom: 12px;
          padding: 6px 9px;
          border-radius: 8px;
          color: white;
          background: rgba(
            3,
            8,
            18,
            0.7
          );
          font-size: 9px;
          font-weight: 850;
        }

        .coverControls,
        .imageActions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .secondaryButton,
        .dangerButton {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          padding: 0 12px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .secondaryButton {
          color: #d4e2f6;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.17
            );
          background: rgba(
            10,
            20,
            40,
            0.8
          );
        }

        .dangerButton {
          color: #ffadb8;
          border: 1px solid
            rgba(
              255,
              88,
              110,
              0.16
            );
          background: rgba(
            255,
            70,
            90,
            0.05
          );
        }

        /* CONTENT TOOLBAR */

        .blockCounter {
          color: #63ddff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .contentToolbar {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 9px;
          margin-bottom: 18px;
        }

        .contentToolbar button {
          min-width: 0;
          min-height: 62px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          text-align: left;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );
          border-radius: 13px;
          background: rgba(
            6,
            15,
            31,
            0.76
          );
          color: white;
          cursor: pointer;
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .contentToolbar button:hover {
          border-color:
            rgba(
              99,
              221,
              255,
              0.3
            );
          background: rgba(
            99,
            221,
            255,
            0.045
          );
        }

        .toolbarIcon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(
            99,
            221,
            255,
            0.07
          );
          color: #63ddff;
          font-size: 12px;
          font-weight: 900;
        }

        .contentToolbar strong {
          display: block;
          font-size: 11px;
        }

        .contentToolbar small {
          display: block;
          margin-top: 2px;
          color: #607797;
          font-size: 9px;
        }

        /* BLOCKS */

        .blocks {
          display: grid;
          gap: 12px;
        }

        .contentBlock {
          overflow: hidden;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.13
            );
          border-radius: 16px;
          background: rgba(
            4,
            11,
            24,
            0.56
          );
        }

        .blockHeader {
          min-height: 54px;
          display: flex;
          justify-content:
            space-between;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-bottom: 1px solid
            rgba(
              118,
              153,
              214,
              0.09
            );
          background: rgba(
            11,
            22,
            43,
            0.55
          );
        }

        .blockIdentity {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .blockNumber {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #63ddff;
          background: rgba(
            99,
            221,
            255,
            0.06
          );
          font-size: 9px;
          font-weight: 900;
        }

        .blockIdentity strong {
          display: block;
          font-size: 11px;
        }

        .blockIdentity small {
          display: block;
          margin-top: 1px;
          color: #566d8c;
          font-size: 8px;
        }

        .blockActions {
          display: flex;
          gap: 5px;
        }

        .blockActions button {
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.13
            );
          border-radius: 8px;
          color: #b9c9df;
          background: rgba(
            7,
            15,
            30,
            0.8
          );
          cursor: pointer;
        }

        .blockActions button:hover:not(
            :disabled
          ) {
          color: white;
          border-color:
            rgba(
              99,
              221,
              255,
              0.3
            );
        }

        .blockActions button:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .blockActions
          .deleteBlock {
          color: #ff9eab;
        }

        .blockContent {
          padding: 14px;
        }

        .headingInput {
          height: 49px;
          padding: 0 14px;
          font-size: 18px;
          font-weight: 800;
        }

        .textBlockInput {
          padding: 14px;
          resize: vertical;
          line-height: 1.7;
        }

        .imageEditor {
          display: grid;
          gap: 12px;
        }

        .imageUpload {
          min-height: 160px;
        }

        .blockImagePreview {
          overflow: hidden;
          border-radius: 13px;
          background: #020711;
        }

        .blockImagePreview img {
          display: block;
          width: 100%;
          max-height: 460px;
          object-fit: contain;
        }

        .imageMetaGrid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 11px;
        }

        .emptyBuilder {
          min-height: 220px;
          display: grid;
          place-items: center;
          align-content: center;
          text-align: center;
          border: 1px dashed
            rgba(
              118,
              153,
              214,
              0.13
            );
          border-radius: 15px;
          background: rgba(
            3,
            10,
            22,
            0.45
          );
        }

        .emptyBuilderIcon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          margin-bottom: 8px;
          border-radius: 12px;
          color: #63ddff;
          background: rgba(
            99,
            221,
            255,
            0.06
          );
          font-size: 20px;
        }

        .emptyBuilder h3 {
          margin: 0;
          font-size: 14px;
        }

        .emptyBuilder p {
          margin: 5px 0 0;
          color: #637a9c;
          font-size: 10px;
        }

        /* SIDEBAR */

        .editorSidebar {
          min-width: 0;
        }

        .sidebarSticky {
          position: sticky;
          top: 20px;
          display: grid;
          gap: 13px;
        }

        .sidebarPanel,
        .previewPanel {
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.15
            );
          border-radius: 19px;
          background: rgba(
            8,
            17,
            34,
            0.94
          );
        }

        .sidebarPanel {
          padding: 17px;
        }

        .sidebarTitle {
          display: flex;
          justify-content:
            space-between;
          align-items: center;
          margin-bottom: 13px;
        }

        .sidebarTitle span {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .sidebarTitle strong {
          color: #758aaa;
          font-size: 9px;
        }

        .publishControl {
          display: flex;
          justify-content:
            space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 12px;
          padding: 12px;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.1
            );
          border-radius: 12px;
          background: rgba(
            4,
            12,
            26,
            0.7
          );
          cursor: pointer;
        }

        .publishControl strong {
          display: block;
          font-size: 11px;
        }

        .publishControl small {
          display: block;
          margin-top: 2px;
          color: #617797;
          font-size: 9px;
        }

        .publishControl input {
          width: 17px;
          height: 17px;
          accent-color: #63ddff;
        }

        .publishInfo {
          display: flex;
          justify-content:
            space-between;
          gap: 12px;
          padding: 8px 2px;
          border-bottom: 1px solid
            rgba(
              118,
              153,
              214,
              0.07
            );
          font-size: 9px;
        }

        .publishInfo span {
          color: #687f9f;
        }

        .publishInfo strong {
          color: #c9d6e9;
        }

        /* PREVIEW */

        .previewPanel {
          overflow: hidden;
        }

        .previewToolbar {
          display: flex;
          align-items: center;
          justify-content:
            space-between;
          gap: 10px;
          padding: 12px 14px;
          border-bottom: 1px solid
            rgba(
              118,
              153,
              214,
              0.1
            );
        }

        .previewToolbar span {
          display: block;
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .previewToolbar strong {
          display: block;
          margin-top: 2px;
          color: #768baa;
          font-size: 8px;
        }

        .previewMode {
          display: flex;
          gap: 3px;
          padding: 3px;
          border-radius: 9px;
          background: rgba(
            4,
            11,
            24,
            0.8
          );
        }

        .previewMode button {
          padding: 6px 8px;
          border: 0;
          border-radius: 6px;
          color: #687e9d;
          background: transparent;
          font-size: 8px;
          cursor: pointer;
        }

        .previewMode button.active {
          color: white;
          background: rgba(
            99,
            221,
            255,
            0.09
          );
        }

        .articlePreview {
          max-height: 620px;
          overflow-y: auto;
        }

        .previewCover {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 8;
          object-fit: cover;
        }

        .articlePreviewContent {
          padding: 20px;
        }

        .previewVersion {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .articlePreview h2 {
          margin: 7px 0 8px;
          font-size: 27px;
          line-height: 1.05;
          letter-spacing: -0.035em;
        }

        .previewSummary {
          margin: 0;
          color: #91a4c0;
          font-size: 11px;
          line-height: 1.6;
        }

        .previewArticleBlocks {
          display: grid;
          gap: 13px;
          margin-top: 21px;
          padding-top: 18px;
          border-top: 1px solid
            rgba(
              118,
              153,
              214,
              0.09
            );
        }

        .previewArticleBlocks h3 {
          margin: 7px 0 0;
          font-size: 18px;
        }

        .previewArticleBlocks p {
          margin: 0;
          color: #bdcce1;
          font-size: 11px;
          line-height: 1.75;
          white-space: pre-wrap;
        }

        .previewArticleBlocks figure {
          margin: 5px 0;
        }

        .previewArticleBlocks figure img {
          display: block;
          width: 100%;
          border-radius: 10px;
        }

        .previewArticleBlocks figcaption {
          margin-top: 5px;
          color: #647999;
          font-size: 8px;
        }

        .cardPreview {
          margin: 15px;
          overflow: hidden;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.13
            );
          border-radius: 15px;
          background: rgba(
            4,
            12,
            26,
            0.7
          );
        }

        .cardPreview img {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
        }

        .cardPreviewContent {
          padding: 15px;
        }

        .cardPreviewContent h3 {
          margin: 5px 0 7px;
          font-size: 17px;
        }

        .cardPreviewContent p {
          margin: 0;
          color: #8296b5;
          font-size: 10px;
          line-height: 1.55;
        }

        /* MESSAGES */

        .editorMessage {
          margin-bottom: 18px;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 11px;
        }

        .editorMessage.error {
          color: #ffb4bf;
          border: 1px solid
            rgba(
              255,
              80,
              100,
              0.17
            );
          background: rgba(
            255,
            70,
            90,
            0.06
          );
        }

        .editorMessage.success {
          color: #a8f3d0;
          border: 1px solid
            rgba(
              65,
              220,
              150,
              0.17
            );
          background: rgba(
            55,
            210,
            145,
            0.06
          );
        }

        .patchEditorLoading {
          max-width: 900px;
          margin: 40px auto;
          padding: 30px;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.16
            );
          border-radius: 20px;
          background: rgba(
            8,
            17,
            34,
            0.92
          );
        }

        /* RESPONSIVE */

        @media (max-width: 1150px) {
          .editorLayout {
            grid-template-columns:
              1fr;
          }

          .sidebarSticky {
            position: static;
          }

          .editorSidebar {
            display: grid;
          }

          .articlePreview {
            max-height: none;
          }
        }

        @media (max-width: 720px) {
          .detailsGrid,
          .imageMetaGrid,
          .contentToolbar {
            grid-template-columns:
              1fr;
          }

          .editorField.wide {
            grid-column: auto;
          }

          .editorPanelHeader {
            align-items:
              flex-start;
          }

          .patchEditorHeader {
            align-items:
              flex-start;
          }

          .headerActions {
            width: 100%;
          }

          .saveButton {
            flex: 1;
          }

          .blockHeader {
            align-items:
              flex-start;
            flex-direction:
              column;
          }

          .blockActions {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

/* =========================================================
   COMPONENTS
   ========================================================= */

function EditorPanel({
  number,
  title,
  description,
  right,
  children,
}: {
  number: string;
  title: string;
  description: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="editorPanel">
      <header className="editorPanelHeader">
        <div className="editorPanelTitle">
          <span className="panelNumber">
            {number}
          </span>

          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>

        {right}
      </header>

      <div className="editorPanelContent">
        {children}
      </div>
    </section>
  );
}

function EditorField({
  label,
  hint,
  wide = false,
  children,
}: {
  label: string;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        wide
          ? "editorField wide"
          : "editorField"
      }
    >
      <div className="fieldTop">
        <span>{label}</span>

        {hint && (
          <span className="fieldHint">
            {hint}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

function ArticlePreview({
  form,
}: {
  form: PatchnoteEditorForm;
}) {
  return (
    <article className="articlePreview">
      {form.cover_url && (
        <img
          className="previewCover"
          src={form.cover_url}
          alt=""
        />
      )}

      <div className="articlePreviewContent">
        <div className="previewVersion">
          VERSION{" "}
          {form.version || "X.X.X"}
        </div>

        <h2>
          {form.title ||
            "Patchnote Title"}
        </h2>

        {form.summary && (
          <p className="previewSummary">
            {form.summary}
          </p>
        )}

        <div className="previewArticleBlocks">
          {form.blocks.map((block) => {
            if (
              block.type === "heading"
            ) {
              return (
                <h3 key={block.id}>
                  {block.text ||
                    "Section Heading"}
                </h3>
              );
            }

            if (
              block.type === "text"
            ) {
              return (
                <p key={block.id}>
                  {block.text ||
                    "Your text will appear here."}
                </p>
              );
            }

            if (!block.url) {
              return null;
            }

            return (
              <figure key={block.id}>
                <img
                  src={block.url}
                  alt={block.alt ?? ""}
                />

                {block.caption && (
                  <figcaption>
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function CardPreview({
  form,
}: {
  form: PatchnoteEditorForm;
}) {
  return (
    <article className="cardPreview">
      {form.cover_url && (
        <img
          src={form.cover_url}
          alt=""
        />
      )}

      <div className="cardPreviewContent">
        <div className="previewVersion">
          VERSION{" "}
          {form.version || "X.X.X"}
        </div>

        <h3>
          {form.title ||
            "Patchnote Title"}
        </h3>

        <p>
          {form.summary ||
            "Your patchnote summary will appear here."}
        </p>
      </div>
    </article>
  );
}