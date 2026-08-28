"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  createGalleryItem,
  getAdminGalleryById,
  updateGalleryItem,
  uploadGalleryImage,
} from "../../services/gallery-admin.service";

import {
  emptyGalleryEditorForm,
} from "../../types/community";

import type {
  GalleryEditorForm,
} from "../../types/community";

const CATEGORY_PRESETS = [
  "Season 1",
  "POIs",
  "Gameplay",
  "Development",
  "Events",
  "Story",
  "Promotional",
];

export default function GalleryEditor({
  galleryId,
}: {
  galleryId?: string;
}) {
  const [
    form,
    setForm,
  ] =
    useState<GalleryEditorForm>(
      emptyGalleryEditorForm
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      !!galleryId
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(null);

  useEffect(() => {
    if (!galleryId) {
      return;
    }

    getAdminGalleryById(
      galleryId
    )
      .then(
        (item) => {
          if (!item) {
            setError(
              "Gallery item not found."
            );

            return;
          }

          setForm({
            title:
              item.title,

            image_url:
              item.image_url,

            category:
              item.category ??
              "",

            description:
              item.description ??
              "",

            featured:
              item.featured,

            published:
              item.published,
          });
        }
      )
      .catch(
        (err) => {
          setError(
            err?.message ||
              "Could not load gallery item."
          );
        }
      )
      .finally(
        () =>
          setLoading(
            false
          )
      );
  }, [
    galleryId,
  ]);

  function update<
    K extends keyof GalleryEditorForm
  >(
    key: K,
    value: GalleryEditorForm[K]
  ) {
    setForm(
      (previous) => ({
        ...previous,
        [key]:
          value,
      })
    );
  }

  async function upload(
    file?: File
  ) {
    if (!file) {
      return;
    }

    try {
      setUploading(
        true
      );

      setError(null);

      const url =
        await uploadGalleryImage(
          file
        );

      update(
        "image_url",
        url
      );
    } catch (
      err: any
    ) {
      setError(
        err?.message ||
          "Image upload failed."
      );
    } finally {
      setUploading(
        false
      );
    }
  }

  async function save() {
    setError(null);
    setSuccess(null);

    if (
      !form.title.trim()
    ) {
      setError(
        "Please enter a title."
      );

      return;
    }

    if (
      !form.image_url.trim()
    ) {
      setError(
        "Please upload an image."
      );

      return;
    }

    try {
      setSaving(true);

      if (
        galleryId
      ) {
        await updateGalleryItem(
          galleryId,
          form
        );

        setSuccess(
          "Gallery item saved."
        );
      } else {
        await createGalleryItem(
          form
        );

        window.location.href =
          "/admin/gallery";
      }
    } catch (
      err: any
    ) {
      setError(
        err?.message ||
          "Could not save gallery item."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="galleryEditorLoading">
        Loading Gallery Editor...
      </div>
    );
  }

  return (
    <>
      <div className="galleryEditorPage">
        <header className="galleryEditorHeader">
          <div>
            <Link
              href="/admin/gallery"
              className="galleryEditorBack"
            >
              ← Gallery
            </Link>

            <div className="galleryEditorEyebrow">
              AUROS MEDIA
            </div>

            <h1>
              {galleryId
                ? "Edit Image"
                : "Add Gallery Image"}
            </h1>

            <p>
              Add screenshots, promotional
              artwork and moments from Auros.
            </p>
          </div>

          <button
            type="button"
            className="galleryEditorSave"
            disabled={
              saving
            }
            onClick={save}
          >
            {saving
              ? "Saving..."
              : galleryId
              ? "Save Changes"
              : "Add to Gallery"}
          </button>
        </header>

        {error && (
          <div className="galleryEditorMessage error">
            {error}
          </div>
        )}

        {success && (
          <div className="galleryEditorMessage success">
            {success}
          </div>
        )}

        <div className="galleryEditorGrid">
          <main className="galleryEditorMain">
            {/* IMAGE */}

            <section className="galleryEditorPanel">
              <PanelHeader
                number="01"
                title="Image"
                description="Main gallery media."
              />

              <div className="galleryEditorPanelContent">
                {form.image_url ? (
                  <div className="galleryImageEditor">
                    <img
                      src={
                        form.image_url
                      }
                      alt=""
                    />

                    <div className="galleryImageActions">
                      <label className="gallerySecondaryButton">
                        Replace Image

                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(
                            event
                          ) =>
                            upload(
                              event
                                .target
                                .files?.[0]
                            )
                          }
                        />
                      </label>

                      <button
                        type="button"
                        className="galleryDangerButton"
                        onClick={() =>
                          update(
                            "image_url",
                            ""
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="galleryUploadZone">
                    <div className="galleryUploadIcon">
                      ↑
                    </div>

                    <strong>
                      {uploading
                        ? "Uploading..."
                        : "Upload Gallery Image"}
                    </strong>

                    <p>
                      PNG, JPG or WEBP ·
                      Maximum 15 MB
                    </p>

                    <span>
                      Landscape images work
                      best.
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
                        upload(
                          event
                            .target
                            .files?.[0]
                        )
                      }
                    />
                  </label>
                )}
              </div>
            </section>

            {/* DETAILS */}

            <section className="galleryEditorPanel">
              <PanelHeader
                number="02"
                title="Image Details"
                description="Information shown in the gallery."
              />

              <div className="galleryEditorPanelContent details">
                <label className="galleryField">
                  <span>
                    Title
                  </span>

                  <input
                    value={
                      form.title
                    }
                    placeholder="Auros City at Night"
                    onChange={(
                      event
                    ) =>
                      update(
                        "title",
                        event
                          .target
                          .value
                      )
                    }
                  />
                </label>

                <label className="galleryField">
                  <span>
                    Category
                  </span>

                  <input
                    list="gallery-categories"
                    value={
                      form.category
                    }
                    placeholder="Season 1"
                    onChange={(
                      event
                    ) =>
                      update(
                        "category",
                        event
                          .target
                          .value
                      )
                    }
                  />

                  <datalist id="gallery-categories">
                    {CATEGORY_PRESETS.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        />
                      )
                    )}
                  </datalist>
                </label>

                <label className="galleryField full">
                  <span>
                    Description
                  </span>

                  <textarea
                    rows={6}
                    maxLength={500}
                    value={
                      form.description
                    }
                    placeholder="Describe this image..."
                    onChange={(
                      event
                    ) =>
                      update(
                        "description",
                        event
                          .target
                          .value
                      )
                    }
                  />

                  <small>
                    {
                      form
                        .description
                        .length
                    }
                    /500
                  </small>
                </label>
              </div>
            </section>
          </main>

          {/* SIDEBAR */}

          <aside className="galleryEditorSidebar">
            <section className="gallerySettingsPanel">
              <div className="gallerySettingsTitle">
                PUBLISH
              </div>

              <label className="galleryToggle">
                <div>
                  <strong>
                    Published
                  </strong>

                  <small>
                    Visible in the
                    public gallery
                  </small>
                </div>

                <input
                  type="checkbox"
                  checked={
                    form.published
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "published",
                      event
                        .target
                        .checked
                    )
                  }
                />
              </label>

              <label className="galleryToggle">
                <div>
                  <strong>
                    Featured
                  </strong>

                  <small>
                    Prioritize this
                    image
                  </small>
                </div>

                <input
                  type="checkbox"
                  checked={
                    form.featured
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "featured",
                      event
                        .target
                        .checked
                    )
                  }
                />
              </label>
            </section>

            <section className="galleryPreviewPanel">
              <div className="galleryPreviewLabel">
                LIVE PREVIEW
              </div>

              {form.image_url ? (
                <img
                  src={
                    form.image_url
                  }
                  alt=""
                />
              ) : (
                <div className="galleryPreviewPlaceholder">
                  IMAGE PREVIEW
                </div>
              )}

              <div className="galleryPreviewContent">
                <div className="galleryPreviewCategory">
                  {form.category ||
                    "CATEGORY"}
                </div>

                <h2>
                  {form.title ||
                    "Gallery Image"}
                </h2>

                <p>
                  {form.description ||
                    "Your image description will appear here."}
                </p>

                <div className="galleryPreviewBadges">
                  {form.featured && (
                    <span>
                      FEATURED
                    </span>
                  )}

                  <span>
                    {form.published
                      ? "PUBLISHED"
                      : "DRAFT"}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .galleryEditorPage {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .galleryEditorHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .galleryEditorBack {
          display: inline-block;
          margin-bottom: 18px;
          color: #8198ba;
          font-size: 12px;
          text-decoration: none;
        }

        .galleryEditorEyebrow {
          color: #63ddff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .galleryEditorHeader h1 {
          margin: 7px 0;
          font-size: clamp(
            40px,
            6vw,
            58px
          );
          letter-spacing: -0.045em;
        }

        .galleryEditorHeader p {
          margin: 0;
          color: #879bb9;
        }

        .galleryEditorSave {
          min-height: 44px;
          padding: 0 18px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(
            95deg,
            #63ddff,
            #8b81ff
          );
          color: #04101a;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .galleryEditorGrid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(320px, 420px);
          gap: 18px;
          align-items: start;
        }

        .galleryEditorMain {
          display: grid;
          gap: 16px;
          min-width: 0;
        }

        .galleryEditorPanel,
        .gallerySettingsPanel,
        .galleryPreviewPanel {
          overflow: hidden;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );
          border-radius: 19px;
          background: rgba(
            8,
            17,
            34,
            0.92
          );
        }

        .galleryPanelHeader {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 16px 18px;
          border-bottom: 1px solid
            rgba(
              118,
              153,
              214,
              0.09
            );
        }

        .galleryPanelNumber {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 9px;
          background: rgba(
            99,
            221,
            255,
            0.06
          );
          color: #63ddff;
          font-size: 9px;
          font-weight: 900;
        }

        .galleryPanelHeader h2 {
          margin: 0;
          font-size: 15px;
        }

        .galleryPanelHeader p {
          margin: 2px 0 0;
          color: #637898;
          font-size: 9px;
        }

        .galleryEditorPanelContent {
          padding: 18px;
        }

        .galleryEditorPanelContent.details {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 14px;
        }

        .galleryField {
          min-width: 0;
          display: grid;
          gap: 7px;
        }

        .galleryField.full {
          grid-column: 1 / -1;
        }

        .galleryField > span {
          color: #aebed6;
          font-size: 10px;
          font-weight: 800;
        }

        .galleryField input,
        .galleryField textarea {
          width: 100%;
          padding: 12px;
          outline: none;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );
          border-radius: 11px;
          background: rgba(
            4,
            12,
            26,
            0.86
          );
          color: white;
        }

        .galleryField textarea {
          resize: vertical;
          line-height: 1.65;
        }

        .galleryField small {
          justify-self: end;
          color: #576e8e;
          font-size: 8px;
        }

        .galleryUploadZone {
          min-height: 260px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 7px;
          text-align: center;
          border: 1px dashed
            rgba(
              99,
              221,
              255,
              0.3
            );
          border-radius: 15px;
          background: rgba(
            99,
            221,
            255,
            0.025
          );
          cursor: pointer;
        }

        .galleryUploadIcon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(
            99,
            221,
            255,
            0.07
          );
          color: #63ddff;
          font-size: 21px;
        }

        .galleryUploadZone strong {
          font-size: 13px;
        }

        .galleryUploadZone p,
        .galleryUploadZone span {
          margin: 0;
          color: #687e9e;
          font-size: 9px;
        }

        .galleryImageEditor {
          display: grid;
          gap: 10px;
        }

        .galleryImageEditor img {
          display: block;
          width: 100%;
          max-height: 520px;
          object-fit: contain;
          border-radius: 13px;
          background: #030812;
        }

        .galleryImageActions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .gallerySecondaryButton,
        .galleryDangerButton {
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          padding: 0 11px;
          border-radius: 9px;
          font-size: 9px;
          cursor: pointer;
        }

        .gallerySecondaryButton {
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.15
            );
          background: rgba(
            10,
            20,
            40,
            0.8
          );
          color: #d0def1;
        }

        .galleryDangerButton {
          border: 1px solid
            rgba(
              255,
              80,
              100,
              0.16
            );
          background: rgba(
            255,
            70,
            90,
            0.05
          );
          color: #ffabb7;
        }

        .galleryEditorSidebar {
          position: sticky;
          top: 18px;
          display: grid;
          gap: 12px;
        }

        .gallerySettingsPanel {
          padding: 16px;
        }

        .gallerySettingsTitle {
          margin-bottom: 11px;
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .galleryToggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 11px;
          margin-top: 7px;
          border: 1px solid
            rgba(
              118,
              153,
              214,
              0.1
            );
          border-radius: 11px;
          background: rgba(
            4,
            12,
            26,
            0.65
          );
          cursor: pointer;
        }

        .galleryToggle strong {
          display: block;
          font-size: 10px;
        }

        .galleryToggle small {
          display: block;
          margin-top: 2px;
          color: #617695;
          font-size: 8px;
        }

        .galleryToggle input {
          accent-color: #63ddff;
        }

        .galleryPreviewLabel {
          padding: 12px 14px;
          border-bottom: 1px solid
            rgba(
              118,
              153,
              214,
              0.09
            );
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .galleryPreviewPanel > img {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 10;
          object-fit: cover;
        }

        .galleryPreviewPlaceholder {
          aspect-ratio: 16 / 10;
          display: grid;
          place-items: center;
          background: #050d1b;
          color: #4d6586;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .galleryPreviewContent {
          padding: 15px;
        }

        .galleryPreviewCategory {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.09em;
        }

        .galleryPreviewContent h2 {
          margin: 6px 0;
          font-size: 19px;
        }

        .galleryPreviewContent p {
          margin: 0;
          color: #879bb9;
          font-size: 10px;
          line-height: 1.6;
        }

        .galleryPreviewBadges {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .galleryPreviewBadges span {
          padding: 5px 7px;
          border-radius: 999px;
          background: rgba(
            99,
            221,
            255,
            0.06
          );
          color: #8fdff6;
          font-size: 7px;
          font-weight: 900;
        }

        .galleryEditorMessage,
        .galleryEditorLoading {
          margin-bottom: 14px;
          padding: 12px;
          border-radius: 10px;
          font-size: 10px;
        }

        .galleryEditorMessage.error {
          color: #ffb1bc;
          background: rgba(
            255,
            70,
            90,
            0.06
          );
        }

        .galleryEditorMessage.success {
          color: #a6f1cd;
          background: rgba(
            60,
            215,
            150,
            0.06
          );
        }

        @media (max-width: 1000px) {
          .galleryEditorGrid {
            grid-template-columns:
              1fr;
          }

          .galleryEditorSidebar {
            position: static;
          }
        }

        @media (max-width: 650px) {
          .galleryEditorPanelContent.details {
            grid-template-columns:
              1fr;
          }

          .galleryField.full {
            grid-column: auto;
          }
        }
      `}</style>
    </>
  );
}

function PanelHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <header className="galleryPanelHeader">
      <span className="galleryPanelNumber">
        {number}
      </span>

      <div>
        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>
      </div>
    </header>
  );
}