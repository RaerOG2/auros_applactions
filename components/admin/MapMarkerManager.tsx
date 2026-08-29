"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import type {
  AurosMap,
} from "../../types/maps";

import type {
  MapMarker,
} from "../../types/map-markers";

import {
  copyMapMarkers,
  copySelectedMapMarkers,
  deleteMapMarker,
  getAdminMapMarkers,
} from "../../services/map-marker-admin.service";

type Props = {
  maps: AurosMap[];
};

export default function MapMarkerManager({
  maps,
}: Props) {
  const [
    sourceMapId,
    setSourceMapId,
  ] = useState("");

  const [
    targetMapId,
    setTargetMapId,
  ] = useState("");

  const [
    markers,
    setMarkers,
  ] =
    useState<MapMarker[]>(
      []
    );

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<string[]>(
    []
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    copying,
    setCopying,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    replaceExisting,
    setReplaceExisting,
  ] = useState(false);

  useEffect(() => {
    if (
      maps.length ===
      0
    ) {
      return;
    }

    const current =
      maps.find(
        (map) =>
          map.current
      ) ??
      maps[0];

    const previous =
      maps.find(
        (map) =>
          map.id !==
          current.id
      );

    setSourceMapId(
      previous?.id ??
        current.id
    );

    setTargetMapId(
      current.id
    );
  }, [maps]);

  useEffect(() => {
    if (!sourceMapId) {
      return;
    }

    loadMarkers();
  }, [sourceMapId]);

  async function loadMarkers() {
    setLoading(true);
    setError("");

    try {
      const data =
        await getAdminMapMarkers(
          sourceMapId
        );

      setMarkers(data);

      setSelectedIds([]);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load markers."
      );
    } finally {
      setLoading(false);
    }
  }

  const shownMarkers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return markers;
      }

      return markers.filter(
        (marker) =>
          marker.name
            .toLowerCase()
            .includes(
              query
            ) ||
          marker.type
            .toLowerCase()
            .includes(
              query
            )
      );
    }, [
      markers,
      search,
    ]);

  const allVisibleSelected =
    shownMarkers.length >
      0 &&
    shownMarkers.every(
      (marker) =>
        selectedIds.includes(
          marker.id
        )
    );

  function toggleMarker(
    id: string
  ) {
    setSelectedIds(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) =>
                item !== id
            )
          : [
              ...current,
              id,
            ]
    );
  }

  function toggleAll() {
    if (
      allVisibleSelected
    ) {
      setSelectedIds(
        (current) =>
          current.filter(
            (id) =>
              !shownMarkers.some(
                (marker) =>
                  marker.id ===
                  id
              )
          )
      );

      return;
    }

    setSelectedIds(
      (current) =>
        Array.from(
          new Set([
            ...current,
            ...shownMarkers.map(
              (marker) =>
                marker.id
            ),
          ])
        )
    );
  }

  async function handleCopyAll() {
    if (
      !sourceMapId ||
      !targetMapId
    ) {
      return;
    }

    if (
      sourceMapId ===
      targetMapId
    ) {
      setError(
        "Source and target map cannot be the same."
      );

      return;
    }

    if (
      replaceExisting &&
      !window.confirm(
        "This will DELETE all existing markers on the target map before copying. Continue?"
      )
    ) {
      return;
    }

    setCopying(true);
    setError("");
    setMessage("");

    try {
      const count =
        await copyMapMarkers(
          sourceMapId,
          targetMapId,
          {
            replaceExisting,
          }
        );

      setMessage(
        `${count} markers copied successfully.`
      );
    } catch (copyError) {
      setError(
        copyError instanceof Error
          ? copyError.message
          : "Could not copy markers."
      );
    } finally {
      setCopying(false);
    }
  }

  async function handleCopySelected() {
    if (
      selectedIds.length ===
      0
    ) {
      setError(
        "Select at least one marker."
      );

      return;
    }

    if (
      sourceMapId ===
      targetMapId
    ) {
      setError(
        "Source and target map cannot be the same."
      );

      return;
    }

    setCopying(true);
    setError("");
    setMessage("");

    try {
      const count =
        await copySelectedMapMarkers(
          selectedIds,
          targetMapId
        );

      setMessage(
        `${count} selected markers copied successfully.`
      );
    } catch (copyError) {
      setError(
        copyError instanceof Error
          ? copyError.message
          : "Could not copy markers."
      );
    } finally {
      setCopying(false);
    }
  }

  async function handleDelete(
    marker: MapMarker
  ) {
    if (
      !window.confirm(
        `Delete "${marker.name}"?`
      )
    ) {
      return;
    }

    try {
      await deleteMapMarker(
        marker.id
      );

      setMarkers(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              marker.id
          )
      );

      setSelectedIds(
        (current) =>
          current.filter(
            (id) =>
              id !==
              marker.id
          )
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete marker."
      );
    }
  }

  function mapName(
    id: string
  ) {
    return (
      maps.find(
        (map) =>
          map.id === id
      )?.name ??
      "Unknown Map"
    );
  }

  return (
    <>
      <section className="markerManager">
        <header className="markerManagerHeader">
          <div>
            <span>
              MAP CONTENT
            </span>

            <h2>
              Marker Management
            </h2>

            <p>
              View, manage and copy
              locations between map
              versions.
            </p>
          </div>

          <div className="markerManagerCount">
            <strong>
              {markers.length}
            </strong>

            <span>
              MARKERS
            </span>
          </div>
        </header>

        {error && (
          <div className="markerManagerError">
            {error}
          </div>
        )}

        {message && (
          <div className="markerManagerSuccess">
            {message}
          </div>
        )}

        {/* COPY TOOL */}

        <div className="markerCopyCard">
          <div className="copyHeader">
            <div>
              <span>
                MARKER MIGRATION
              </span>

              <h3>
                Copy markers to another map
              </h3>
            </div>
          </div>

          <div className="copyGrid">
            <label>
              <span>
                SOURCE MAP
              </span>

              <select
                value={
                  sourceMapId
                }
                onChange={(event) =>
                  setSourceMapId(
                    event.target.value
                  )
                }
              >
                {maps.map(
                  (map) => (
                    <option
                      key={
                        map.id
                      }
                      value={
                        map.id
                      }
                    >
                      {map.name}
                      {map.version
                        ? ` · ${map.version}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </label>

            <div className="copyArrow">
              →
            </div>

            <label>
              <span>
                TARGET MAP
              </span>

              <select
                value={
                  targetMapId
                }
                onChange={(event) =>
                  setTargetMapId(
                    event.target.value
                  )
                }
              >
                {maps.map(
                  (map) => (
                    <option
                      key={
                        map.id
                      }
                      value={
                        map.id
                      }
                    >
                      {map.name}
                      {map.version
                        ? ` · ${map.version}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>

          <div className="copyInfo">
            <div>
              <strong>
                {mapName(
                  sourceMapId
                )}
              </strong>

              <span>
                {markers.length}
                {" "}locations available
              </span>
            </div>

            <span>
              →
            </span>

            <div>
              <strong>
                {mapName(
                  targetMapId
                )}
              </strong>

              <span>
                Destination map
              </span>
            </div>
          </div>

          <label className="replaceToggle">
            <input
              type="checkbox"
              checked={
                replaceExisting
              }
              onChange={(event) =>
                setReplaceExisting(
                  event.target.checked
                )
              }
            />

            <div>
              <strong>
                Replace existing markers
              </strong>

              <span>
                Delete all markers on the
                destination map before
                copying.
              </span>
            </div>
          </label>

          <div className="copyActions">
            <button
              type="button"
              className="copySelected"
              disabled={
                copying ||
                selectedIds.length ===
                  0
              }
              onClick={
                handleCopySelected
              }
            >
              Copy Selected (
              {selectedIds.length})
            </button>

            <button
              type="button"
              className="copyAll"
              disabled={
                copying ||
                markers.length ===
                  0
              }
              onClick={
                handleCopyAll
              }
            >
              {copying
                ? "Copying..."
                : `Copy All ${markers.length} Markers`}
            </button>
          </div>
        </div>

        {/* LIST */}

        <div className="markerListCard">
          <div className="markerListToolbar">
            <div>
              <span>
                MARKERS ON
              </span>

              <strong>
                {mapName(
                  sourceMapId
                )}
              </strong>
            </div>

            <input
              value={
                search
              }
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search markers..."
            />
          </div>

          <div className="markerTableHeader">
            <label>
              <input
                type="checkbox"
                checked={
                  allVisibleSelected
                }
                onChange={
                  toggleAll
                }
              />
            </label>

            <span>
              LOCATION
            </span>

            <span>
              TYPE
            </span>

            <span>
              POSITION
            </span>

            <span>
              STATUS
            </span>

            <span>
              ACTIONS
            </span>
          </div>

          <div className="markerRows">
            {loading ? (
              <div className="markerEmpty">
                Loading markers...
              </div>
            ) : shownMarkers.length ===
              0 ? (
              <div className="markerEmpty">
                No markers found.
              </div>
            ) : (
              shownMarkers.map(
                (marker) => (
                  <div
                    key={
                      marker.id
                    }
                    className="markerTableRow"
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          marker.id
                        )}
                        onChange={() =>
                          toggleMarker(
                            marker.id
                          )
                        }
                      />
                    </label>

                    <div className="markerNameCell">
                      <div
                        className={`markerTypeIcon ${marker.type}`}
                      >
                        {marker.icon ||
                          marker.type
                            .slice(
                              0,
                              1
                            )
                            .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {
                            marker.name
                          }
                        </strong>

                        <small>
                          {marker.description ||
                            "No description"}
                        </small>
                      </div>
                    </div>

                    <span className="markerTypeText">
                      {marker.type}
                    </span>

                    <span className="markerCoordinates">
                      {Number(
                        marker.x
                      ).toFixed(
                        2
                      )}
                      %
                      <br />
                      {Number(
                        marker.y
                      ).toFixed(
                        2
                      )}
                      %
                    </span>

                    <span
                      className={
                        marker.published
                          ? "markerStatus published"
                          : "markerStatus draft"
                      }
                    >
                      {marker.published
                        ? "Published"
                        : "Hidden"}
                    </span>

                    <div className="markerActions">
                      <Link
                        href={`/admin/maps/${sourceMapId}/edit`}
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            marker
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </section>

      <style jsx global>{`
        .markerManager {
          display: grid;
          gap: 16px;
        }

        .markerManagerHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
        }

        .markerManagerHeader > div:first-child > span,
        .copyHeader span,
        .markerListToolbar > div span {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.11em;
        }

        .markerManagerHeader h2 {
          margin: 5px 0 3px;
          font-size: 25px;
        }

        .markerManagerHeader p {
          margin: 0;
          color: #7388a7;
          font-size: 10px;
        }

        .markerManagerCount {
          text-align: right;
        }

        .markerManagerCount strong {
          display: block;
          color: #63ddff;
          font-size: 25px;
        }

        .markerManagerCount span {
          color: #647a99;
          font-size: 7px;
          font-weight: 900;
        }

        .markerManagerError,
        .markerManagerSuccess {
          padding: 11px 13px;
          border-radius: 9px;
          font-size: 9px;
        }

        .markerManagerError {
          border: 1px solid rgba(255,90,105,.2);
          background: rgba(140,20,35,.1);
          color: #ff99a4;
        }

        .markerManagerSuccess {
          border: 1px solid rgba(66,229,167,.18);
          background: rgba(66,229,167,.07);
          color: #74eeb8;
        }

        .markerCopyCard,
        .markerListCard {
          border: 1px solid rgba(110,148,205,.12);
          border-radius: 15px;
          background: rgba(7,16,31,.76);
        }

        .markerCopyCard {
          padding: 17px;
        }

        .copyHeader h3 {
          margin: 4px 0 0;
          font-size: 18px;
        }

        .copyGrid {
          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            auto
            minmax(0,1fr);
          gap: 10px;
          align-items: end;
          margin-top: 16px;
        }

        .copyGrid label {
          display: grid;
          gap: 5px;
        }

        .copyGrid label > span {
          color: #6d83a2;
          font-size: 7px;
          font-weight: 900;
        }

        .copyGrid select {
          width: 100%;
          min-height: 40px;
          padding: 0 10px;
          border: 1px solid rgba(112,149,205,.14);
          border-radius: 8px;
          background: #071122;
          color: white;
          font-size: 9px;
        }

        .copyArrow {
          padding-bottom: 10px;
          color: #63ddff;
          font-size: 18px;
        }

        .copyInfo {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 12px;
          align-items: center;
          margin-top: 12px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(3,10,22,.5);
        }

        .copyInfo > div {
          display: grid;
          gap: 2px;
        }

        .copyInfo > div:last-child {
          text-align: right;
        }

        .copyInfo strong {
          font-size: 9px;
        }

        .copyInfo span {
          color: #637a99;
          font-size: 7px;
        }

        .replaceToggle {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: 12px;
          padding: 10px;
          border: 1px solid rgba(255,177,70,.1);
          border-radius: 9px;
        }

        .replaceToggle input {
          width: 17px;
          height: 17px;
          accent-color: #ffb846;
        }

        .replaceToggle div {
          display: grid;
          gap: 2px;
        }

        .replaceToggle strong {
          font-size: 8px;
        }

        .replaceToggle span {
          color: #687e9c;
          font-size: 7px;
        }

        .copyActions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 14px;
        }

        .copyActions button {
          min-height: 38px;
          padding: 0 13px;
          border-radius: 8px;
          font-size: 8px;
          font-weight: 900;
          cursor: pointer;
        }

        .copySelected {
          border: 1px solid rgba(99,221,255,.18);
          background: rgba(99,221,255,.05);
          color: #8ce9ff;
        }

        .copyAll {
          border: 0;
          background: #63ddff;
          color: #04101b;
        }

        .copyActions button:disabled {
          opacity: .4;
          cursor: default;
        }

        .markerListToolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 14px;
          border-bottom: 1px solid rgba(110,148,205,.08);
        }

        .markerListToolbar > div {
          display: grid;
          gap: 3px;
        }

        .markerListToolbar strong {
          font-size: 11px;
        }

        .markerListToolbar input {
          width: min(260px,100%);
          min-height: 36px;
          padding: 0 10px;
          border: 1px solid rgba(112,149,205,.13);
          border-radius: 8px;
          background: #071122;
          color: white;
          font-size: 8px;
        }

        .markerTableHeader,
        .markerTableRow {
          display: grid;
          grid-template-columns:
            35px
            minmax(180px,1.5fr)
            .6fr
            .6fr
            .6fr
            .7fr;
          gap: 10px;
          align-items: center;
        }

        .markerTableHeader {
          min-height: 36px;
          padding: 0 14px;
          color: #536b8c;
          font-size: 6px;
          font-weight: 900;
          border-bottom: 1px solid rgba(110,148,205,.07);
        }

        .markerTableRow {
          min-height: 62px;
          padding: 8px 14px;
          border-bottom: 1px solid rgba(110,148,205,.06);
        }

        .markerTableRow:last-child {
          border-bottom: none;
        }

        .markerNameCell {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .markerTypeIcon {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #63ddff;
          color: #04101b;
          font-size: 8px;
          font-weight: 950;
        }

        .markerTypeIcon.landmark {
          background: #65e8a8;
        }

        .markerTypeIcon.story {
          background: #ab87ff;
        }

        .markerTypeIcon.event {
          background: #ff9e55;
        }

        .markerTypeIcon.spawn {
          background: #ffd866;
        }

        .markerNameCell strong {
          display: block;
          font-size: 9px;
        }

        .markerNameCell small {
          display: block;
          max-width: 300px;
          overflow: hidden;
          margin-top: 2px;
          color: #617797;
          font-size: 7px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .markerTypeText,
        .markerCoordinates {
          color: #758aa8;
          font-size: 8px;
        }

        .markerTypeText {
          text-transform: capitalize;
        }

        .markerStatus {
          width: fit-content;
          padding: 4px 6px;
          border-radius: 999px;
          font-size: 6px;
          font-weight: 900;
        }

        .markerStatus.published {
          background: rgba(66,229,167,.08);
          color: #5ee4a8;
        }

        .markerStatus.draft {
          background: rgba(255,177,70,.08);
          color: #ffc268;
        }

        .markerActions {
          display: flex;
          gap: 5px;
        }

        .markerActions a,
        .markerActions button {
          min-height: 29px;
          display: inline-flex;
          align-items: center;
          padding: 0 8px;
          border: 1px solid rgba(110,148,205,.11);
          border-radius: 7px;
          background: rgba(8,18,34,.7);
          color: #8ca2c0;
          font-size: 7px;
          text-decoration: none;
          cursor: pointer;
        }

        .markerActions button {
          color: #ff9ca7;
        }

        .markerEmpty {
          padding: 35px;
          color: #687e9d;
          font-size: 9px;
          text-align: center;
        }

        @media (max-width: 900px) {
          .copyGrid {
            grid-template-columns: 1fr;
          }

          .copyArrow {
            display: none;
          }

          .markerTableHeader {
            display: none;
          }

          .markerTableRow {
            grid-template-columns: 30px 1fr auto;
          }

          .markerTypeText,
          .markerCoordinates,
          .markerStatus {
            display: none;
          }
        }
      `}</style>
    </>
  );
}