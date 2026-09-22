"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createFeatureFlag,
  deleteFeatureFlag,
  getFeatureFlags,
  updateFeatureFlag,
  updateFeatureFlagEnabled,
} from "../../services/feature-flag.service";

import {
  createAdminActivityLog,
} from "../../services/admin-log-service";

import {
  getCurrentUser,
} from "../../services/admin-service";

import type {
  FeatureFlag,
  FeatureFlagAudience,
  FeatureFlagInput,
} from "../../types/feature-flags";


const EMPTY_FORM:
  FeatureFlagInput = {
    key:
      "",

    name:
      "",

    description:
      "",

    enabled:
      false,

    audience:
      "everyone",
  };


const AUDIENCE_OPTIONS: {
  value:
    FeatureFlagAudience;

  label:
    string;

  description:
    string;
}[] = [
  {
    value:
      "everyone",

    label:
      "Everyone",

    description:
      "Available to all visitors.",
  },
  {
    value:
      "beta",

    label:
      "Beta",

    description:
      "Available to Beta users and higher access levels.",
  },
  {
    value:
      "developers",

    label:
      "Developers",

    description:
      "Available to Auros developers and admins.",
  },
  {
    value:
      "admin",

    label:
      "Admin",

    description:
      "Available to administrators only.",
  },
];


export default function AdminFeatureFlagsSection() {
  const [
    flags,
    setFlags,
  ] =
    useState<FeatureFlag[]>(
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
    saving,
    setSaving,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    success,
    setSuccess,
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
    editingFlag,
    setEditingFlag,
  ] =
    useState<FeatureFlag | null>(
      null
    );

  const [
    form,
    setForm,
  ] =
    useState<FeatureFlagInput>(
      EMPTY_FORM
    );


  const enabledCount =
    useMemo(
      () =>
        flags.filter(
          (
            flag
          ) =>
            flag.enabled
        ).length,
      [
        flags,
      ]
    );


  const publicCount =
    useMemo(
      () =>
        flags.filter(
          (
            flag
          ) =>
            flag.audience ===
            "everyone"
        ).length,
      [
        flags,
      ]
    );


  const betaCount =
    useMemo(
      () =>
        flags.filter(
          (
            flag
          ) =>
            flag.audience ===
            "beta"
        ).length,
      [
        flags,
      ]
    );


  useEffect(() => {
    void loadFlags();
  }, []);


  async function loadFlags() {
    setLoading(
      true
    );

    setError(
      null
    );


    try {
      const result =
        await getFeatureFlags();


      setFlags(
        result
      );
    } catch (
      loadError
    ) {
      console.error(
        "[AdminFeatureFlags] Failed to load flags:",
        loadError
      );

      setError(
        "Feature flags could not be loaded."
      );
    } finally {
      setLoading(
        false
      );
    }
  }


  function openCreateModal() {
    setEditingFlag(
      null
    );

    setForm({
      ...EMPTY_FORM,
    });

    setError(
      null
    );

    setSuccess(
      null
    );

    setModalOpen(
      true
    );
  }


  function openEditModal(
    flag:
      FeatureFlag
  ) {
    setEditingFlag(
      flag
    );

    setForm({
      key:
        flag.key,

      name:
        flag.name,

      description:
        flag.description ??
        "",

      enabled:
        flag.enabled,

      audience:
        flag.audience,
    });

    setError(
      null
    );

    setSuccess(
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

    setEditingFlag(
      null
    );

    setForm({
      ...EMPTY_FORM,
    });
  }


  async function writeActivityLog(
    action:
      string,

    flag:
      FeatureFlag,

    details?:
      Record<
        string,
        unknown
      >
  ) {
    try {
      const user =
        await getCurrentUser();


      await createAdminActivityLog({
        adminUserId:
          user?.id ??
          null,

        adminEmail:
          user?.email ??
          null,

        action,

        targetType:
          "feature_flag",

        targetId:
          flag.id,

        targetLabel:
          flag.name,

        details:
          details ??
          null,
      });
    } catch (
      logError
    ) {
      console.error(
        "[AdminFeatureFlags] Failed to write admin log:",
        logError
      );
    }
  }


  async function saveFlag() {
    if (
      saving
    ) {
      return;
    }


    const name =
      form.name.trim();

    const key =
      form.key.trim();


    if (
      !name
    ) {
      setError(
        "Please enter a feature flag name."
      );

      return;
    }


    if (
      !key
    ) {
      setError(
        "Please enter a feature flag key."
      );

      return;
    }


    setSaving(
      true
    );

    setError(
      null
    );

    setSuccess(
      null
    );


    try {
      if (
        editingFlag
      ) {
        const updated =
          await updateFeatureFlag(
            editingFlag.id,
            form
          );


        setFlags(
          (
            current
          ) =>
            current
              .map(
                (
                  flag
                ) =>
                  flag.id ===
                  updated.id
                    ? updated
                    : flag
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  a.name.localeCompare(
                    b.name
                  )
              )
        );


        await writeActivityLog(
          "feature_flag.updated",
          updated,
          {
            key:
              updated.key,

            enabled:
              updated.enabled,

            audience:
              updated.audience,
          }
        );


        setSuccess(
          "Feature flag updated."
        );
      } else {
        const created =
          await createFeatureFlag(
            form
          );


        setFlags(
          (
            current
          ) =>
            [
              ...current,
              created,
            ].sort(
              (
                a,
                b
              ) =>
                a.name.localeCompare(
                  b.name
                )
            )
        );


        await writeActivityLog(
          "feature_flag.created",
          created,
          {
            key:
              created.key,

            enabled:
              created.enabled,

            audience:
              created.audience,
          }
        );


        setSuccess(
          "Feature flag created."
        );
      }


      setModalOpen(
        false
      );

      setEditingFlag(
        null
      );

      setForm({
        ...EMPTY_FORM,
      });
    } catch (
      saveError:
        unknown
    ) {
      console.error(
        "[AdminFeatureFlags] Failed to save flag:",
        saveError
      );


      const message =
        saveError instanceof Error
          ? saveError.message
          : "";


      if (
        message
          .toLowerCase()
          .includes(
            "duplicate"
          ) ||
        message
          .toLowerCase()
          .includes(
            "unique"
          )
      ) {
        setError(
          "This feature flag key already exists."
        );
      } else {
        setError(
          "The feature flag could not be saved."
        );
      }
    } finally {
      setSaving(
        false
      );
    }
  }


  async function toggleFlag(
    flag:
      FeatureFlag
  ) {
    const nextEnabled =
      !flag.enabled;


    setError(
      null
    );

    setSuccess(
      null
    );


    setFlags(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item.id ===
            flag.id
              ? {
                  ...item,
                  enabled:
                    nextEnabled,
                }
              : item
        )
    );


    try {
      await updateFeatureFlagEnabled(
        flag.id,
        nextEnabled
      );


      const updatedFlag: FeatureFlag = {
        ...flag,
        enabled:
          nextEnabled,
      };


      await writeActivityLog(
        nextEnabled
          ? "feature_flag.enabled"
          : "feature_flag.disabled",
        updatedFlag,
        {
          key:
            flag.key,

          enabled:
            nextEnabled,

          audience:
            flag.audience,
        }
      );


      setSuccess(
        nextEnabled
          ? `${flag.name} enabled.`
          : `${flag.name} disabled.`
      );
    } catch (
      toggleError
    ) {
      console.error(
        "[AdminFeatureFlags] Failed to toggle flag:",
        toggleError
      );


      setFlags(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.id ===
              flag.id
                ? {
                    ...item,
                    enabled:
                      flag.enabled,
                  }
                : item
          )
      );


      setError(
        "The feature flag state could not be changed."
      );
    }
  }


  async function removeFlag(
    flag:
      FeatureFlag
  ) {
    const confirmed =
      window.confirm(
        `Delete feature flag "${flag.name}"?\n\nKey: ${flag.key}\n\nThis cannot be undone.`
      );


    if (
      !confirmed
    ) {
      return;
    }


    setError(
      null
    );

    setSuccess(
      null
    );


    try {
      await deleteFeatureFlag(
        flag.id
      );


      setFlags(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item.id !==
              flag.id
          )
      );


      await writeActivityLog(
        "feature_flag.deleted",
        flag,
        {
          key:
            flag.key,

          enabled:
            flag.enabled,

          audience:
            flag.audience,
        }
      );


      setSuccess(
        `${flag.name} deleted.`
      );
    } catch (
      deleteError
    ) {
      console.error(
        "[AdminFeatureFlags] Failed to delete flag:",
        deleteError
      );

      setError(
        "The feature flag could not be deleted."
      );
    }
  }


  return (
    <>
      <section className="featureFlagsSection">
        <div className="featureFlagsHero">
          <div>
            <div className="featureFlagsEyebrow">
              AUROS FEATURE CONTROL
            </div>

            <h1>
              Feature Flags
            </h1>

            <p>
              Control experimental,
              staged and restricted
              Auros features without
              changing the public
              release state.
            </p>
          </div>


          <button
            type="button"
            className="featureFlagsCreateButton"
            onClick={
              openCreateModal
            }
          >
            <span>
              +
            </span>

            New Feature Flag
          </button>
        </div>


        <div className="featureFlagsStats">
          <StatCard
            label="Total Flags"
            value={
              flags.length
            }
            detail="Configured features"
          />

          <StatCard
            label="Enabled"
            value={
              enabledCount
            }
            detail="Currently active"
          />

          <StatCard
            label="Public"
            value={
              publicCount
            }
            detail="Everyone audience"
          />

          <StatCard
            label="Beta"
            value={
              betaCount
            }
            detail="Beta audience"
          />
        </div>


        {error && (
          <div className="featureFlagsNotice error">
            {error}
          </div>
        )}


        {success && (
          <div className="featureFlagsNotice success">
            {success}
          </div>
        )}


        <div className="featureFlagsPanel">
          <div className="featureFlagsPanelHeader">
            <div>
              <span className="featureFlagsPanelEyebrow">
                CONFIGURATION
              </span>

              <h2>
                Flags
              </h2>
            </div>

            <button
              type="button"
              className="featureFlagsRefreshButton"
              onClick={() =>
                void loadFlags()
              }
              disabled={
                loading
              }
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>
          </div>


          {loading ? (
            <div className="featureFlagsEmpty">
              <div className="featureFlagsEmptyIcon">
                F
              </div>

              <strong>
                Loading Feature Flags
              </strong>

              <span>
                Reading the current
                Auros feature
                configuration.
              </span>
            </div>
          ) : flags.length ===
            0 ? (
            <div className="featureFlagsEmpty">
              <div className="featureFlagsEmptyIcon">
                F
              </div>

              <strong>
                No Feature Flags Yet
              </strong>

              <span>
                Create the first flag
                to start controlling
                staged Auros features.
              </span>

              <button
                type="button"
                onClick={
                  openCreateModal
                }
              >
                Create First Flag
              </button>
            </div>
          ) : (
            <div className="featureFlagsList">
              {flags.map(
                (
                  flag
                ) => (
                  <FeatureFlagCard
                    key={
                      flag.id
                    }
                    flag={
                      flag
                    }
                    onToggle={() =>
                      void toggleFlag(
                        flag
                      )
                    }
                    onEdit={() =>
                      openEditModal(
                        flag
                      )
                    }
                    onDelete={() =>
                      void removeFlag(
                        flag
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </section>


      {modalOpen && (
        <div
          className="featureFlagModalBackdrop"
          onMouseDown={
            (
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }
          }
        >
          <div className="featureFlagModal">
            <div className="featureFlagModalHeader">
              <div>
                <span>
                  FEATURE CONTROL
                </span>

                <h2>
                  {editingFlag
                    ? "Edit Feature Flag"
                    : "New Feature Flag"}
                </h2>
              </div>

              <button
                type="button"
                className="featureFlagModalClose"
                onClick={
                  closeModal
                }
                aria-label="Close"
              >
                ×
              </button>
            </div>


            <div className="featureFlagForm">
              <label>
                <span>
                  Name
                </span>

                <input
                  type="text"
                  value={
                    form.name
                  }
                  placeholder="Experimental Map UI"
                  onChange={
                    (
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          name:
                            event
                              .target
                              .value,
                        })
                      )
                  }
                />
              </label>


              <label>
                <span>
                  Key
                </span>

                <input
                  type="text"
                  value={
                    form.key
                  }
                  placeholder="EXPERIMENTAL_MAP_UI"
                  autoCapitalize="characters"
                  spellCheck={
                    false
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          key:
                            event
                              .target
                              .value,
                        })
                      )
                  }
                />

                <small>
                  Keys are automatically
                  converted to
                  UPPER_SNAKE_CASE.
                </small>
              </label>


              <label>
                <span>
                  Description
                </span>

                <textarea
                  value={
                    form.description
                  }
                  placeholder="Describe what this feature flag controls..."
                  rows={
                    4
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          description:
                            event
                              .target
                              .value,
                        })
                      )
                  }
                />
              </label>


              <label>
                <span>
                  Audience
                </span>

                <select
                  value={
                    form.audience
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          audience:
                            event
                              .target
                              .value as FeatureFlagAudience,
                        })
                      )
                  }
                >
                  {AUDIENCE_OPTIONS.map(
                    (
                      option
                    ) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    )
                  )}
                </select>

                <small>
                  {
                    AUDIENCE_OPTIONS.find(
                      (
                        option
                      ) =>
                        option.value ===
                        form.audience
                    )
                      ?.description
                  }
                </small>
              </label>


              <div className="featureFlagEnabledRow">
                <div>
                  <strong>
                    Enabled
                  </strong>

                  <span>
                    The audience only
                    receives access while
                    this flag is enabled.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    form.enabled
                      ? "featureFlagSwitch active"
                      : "featureFlagSwitch"
                  }
                  onClick={() =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        enabled:
                          !current.enabled,
                      })
                    )
                  }
                  aria-pressed={
                    form.enabled
                  }
                >
                  <span />
                </button>
              </div>
            </div>


            <div className="featureFlagModalFooter">
              <button
                type="button"
                className="featureFlagCancelButton"
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
                type="button"
                className="featureFlagSaveButton"
                onClick={() =>
                  void saveFlag()
                }
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : editingFlag
                  ? "Save Changes"
                  : "Create Flag"}
              </button>
            </div>
          </div>
        </div>
      )}


      <style jsx global>{`
        .featureFlagsSection {
          display:
            grid;

          gap:
            18px;
        }


        .featureFlagsHero {
          display:
            flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap:
            24px;

          padding:
            25px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.16
            );

          border-radius:
            24px;

          background:
            radial-gradient(
              circle
              at
              90%
              10%,
              rgba(
                99,
                221,
                255,
                0.1
              ),
              transparent
              30%
            ),
            linear-gradient(
              135deg,
              rgba(
                14,
                28,
                54,
                0.9
              ),
              rgba(
                8,
                17,
                34,
                0.94
              )
            );

          box-shadow:
            0
            20px
            55px
            rgba(
              0,
              0,
              0,
              0.2
            );
        }


        .featureFlagsEyebrow,
        .featureFlagsPanelEyebrow {
          color:
            #63ddff;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.16em;
        }


        .featureFlagsHero h1 {
          margin:
            7px
            0
            8px;

          color:
            #f5f8ff;

          font-size:
            clamp(
              27px,
              4vw,
              42px
            );

          line-height:
            1;

          letter-spacing:
            -0.04em;
        }


        .featureFlagsHero p {
          max-width:
            650px;

          margin:
            0;

          color:
            #8297b8;

          font-size:
            12px;

          line-height:
            1.7;
        }


        .featureFlagsCreateButton,
        .featureFlagSaveButton {
          min-height:
            43px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            8px;

          padding:
            0
            15px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.34
            );

          border-radius:
            11px;

          background:
            linear-gradient(
              135deg,
              rgba(
                99,
                221,
                255,
                0.18
              ),
              rgba(
                139,
                114,
                255,
                0.14
              )
            );

          color:
            #eafaff;

          font-size:
            10px;

          font-weight:
            900;

          cursor:
            pointer;
        }


        .featureFlagsCreateButton span {
          color:
            #63ddff;

          font-size:
            18px;

          line-height:
            1;
        }


        .featureFlagsCreateButton:hover,
        .featureFlagSaveButton:hover {
          border-color:
            rgba(
              99,
              221,
              255,
              0.6
            );

          transform:
            translateY(
              -1px
            );
        }


        .featureFlagsStats {
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
        }


        .featureFlagStat {
          padding:
            17px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.13
            );

          border-radius:
            17px;

          background:
            rgba(
              10,
              21,
              42,
              0.76
            );
        }


        .featureFlagStat span {
          display:
            block;

          color:
            #607797;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.08em;

          text-transform:
            uppercase;
        }


        .featureFlagStat strong {
          display:
            block;

          margin-top:
            7px;

          color:
            #f4f8ff;

          font-size:
            25px;

          line-height:
            1;
        }


        .featureFlagStat small {
          display:
            block;

          margin-top:
            7px;

          color:
            #526987;

          font-size:
            8px;
        }


        .featureFlagsNotice {
          padding:
            11px
            14px;

          border-radius:
            12px;

          font-size:
            9px;

          font-weight:
            800;
        }


        .featureFlagsNotice.error {
          border:
            1px solid
            rgba(
              255,
              101,
              123,
              0.22
            );

          background:
            rgba(
              255,
              101,
              123,
              0.08
            );

          color:
            #ff91a3;
        }


        .featureFlagsNotice.success {
          border:
            1px solid
            rgba(
              84,
              223,
              160,
              0.2
            );

          background:
            rgba(
              84,
              223,
              160,
              0.07
            );

          color:
            #75e7b4;
        }


        .featureFlagsPanel {
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
            22px;

          background:
            rgba(
              8,
              17,
              34,
              0.88
            );

          box-shadow:
            0
            20px
            50px
            rgba(
              0,
              0,
              0,
              0.18
            );
        }


        .featureFlagsPanelHeader {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            18px;

          padding:
            18px
            20px;

          border-bottom:
            1px solid
            rgba(
              118,
              153,
              214,
              0.09
            );
        }


        .featureFlagsPanelHeader h2 {
          margin:
            4px
            0
            0;

          color:
            #f3f7ff;

          font-size:
            18px;
        }


        .featureFlagsRefreshButton,
        .featureFlagCancelButton {
          min-height:
            37px;

          padding:
            0
            12px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.14
            );

          border-radius:
            9px;

          background:
            rgba(
              15,
              29,
              54,
              0.62
            );

          color:
            #9eb0cc;

          font-size:
            9px;

          font-weight:
            800;

          cursor:
            pointer;
        }


        .featureFlagsRefreshButton:hover,
        .featureFlagCancelButton:hover {
          color:
            white;

          border-color:
            rgba(
              99,
              221,
              255,
              0.22
            );
        }


        .featureFlagsRefreshButton:disabled,
        .featureFlagCancelButton:disabled,
        .featureFlagSaveButton:disabled {
          opacity:
            0.55;

          cursor:
            not-allowed;
        }


        .featureFlagsList {
          display:
            grid;
        }


        .featureFlagCard {
          display:
            grid;

          grid-template-columns:
            minmax(
              0,
              1fr
            )
            auto;

          gap:
            18px;

          padding:
            18px
            20px;

          border-bottom:
            1px solid
            rgba(
              118,
              153,
              214,
              0.075
            );
        }


        .featureFlagCard:last-child {
          border-bottom:
            0;
        }


        .featureFlagCard:hover {
          background:
            rgba(
              99,
              221,
              255,
              0.018
            );
        }


        .featureFlagMain {
          min-width:
            0;
        }


        .featureFlagTopline {
          display:
            flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap:
            7px;
        }


        .featureFlagTopline h3 {
          margin:
            0;

          color:
            #f1f6ff;

          font-size:
            13px;
        }


        .featureFlagStateBadge,
        .featureFlagAudienceBadge {
          display:
            inline-flex;

          align-items:
            center;

          min-height:
            21px;

          padding:
            0
            7px;

          border-radius:
            999px;

          font-size:
            7px;

          font-weight:
            900;

          letter-spacing:
            0.06em;

          text-transform:
            uppercase;
        }


        .featureFlagStateBadge.enabled {
          border:
            1px solid
            rgba(
              84,
              223,
              160,
              0.18
            );

          background:
            rgba(
              84,
              223,
              160,
              0.08
            );

          color:
            #72e5b1;
        }


        .featureFlagStateBadge.disabled {
          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.13
            );

          background:
            rgba(
              118,
              153,
              214,
              0.05
            );

          color:
            #6f84a3;
        }


        .featureFlagAudienceBadge {
          border:
            1px solid
            rgba(
              139,
              114,
              255,
              0.2
            );

          background:
            rgba(
              139,
              114,
              255,
              0.08
            );

          color:
            #b2a5ff;
        }


        .featureFlagKey {
          display:
            inline-flex;

          margin-top:
            8px;

          padding:
            5px
            7px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.1
            );

          border-radius:
            7px;

          background:
            rgba(
              3,
              10,
              22,
              0.6
            );

          color:
            #63ddff;

          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;

          font-size:
            8px;

          font-weight:
            800;
        }


        .featureFlagDescription {
          max-width:
            750px;

          margin:
            9px
            0
            0;

          color:
            #7187a8;

          font-size:
            9px;

          line-height:
            1.6;
        }


        .featureFlagMeta {
          margin-top:
            9px;

          color:
            #465d7c;

          font-size:
            7px;
        }


        .featureFlagControls {
          display:
            flex;

          align-items:
            center;

          gap:
            7px;
        }


        .featureFlagActionButton {
          min-height:
            34px;

          padding:
            0
            10px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.12
            );

          border-radius:
            9px;

          background:
            rgba(
              15,
              29,
              54,
              0.55
            );

          color:
            #8da2c1;

          font-size:
            8px;

          font-weight:
            800;

          cursor:
            pointer;
        }


        .featureFlagActionButton:hover {
          color:
            #eef8ff;

          border-color:
            rgba(
              99,
              221,
              255,
              0.2
            );
        }


        .featureFlagActionButton.danger:hover {
          color:
            #ff8fa1;

          border-color:
            rgba(
              255,
              101,
              123,
              0.22
            );
        }


        .featureFlagSwitch {
          position:
            relative;

          width:
            43px;

          height:
            24px;

          flex-shrink:
            0;

          padding:
            0;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.18
            );

          border-radius:
            999px;

          background:
            rgba(
              44,
              58,
              82,
              0.65
            );

          cursor:
            pointer;

          transition:
            background
              0.16s
              ease,
            border-color
              0.16s
              ease;
        }


        .featureFlagSwitch span {
          position:
            absolute;

          top:
            3px;

          left:
            3px;

          width:
            16px;

          height:
            16px;

          border-radius:
            50%;

          background:
            #8ca0bd;

          transition:
            transform
              0.16s
              ease,
            background
              0.16s
              ease;
        }


        .featureFlagSwitch.active {
          border-color:
            rgba(
              84,
              223,
              160,
              0.35
            );

          background:
            rgba(
              84,
              223,
              160,
              0.17
            );
        }


        .featureFlagSwitch.active span {
          transform:
            translateX(
              19px
            );

          background:
            #54dfa0;

          box-shadow:
            0
            0
            10px
            rgba(
              84,
              223,
              160,
              0.3
            );
        }


        .featureFlagsEmpty {
          min-height:
            260px;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          gap:
            8px;

          padding:
            30px;

          text-align:
            center;
        }


        .featureFlagsEmptyIcon {
          width:
            42px;

          height:
            42px;

          display:
            grid;

          place-items:
            center;

          margin-bottom:
            3px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.17
            );

          border-radius:
            12px;

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
            13px;

          font-weight:
            950;
        }


        .featureFlagsEmpty strong {
          color:
            #dce7f8;

          font-size:
            12px;
        }


        .featureFlagsEmpty span {
          max-width:
            350px;

          color:
            #617796;

          font-size:
            9px;

          line-height:
            1.6;
        }


        .featureFlagsEmpty button {
          margin-top:
            7px;

          min-height:
            37px;

          padding:
            0
            12px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.2
            );

          border-radius:
            9px;

          background:
            rgba(
              99,
              221,
              255,
              0.07
            );

          color:
            #63ddff;

          font-size:
            8px;

          font-weight:
            900;

          cursor:
            pointer;
        }


        .featureFlagModalBackdrop {
          position:
            fixed;

          inset:
            0;

          z-index:
            2000;

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
              1,
              5,
              13,
              0.8
            );

          backdrop-filter:
            blur(
              10px
            );
        }


        .featureFlagModal {
          width:
            min(
              620px,
              100%
            );

          overflow:
            hidden;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.2
            );

          border-radius:
            20px;

          background:
            #091225;

          box-shadow:
            0
            30px
            100px
            rgba(
              0,
              0,
              0,
              0.55
            );
        }


        .featureFlagModalHeader {
          display:
            flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap:
            16px;

          padding:
            19px
            20px;

          border-bottom:
            1px solid
            rgba(
              118,
              153,
              214,
              0.1
            );
        }


        .featureFlagModalHeader span {
          color:
            #63ddff;

          font-size:
            7px;

          font-weight:
            900;

          letter-spacing:
            0.14em;
        }


        .featureFlagModalHeader h2 {
          margin:
            5px
            0
            0;

          color:
            #f4f8ff;

          font-size:
            19px;
        }


        .featureFlagModalClose {
          width:
            34px;

          height:
            34px;

          display:
            grid;

          place-items:
            center;

          flex-shrink:
            0;

          padding:
            0;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.12
            );

          border-radius:
            9px;

          background:
            rgba(
              15,
              29,
              54,
              0.55
            );

          color:
            #8297b8;

          font-size:
            19px;

          cursor:
            pointer;
        }


        .featureFlagForm {
          display:
            grid;

          gap:
            16px;

          padding:
            20px;
        }


        .featureFlagForm label {
          display:
            grid;

          gap:
            7px;
        }


        .featureFlagForm label
          > span {
          color:
            #9db0cb;

          font-size:
            8px;

          font-weight:
            900;

          text-transform:
            uppercase;

          letter-spacing:
            0.06em;
        }


        .featureFlagForm input,
        .featureFlagForm textarea,
        .featureFlagForm select {
          width:
            100%;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.15
            );

          border-radius:
            10px;

          outline:
            none;

          background:
            #071020;

          color:
            #edf5ff;

          font-family:
            inherit;

          font-size:
            10px;

          color-scheme:
            dark;
        }


        .featureFlagForm input,
        .featureFlagForm select {
          min-height:
            42px;

          padding:
            0
            12px;
        }


        .featureFlagForm textarea {
          min-height:
            100px;

          resize:
            vertical;

          padding:
            11px
            12px;

          line-height:
            1.6;
        }


        .featureFlagForm input:focus,
        .featureFlagForm textarea:focus,
        .featureFlagForm select:focus {
          border-color:
            rgba(
              99,
              221,
              255,
              0.4
            );

          box-shadow:
            0
            0
            0
            3px
            rgba(
              99,
              221,
              255,
              0.055
            );
        }


        .featureFlagForm select option {
          background:
            #071020;

          color:
            #edf5ff;
        }


        .featureFlagForm small {
          color:
            #4f6687;

          font-size:
            7px;

          line-height:
            1.5;
        }


        .featureFlagEnabledRow {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            20px;

          padding:
            13px;

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
              0.42
            );
        }


        .featureFlagEnabledRow strong {
          display:
            block;

          color:
            #dbe7f7;

          font-size:
            9px;
        }


        .featureFlagEnabledRow
          > div
          > span {
          display:
            block;

          margin-top:
            3px;

          color:
            #566d8d;

          font-size:
            7px;

          line-height:
            1.5;
        }


        .featureFlagModalFooter {
          display:
            flex;

          justify-content:
            flex-end;

          gap:
            9px;

          padding:
            15px
            20px;

          border-top:
            1px solid
            rgba(
              118,
              153,
              214,
              0.09
            );

          background:
            rgba(
              4,
              11,
              23,
              0.45
            );
        }


        @media (
          max-width:
            900px
        ) {
          .featureFlagsStats {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }


          .featureFlagCard {
            grid-template-columns:
              1fr;
          }


          .featureFlagControls {
            justify-content:
              flex-start;
          }
        }


        @media (
          max-width:
            620px
        ) {
          .featureFlagsHero {
            align-items:
              stretch;

            flex-direction:
              column;
          }


          .featureFlagsCreateButton {
            width:
              100%;
          }


          .featureFlagsStats {
            grid-template-columns:
              1fr
              1fr;
          }


          .featureFlagCard {
            padding:
              15px;
          }


          .featureFlagControls {
            flex-wrap:
              wrap;
          }


          .featureFlagActionButton {
            flex:
              1;
          }


          .featureFlagModalBackdrop {
            padding:
              10px;
          }


          .featureFlagModalFooter {
            flex-direction:
              column-reverse;
          }


          .featureFlagModalFooter
            button {
            width:
              100%;
          }
        }


        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .featureFlagsCreateButton,
          .featureFlagSaveButton,
          .featureFlagSwitch,
          .featureFlagSwitch span {
            transition:
              none;
          }
        }
      `}</style>
    </>
  );
}


function StatCard({
  label,
  value,
  detail,
}: {
  label:
    string;

  value:
    number;

  detail:
    string;
}) {
  return (
    <div className="featureFlagStat">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {detail}
      </small>
    </div>
  );
}


function FeatureFlagCard({
  flag,
  onToggle,
  onEdit,
  onDelete,
}: {
  flag:
    FeatureFlag;

  onToggle:
    () => void;

  onEdit:
    () => void;

  onDelete:
    () => void;
}) {
  const audience =
    AUDIENCE_OPTIONS.find(
      (
        option
      ) =>
        option.value ===
        flag.audience
    );


  const updatedAt =
    new Date(
      flag.updated_at
    );


  return (
    <article className="featureFlagCard">
      <div className="featureFlagMain">
        <div className="featureFlagTopline">
          <h3>
            {flag.name}
          </h3>

          <span
            className={
              flag.enabled
                ? "featureFlagStateBadge enabled"
                : "featureFlagStateBadge disabled"
            }
          >
            {flag.enabled
              ? "Enabled"
              : "Disabled"}
          </span>

          <span className="featureFlagAudienceBadge">
            {audience?.label ??
              flag.audience}
          </span>
        </div>


        <div className="featureFlagKey">
          {flag.key}
        </div>


        {flag.description && (
          <p className="featureFlagDescription">
            {
              flag.description
            }
          </p>
        )}


        <div className="featureFlagMeta">
          Updated{" "}
          {Number.isNaN(
            updatedAt.getTime()
          )
            ? "recently"
            : updatedAt.toLocaleString()}
        </div>
      </div>


      <div className="featureFlagControls">
        <button
          type="button"
          className={
            flag.enabled
              ? "featureFlagSwitch active"
              : "featureFlagSwitch"
          }
          onClick={
            onToggle
          }
          aria-label={
            flag.enabled
              ? `Disable ${flag.name}`
              : `Enable ${flag.name}`
          }
          aria-pressed={
            flag.enabled
          }
        >
          <span />
        </button>

        <button
          type="button"
          className="featureFlagActionButton"
          onClick={
            onEdit
          }
        >
          Edit
        </button>

        <button
          type="button"
          className="featureFlagActionButton danger"
          onClick={
            onDelete
          }
        >
          Delete
        </button>
      </div>
    </article>
  );
}