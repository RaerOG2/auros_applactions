"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import InteractiveMapViewer from "../../components/map/InteractiveMapViewer";

import { getPublishedMaps } from "../../services/map.service";

import type { AurosMap } from "../../types/maps";

export default function MapPage() {
  const [maps, setMaps] =
    useState<AurosMap[]>([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    getPublishedMaps()
      .then((data) => {
        setMaps(data);

        const current =
          data.find(
            (map) => map.current
          ) ?? data[0];

        if (current) {
          setSelectedId(
            current.id
          );
        }
      })
      .catch((loadError) => {
        console.error(
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
            map.id === selectedId
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
      return maps.find(
        (map) => map.current
      );
    }, [maps]);

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return null;
    }

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
  }

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
                Explore every version of
                the Auros island and travel
                through its history.
              </p>
            </div>

            {currentMap && (
              <div className="currentMapIndicator">
                <span>
                  CURRENT MAP
                </span>

                <strong>
                  {
                    currentMap.name
                  }
                </strong>
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
            No published maps are
            currently available.
          </div>
        ) : (
          <>
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

                <small>
                  {maps.length}{" "}
                  {maps.length === 1
                    ? "map"
                    : "maps"}
                </small>
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
                      setSelectedId(
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
                        {map.name}
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
                ))}
              </div>
            </section>

            <div className="mapMainLayout">
              <main className="mapViewerColumn">
                <InteractiveMapViewer
                  key={
                    selectedMap.id
                  }
                  map={
                    selectedMap
                  }
                />
              </main>

              <aside className="mapInformation">
                <div className="mapInfoCard primary">
                  <div className="mapInfoTop">
                    <span>
                      {
                        selectedMap.current
                          ? "CURRENT MAP"
                          : "ARCHIVED MAP"
                      }
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

                <div className="mapPhaseNotice">
                  <span>
                    MAP SYSTEM
                  </span>

                  <strong>
                    Locations coming next
                  </strong>

                  <p>
                    POIs, landmarks and story
                    locations will soon be
                    available directly on the
                    interactive map.
                  </p>
                </div>
              </aside>
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
          font-size: clamp(
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
          min-width: 190px;
          padding: 13px 14px;
          border: 1px solid rgba(99, 221, 255, 0.16);
          border-radius: 12px;
          background: rgba(99, 221, 255, 0.05);
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
          font-size: 11px;
        }

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

        .mapArchiveSelectorHeader small {
          color: #627899;
          font-size: 8px;
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
          border: 1px solid rgba(110, 148, 205, 0.11);
          border-radius: 12px;
          background: rgba(7, 16, 31, 0.7);
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
          border-color: rgba(99, 221, 255, 0.23);
        }

        .mapArchiveCard.active {
          border-color: rgba(99, 221, 255, 0.42);
          background: rgba(99, 221, 255, 0.06);
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

        .mapMainLayout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            280px;
          gap: 14px;
          align-items: start;
        }

        .mapViewerColumn {
          min-width: 0;
        }

        .mapInformation {
          display: grid;
          gap: 10px;
          position: sticky;
          top: 90px;
        }

        .mapInfoCard {
          padding: 15px;
          border: 1px solid rgba(110, 148, 205, 0.11);
          border-radius: 13px;
          background: rgba(7, 16, 31, 0.74);
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
          box-shadow: 0 0 8px rgba(66, 229, 167, 0.6);
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
          border-top: 1px solid rgba(110, 148, 205, 0.08);
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
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          min-height: 34px;
          border-bottom: 1px solid rgba(110, 148, 205, 0.07);
        }

        .mapDetailRows > div:last-child {
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

        .mapDetailRows .currentValue {
          color: #42e5a7;
        }

        .mapPhaseNotice {
          padding: 15px;
          border: 1px dashed rgba(159, 112, 255, 0.2);
          border-radius: 13px;
          background: rgba(77, 44, 130, 0.07);
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

        .mapState {
          min-height: 360px;
          display: grid;
          place-items: center;
          padding: 30px;
          border: 1px dashed rgba(110, 148, 205, 0.12);
          border-radius: 16px;
          color: #6d82a1;
          background: rgba(6, 14, 28, 0.45);
          font-size: 10px;
          text-align: center;
        }

        .mapState.error {
          color: #ff9aa5;
        }

        @media (max-width: 1000px) {
          .mapMainLayout {
            grid-template-columns: 1fr;
          }

          .mapInformation {
            position: static;
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .mapInfoCard.primary {
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

          .mapInformation {
            grid-template-columns: 1fr;
          }

          .mapInfoCard.primary {
            grid-column: auto;
          }

          .mapArchiveCard {
            width: 175px;
            min-width: 175px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mapArchiveCard {
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