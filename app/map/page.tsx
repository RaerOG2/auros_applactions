"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import InteractiveMapViewer from "../../components/map/InteractiveMapViewer";
import MapCompareSlider from "../../components/map/MapCompareSlider";
import MapTimeline from "../../components/map/MapTimeline";

import {
  getPublishedMaps,
} from "../../services/map.service";

import {
  getPublishedMapMarkers,
} from "../../services/map-marker.service";

import type {
  AurosMap,
} from "../../types/maps";

import type {
  MapMarker,
} from "../../types/map-markers";

type SearchMarker = MapMarker & {
  mapName: string;
  mapVersion: string | null;
};

/* =========================================================
   PAGE

   useSearchParams requires a Suspense boundary during
   production prerendering in Next.js.

   The complete interactive map lives inside
   MapPageContent so none of the existing map logic
   needs to change.
   ========================================================= */

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <MapPageLoading />
      }
    >
      <MapPageContent />
    </Suspense>
  );
}

/* =========================================================
   SUSPENSE FALLBACK
   ========================================================= */

function MapPageLoading() {
  return (
    <>
      <div className="publicMapPage">
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
          </div>
        </header>

        <div className="mapState">
          Loading Auros maps...
        </div>
      </div>

      <MapPageStyles />
    </>
  );
}

/* =========================================================
   MAP PAGE CONTENT
   ========================================================= */

function MapPageContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

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

  const [
    allMarkers,
    setAllMarkers,
  ] = useState<SearchMarker[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    focusMarkerId,
    setFocusMarkerId,
  ] = useState<string | null>(
    null
  );

  const [
    markerSearchLoading,
    setMarkerSearchLoading,
  ] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const data =
          await getPublishedMaps();

        setMaps(data);

        const urlMapId =
          searchParams.get(
            "map"
          );

        const urlLocationId =
          searchParams.get(
            "location"
          );

        const mapFromUrl =
          urlMapId
            ? data.find(
                (map) =>
                  map.id ===
                  urlMapId
              )
            : null;

        const current =
          mapFromUrl ??
          data.find(
            (map) =>
              map.current
          ) ??
          data[0] ??
          null;

        if (current) {
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
        }

        if (urlLocationId) {
          setFocusMarkerId(
            urlLocationId
          );
        }
      } catch (loadError) {
        console.error(
          "MAP LOAD ERROR:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load maps."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [searchParams]);

  useEffect(() => {
    if (
      maps.length === 0
    ) {
      return;
    }

    async function loadMarkers() {
      setMarkerSearchLoading(
        true
      );

      try {
        const results =
          await Promise.all(
            maps.map(
              async (map) => {
                const markers =
                  await getPublishedMapMarkers(
                    map.id
                  );

                return markers.map(
                  (marker) => ({
                    ...marker,

                    mapName:
                      map.name,

                    mapVersion:
                      map.version ??
                      null,
                  })
                );
              }
            )
          );

        setAllMarkers(
          results.flat()
        );
      } catch (markerError) {
        console.error(
          "GLOBAL MARKER LOAD ERROR:",
          markerError
        );

        setAllMarkers([]);
      } finally {
        setMarkerSearchLoading(
          false
        );
      }
    }

    loadMarkers();
  }, [maps]);

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

  const searchResults =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (
        query.length < 2
      ) {
        return [];
      }

      return allMarkers
        .filter(
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
              ) ||
            marker.mapName
              .toLowerCase()
              .includes(
                query
              ) ||
            marker.description
              ?.toLowerCase()
              .includes(
                query
              )
        )
        .slice(
          0,
          12
        );
    }, [
      search,
      allMarkers,
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

  function updateMapUrl(
    mapId: string,
    markerId?: string | null
  ) {
    const params =
      new URLSearchParams();

    params.set(
      "map",
      mapId
    );

    if (markerId) {
      params.set(
        "location",
        markerId
      );
    }

    router.replace(
      `/map?${params.toString()}`,
      {
        scroll: false,
      }
    );
  }

  function selectMap(
    mapId: string
  ) {
    setSelectedId(
      mapId
    );

    setFocusMarkerId(
      null
    );

    if (compareMode) {
      setCompareRightId(
        mapId
      );
    }

    updateMapUrl(
      mapId
    );
  }

  function selectSearchResult(
    marker: SearchMarker
  ) {
    setCompareMode(
      false
    );

    setSelectedId(
      marker.map_id
    );

    setFocusMarkerId(
      marker.id
    );

    setSearch("");

    updateMapUrl(
      marker.map_id,
      marker.id
    );
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

  return (
    <>
      <div className="publicMapPage">
        {/* HEADER */}

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
            {/* SEARCH */}

            <section className="mapSearchSection">
              <div className="mapSearchHeading">
                <div>
                  <span>
                    LOCATION SEARCH
                  </span>

                  <strong>
                    Find a place
                  </strong>
                </div>

                <small>
                  {markerSearchLoading
                    ? "Loading locations..."
                    : `${allMarkers.length} locations indexed`}
                </small>
              </div>

              <div className="mapSearchBox">
                <span className="mapSearchIcon">
                  ⌕
                </span>

                <input
                  value={
                    search
                  }
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search Auros City, landmarks, story locations..."
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch(
                        ""
                      )
                    }
                  >
                    ×
                  </button>
                )}
              </div>

              {search.trim().length >=
                2 && (
                <div className="mapSearchResults">
                  {searchResults.length ===
                  0 ? (
                    <div className="mapSearchEmpty">
                      No locations found.
                    </div>
                  ) : (
                    searchResults.map(
                      (marker) => (
                        <button
                          key={
                            marker.id
                          }
                          type="button"
                          className="mapSearchResult"
                          onClick={() =>
                            selectSearchResult(
                              marker
                            )
                          }
                        >
                          <div
                            className={`searchMarkerIcon ${marker.type}`}
                          >
                            {marker.icon ||
                              marker.type
                                .slice(
                                  0,
                                  1
                                )
                                .toUpperCase()}
                          </div>

                          <div className="searchMarkerText">
                            <strong>
                              {
                                marker.name
                              }
                            </strong>

                            <span>
                              {
                                marker.mapName
                              }
                              {marker.mapVersion
                                ? ` · ${marker.mapVersion}`
                                : ""}
                            </span>
                          </div>

                          <div className="searchMarkerType">
                            {
                              marker.type
                            }
                          </div>

                          <span className="searchArrow">
                            →
                          </span>
                        </button>
                      )
                    )
                  )}
                </div>
              )}
            </section>

            {/* MAP ARCHIVE */}

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
                {maps.map(
                  (map) => (
                    <button
                      key={
                        map.id
                      }
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
                            .filter(
                              Boolean
                            )
                            .join(
                              " · "
                            ) ||
                            "AUROS"}
                        </div>

                        <strong>
                          {
                            map.name
                          }
                        </strong>

                        <small>
                          {[
                            map.season_name,
                            map.version,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              " · "
                            ) ||
                            "Map Version"}
                        </small>
                      </div>
                    </button>
                  )
                )}
              </div>
            </section>

            {/* TIMELINE */}

            <MapTimeline
              maps={maps}
              selectedId={
                selectedId
              }
              onSelect={
                selectMap
              }
            />

            {/* COMPARE */}

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

            {/* MAIN */}

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
                    focusMarkerId={
                      focusMarkerId
                    }
                  />
                )}
              </main>

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
                      {
                        selectedMap.name
                      }
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
                        .filter(
                          Boolean
                        )
                        .join(
                          " · "
                        )}
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

                  {focusMarkerId && (
                    <button
                      type="button"
                      className="clearLocationFocus"
                      onClick={() => {
                        setFocusMarkerId(
                          null
                        );

                        updateMapUrl(
                          selectedMap.id
                        );
                      }}
                    >
                      Clear Location Focus
                    </button>
                  )}
                </aside>
              )}

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
                  </aside>
                )}
            </div>
          </>
        )}
      </div>

      <MapPageStyles />
    </>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

function MapPageStyles() {
  return (
    <style jsx global>{`
      .publicMapPage {
        width: 100%;
        max-width: 1500px;
        margin: 0 auto;
        padding-bottom: 70px;
      }

      .publicMapHeader {
        padding: 45px 0 30px;
      }

      .publicMapEyebrow {
        color: #63ddff;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .15em;
      }

      .publicMapTitleRow {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 30px;
      }

      .publicMapTitleRow h1 {
        margin: 8px 0 10px;
        font-size: clamp(43px,7vw,72px);
        line-height: 1;
        letter-spacing: -.045em;
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
        border: 1px solid rgba(99,221,255,.16);
        border-radius: 12px;
        background: rgba(99,221,255,.05);
      }

      .currentMapIndicator span {
        display: block;
        color: #63ddff;
        font-size: 7px;
        font-weight: 900;
      }

      .currentMapIndicator strong {
        display: block;
        margin-top: 4px;
        font-size: 12px;
      }

      .currentMapIndicator small {
        display: block;
        margin-top: 3px;
        color: #6f87a7;
        font-size: 7px;
      }

      /* SEARCH */

      .mapSearchSection {
        position: relative;
        z-index: 100;
        margin-bottom: 18px;
      }

      .mapSearchHeading {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 8px;
      }

      .mapSearchHeading > div {
        display: grid;
        gap: 3px;
      }

      .mapSearchHeading span {
        color: #63ddff;
        font-size: 7px;
        font-weight: 900;
        letter-spacing: .11em;
      }

      .mapSearchHeading strong {
        font-size: 15px;
      }

      .mapSearchHeading small {
        color: #627899;
        font-size: 7px;
      }

      .mapSearchBox {
        min-height: 48px;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 0 13px;
        border: 1px solid rgba(99,221,255,.14);
        border-radius: 12px;
        background: rgba(7,16,31,.9);
      }

      .mapSearchIcon {
        color: #63ddff;
        font-size: 20px;
      }

      .mapSearchBox input {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: white;
        font-size: 11px;
      }

      .mapSearchBox input::placeholder {
        color: #536b8c;
      }

      .mapSearchBox button {
        width: 30px;
        height: 30px;
        border: 0;
        border-radius: 8px;
        background: rgba(255,255,255,.04);
        color: #7f94b2;
        cursor: pointer;
      }

      .mapSearchResults {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        max-height: 390px;
        overflow-y: auto;
        padding: 7px;
        border: 1px solid rgba(99,221,255,.15);
        border-radius: 12px;
        background: rgba(4,11,24,.98);
        box-shadow: 0 25px 70px rgba(0,0,0,.45);
      }

      .mapSearchResult {
        width: 100%;
        min-height: 53px;
        display: grid;
        grid-template-columns: auto minmax(0,1fr) auto auto;
        align-items: center;
        gap: 10px;
        padding: 7px 9px;
        border: 1px solid transparent;
        border-radius: 9px;
        background: transparent;
        color: white;
        text-align: left;
        cursor: pointer;
      }

      .mapSearchResult:hover {
        border-color: rgba(99,221,255,.13);
        background: rgba(99,221,255,.05);
      }

      .searchMarkerIcon {
        width: 31px;
        height: 31px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: #63ddff;
        color: #04101b;
        font-size: 8px;
        font-weight: 950;
      }

      .searchMarkerIcon.landmark {
        background: #65e8a8;
      }

      .searchMarkerIcon.story {
        background: #ab87ff;
      }

      .searchMarkerIcon.event {
        background: #ff9e55;
      }

      .searchMarkerIcon.spawn {
        background: #ffd866;
      }

      .searchMarkerText {
        min-width: 0;
        display: grid;
        gap: 2px;
      }

      .searchMarkerText strong {
        font-size: 9px;
      }

      .searchMarkerText span {
        color: #637b9b;
        font-size: 7px;
      }

      .searchMarkerType {
        padding: 4px 6px;
        border-radius: 999px;
        background: rgba(99,221,255,.06);
        color: #7890af;
        font-size: 6px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .searchArrow {
        color: #63ddff;
      }

      .mapSearchEmpty {
        padding: 25px;
        color: #667d9e;
        font-size: 9px;
        text-align: center;
      }

      /* ARCHIVE */

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
        border: 1px solid rgba(99,221,255,.17);
        border-radius: 8px;
        background: rgba(99,221,255,.05);
        color: #83e6ff;
        font-size: 7px;
        font-weight: 900;
        cursor: pointer;
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
      }

      .mapArchiveCard {
        width: 205px;
        min-width: 205px;
        overflow: hidden;
        padding: 0;
        border: 1px solid rgba(110,148,205,.11);
        border-radius: 12px;
        background: rgba(7,16,31,.7);
        color: white;
        text-align: left;
        cursor: pointer;
      }

      .mapArchiveCard.active {
        border-color: rgba(99,221,255,.42);
        background: rgba(99,221,255,.06);
      }

      .archiveCardImage {
        position: relative;
        aspect-ratio: 16 / 9;
        overflow: hidden;
      }

      .archiveCardImage img {
        width: 100%;
        height: 100%;
        display: block;
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
      }

      .archiveCardContent {
        padding: 9px 10px 11px;
      }

      .archiveCardContent > div {
        color: #63ddff;
        font-size: 6px;
        font-weight: 900;
      }

      .archiveCardContent strong {
        display: block;
        margin-top: 4px;
        font-size: 11px;
      }

      .archiveCardContent small {
        display: block;
        margin-top: 3px;
        color: #6c82a2;
        font-size: 7px;
      }

      /* COMPARE */

      .mapCompareConfiguration {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 10px;
        align-items: end;
        margin-bottom: 14px;
        padding: 13px;
        border: 1px solid rgba(99,221,255,.13);
        border-radius: 12px;
        background: rgba(7,16,31,.72);
      }

      .compareSelectField {
        display: grid;
        gap: 5px;
      }

      .compareSelectField span {
        color: #63ddff;
        font-size: 7px;
        font-weight: 900;
      }

      .compareSelectField select {
        width: 100%;
        min-height: 38px;
        padding: 0 10px;
        border: 1px solid rgba(112,149,205,.14);
        border-radius: 8px;
        background: #071122;
        color: white;
      }

      .compareSwapButton {
        width: 38px;
        height: 38px;
        border: 1px solid rgba(99,221,255,.16);
        border-radius: 9px;
        background: rgba(99,221,255,.05);
        color: #8ce9ff;
        cursor: pointer;
      }

      /* MAIN */

      .mapMainLayout {
        display: grid;
        grid-template-columns: minmax(0,1fr) 280px;
        gap: 14px;
        align-items: start;
      }

      .mapMainLayout.compareActive {
        grid-template-columns: minmax(0,1fr) 260px;
      }

      .mapViewerColumn {
        min-width: 0;
      }

      .mapInformation {
        position: sticky;
        top: 90px;
        display: grid;
        gap: 10px;
      }

      .mapInfoCard {
        padding: 15px;
        border: 1px solid rgba(110,148,205,.11);
        border-radius: 13px;
        background: rgba(7,16,31,.74);
      }

      .mapInfoTop {
        display: flex;
        gap: 7px;
        align-items: center;
      }

      .mapInfoTop span,
      .infoCardLabel {
        color: #63ddff;
        font-size: 7px;
        font-weight: 900;
      }

      .mapInfoTop i {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #42e5a7;
      }

      .mapInfoCard h2 {
        margin: 8px 0 4px;
        font-size: 22px;
      }

      .mapInfoContext,
      .compareInfoDescription {
        color: #7186a5;
        font-size: 8px;
      }

      .mapDescription {
        color: #8fa1bc;
        font-size: 9px;
        line-height: 1.6;
      }

      .mapDetailRows > div {
        min-height: 34px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(110,148,205,.07);
      }

      .mapDetailRows span {
        color: #637897;
        font-size: 7px;
      }

      .mapDetailRows strong {
        font-size: 8px;
      }

      .currentValue {
        color: #42e5a7;
      }

      .clearLocationFocus {
        min-height: 38px;
        border: 1px solid rgba(99,221,255,.15);
        border-radius: 9px;
        background: rgba(99,221,255,.05);
        color: #8ce9ff;
        font-size: 8px;
        font-weight: 900;
        cursor: pointer;
      }

      .compareMapInfo {
        display: grid;
        gap: 5px;
      }

      .compareColorLabel {
        width: fit-content;
        padding: 4px 6px;
        border-radius: 999px;
        font-size: 6px;
        font-weight: 900;
      }

      .compareColorLabel.left {
        color: #63ddff;
        background: rgba(99,221,255,.1);
      }

      .compareColorLabel.right {
        color: #b89cff;
        background: rgba(171,135,255,.12);
      }

      .mapState {
        min-height: 360px;
        display: grid;
        place-items: center;
        color: #6d82a1;
      }

      .mapState.error {
        color: #ff9aa5;
      }

      @media (max-width: 1000px) {
        .mapMainLayout,
        .mapMainLayout.compareActive {
          grid-template-columns: 1fr;
        }

        .mapInformation {
          position: static;
        }
      }

      @media (max-width: 700px) {
        .publicMapTitleRow {
          flex-direction: column;
          align-items: stretch;
        }

        .mapCompareConfiguration {
          grid-template-columns: 1fr;
        }

        .compareSwapButton {
          width: 100%;
        }

        .mapSearchResult {
          grid-template-columns:
            auto
            minmax(0,1fr)
            auto;
        }

        .searchMarkerType {
          display: none;
        }
      }
    `}</style>
  );
}