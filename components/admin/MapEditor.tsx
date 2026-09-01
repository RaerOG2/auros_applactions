"use client";

import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import type {
  MapEditorForm,
} from "../../types/maps";

import {
  uploadMapImage,
} from "../../services/map-admin.service";

interface MapEditorProps {
  initialValue: MapEditorForm;

  mode: "create" | "edit";

  onSave: (
    form: MapEditorForm
  ) => Promise<void>;
}

export default function MapEditor({
  initialValue,
  mode,
  onSave,
}: MapEditorProps) {
  const [form, setForm] =
    useState<MapEditorForm>(
      initialValue
    );

  const [saving, setSaving] =
    useState(false);

  const [uploadingMap, setUploadingMap] =
    useState(false);

  const [
    uploadingThumbnail,
    setUploadingThumbnail,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const mapInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const thumbnailInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  function updateField<
    K extends keyof MapEditorForm
  >(
    key: K,
    value: MapEditorForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleDevOnlyChange(
    checked: boolean
  ) {
    setForm((current) => ({
      ...current,

      dev_only:
        checked,

      /*
       * DEV maps must never become
       * the public Current map.
       */
      current:
        checked
          ? false
          : current.current,
    }));
  }

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>,
    type: "map" | "thumbnail"
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    try {
      if (type === "map") {
        setUploadingMap(true);
      } else {
        setUploadingThumbnail(true);
      }

      const url =
        await uploadMapImage(
          file,
          type
        );

      if (type === "map") {
        updateField(
          "image_url",
          url
        );

        if (!form.thumbnail_url) {
          updateField(
            "thumbnail_url",
            url
          );
        }
      } else {
        updateField(
          "thumbnail_url",
          url
        );
      }
    } catch (uploadError) {
      console.error(
        uploadError
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed."
      );
    } finally {
      setUploadingMap(false);
      setUploadingThumbnail(false);

      event.target.value = "";
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError(
        "Please enter a map name."
      );

      return;
    }

    if (!form.image_url.trim()) {
      setError(
        "Please upload a map image."
      );

      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(
        form
      );
    } catch (saveError) {
      console.error(
        saveError
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Saving failed."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mapEditor">
        <div className="mapEditorHeader">
          <div>
            <span className="mapEditorEyebrow">
              AUROS WORLD CMS
            </span>

            <h1>
              {mode === "create"
                ? "Create Map"
                : "Edit Map"}
            </h1>

            <p>
              Configure a map version for
              the Auros Interactive Map
              Archive.
            </p>
          </div>

          <button
            type="button"
            className="mapSaveButton"
            onClick={
              handleSave
            }
            disabled={
              saving ||
              uploadingMap ||
              uploadingThumbnail
            }
          >
            {saving
              ? "Saving..."
              : mode === "create"
              ? "Create Map"
              : "Save Changes"}
          </button>
        </div>

        {error && (
          <div className="mapEditorError">
            {error}
          </div>
        )}

        <div className="mapEditorLayout">
          <div className="mapEditorMain">
            <section className="mapEditorSection">
              <div className="mapSectionTitle">
                <span>
                  01
                </span>

                <div>
                  <h2>
                    Map Image
                  </h2>

                  <p>
                    Upload the full
                    resolution map used by
                    the interactive viewer.
                  </p>
                </div>
              </div>

              <input
                ref={
                  mapInputRef
                }
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(event) =>
                  handleImageUpload(
                    event,
                    "map"
                  )
                }
              />

              {form.image_url ? (
                <div className="mapImagePreview">
                  <img
                    src={
                      form.image_url
                    }
                    alt="Map preview"
                  />

                  <div className="mapImagePreviewBar">
                    <div>
                      <strong>
                        Main Map
                      </strong>

                      <span>
                        Ready for viewer
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        mapInputRef.current?.click()
                      }
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="mapUploadArea"
                  onClick={() =>
                    mapInputRef.current?.click()
                  }
                >
                  <span className="mapUploadIcon">
                    +
                  </span>

                  <strong>
                    {uploadingMap
                      ? "Uploading..."
                      : "Upload Map Image"}
                  </strong>

                  <small>
                    PNG, JPG or WebP · up to
                    25 MB
                  </small>
                </button>
              )}
            </section>

            <section className="mapEditorSection">
              <div className="mapSectionTitle">
                <span>
                  02
                </span>

                <div>
                  <h2>
                    Map Information
                  </h2>

                  <p>
                    Define how this version
                    appears throughout the
                    archive.
                  </p>
                </div>
              </div>

              <div className="mapFormGrid">
                <label className="mapField mapFieldWide">
                  <span>
                    Map Name *
                  </span>

                  <input
                    value={
                      form.name
                    }
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Genesis Island"
                  />
                </label>

                <label className="mapField">
                  <span>
                    Venture
                  </span>

                  <input
                    value={
                      form.venture_name
                    }
                    onChange={(event) =>
                      updateField(
                        "venture_name",
                        event.target.value
                      )
                    }
                    placeholder="Venture 1"
                  />
                </label>

                <label className="mapField">
                  <span>
                    Season Name
                  </span>

                  <input
                    value={
                      form.season_name
                    }
                    onChange={(event) =>
                      updateField(
                        "season_name",
                        event.target.value
                      )
                    }
                    placeholder="Genesis"
                  />
                </label>

                <label className="mapField">
                  <span>
                    Season Number
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.season_number
                    }
                    onChange={(event) =>
                      updateField(
                        "season_number",
                        event.target.value
                      )
                    }
                    placeholder="1"
                  />
                </label>

                <label className="mapField">
                  <span>
                    Map Version
                  </span>

                  <input
                    value={
                      form.version
                    }
                    onChange={(event) =>
                      updateField(
                        "version",
                        event.target.value
                      )
                    }
                    placeholder="Launch"
                  />
                </label>

                <label className="mapField">
                  <span>
                    Release Date
                  </span>

                  <input
                    type="date"
                    value={
                      form.release_date
                    }
                    onChange={(event) =>
                      updateField(
                        "release_date",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="mapField">
                  <span>
                    Sort Order
                  </span>

                  <input
                    type="number"
                    value={
                      form.sort_order
                    }
                    onChange={(event) =>
                      updateField(
                        "sort_order",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="mapField mapFieldWide">
                  <span>
                    Description
                  </span>

                  <textarea
                    rows={6}
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Describe this version of the Auros island..."
                  />
                </label>
              </div>
            </section>

            <section className="mapEditorSection">
              <div className="mapSectionTitle">
                <span>
                  03
                </span>

                <div>
                  <h2>
                    Thumbnail
                  </h2>

                  <p>
                    Used in map selectors
                    and the historical
                    archive.
                  </p>
                </div>
              </div>

              <input
                ref={
                  thumbnailInputRef
                }
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(event) =>
                  handleImageUpload(
                    event,
                    "thumbnail"
                  )
                }
              />

              <div className="thumbnailEditor">
                {form.thumbnail_url && (
                  <img
                    src={
                      form.thumbnail_url
                    }
                    alt="Thumbnail"
                  />
                )}

                <div>
                  <strong>
                    Archive Thumbnail
                  </strong>

                  <p>
                    You can use a separate
                    crop or simply keep the
                    main map image.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      thumbnailInputRef.current?.click()
                    }
                  >
                    {uploadingThumbnail
                      ? "Uploading..."
                      : form.thumbnail_url
                      ? "Replace Thumbnail"
                      : "Upload Thumbnail"}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <aside className="mapEditorSidebar">
            <section className="mapEditorSection">
              <div className="mapSectionTitle compact">
                <div>
                  <h2>
                    Publication
                  </h2>
                </div>
              </div>

              <label className="mapToggle">
                <div>
                  <strong>
                    Published
                  </strong>

                  <span>
                    {form.dev_only
                      ? "Available to admins in DEV Map mode."
                      : "Visible on the public website."}
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={
                    form.published
                  }
                  onChange={(event) =>
                    updateField(
                      "published",
                      event.target.checked
                    )
                  }
                />
              </label>

              <label
                className={
                  form.dev_only
                    ? "mapToggle devToggle active"
                    : "mapToggle devToggle"
                }
              >
                <div>
                  <strong>
                    Development Map
                  </strong>

                  <span>
                    Admin only. Hidden from
                    public visitors.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={
                    form.dev_only
                  }
                  onChange={(event) =>
                    handleDevOnlyChange(
                      event.target.checked
                    )
                  }
                />
              </label>

              <label
                className={
                  form.dev_only
                    ? "mapToggle disabled"
                    : "mapToggle"
                }
              >
                <div>
                  <strong>
                    Current Map
                  </strong>

                  <span>
                    {form.dev_only
                      ? "DEV maps cannot be the public Current Map."
                      : "Mark this as the active Auros island."}
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={
                    form.current
                  }
                  disabled={
                    form.dev_only
                  }
                  onChange={(event) =>
                    updateField(
                      "current",
                      event.target.checked
                    )
                  }
                />
              </label>

              {form.dev_only && (
                <div className="devMapWarning">
                  <span>
                    DEV MAP
                  </span>

                  <strong>
                    Admin Only
                  </strong>

                  <p>
                    This map will not be
                    shown to normal visitors.
                    You can prepare and test
                    it before making it
                    public.
                  </p>
                </div>
              )}
            </section>

            <section className="mapEditorSection mapArchivePreview">
              <span className="previewLabel">
                ARCHIVE PREVIEW
              </span>

              {form.thumbnail_url ||
              form.image_url ? (
                <img
                  src={
                    form.thumbnail_url ||
                    form.image_url
                  }
                  alt=""
                />
              ) : (
                <div className="previewPlaceholder">
                  No map image
                </div>
              )}

              <div className="previewContent">
                <div className="previewTags">
                  {form.dev_only && (
                    <span className="devTag">
                      DEV ONLY
                    </span>
                  )}

                  {form.current &&
                    !form.dev_only && (
                      <span className="currentTag">
                        CURRENT
                      </span>
                    )}

                  {form.venture_name && (
                    <span>
                      {
                        form.venture_name
                      }
                    </span>
                  )}
                </div>

                <h3>
                  {form.name ||
                    "Untitled Map"}
                </h3>

                <p>
                  {[
                    form.season_number
                      ? `Season ${form.season_number}`
                      : null,

                    form.season_name ||
                      null,

                    form.version ||
                      null,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      " · "
                    ) ||
                    "No season information"}
                </p>
              </div>
            </section>

            <div
              className={
                form.dev_only
                  ? "mapEditorStatusNotice dev"
                  : "mapEditorStatusNotice"
              }
            >
              <span>
                {form.dev_only
                  ? "DEVELOPMENT MODE"
                  : "MAP STATUS"}
              </span>

              <strong>
                {form.dev_only
                  ? "Private Map Testing"
                  : form.published
                  ? "Public Map"
                  : "Draft Map"}
              </strong>

              <p>
                {form.dev_only
                  ? "This map is reserved for administrators and can be prepared before its public release."
                  : form.published
                  ? "This map is available through the public Interactive Map."
                  : "This map is currently unpublished and hidden from visitors."}
              </p>
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .mapEditor {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 30px;
        }

        .mapEditorHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 25px;
        }

        .mapEditorEyebrow {
          color: #63ddff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.13em;
        }

        .mapEditorHeader h1 {
          margin: 7px 0;
          font-size: 34px;
          letter-spacing: -0.035em;
        }

        .mapEditorHeader p {
          margin: 0;
          color: #8195b3;
          font-size: 12px;
        }

        .mapSaveButton {
          min-height: 42px;
          padding: 0 18px;
          border: 1px solid rgba(99, 221, 255, 0.3);
          border-radius: 10px;
          background: #63ddff;
          color: #04101c;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        .mapSaveButton:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .mapEditorError {
          margin-bottom: 17px;
          padding: 12px 14px;
          border: 1px solid rgba(255, 94, 110, 0.25);
          border-radius: 10px;
          background: rgba(120, 20, 34, 0.15);
          color: #ff9aa5;
          font-size: 10px;
        }

        .mapEditorLayout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            330px;
          gap: 18px;
          align-items: start;
        }

        .mapEditorMain {
          display: grid;
          gap: 16px;
        }

        .mapEditorSidebar {
          display: grid;
          gap: 16px;
          position: sticky;
          top: 20px;
        }

        .mapEditorSection {
          padding: 20px;
          border: 1px solid rgba(113, 149, 207, 0.12);
          border-radius: 16px;
          background: rgba(7, 16, 32, 0.76);
        }

        .mapSectionTitle {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 17px;
        }

        .mapSectionTitle > span {
          display: grid;
          width: 28px;
          height: 28px;
          place-items: center;
          flex-shrink: 0;
          border-radius: 8px;
          background: rgba(99, 221, 255, 0.08);
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
        }

        .mapSectionTitle h2 {
          margin: 0;
          font-size: 15px;
        }

        .mapSectionTitle p {
          margin: 4px 0 0;
          color: #7489a8;
          font-size: 9px;
          line-height: 1.5;
        }

        .mapSectionTitle.compact {
          margin-bottom: 7px;
        }

        .mapImagePreview {
          overflow: hidden;
          border: 1px solid rgba(113, 149, 207, 0.12);
          border-radius: 14px;
          background: #020710;
        }

        .mapImagePreview > img {
          display: block;
          width: 100%;
          max-height: 600px;
          object-fit: contain;
        }

        .mapImagePreviewBar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 12px;
          border-top: 1px solid rgba(113, 149, 207, 0.1);
        }

        .mapImagePreviewBar > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mapImagePreviewBar strong {
          font-size: 10px;
        }

        .mapImagePreviewBar span {
          color: #667c9c;
          font-size: 8px;
        }

        .mapImagePreviewBar button,
        .thumbnailEditor button {
          min-height: 34px;
          padding: 0 12px;
          border: 1px solid rgba(99, 221, 255, 0.2);
          border-radius: 8px;
          background: rgba(99, 221, 255, 0.07);
          color: #9cecff;
          font-size: 9px;
          font-weight: 800;
          cursor: pointer;
        }

        .mapUploadArea {
          width: 100%;
          min-height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px dashed rgba(99, 221, 255, 0.22);
          border-radius: 14px;
          background: rgba(6, 15, 30, 0.56);
          color: white;
          cursor: pointer;
        }

        .mapUploadArea:hover {
          border-color: rgba(99, 221, 255, 0.4);
          background: rgba(9, 22, 41, 0.7);
        }

        .mapUploadIcon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(99, 221, 255, 0.1);
          color: #63ddff;
          font-size: 20px;
        }

        .mapUploadArea strong {
          font-size: 11px;
        }

        .mapUploadArea small {
          color: #627898;
          font-size: 8px;
        }

        .mapFormGrid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );
          gap: 13px;
        }

        .mapField {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mapFieldWide {
          grid-column: 1 / -1;
        }

        .mapField > span {
          color: #9aadca;
          font-size: 8px;
          font-weight: 800;
        }

        .mapField input,
        .mapField textarea {
          width: 100%;
          border: 1px solid rgba(113, 149, 207, 0.14);
          border-radius: 9px;
          outline: none;
          background: rgba(4, 11, 24, 0.75);
          color: white;
          font: inherit;
          font-size: 10px;
        }

        .mapField input {
          min-height: 40px;
          padding: 0 11px;
        }

        .mapField textarea {
          resize: vertical;
          padding: 11px;
          line-height: 1.6;
        }

        .mapField input:focus,
        .mapField textarea:focus {
          border-color: rgba(99, 221, 255, 0.34);
        }

        .thumbnailEditor {
          display: grid;
          grid-template-columns:
            180px
            1fr;
          gap: 15px;
          align-items: center;
        }

        .thumbnailEditor > img {
          width: 100%;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          border-radius: 10px;
          background: #020710;
        }

        .thumbnailEditor strong {
          font-size: 11px;
        }

        .thumbnailEditor p {
          max-width: 450px;
          margin: 5px 0 10px;
          color: #7186a4;
          font-size: 9px;
          line-height: 1.5;
        }

        .mapToggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 13px 0;
          border-bottom: 1px solid rgba(113, 149, 207, 0.08);
          cursor: pointer;
        }

        .mapToggle:last-of-type {
          border-bottom: none;
        }

        .mapToggle > div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .mapToggle strong {
          font-size: 10px;
        }

        .mapToggle span {
          max-width: 225px;
          color: #6f84a2;
          font-size: 8px;
          line-height: 1.45;
        }

        .mapToggle input {
          width: 17px;
          height: 17px;
          flex-shrink: 0;
          accent-color: #63ddff;
        }

        .mapToggle.disabled {
          opacity: 0.48;
          cursor: not-allowed;
        }

        .mapToggle.disabled input {
          cursor: not-allowed;
        }

        .mapToggle.devToggle.active strong {
          color: #c5b4ff;
        }

        .mapToggle.devToggle input {
          accent-color: #ab87ff;
        }

        .devMapWarning {
          margin-top: 12px;
          padding: 12px;
          border: 1px solid rgba(171, 135, 255, 0.2);
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              rgba(171, 135, 255, 0.1),
              rgba(76, 55, 140, 0.04)
            );
        }

        .devMapWarning > span {
          color: #ab87ff;
          font-size: 7px;
          font-weight: 950;
          letter-spacing: 0.11em;
        }

        .devMapWarning strong {
          display: block;
          margin-top: 4px;
          color: #d1c4ff;
          font-size: 11px;
        }

        .devMapWarning p {
          margin: 5px 0 0;
          color: #8275a7;
          font-size: 8px;
          line-height: 1.55;
        }

        .mapArchivePreview {
          overflow: hidden;
          padding: 0;
        }

        .previewLabel {
          display: block;
          padding: 13px 14px 8px;
          color: #63ddff;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.11em;
        }

        .mapArchivePreview > img {
          display: block;
          width: calc(100% - 18px);
          margin: 0 9px;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          border-radius: 10px;
          background: #020710;
        }

        .previewPlaceholder {
          width: calc(100% - 18px);
          aspect-ratio: 1 / 1;
          display: grid;
          place-items: center;
          margin: 0 9px;
          border-radius: 10px;
          background: #030915;
          color: #4f6584;
          font-size: 9px;
        }

        .previewContent {
          padding: 13px;
        }

        .previewTags {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .previewTags span {
          padding: 4px 6px;
          border-radius: 999px;
          background: rgba(94, 116, 150, 0.1);
          color: #7f94b2;
          font-size: 7px;
          font-weight: 800;
        }

        .previewTags .currentTag {
          background: rgba(99, 221, 255, 0.1);
          color: #63ddff;
        }

        .previewTags .devTag {
          background: rgba(171, 135, 255, 0.13);
          color: #c7b5ff;
        }

        .previewContent h3 {
          margin: 8px 0 4px;
          font-size: 16px;
        }

        .previewContent p {
          margin: 0;
          color: #7186a5;
          font-size: 8px;
        }

        .mapEditorStatusNotice {
          padding: 16px;
          border: 1px solid rgba(99, 221, 255, 0.13);
          border-radius: 14px;
          background: rgba(99, 221, 255, 0.04);
        }

        .mapEditorStatusNotice.dev {
          border-color: rgba(171, 135, 255, 0.22);
          background: rgba(67, 35, 120, 0.08);
        }

        .mapEditorStatusNotice > span {
          color: #63ddff;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .mapEditorStatusNotice.dev > span {
          color: #ad8bff;
        }

        .mapEditorStatusNotice strong {
          display: block;
          margin-top: 6px;
          font-size: 11px;
        }

        .mapEditorStatusNotice p {
          margin: 5px 0 0;
          color: #798dac;
          font-size: 8px;
          line-height: 1.5;
        }

        @media (max-width: 1000px) {
          .mapEditorLayout {
            grid-template-columns: 1fr;
          }

          .mapEditorSidebar {
            position: static;
          }
        }

        @media (max-width: 650px) {
          .mapEditor {
            padding: 18px 12px;
          }

          .mapEditorHeader {
            flex-direction: column;
          }

          .mapSaveButton {
            width: 100%;
          }

          .mapFormGrid {
            grid-template-columns: 1fr;
          }

          .mapFieldWide {
            grid-column: auto;
          }

          .thumbnailEditor {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}