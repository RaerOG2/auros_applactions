"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  createNewsItem,
  getAdminNewsById,
  updateNewsItem,
  uploadNewsImage,
} from "../../services/news-admin.service";

import {
  emptyNewsEditorForm,
} from "../../types/community";

import type {
  NewsEditorForm,
} from "../../types/community";

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

export default function NewsEditor({
  newsId,
}: {
  newsId?: string;
}) {
  const [
    form,
    setForm,
  ] =
    useState<NewsEditorForm>(
      emptyNewsEditorForm
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      !!newsId
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
    if (!newsId) {
      return;
    }

    getAdminNewsById(
      newsId
    )
      .then(
        (item) => {
          if (!item) {
            setError(
              "News item not found."
            );

            return;
          }

          setForm({
            title:
              item.title,

            slug:
              item.slug,

            summary:
              item.summary ??
              "",

            content:
              item.content ??
              "",

            image_url:
              item.image_url ??
              "",

            pinned:
              item.pinned,

            published:
              item.published,
          });
        }
      )
      .catch(
        (err) => {
          setError(
            err?.message ||
              "Could not load news item."
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
    newsId,
  ]);

  function update<
    K extends keyof NewsEditorForm
  >(
    key: K,
    value: NewsEditorForm[K]
  ) {
    setForm(
      (previous) => ({
        ...previous,
        [key]:
          value,
      })
    );
  }

  function changeTitle(
    title: string
  ) {
    setForm(
      (previous) => {
        const oldSlug =
          makeSlug(
            previous.title
          );

        const auto =
          !previous.slug ||
          previous.slug ===
            oldSlug;

        return {
          ...previous,

          title,

          slug:
            auto
              ? makeSlug(
                  title
                )
              : previous.slug,
        };
      }
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
        await uploadNewsImage(
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
      !form.slug.trim()
    ) {
      setError(
        "Please enter a slug."
      );

      return;
    }

    try {
      setSaving(true);

      if (newsId) {
        await updateNewsItem(
          newsId,
          form
        );

        setSuccess(
          "News item saved."
        );
    } else {
    await createNewsItem(form);

    window.location.href =
        "/admin/news";
    }
    } catch (
      err: any
    ) {
      setError(
        err?.message ||
          "Could not save news item."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="newsEditorLoading">
        Loading News Editor...
      </div>
    );
  }

  return (
    <>
      <div className="newsEditorPage">
        <header className="newsEditorHeader">
          <div>
            <Link
              href="/admin/news"
              className="newsBack"
            >
              ← News
            </Link>

            <div className="newsEyebrow">
              AUROS CONTENT
            </div>

            <h1>
              {newsId
                ? "Edit News"
                : "Create News"}
            </h1>

            <p>
              Create a smaller
              announcement for
              the Auros community.
            </p>
          </div>

          <button
            type="button"
            className="newsSaveButton"
            disabled={
              saving
            }
            onClick={save}
          >
            {saving
              ? "Saving..."
              : newsId
              ? "Save Changes"
              : "Create News"}
          </button>
        </header>

        {error && (
          <div className="newsMessage error">
            {error}
          </div>
        )}

        {success && (
          <div className="newsMessage success">
            {success}
          </div>
        )}

        <div className="newsEditorGrid">
          <main className="newsEditorMain">
            <section className="newsPanel">
              <div className="newsPanelHeader">
                <span>
                  01
                </span>

                <div>
                  <h2>
                    Announcement
                  </h2>

                  <p>
                    Main information.
                  </p>
                </div>
              </div>

              <div className="newsPanelContent">
                <label className="newsField">
                  <span>
                    Title
                  </span>

                  <input
                    value={
                      form.title
                    }
                    placeholder="Auros launches October 10"
                    onChange={(
                      event
                    ) =>
                      changeTitle(
                        event
                          .target
                          .value
                      )
                    }
                  />
                </label>

                <label className="newsField">
                  <span>
                    Slug
                  </span>

                  <div className="newsSlug">
                    <span>
                      /news/
                    </span>

                    <input
                      value={
                        form.slug
                      }
                      onChange={(
                        event
                      ) =>
                        update(
                          "slug",
                          makeSlug(
                            event
                              .target
                              .value
                          )
                        )
                      }
                    />
                  </div>
                </label>

                <label className="newsField">
                  <span>
                    Summary
                  </span>

                  <textarea
                    rows={4}
                    value={
                      form.summary
                    }
                    placeholder="Short announcement summary..."
                    onChange={(
                      event
                    ) =>
                      update(
                        "summary",
                        event
                          .target
                          .value
                      )
                    }
                  />
                </label>

                <label className="newsField">
                  <span>
                    Content
                  </span>

                  <textarea
                    rows={11}
                    value={
                      form.content
                    }
                    placeholder="Write the announcement..."
                    onChange={(
                      event
                    ) =>
                      update(
                        "content",
                        event
                          .target
                          .value
                      )
                    }
                  />
                </label>
              </div>
            </section>

            <section className="newsPanel">
              <div className="newsPanelHeader">
                <span>
                  02
                </span>

                <div>
                  <h2>
                    Image
                  </h2>

                  <p>
                    Optional artwork.
                  </p>
                </div>
              </div>

              <div className="newsPanelContent">
                {form.image_url ? (
                  <div className="newsImageEditor">
                    <img
                      src={
                        form.image_url
                      }
                      alt=""
                    />

                    <div>
                      <label className="newsSecondaryButton">
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
                        className="newsDangerButton"
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
                  <label className="newsUploadZone">
                    <strong>
                      {uploading
                        ? "Uploading..."
                        : "Upload News Image"}
                    </strong>

                    <span>
                      PNG, JPG or WEBP
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
          </main>

          {/* SIDEBAR */}

          <aside className="newsEditorSidebar">
            <section className="newsSidebarPanel">
              <div className="newsSidebarTitle">
                PUBLISH
              </div>

              <label className="newsToggle">
                <div>
                  <strong>
                    Published
                  </strong>

                  <small>
                    Visible publicly
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

              <label className="newsToggle">
                <div>
                  <strong>
                    Pin News
                  </strong>

                  <small>
                    Show with priority
                  </small>
                </div>

                <input
                  type="checkbox"
                  checked={
                    form.pinned
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "pinned",
                      event
                        .target
                        .checked
                    )
                  }
                />
              </label>
            </section>

            <section className="newsPreviewPanel">
              <div className="newsPreviewLabel">
                LIVE PREVIEW
              </div>

              {form.image_url && (
                <img
                  src={
                    form.image_url
                  }
                  alt=""
                />
              )}

              <div className="newsPreviewContent">
                <span>
                  {form.pinned
                    ? "PINNED NEWS"
                    : "NEWS"}
                </span>

                <h2>
                  {form.title ||
                    "Announcement Title"}
                </h2>

                <p>
                  {form.summary ||
                    "Your announcement summary will appear here."}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .newsEditorPage {
          max-width:
            1400px;

          margin:
            0 auto;
        }

        .newsEditorHeader {
          display: flex;

          justify-content:
            space-between;

          align-items:
            flex-end;

          gap: 20px;

          flex-wrap:
            wrap;

          margin-bottom:
            22px;
        }

        .newsBack {
          display:
            inline-block;

          margin-bottom:
            18px;

          color:
            #8096b7;

          font-size:
            12px;

          text-decoration:
            none;
        }

        .newsEyebrow {
          color:
            #63ddff;

          font-size:
            10px;

          font-weight:
            900;

          letter-spacing:
            0.15em;
        }

        .newsEditorHeader h1 {
          margin:
            7px 0;

          font-size:
            clamp(
              40px,
              6vw,
              58px
            );

          letter-spacing:
            -0.045em;
        }

        .newsEditorHeader p {
          margin: 0;

          color:
            #8599b9;
        }

        .newsSaveButton {
          min-height:
            44px;

          padding:
            0 18px;

          border: 0;

          border-radius:
            12px;

          background:
            linear-gradient(
              95deg,
              #63ddff,
              #8b81ff
            );

          color:
            #04101a;

          font-size:
            12px;

          font-weight:
            900;

          cursor:
            pointer;
        }

        .newsEditorGrid {
          display: grid;

          grid-template-columns:
            minmax(
              0,
              1fr
            )
            minmax(
              320px,
              410px
            );

          gap:
            18px;

          align-items:
            start;
        }

        .newsEditorMain {
          display:
            grid;

          gap:
            16px;

          min-width:
            0;
        }

        .newsPanel,
        .newsSidebarPanel,
        .newsPreviewPanel {
          overflow:
            hidden;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );

          border-radius:
            19px;

          background:
            rgba(
              8,
              17,
              34,
              0.92
            );
        }

        .newsPanelHeader {
          display:
            flex;

          align-items:
            center;

          gap:
            11px;

          padding:
            16px 18px;

          border-bottom:
            1px solid
            rgba(
              118,
              153,
              214,
              0.09
            );
        }

        .newsPanelHeader
          > span {
          width: 31px;
          height: 31px;

          display:
            grid;

          place-items:
            center;

          border-radius:
            9px;

          background:
            rgba(
              99,
              221,
              255,
              0.06
            );

          color:
            #63ddff;

          font-size:
            9px;

          font-weight:
            900;
        }

        .newsPanelHeader h2 {
          margin: 0;

          font-size:
            15px;
        }

        .newsPanelHeader p {
          margin:
            2px 0 0;

          color:
            #637898;

          font-size:
            9px;
        }

        .newsPanelContent {
          display:
            grid;

          gap:
            14px;

          padding:
            18px;
        }

        .newsField {
          display:
            grid;

          gap:
            7px;
        }

        .newsField
          > span {
          color:
            #aebed6;

          font-size:
            10px;

          font-weight:
            800;
        }

        .newsField input,
        .newsField textarea {
          width:
            100%;

          padding:
            12px;

          outline:
            none;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );

          border-radius:
            11px;

          background:
            rgba(
              4,
              12,
              26,
              0.86
            );

          color:
            white;
        }

        .newsField textarea {
          resize:
            vertical;

          line-height:
            1.65;
        }

        .newsSlug {
          display:
            flex;

          align-items:
            center;

          overflow:
            hidden;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );

          border-radius:
            11px;

          background:
            rgba(
              4,
              12,
              26,
              0.86
            );
        }

        .newsSlug
          > span {
          padding-left:
            12px;

          color:
            #59708f;

          font-size:
            10px;
        }

        .newsSlug input {
          border: 0;

          background:
            transparent;
        }

        .newsUploadZone {
          min-height:
            180px;

          display:
            grid;

          place-items:
            center;

          align-content:
            center;

          gap: 6px;

          border:
            1px dashed
            rgba(
              99,
              221,
              255,
              0.3
            );

          border-radius:
            15px;

          background:
            rgba(
              99,
              221,
              255,
              0.025
            );

          text-align:
            center;

          cursor:
            pointer;
        }

        .newsUploadZone span {
          color:
            #667d9d;

          font-size:
            9px;
        }

        .newsImageEditor {
          display:
            grid;

          gap:
            10px;
        }

        .newsImageEditor img {
          width:
            100%;

          max-height:
            450px;

          object-fit:
            contain;

          border-radius:
            13px;

          background:
            #030812;
        }

        .newsImageEditor
          > div {
          display:
            flex;

          gap:
            7px;
        }

        .newsSecondaryButton,
        .newsDangerButton {
          min-height:
            36px;

          display:
            inline-flex;

          align-items:
            center;

          padding:
            0 11px;

          border-radius:
            9px;

          font-size:
            9px;

          cursor:
            pointer;
        }

        .newsSecondaryButton {
          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.15
            );

          background:
            rgba(
              10,
              20,
              40,
              0.8
            );

          color:
            #d0def1;
        }

        .newsDangerButton {
          border:
            1px solid
            rgba(
              255,
              80,
              100,
              0.16
            );

          background:
            rgba(
              255,
              70,
              90,
              0.05
            );

          color:
            #ffabb7;
        }

        .newsEditorSidebar {
          position:
            sticky;

          top:
            18px;

          display:
            grid;

          gap:
            12px;
        }

        .newsSidebarPanel {
          padding:
            16px;
        }

        .newsSidebarTitle {
          margin-bottom:
            11px;

          color:
            #63ddff;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.1em;
        }

        .newsToggle {
          display:
            flex;

          justify-content:
            space-between;

          align-items:
            center;

          gap:
            10px;

          padding:
            11px;

          margin-top:
            7px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.1
            );

          border-radius:
            11px;

          background:
            rgba(
              4,
              12,
              26,
              0.65
            );

          cursor:
            pointer;
        }

        .newsToggle strong {
          display:
            block;

          font-size:
            10px;
        }

        .newsToggle small {
          display:
            block;

          margin-top:
            2px;

          color:
            #617695;

          font-size:
            8px;
        }

        .newsToggle input {
          accent-color:
            #63ddff;
        }

        .newsPreviewLabel {
          padding:
            12px 14px;

          border-bottom:
            1px solid
            rgba(
              118,
              153,
              214,
              0.09
            );

          color:
            #63ddff;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.1em;
        }

        .newsPreviewPanel
          > img {
          width:
            100%;

          aspect-ratio:
            16 / 9;

          object-fit:
            cover;
        }

        .newsPreviewContent {
          padding:
            16px;
        }

        .newsPreviewContent
          > span {
          color:
            #63ddff;

          font-size:
            8px;

          font-weight:
            900;
        }

        .newsPreviewContent h2 {
          margin:
            6px 0;

          font-size:
            20px;
        }

        .newsPreviewContent p {
          margin: 0;

          color:
            #879ab7;

          font-size:
            10px;

          line-height:
            1.6;
        }

        .newsMessage,
        .newsEditorLoading {
          padding:
            12px;

          margin-bottom:
            14px;

          border-radius:
            10px;

          font-size:
            10px;
        }

        .newsMessage.error {
          color:
            #ffb1bc;

          background:
            rgba(
              255,
              70,
              90,
              0.06
            );
        }

        .newsMessage.success {
          color:
            #a6f1cd;

          background:
            rgba(
              60,
              215,
              150,
              0.06
            );
        }

        @media (
          max-width:
            1000px
        ) {
          .newsEditorGrid {
            grid-template-columns:
              1fr;
          }

          .newsEditorSidebar {
            position:
              static;
          }
        }
      `}</style>
    </>
  );
}