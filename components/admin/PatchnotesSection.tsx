"use client";

import Link from "next/link";

import type {
  PatchnoteItem,
} from "../../types/admin";

import {
  panelStyle,
} from "../../lib/admin-styles";

import {
  formatDate,
} from "../../lib/admin-utils";

type PatchnotesSectionProps = {
  patchnotesOpen: boolean;

  setPatchnotesOpen:
    React.Dispatch<
      React.SetStateAction<boolean>
    >;

  patchVersion: string;

  setPatchVersion:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  patchTitle: string;

  setPatchTitle:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  patchContent: string;

  setPatchContent:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  editingPatchId:
    string | null;

  expandedPatchnotes:
    string[];

  patchnotes:
    PatchnoteItem[];

  savePatchnote:
    () => void;

  cancelEditPatchnote:
    () => void;

  startEditPatchnote:
    (
      note:
        PatchnoteItem
    ) => void;

  togglePatchnote:
    (
      id: string
    ) => void;

  deletePatchnote:
    (
      id: string
    ) => void;
};

export default function PatchnotesSection({
  patchnotes,
}: PatchnotesSectionProps) {
  const published =
    patchnotes.filter(
      (note) =>
        note.published
    ).length;

  const drafts =
    patchnotes.length -
    published;

  return (
    <>
      <section className="dashboardPatchSection">
        <header className="dashboardPatchHeader">
          <div>
            <div className="dashboardPatchEyebrow">
              CONTENT
              MANAGEMENT
            </div>

            <h2>
              Patchnotes
            </h2>

            <p>
              Patchnotes now
              have their own
              complete
              management area.
            </p>
          </div>

          <div className="dashboardPatchActions">
            <Link
              href="/admin/patchnotes"
              className="manageButton"
            >
              Manage
              Patchnotes
            </Link>

            <Link
              href="/admin/patchnotes/new"
              className="newButton"
            >
              + New
              Patchnote
            </Link>
          </div>
        </header>

        <div className="dashboardPatchStats">
          <PatchStat
            label="Total"
            value={
              patchnotes.length
            }
          />

          <PatchStat
            label="Published"
            value={
              published
            }
          />

          <PatchStat
            label="Drafts"
            value={
              drafts
            }
          />
        </div>

        <div
          style={{
            ...panelStyle,
            padding: 15,
            borderRadius: 17,
          }}
        >
          <div className="recentTitle">
            Recent
            Patchnotes
          </div>

          <div className="recentList">
            {patchnotes
              .slice(0, 5)
              .map(
                (note) => (
                  <Link
                    href={`/admin/patchnotes/${note.id}/edit`}
                    key={
                      note.id
                    }
                    className="recentPatch"
                  >
                    <div>
                      <span>
                        VERSION{" "}
                        {note.version ||
                          "-"}
                      </span>

                      <strong>
                        {note.title ||
                          "Untitled"}
                      </strong>
                    </div>

                    <div className="recentRight">
                      <small
                        className={
                          note.published
                            ? "published"
                            : "draft"
                        }
                      >
                        {note.published
                          ? "Published"
                          : "Draft"}
                      </small>

                      <time>
                        {formatDate(
                          note.created_at
                        )}
                      </time>
                    </div>
                  </Link>
                )
              )}

            {patchnotes
              .length ===
              0 && (
              <div className="emptyPatchnotes">
                No patchnotes
                created yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <style jsx global>{`
        .dashboardPatchSection {
          display: grid;
          gap: 17px;
        }

        .dashboardPatchHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        .dashboardPatchEyebrow {
          color: #63ddff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .dashboardPatchHeader h2 {
          margin: 6px 0;
          font-size: 27px;
        }

        .dashboardPatchHeader p {
          margin: 0;
          color: #8fa2c0;
          font-size: 13px;
        }

        .dashboardPatchActions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .dashboardPatchActions a {
          min-height: 41px;
          display: inline-flex;
          align-items: center;
          padding: 0 14px;
          border-radius: 11px;
          font-size: 12px;
          font-weight: 850;
          text-decoration: none;
        }

        .manageButton {
          color: #dce8fb;
          border: 1px solid rgba(118, 153, 214, 0.18);
          background: rgba(10, 21, 41, 0.86);
        }

        .newButton {
          color: #04101b;
          background: linear-gradient(95deg, #63ddff, #8a7cff);
        }

        .dashboardPatchStats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 11px;
        }

        .patchStat {
          padding: 15px;
          border: 1px solid rgba(118, 153, 214, 0.13);
          border-radius: 14px;
          background: rgba(7, 15, 30, 0.68);
        }

        .patchStat span {
          display: block;
          color: #7489a9;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.08em;
        }

        .patchStat strong {
          display: block;
          margin-top: 4px;
          font-size: 23px;
        }

        .recentTitle {
          margin-bottom: 10px;
          color: #8196b7;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .recentList {
          display: grid;
          gap: 7px;
        }

        .recentPatch {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 11px 12px;
          color: white;
          border: 1px solid rgba(118, 153, 214, 0.1);
          border-radius: 11px;
          background: rgba(5, 13, 27, 0.66);
          text-decoration: none;
        }

        .recentPatch:hover {
          border-color: rgba(99, 221, 255, 0.23);
        }

        .recentPatch > div:first-child {
          display: grid;
          gap: 3px;
        }

        .recentPatch span {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
        }

        .recentPatch strong {
          font-size: 12px;
        }

        .recentRight {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .recentRight small {
          padding: 4px 7px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 850;
        }

        .recentRight small.published {
          color: #9cf1c9;
          background: rgba(50, 210, 145, 0.09);
        }

        .recentRight small.draft {
          color: #d5bfeb;
          background: rgba(160, 120, 210, 0.09);
        }

        .recentRight time {
          color: #627897;
          font-size: 9px;
        }

        .emptyPatchnotes {
          padding: 23px;
          text-align: center;
          color: #7287a8;
          font-size: 12px;
        }

        @media (max-width: 650px) {
          .dashboardPatchStats {
            grid-template-columns: 1fr;
          }

          .recentPatch {
            align-items: flex-start;
            flex-direction: column;
          }

          .recentRight {
            justify-content: flex-start;
          }
        }
      `}</style>
    </>
  );
}

function PatchStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="patchStat">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}