"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import InteractiveMapViewer from "../../components/map/InteractiveMapViewer";
import MapCompareSlider from "../../components/map/MapCompareSlider";
import MapTimeline from "../../components/map/MapTimeline";

import {
  getPublishedMaps,
} from "../../services/map.service";

import type {
  AurosMap,
} from "../../types/maps";

export default function MapPage() {
  const [maps, setMaps] =
    useState<AurosMap[]>([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    compareMode,
    setCompareMode,
  ] = useState(false);

  const [
    compareLeftId,
    setCompareLeftId,
  ] = useState("");

  const [
    compareRightId,
    setCompareRightId,
  ] = useState("");

  useEffect(() => {
    getPublishedMaps()
      .then((data) => {
        setMaps(data);

        const current =
          data.find(
            (map) => map.current
          ) ??
          data[0] ??
          null;

        if (!current) {
          return;
        }

        setSelectedId(
          current.id
        );

        setCompareRightId(
          current.id
        );

        const older =
          data.find(
            (map) =>
              map.id !==
              current.id
          );

        setCompareLeftId(
          older?.id ??
            current.id
        );
      })
      .catch((loadError) => {
        console.error(
          "MAP LOAD ERROR:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load maps."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const selectedMap =
    useMemo(() => {
      return (
        maps.find(
          (map) =>
            map.id ===
            selectedId
        ) ??
        maps[0] ??
        null
      );
    }, [
      maps,
      selectedId,
    ]);

  const currentMap =
    useMemo(() => {
      return (
        maps.find(
          (map) =>
            map.current
        ) ??
        null
      );
    }, [maps]);

  const compareLeftMap =
    useMemo(() => {
      return (
        maps.find(
          (map) =>
            map.id ===
            compareLeftId
        ) ??
        null
      );
    }, [
      maps,
      compareLeftId,
    ]);

  const compareRightMap =
    useMemo(() => {
      return (
        maps.find(
          (map) =>
            map.id ===
            compareRightId
        ) ??
        null
      );
    }, [
      maps,
      compareRightId,
    ]);

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return null;
    }

    try {
      return new Intl.DateTimeFormat(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ).format(
        new Date(value)
      );
    } catch {
      return value;
    }
  }

  function getMapMeta(
    map: AurosMap
  ) {
    return [
      map.venture_name,

      map.season_number !== null
        ? `S${map.season_number}`
        : null,

      map.version,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function switchCompareMaps() {
    const oldLeft =
      compareLeftId;

    setCompareLeftId(
      compareRightId
    );

    setCompareRightId(
      oldLeft
    );
  }

  function selectMap(
    mapId: string
  ) {
    setSelectedId(
      mapId
    );

    if (compareMode) {
      setCompareRightId(
        mapId
      );
    }
  }

  return (
    <>
      <div className="publicMapPage">
        {/* =========================================
            HEADER
        ========================================== */}

        <header className="publicMapHeader">
          <div className="publicMapEyebrow">
            AUROS WORLD
          </div>

          <div className="publicMapTitleRow">
            <div>
              <h1>
                Interactive Map
              </h1>

              <p>
                Explore every version of the Auros island,
                discover locations and travel through the
                history of the world.
              </p>
            </div>

            {currentMap && (
              <div className="currentMapIndicator">
                <span>
                  CURRENT MAP
                </span>

                <strong>
                  {currentMap.name}
                </strong>

                {getMapMeta(
                  currentMap
                ) && (
                  <small>
                    {getMapMeta(
                      currentMap
                    )}
                  </small>
                )}
              </div>
            )}
          </div>
        </header>

        {/* =========================================
            LOADING / ERROR
        ========================================== */}

        {loading ? (
          <div className="mapState">
            Loading Auros maps...
          </div>
        ) : error ? (
          <div className="mapState error">
            {error}
          </div>
        ) : !selectedMap ? (
          <div className="mapState">
            No published maps are currently available.
          </div>
        ) : (
          <>
            {/* =========================================
                MAP ARCHIVE
            ========================================== */}

            <section className="mapArchiveSelector">
              <div className="mapArchiveSelectorHeader">
                <div>
                  <span>
                    MAP ARCHIVE
                  </span>

                  <h2>
                    Choose an era
                  </h2>
                </div>

                <div className="mapArchiveActions">
                  <small>
                    {maps.length}{" "}
                    {maps.length === 1
                      ? "map"
                      : "maps"}
                  </small>

                  {maps.length >= 2 && (
                    <button
                      type="button"
                      className={
                        compareMode
                          ? "compareModeButton active"
                          : "compareModeButton"
                      }
                      onClick={() =>
                        setCompareMode(
                          (current) =>
                            !current
                        )
                      }
                    >
                      {compareMode
                        ? "Exit Compare"
                        : "Compare Maps"}
                    </button>
                  )}
                </div>
              </div>

              <div className="mapArchiveCards">
                {maps.map((map) => (
                  <button
                    key={map.id}
                    type="button"
                    className={
                      map.id ===
                      selectedMap.id
                        ? "mapArchiveCard active"
                        : "mapArchiveCard"
                    }
                    onClick={() =>
                      selectMap(
                        map.id
                      )
                    }
                  >
                    <div className="archiveCardImage">
                      <img
                        src={
                          map.thumbnail_url ||
                          map.image_url
                        }
                        alt={
                          map.name
                        }
                      />

                      {map.current && (
                        <span>
                          CURRENT
                        </span>
                      )}
                    </div>

                    <div className="archiveCardContent">
                      <div>
                        {[
                          map.venture_name,

                          map.season_number !==
                          null
                            ? `S${map.season_number}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") ||
                          "AUROS"}
                      </div>

                      <strong>
                        {map.name}
                      </strong>

                      <small>
                        {[
                          map.season_name,
                          map.version,
                        ]
                          .filter(Boolean)
                          .join(" · ") ||
                          "Map Version"}
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* =========================================
                PHASE 4.2 — TIMELINE
            ========================================== */}

            <MapTimeline
              maps={maps}
              selectedId={
                selectedId
              }
              onSelect={(
                mapId
              ) => {
                selectMap(
                  mapId
                );
              }}
            />

            {/* =========================================
                COMPARE CONFIGURATION
            ========================================== */}

            {compareMode && (
              <section className="mapCompareConfiguration">
                <div className="compareSelectField">
                  <span>
                    MAP A
                  </span>

                  <select
                    value={
                      compareLeftId
                    }
                    onChange={(event) =>
                      setCompareLeftId(
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
                </div>

                <button
                  type="button"
                  className="compareSwapButton"
                  onClick={
                    switchCompareMaps
                  }
                  title="Swap maps"
                >
                  ⇄
                </button>

                <div className="compareSelectField">
                  <span>
                    MAP B
                  </span>

                  <select
                    value={
                      compareRightId
                    }
                    onChange={(event) => {
                      setCompareRightId(
                        event.target.value
                      );

                      setSelectedId(
                        event.target.value
                      );
                    }}
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
                </div>
              </section>
            )}

            {/* =========================================
                MAIN AREA
            ========================================== */}

            <div
              className={
                compareMode
                  ? "mapMainLayout compareActive"
                  : "mapMainLayout"
              }
            >
              <main className="mapViewerColumn">
                {compareMode &&
                compareLeftMap &&
                compareRightMap ? (
                  <MapCompareSlider
                    leftMap={
                      compareLeftMap
                    }
                    rightMap={
                      compareRightMap
                    }
                  />
                ) : (
                  <InteractiveMapViewer
                    key={
                      selectedMap.id
                    }
                    map={
                      selectedMap
                    }
                  />
                )}
              </main>

              {/* =========================================
                  NORMAL INFO SIDEBAR
              ========================================== */}

              {!compareMode && (
                <aside className="mapInformation">
                  <div className="mapInfoCard primary">
                    <div className="mapInfoTop">
                      <span>
                        {selectedMap.current
                          ? "CURRENT MAP"
                          : "ARCHIVED MAP"}
                      </span>

                      {selectedMap.current && (
                        <i />
                      )}
                    </div>

                    <h2>
                      {selectedMap.name}
                    </h2>

                    <p className="mapInfoContext">
                      {[
                        selectedMap.venture_name,

                        selectedMap.season_number !==
                        null
                          ? `Season ${selectedMap.season_number}`
                          : null,

                        selectedMap.season_name,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                    {selectedMap.description && (
                      <p className="mapDescription">
                        {
                          selectedMap.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="mapInfoCard">
                    <span className="infoCardLabel">
                      MAP DETAILS
                    </span>

                    <div className="mapDetailRows">
                      <div>
                        <span>
                          Version
                        </span>

                        <strong>
                          {selectedMap.version ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Released
                        </span>

                        <strong>
                          {formatDate(
                            selectedMap.release_date
                          ) ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Season
                        </span>

                        <strong>
                          {selectedMap.season_number !==
                          null
                            ? `Season ${selectedMap.season_number}`
                            : "—"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Status
                        </span>

                        <strong
                          className={
                            selectedMap.current
                              ? "currentValue"
                              : ""
                          }
                        >
                          {selectedMap.current
                            ? "Live"
                            : "Archived"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="mapPhaseNotice">
                    <span>
                      AUROS MAP SYSTEM
                    </span>

                    <strong>
                      Interactive world archive
                    </strong>

                    <p>
                      Explore POIs, landmarks, story locations,
                      events and historical versions of the
                      Auros island.
                    </p>
                  </div>
                </aside>
              )}

              {/* =========================================
                  COMPARE SIDEBAR
              ========================================== */}

              {compareMode &&
                compareLeftMap &&
                compareRightMap && (
                  <aside className="mapInformation">
                    <div className="mapInfoCard compareInfoCard">
                      <span className="infoCardLabel">
                        COMPARE MODE
                      </span>

                      <h2>
                        Map Comparison
                      </h2>

                      <p className="compareInfoDescription">
                        Drag the divider across the map to compare
                        both versions directly.
                      </p>
                    </div>

                    <div className="mapInfoCard compareMapInfo">
                      <span className="compareColorLabel left">
                        MAP A
                      </span>

                      <strong>
                        {
                          compareLeftMap.name
                        }
                      </strong>

                      <small>
                        {getMapMeta(
                          compareLeftMap
                        ) ||
                          "Map Version"}
                      </small>
                    </div>

                    <div className="mapInfoCard compareMapInfo">
                      <span className="compareColorLabel right">
                        MAP B
                      </span>

                      <strong>
                        {
                          compareRightMap.name
                        }
                      </strong>

                      <small>
                        {getMapMeta(
                          compareRightMap
                        ) ||
                          "Map Version"}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="exitCompareSideButton"
                      onClick={() =>
                        setCompareMode(
                          false
                        )
                      }
                    >
                      Exit Compare Mode
                    </button>
                  </aside>
                )}
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .publicMapPage {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding-bottom: 70px;
        }

        /* =====================================
           HEADER
        ====================================== */

        .publicMapHeader {
          padding: 45px 0 30px;
        }

        .publicMapEyebrow {
          color: #63ddff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .publicMapTitleRow {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
        }

        .publicMapTitleRow h1 {
          margin: 8px 0 10px;

          font-size:
            clamp(
              43px,
              7vw,
              72px
            );

          line-height: 1;
          letter-spacing: -0.045em;
        }

        .publicMapTitleRow p {
          max-width: 700px;
          margin: 0;
          color: #91a4c2;
          font-size: 15px;
          line-height: 1.7;
        }

        .currentMapIndicator {
          min-width: 210px;
          padding: 13px 14px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.16
            );

          border-radius: 12px;

          background:
            rgba(
              99,
              221,
              255,
              0.05
            );
        }

        .currentMapIndicator span {
          display: block;
          margin-bottom: 4px;

          color: #63ddff;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .currentMapIndicator strong {
          display: block;
          color: white;
          font-size: 12px;
        }

        .currentMapIndicator small {
          display: block;
          margin-top: 3px;
          color: #6f87a7;
          font-size: 7px;
        }

        /* =====================================
           ARCHIVE
        ====================================== */

        .mapArchiveSelector {
          margin-bottom: 16px;
        }

        .mapArchiveSelectorHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 11px;
        }

        .mapArchiveSelectorHeader span {
          color: #63ddff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.11em;
        }

        .mapArchiveSelectorHeader h2 {
          margin: 3px 0 0;
          font-size: 20px;
        }

        .mapArchiveActions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .mapArchiveActions small {
          color: #627899;
          font-size: 8px;
        }

        .compareModeButton {
          min-height: 32px;
          padding: 0 11px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.17
            );

          border-radius: 8px;

          background:
            rgba(
              99,
              221,
              255,
              0.05
            );

          color: #83e6ff;
          font-size: 7px;
          font-weight: 900;
          cursor: pointer;
        }

        .compareModeButton:hover {
          border-color:
            rgba(
              99,
              221,
              255,
              0.3
            );

          background:
            rgba(
              99,
              221,
              255,
              0.09
            );
        }

        .compareModeButton.active {
          background: #63ddff;
          color: #04101b;
        }

        .mapArchiveCards {
          display: flex;
          gap: 9px;

          overflow-x: auto;

          padding-bottom: 5px;

          scrollbar-width: thin;
        }

        .mapArchiveCard {
          width: 205px;
          min-width: 205px;

          overflow: hidden;

          padding: 0;

          border:
            1px solid
            rgba(
              110,
              148,
              205,
              0.11
            );

          border-radius: 12px;

          background:
            rgba(
              7,
              16,
              31,
              0.7
            );

          color: white;
          text-align: left;
          cursor: pointer;

          transition:
            border-color 0.15s ease,
            background 0.15s ease,
            transform 0.15s ease;
        }

        .mapArchiveCard:hover {
          transform: translateY(-2px);

          border-color:
            rgba(
              99,
              221,
              255,
              0.23
            );
        }

        .mapArchiveCard.active {
          border-color:
            rgba(
              99,
              221,
              255,
              0.42
            );

          background:
            rgba(
              99,
              221,
              255,
              0.06
            );
        }

        .archiveCardImage {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #02060d;
        }

        .archiveCardImage img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .archiveCardImage span {
          position: absolute;
          top: 7px;
          left: 7px;

          padding: 4px 6px;

          border-radius: 999px;

          background: #63ddff;
          color: #03101a;

          font-size: 6px;
          font-weight: 950;
          letter-spacing: 0.06em;
        }

        .archiveCardContent {
          padding: 9px 10px 11px;
        }

        .archiveCardContent > div {
          color: #63ddff;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 0.07em;
        }

        .archiveCardContent strong {
          display: block;

          margin-top: 4px;

          overflow: hidden;

          font-size: 11px;

          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .archiveCardContent small {
          display: block;

          margin-top: 3px;

          overflow: hidden;

          color: #6c82a2;
          font-size: 7px;

          white-space: nowrap;
          text-overflow: ellipsis;
        }

        /* =====================================
           COMPARE CONFIG
        ====================================== */

        .mapCompareConfiguration {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            auto
            minmax(0, 1fr);

          align-items: end;

          gap: 10px;

          margin-bottom: 14px;

          padding: 13px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.13
            );

          border-radius: 12px;

          background:
            rgba(
              7,
              16,
              31,
              0.72
            );
        }

        .compareSelectField {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .compareSelectField span {
          color: #63ddff;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.09em;
        }

        .compareSelectField select {
          width: 100%;
          min-height: 38px;

          padding: 0 10px;

          border:
            1px solid
            rgba(
              112,
              149,
              205,
              0.14
            );

          border-radius: 8px;

          outline: none;

          background: #071122;
          color: white;
          font-size: 9px;
        }

        .compareSwapButton {
          width: 38px;
          height: 38px;

          display: grid;
          place-items: center;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.16
            );

          border-radius: 9px;

          background:
            rgba(
              99,
              221,
              255,
              0.05
            );

          color: #8ce9ff;
          font-size: 17px;
          cursor: pointer;
        }

        .compareSwapButton:hover {
          background:
            rgba(
              99,
              221,
              255,
              0.1
            );
        }

        /* =====================================
           MAIN
        ====================================== */

        .mapMainLayout {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            280px;

          gap: 14px;

          align-items: start;
        }

        .mapMainLayout.compareActive {
          grid-template-columns:
            minmax(0, 1fr)
            260px;
        }

        .mapViewerColumn {
          min-width: 0;
        }

        /* =====================================
           SIDE INFO
        ====================================== */

        .mapInformation {
          position: sticky;
          top: 90px;

          display: grid;
          gap: 10px;
        }

        .mapInfoCard {
          padding: 15px;

          border:
            1px solid
            rgba(
              110,
              148,
              205,
              0.11
            );

          border-radius: 13px;

          background:
            rgba(
              7,
              16,
              31,
              0.74
            );
        }

        .mapInfoCard.primary {
          padding: 17px;
        }

        .mapInfoTop {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .mapInfoTop span {
          color: #63ddff;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .mapInfoTop i {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #42e5a7;

          box-shadow:
            0 0 8px
            rgba(
              66,
              229,
              167,
              0.6
            );
        }

        .mapInfoCard h2 {
          margin: 8px 0 4px;

          font-size: 22px;
          letter-spacing: -0.025em;
        }

        .mapInfoContext {
          margin: 0;
          color: #7186a5;
          font-size: 8px;
        }

        .mapDescription {
          margin: 13px 0 0;
          padding-top: 12px;

          border-top:
            1px solid
            rgba(
              110,
              148,
              205,
              0.08
            );

          color: #8fa1bc;
          font-size: 9px;
          line-height: 1.6;
        }

        .infoCardLabel {
          color: #637b9c;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.09em;
        }

        .mapDetailRows {
          margin-top: 8px;
        }

        .mapDetailRows > div {
          min-height: 34px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;

          border-bottom:
            1px solid
            rgba(
              110,
              148,
              205,
              0.07
            );
        }

        .mapDetailRows
          > div:last-child {
          border-bottom: none;
        }

        .mapDetailRows span {
          color: #637897;
          font-size: 7px;
        }

        .mapDetailRows strong {
          color: #acbad0;
          font-size: 8px;
        }

        .mapDetailRows
          .currentValue {
          color: #42e5a7;
        }

        .mapPhaseNotice {
          padding: 15px;

          border:
            1px dashed
            rgba(
              159,
              112,
              255,
              0.2
            );

          border-radius: 13px;

          background:
            rgba(
              77,
              44,
              130,
              0.07
            );
        }

        .mapPhaseNotice > span {
          color: #a98aff;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 0.09em;
        }

        .mapPhaseNotice strong {
          display: block;
          margin-top: 5px;
          font-size: 10px;
        }

        .mapPhaseNotice p {
          margin: 5px 0 0;

          color: #7488a6;
          font-size: 8px;
          line-height: 1.55;
        }

        /* =====================================
           COMPARE INFO
        ====================================== */

        .compareInfoCard h2 {
          margin-top: 7px;
        }

        .compareInfoDescription {
          margin: 6px 0 0;

          color: #788da9;
          font-size: 8px;
          line-height: 1.55;
        }

        .compareMapInfo {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .compareMapInfo strong {
          font-size: 11px;
        }

        .compareMapInfo small {
          color: #697f9e;
          font-size: 7px;
        }

        .compareColorLabel {
          width: fit-content;

          padding: 4px 6px;

          border-radius: 999px;

          font-size: 6px;
          font-weight: 900;
        }

        .compareColorLabel.left {
          background:
            rgba(
              99,
              221,
              255,
              0.1
            );

          color: #63ddff;
        }

        .compareColorLabel.right {
          background:
            rgba(
              171,
              135,
              255,
              0.12
            );

          color: #b89cff;
        }

        .exitCompareSideButton {
          min-height: 38px;

          border:
            1px solid
            rgba(
              112,
              149,
              205,
              0.13
            );

          border-radius: 9px;

          background:
            rgba(
              7,
              16,
              31,
              0.7
            );

          color: #8299b8;

          font-size: 8px;
          font-weight: 900;

          cursor: pointer;
        }

        .exitCompareSideButton:hover {
          color: white;

          border-color:
            rgba(
              99,
              221,
              255,
              0.21
            );
        }

        /* =====================================
           STATES
        ====================================== */

        .mapState {
          min-height: 360px;

          display: grid;
          place-items: center;

          padding: 30px;

          border:
            1px dashed
            rgba(
              110,
              148,
              205,
              0.12
            );

          border-radius: 16px;

          color: #6d82a1;

          background:
            rgba(
              6,
              14,
              28,
              0.45
            );

          font-size: 10px;

          text-align: center;
        }

        .mapState.error {
          color: #ff9aa5;
        }

        /* =====================================
           RESPONSIVE
        ====================================== */

        @media (max-width: 1000px) {
          .mapMainLayout,
          .mapMainLayout.compareActive {
            grid-template-columns: 1fr;
          }

          .mapInformation {
            position: static;

            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

          .mapInfoCard.primary,
          .compareInfoCard {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 700px) {
          .publicMapHeader {
            padding-top: 28px;
          }

          .publicMapTitleRow {
            align-items: stretch;
            flex-direction: column;
          }

          .currentMapIndicator {
            min-width: 0;
          }

          .mapArchiveSelectorHeader {
            align-items: flex-start;
            flex-direction: column;
          }

          .mapArchiveActions {
            width: 100%;

            justify-content: space-between;
          }

          .mapArchiveCard {
            width: 175px;
            min-width: 175px;
          }

          .mapCompareConfiguration {
            grid-template-columns: 1fr;
          }

          .compareSwapButton {
            width: 100%;
          }

          .mapInformation {
            grid-template-columns: 1fr;
          }

          .mapInfoCard.primary,
          .compareInfoCard {
            grid-column: auto;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .mapArchiveCard,
          .compareModeButton {
            transition: none;
          }

          .mapArchiveCard:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}