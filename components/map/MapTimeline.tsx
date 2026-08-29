"use client";

import type {
  AurosMap,
} from "../../types/maps";

type Props = {
  maps: AurosMap[];

  selectedId: string;

  onSelect: (
    mapId: string
  ) => void;
};

export default function MapTimeline({
  maps,
  selectedId,
  onSelect,
}: Props) {
  const sortedMaps =
    [...maps].sort(
      (a, b) => {
        const aTime =
          a.release_date
            ? new Date(
                a.release_date
              ).getTime()
            : 0;

        const bTime =
          b.release_date
            ? new Date(
                b.release_date
              ).getTime()
            : 0;

        return (
          aTime - bTime
        );
      }
    );

  function getDate(
    value:
      | string
      | null
  ) {
    if (!value) {
      return "Unknown";
    }

    try {
      return new Intl.DateTimeFormat(
        "en",
        {
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

  return (
    <>
      <section className="mapTimeline">
        <header className="mapTimelineHeader">
          <div>
            <span>
              HISTORY
            </span>

            <h2>
              Auros Timeline
            </h2>
          </div>

          <small>
            {maps.length} versions
          </small>
        </header>

        <div className="timelineScroll">
          <div className="timelineTrack">
            {sortedMaps.map(
              (map, index) => {
                const active =
                  selectedId ===
                  map.id;

                return (
                  <button
                    key={
                      map.id
                    }
                    type="button"
                    className={
                      active
                        ? "timelineNode active"
                        : map.current
                        ? "timelineNode current"
                        : "timelineNode"
                    }
                    onClick={() =>
                      onSelect(
                        map.id
                      )
                    }
                  >
                    <div className="timelineDot">
                      <i />
                    </div>

                    <div className="timelineContent">
                      <span>
                        {getDate(
                          map.release_date
                        )}
                      </span>

                      <strong>
                        {map.name}
                      </strong>

                      <small>
                        {[
                          map.venture_name,

                          map.season_number !==
                          null
                            ? `S${map.season_number}`
                            : null,

                          map.version,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " · "
                          )}
                      </small>

                      {map.current && (
                        <b>
                          CURRENT
                        </b>
                      )}
                    </div>

                    {index <
                      sortedMaps.length -
                        1 && (
                      <div className="timelineConnection" />
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </section>

      <style jsx global>{`
        .mapTimeline {
          margin-bottom: 18px;

          padding:
            15px
            16px
            12px;

          border:
            1px solid
            rgba(
              110,
              148,
              205,
              .11
            );

          border-radius: 14px;

          background:
            rgba(
              7,
              16,
              31,
              .68
            );
        }

        .mapTimelineHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;

          margin-bottom: 14px;
        }

        .mapTimelineHeader span {
          color: #63ddff;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .11em;
        }

        .mapTimelineHeader h2 {
          margin: 3px 0 0;
          font-size: 17px;
        }

        .mapTimelineHeader small {
          color: #627899;
          font-size: 7px;
        }

        .timelineScroll {
          overflow-x: auto;

          padding:
            4px
            4px
            8px;

          scrollbar-width:
            thin;
        }

        .timelineTrack {
          min-width:
            max-content;

          display: flex;

          align-items:
            flex-start;
        }

        .timelineNode {
          position: relative;

          width: 180px;

          flex-shrink: 0;

          display: flex;

          align-items:
            flex-start;

          gap: 9px;

          padding: 0;

          border: 0;

          background:
            transparent;

          color: white;

          text-align: left;

          cursor: pointer;
        }

        .timelineDot {
          position: relative;

          z-index: 4;

          width: 18px;
          height: 18px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          margin-top: 2px;

          border:
            1px solid
            rgba(
              112,
              149,
              205,
              .25
            );

          border-radius:
            50%;

          background:
            #071122;
        }

        .timelineDot i {
          width: 6px;
          height: 6px;

          border-radius:
            50%;

          background:
            #627899;
        }

        .timelineNode.active
          .timelineDot {
          border-color:
            #63ddff;

          box-shadow:
            0 0 0 4px
            rgba(
              99,
              221,
              255,
              .08
            );
        }

        .timelineNode.active
          .timelineDot i {
          background:
            #63ddff;
        }

        .timelineNode.current
          .timelineDot i {
          background:
            #42e5a7;
        }

        .timelineConnection {
          position: absolute;

          z-index: 1;

          top: 10px;
          left: 17px;

          width: 163px;
          height: 1px;

          background:
            rgba(
              112,
              149,
              205,
              .17
            );

          pointer-events: none;
        }

        .timelineContent {
          position: relative;

          z-index: 3;

          min-width: 0;

          display: flex;
          flex-direction:
            column;
        }

        .timelineContent > span {
          color: #536d90;

          font-size: 6px;
          font-weight: 850;
        }

        .timelineContent strong {
          max-width: 145px;

          overflow: hidden;

          margin-top: 3px;

          font-size: 9px;

          white-space:
            nowrap;

          text-overflow:
            ellipsis;
        }

        .timelineContent small {
          max-width: 145px;

          overflow: hidden;

          margin-top: 2px;

          color: #647b9b;

          font-size: 6px;

          white-space:
            nowrap;

          text-overflow:
            ellipsis;
        }

        .timelineContent b {
          width:
            fit-content;

          margin-top: 5px;

          padding:
            3px
            5px;

          border-radius:
            999px;

          background:
            rgba(
              66,
              229,
              167,
              .08
            );

          color:
            #54dfa0;

          font-size:
            5px;
        }

        .timelineNode:hover
          .timelineContent strong {
          color: #63ddff;
        }
      `}</style>
    </>
  );
}