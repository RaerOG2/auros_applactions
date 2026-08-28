"use client";

import {
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { AurosMap } from "../../types/maps";

import type {
  MapMarker,
  MapMarkerType,
} from "../../types/map-markers";

import {
  getPublishedMapMarkers,
} from "../../services/map-marker.service";


interface InteractiveMapViewerProps {
  map: AurosMap;
}


interface Position {
  x: number;
  y: number;
}


const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.35;


const filterTypes: {
  value: MapMarkerType;
  label: string;
}[] = [
  {
    value: "poi",
    label: "POIs",
  },
  {
    value: "landmark",
    label: "Landmarks",
  },
  {
    value: "story",
    label: "Story",
  },
  {
    value: "event",
    label: "Events",
  },
  {
    value: "spawn",
    label: "Spawn",
  },
  {
    value: "other",
    label: "Other",
  },
];


export default function InteractiveMapViewer({
  map,
}: InteractiveMapViewerProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [scale, setScale] =
    useState(1);

  const [position, setPosition] =
    useState<Position>({
      x: 0,
      y: 0,
    });

  const [dragging, setDragging] =
    useState(false);

  const dragStartRef =
    useRef<Position>({
      x: 0,
      y: 0,
    });

  const positionStartRef =
    useRef<Position>({
      x: 0,
      y: 0,
    });

  const [fullscreen, setFullscreen] =
    useState(false);

  const [markers, setMarkers] =
    useState<MapMarker[]>([]);

  const [selectedMarker, setSelectedMarker] =
    useState<MapMarker | null>(
      null
    );

  const [enabledTypes, setEnabledTypes] =
    useState<MapMarkerType[]>(
      filterTypes.map(
        (type) => type.value
      )
    );


  useEffect(() => {
    setScale(1);

    setPosition({
      x: 0,
      y: 0,
    });

    setSelectedMarker(null);

    getPublishedMapMarkers(
      map.id
    )
      .then(setMarkers)
      .catch(console.error);
  }, [map.id]);


  useEffect(() => {
    function handleFullscreenChange() {
      setFullscreen(
        document.fullscreenElement ===
          containerRef.current
      );
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);


  const visibleMarkers =
    useMemo(() => {
      return markers.filter(
        (marker) =>
          enabledTypes.includes(
            marker.type
          )
      );
    }, [
      markers,
      enabledTypes,
    ]);


  function resetView() {
    setScale(1);

    setPosition({
      x: 0,
      y: 0,
    });
  }


  function clampScale(
    value: number
  ) {
    return Math.min(
      MAX_SCALE,
      Math.max(
        MIN_SCALE,
        value
      )
    );
  }


  function zoomIn() {
    setScale((current) =>
      clampScale(
        current +
          ZOOM_STEP
      )
    );
  }


  function zoomOut() {
    setScale((current) => {
      const next =
        clampScale(
          current -
            ZOOM_STEP
        );

      if (next === 1) {
        setPosition({
          x: 0,
          y: 0,
        });
      }

      return next;
    });
  }


  function handleWheel(
    event: ReactWheelEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    const direction =
      event.deltaY > 0
        ? -ZOOM_STEP
        : ZOOM_STEP;

    setScale((current) => {
      const next =
        clampScale(
          current +
            direction
        );

      if (next === 1) {
        setPosition({
          x: 0,
          y: 0,
        });
      }

      return next;
    });
  }


  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (scale <= 1) {
      return;
    }

    setDragging(true);

    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    positionStartRef.current =
      position;

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }


  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (!dragging) {
      return;
    }

    setPosition({
      x:
        positionStartRef.current.x +
        (
          event.clientX -
          dragStartRef.current.x
        ),

      y:
        positionStartRef.current.y +
        (
          event.clientY -
          dragStartRef.current.y
        ),
    });
  }


  function handlePointerUp(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    setDragging(false);

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      //
    }
  }


  async function toggleFullscreen() {
    if (
      !containerRef.current
    ) {
      return;
    }

    if (
      !document.fullscreenElement
    ) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }


  function toggleType(
    type: MapMarkerType
  ) {
    setEnabledTypes(
      (current) =>
        current.includes(type)
          ? current.filter(
              (item) =>
                item !== type
            )
          : [
              ...current,
              type,
            ]
    );

    if (
      selectedMarker?.type ===
      type
    ) {
      setSelectedMarker(null);
    }
  }


  const zoomPercent =
    Math.round(
      scale * 100
    );


  return (
    <>
      <div
        ref={containerRef}
        className={
          fullscreen
            ? "interactiveMapViewer fullscreen"
            : "interactiveMapViewer"
        }
      >
        <div className="mapViewerTopbar">
          <div>
            <span>
              INTERACTIVE MAP
            </span>

            <strong>
              {map.name}
            </strong>
          </div>

          <div className="mapViewerZoomLabel">
            {zoomPercent}%
          </div>
        </div>

        <div className="mapFilterBar">
          <span>
            LOCATIONS
          </span>

          {filterTypes.map(
            (type) => (
              <button
                key={
                  type.value
                }
                type="button"
                className={
                  enabledTypes.includes(
                    type.value
                  )
                    ? `mapTypeFilter active ${type.value}`
                    : "mapTypeFilter"
                }
                onClick={() =>
                  toggleType(
                    type.value
                  )
                }
              >
                {type.label}
              </button>
            )
          )}
        </div>

        <div
          className={
            dragging
              ? "mapViewport dragging"
              : "mapViewport"
          }
          onWheel={
            handleWheel
          }
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={
            handlePointerUp
          }
          onPointerCancel={
            handlePointerUp
          }
        >
          <div
            className="mapTransformLayer"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          >
            <img
              src={
                map.image_url
              }
              alt={map.name}
              draggable={false}
            />

            <div className="publicMarkersLayer">
              {visibleMarkers.map(
                (marker) => (
                  <button
                    key={
                      marker.id
                    }
                    type="button"
                    className={
                      selectedMarker?.id ===
                      marker.id
                        ? `publicMapMarker ${marker.type} selected`
                        : `publicMapMarker ${marker.type}`
                    }
                    style={{
                      left: `${marker.x}%`,
                      top: `${marker.y}%`,
                    }}
                    onPointerDown={(
                      event
                    ) =>
                      event.stopPropagation()
                    }
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();

                      setSelectedMarker(
                        marker
                      );
                    }}
                    aria-label={
                      marker.name
                    }
                  >
                    <span>
                      {marker.icon ||
                        markerTypeSymbol(
                          marker.type
                        )}
                    </span>

                    {scale >=
                      1.7 && (
                      <strong>
                        {
                          marker.name
                        }
                      </strong>
                    )}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mapControls">
            <button
              type="button"
              onClick={zoomIn}
            >
              +
            </button>

            <button
              type="button"
              onClick={zoomOut}
            >
              −
            </button>

            <button
              type="button"
              onClick={
                resetView
              }
            >
              ↺
            </button>

            <button
              type="button"
              onClick={
                toggleFullscreen
              }
            >
              {fullscreen
                ? "×"
                : "⛶"}
            </button>
          </div>

          {selectedMarker && (
            <div className="mapLocationPanel">
              <button
                className="closeLocation"
                onClick={() =>
                  setSelectedMarker(
                    null
                  )
                }
              >
                ×
              </button>

              {selectedMarker.image_url && (
                <img
                  src={
                    selectedMarker.image_url
                  }
                  alt={
                    selectedMarker.name
                  }
                />
              )}

              <div className="locationPanelContent">
                <span>
                  {selectedMarker.type.toUpperCase()}
                </span>

                <h3>
                  {
                    selectedMarker.name
                  }
                </h3>

                {selectedMarker.description && (
                  <p>
                    {
                      selectedMarker.description
                    }
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mapViewerBottomBar">
          <div>
            <span className="statusDot" />
            {visibleMarkers.length} locations visible
          </div>

          <div>
            Zoom {zoomPercent}%
          </div>
        </div>
      </div>

      <style jsx global>{`
        .interactiveMapViewer {
          position: relative;
          overflow: hidden;
          width: 100%;
          border: 1px solid rgba(107, 150, 210, 0.15);
          border-radius: 20px;
          background: #02060d;
        }

        .interactiveMapViewer.fullscreen {
          width: 100vw;
          height: 100vh;
          border: 0;
          border-radius: 0;
        }

        .mapViewerTopbar {
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 15px;
          background: #050c18;
          border-bottom: 1px solid rgba(107,150,210,.1);
        }

        .mapViewerTopbar > div:first-child {
          display: flex;
          gap: 9px;
          align-items: center;
        }

        .mapViewerTopbar span,
        .mapFilterBar > span {
          color: #63ddff;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .11em;
        }

        .mapViewerTopbar strong {
          font-size: 10px;
        }

        .mapViewerZoomLabel {
          color: #7187a8;
          font-size: 8px;
        }

        .mapFilterBar {
          min-height: 43px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 13px;
          overflow-x: auto;
          border-bottom: 1px solid rgba(107,150,210,.08);
          background: rgba(5,12,24,.96);
        }

        .mapTypeFilter {
          min-height: 27px;
          padding: 0 9px;
          flex-shrink: 0;
          border: 1px solid rgba(110,148,205,.12);
          border-radius: 999px;
          background: rgba(8,18,34,.8);
          color: #687f9f;
          font-size: 7px;
          font-weight: 800;
          cursor: pointer;
        }

        .mapTypeFilter.active {
          color: white;
          border-color: rgba(99,221,255,.23);
          background: rgba(99,221,255,.08);
        }

        .mapViewport {
          position: relative;
          height: min(70vh, 760px);
          min-height: 500px;
          overflow: hidden;
          touch-action: none;
          user-select: none;
          cursor: grab;
          background: #01040a;
        }

        .interactiveMapViewer.fullscreen .mapViewport {
          height: calc(100vh - 131px);
        }

        .mapViewport.dragging {
          cursor: grabbing;
        }

        .mapTransformLayer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-origin: center center;
          will-change: transform;
        }

        .mapTransformLayer > img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
        }

        .publicMarkersLayer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .publicMapMarker {
          position: absolute;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0;
          border: 0;
          background: transparent;
          color: white;
          cursor: pointer;
          transform: translate(-50%, -50%);
          pointer-events: auto;
        }

        .publicMapMarker > span {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 2px solid white;
          border-radius: 50%;
          background: #63ddff;
          color: #04101b;
          font-size: 8px;
          font-weight: 950;
          box-shadow: 0 3px 12px rgba(0,0,0,.6);
        }

        .publicMapMarker.landmark > span {
          background: #65e8a8;
        }

        .publicMapMarker.story > span {
          background: #ab87ff;
        }

        .publicMapMarker.event > span {
          background: #ff9e55;
        }

        .publicMapMarker.spawn > span {
          background: #ffd866;
        }

        .publicMapMarker.other > span {
          background: #9baac2;
        }

        .publicMapMarker.selected > span {
          box-shadow:
            0 0 0 4px rgba(99,221,255,.18),
            0 3px 12px rgba(0,0,0,.6);
        }

        .publicMapMarker strong {
          max-width: 120px;
          overflow: hidden;
          padding: 4px 6px;
          border-radius: 6px;
          background: rgba(3,9,20,.82);
          font-size: 6px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .mapControls {
          position: absolute;
          z-index: 30;
          top: 13px;
          right: 13px;
          display: grid;
          gap: 6px;
        }

        .mapControls button {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(119,156,211,.16);
          border-radius: 10px;
          background: rgba(4,12,25,.9);
          color: white;
          font-size: 15px;
          cursor: pointer;
        }

        .mapLocationPanel {
          position: absolute;
          z-index: 40;
          left: 14px;
          bottom: 14px;
          width: min(340px, calc(100% - 28px));
          overflow: hidden;
          border: 1px solid rgba(99,221,255,.18);
          border-radius: 14px;
          background: rgba(5,13,27,.96);
          box-shadow: 0 20px 50px rgba(0,0,0,.35);
        }

        .mapLocationPanel > img {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 8;
          object-fit: cover;
        }

        .locationPanelContent {
          padding: 13px;
        }

        .locationPanelContent > span {
          color: #63ddff;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .1em;
        }

        .locationPanelContent h3 {
          margin: 5px 0;
          font-size: 16px;
        }

        .locationPanelContent p {
          margin: 0;
          color: #8398b7;
          font-size: 8px;
          line-height: 1.55;
        }

        .closeLocation {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 2;
          width: 28px;
          height: 28px;
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 8px;
          background: rgba(3,9,20,.8);
          color: white;
          cursor: pointer;
        }

        .mapViewerBottomBar {
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          border-top: 1px solid rgba(107,150,210,.09);
          background: #050c18;
          color: #546c8e;
          font-size: 7px;
        }

        .mapViewerBottomBar > div:first-child {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .statusDot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #42e5a7;
        }

        @media (max-width: 700px) {
          .mapViewport {
            height: 62vh;
            min-height: 420px;
          }

          .mapFilterBar > span {
            display: none;
          }
        }
      `}</style>
    </>
  );
}


function markerTypeSymbol(
  type: MapMarkerType
) {
  switch (type) {
    case "poi":
      return "P";

    case "landmark":
      return "L";

    case "story":
      return "S";

    case "event":
      return "E";

    case "spawn":
      return "★";

    default:
      return "•";
  }
}