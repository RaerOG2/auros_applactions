"use client";

import {
  PointerEvent as ReactPointerEvent,
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

  focusMarkerId?: string | null;
}

interface Position {
  x: number;
  y: number;
}

interface PinchState {
  distance: number;

  scale: number;

  center: Position;

  position: Position;
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;
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
  focusMarkerId = null,
}: InteractiveMapViewerProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const viewportRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const stageRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [scale, setScale] =
    useState(1);

  const scaleRef =
    useRef(1);

  const [position, setPosition] =
    useState<Position>({
      x: 0,
      y: 0,
    });

  const positionRef =
    useRef<Position>({
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

  /*
   * All currently active pointers.
   *
   * Usually:
   * 1 pointer = drag
   * 2 pointers = pinch zoom
   */
  const activePointersRef =
    useRef<Map<number, Position>>(
      new Map()
    );

  const pinchRef =
    useRef<PinchState | null>(
      null
    );

  const [fullscreen, setFullscreen] =
    useState(false);

  const [markers, setMarkers] =
    useState<MapMarker[]>([]);

  const [
    selectedMarker,
    setSelectedMarker,
  ] =
    useState<MapMarker | null>(
      null
    );

  const [
    enabledTypes,
    setEnabledTypes,
  ] = useState<MapMarkerType[]>(
    filterTypes.map(
      (type) => type.value
    )
  );

  /* =========================================================
     INTERNAL VIEW HELPERS
  ========================================================= */

  function applyScale(
    value: number
  ) {
    const next =
      clampScale(value);

    scaleRef.current =
      next;

    setScale(next);
  }

  function applyPosition(
    value: Position
  ) {
    positionRef.current = {
      ...value,
    };

    setPosition({
      ...value,
    });
  }

  /* =========================================================
     LOAD MAP MARKERS
  ========================================================= */

  useEffect(() => {
    resetView();

    setSelectedMarker(
      null
    );

    getPublishedMapMarkers(
      map.id
    )
      .then(setMarkers)
      .catch((error) => {
        console.error(
          "MAP MARKER LOAD ERROR:",
          error
        );

        setMarkers([]);
      });
  }, [map.id]);

  /* =========================================================
     DESKTOP WHEEL ZOOM

     Native listener with passive:false is used here.

     This is important because otherwise Safari / Chrome
     may continue scrolling the entire website while the
     map itself is zooming.
  ========================================================= */

  useEffect(() => {
    const viewport =
      viewportRef.current;

    if (!viewport) {
      return;
    }

    function handleWheel(
      event: WheelEvent
    ) {
      /*
       * Cursor is over the map.
       *
       * The wheel belongs to the map now,
       * not to the page.
       */
      event.preventDefault();

      event.stopPropagation();

      const direction =
        event.deltaY > 0
          ? -ZOOM_STEP
          : ZOOM_STEP;

      const next =
        clampScale(
          scaleRef.current +
            direction
        );

      applyScale(next);

      if (
        next ===
        MIN_SCALE
      ) {
        applyPosition({
          x: 0,
          y: 0,
        });
      }
    }

    viewport.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: false,
      }
    );

    return () => {
      viewport.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, []);

  /* =========================================================
     FULLSCREEN STATE
  ========================================================= */

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

  /* =========================================================
     PHASE 4.3
     FOCUS MARKER FROM SEARCH / DEEP LINK

     Example:
     /map?map=MAP_ID&location=MARKER_ID
  ========================================================= */

  useEffect(() => {
    if (!focusMarkerId) {
      return;
    }

    if (
      markers.length === 0
    ) {
      return;
    }

    const marker =
      markers.find(
        (item) =>
          item.id ===
          focusMarkerId
      );

    if (!marker) {
      return;
    }

    setEnabledTypes(
      (current) =>
        current.includes(
          marker.type
        )
          ? current
          : [
              ...current,
              marker.type,
            ]
    );

    setSelectedMarker(
      marker
    );

    requestAnimationFrame(() => {
      focusMarker(
        marker
      );
    });
  }, [
    focusMarkerId,
    markers,
  ]);

  /* =========================================================
     VISIBLE MARKERS
  ========================================================= */

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

  /* =========================================================
     VIEW
  ========================================================= */

  function resetView() {
    applyScale(1);

    applyPosition({
      x: 0,
      y: 0,
    });

    activePointersRef.current.clear();

    pinchRef.current =
      null;

    setDragging(false);
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

  /* =========================================================
     FOCUS LOCATION
  ========================================================= */

  function focusMarker(
    marker: MapMarker
  ) {
    const viewport =
      viewportRef.current;

    const stage =
      stageRef.current;

    if (
      !viewport ||
      !stage
    ) {
      return;
    }

    const focusScale =
      2.5;

    const viewportRect =
      viewport.getBoundingClientRect();

    const stageRect =
      stage.getBoundingClientRect();

    const markerX =
      stageRect.left -
      viewportRect.left +
      stageRect.width *
        (Number(marker.x) /
          100);

    const markerY =
      stageRect.top -
      viewportRect.top +
      stageRect.height *
        (Number(marker.y) /
          100);

    const viewportCenterX =
      viewportRect.width /
      2;

    const viewportCenterY =
      viewportRect.height /
      2;

    const offsetX =
      viewportCenterX -
      markerX;

    const offsetY =
      viewportCenterY -
      markerY;

    applyScale(
      focusScale
    );

    applyPosition({
      x:
        offsetX *
        focusScale,

      y:
        offsetY *
        focusScale,
    });
  }

  /* =========================================================
     ZOOM BUTTONS
  ========================================================= */

  function zoomIn() {
    const next =
      clampScale(
        scaleRef.current +
          ZOOM_STEP
      );

    applyScale(next);
  }

  function zoomOut() {
    const next =
      clampScale(
        scaleRef.current -
          ZOOM_STEP
      );

    applyScale(next);

    if (
      next ===
      MIN_SCALE
    ) {
      applyPosition({
        x: 0,
        y: 0,
      });
    }
  }

  /* =========================================================
     POINTER / TOUCH HELPERS
  ========================================================= */

  function getPointerDistance(
    first: Position,
    second: Position
  ) {
    return Math.hypot(
      second.x -
        first.x,

      second.y -
        first.y
    );
  }

  function getPointerCenter(
    first: Position,
    second: Position
  ): Position {
    return {
      x:
        (first.x +
          second.x) /
        2,

      y:
        (first.y +
          second.y) /
        2,
    };
  }

  function getFirstTwoPointers() {
    const points =
      Array.from(
        activePointersRef.current.values()
      );

    if (
      points.length < 2
    ) {
      return null;
    }

    return [
      points[0],
      points[1],
    ] as const;
  }

  /* =========================================================
     POINTER DOWN

     Mouse:
     drag when zoomed

     Touch:
     1 finger = drag
     2 fingers = pinch zoom
  ========================================================= */

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    const target =
      event.target as HTMLElement;

    if (
      target.closest(
        ".publicMapMarker"
      ) ||
      target.closest(
        ".mapControls"
      ) ||
      target.closest(
        ".mapLocationPanel"
      ) ||
      target.closest(
        ".mapTypeFilter"
      )
    ) {
      return;
    }

    activePointersRef.current.set(
      event.pointerId,
      {
        x: event.clientX,
        y: event.clientY,
      }
    );

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch {
      //
    }

    /*
     * TWO POINTERS
     *
     * Start pinch zoom.
     */
    if (
      activePointersRef.current.size >=
      2
    ) {
      const pointers =
        getFirstTwoPointers();

      if (!pointers) {
        return;
      }

      const [
        first,
        second,
      ] = pointers;

      const distance =
        Math.max(
          1,
          getPointerDistance(
            first,
            second
          )
        );

      const center =
        getPointerCenter(
          first,
          second
        );

      pinchRef.current = {
        distance,

        scale:
          scaleRef.current,

        center,

        position: {
          ...positionRef.current,
        },
      };

      setDragging(false);

      return;
    }

    /*
     * ONE POINTER
     *
     * Dragging only makes sense when
     * the map is already zoomed.
     */
    if (
      scaleRef.current <=
      MIN_SCALE
    ) {
      return;
    }

    setDragging(true);

    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    positionStartRef.current = {
      ...positionRef.current,
    };
  }

  /* =========================================================
     POINTER MOVE
  ========================================================= */

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    /*
     * Update the current pointer position.
     */
    if (
      activePointersRef.current.has(
        event.pointerId
      )
    ) {
      activePointersRef.current.set(
        event.pointerId,
        {
          x: event.clientX,
          y: event.clientY,
        }
      );
    }

    /*
     * ============================================
     * PINCH ZOOM
     * ============================================
     */

    if (
      activePointersRef.current.size >=
        2 &&
      pinchRef.current
    ) {
      const pointers =
        getFirstTwoPointers();

      if (!pointers) {
        return;
      }

      const [
        first,
        second,
      ] = pointers;

      const currentDistance =
        Math.max(
          1,
          getPointerDistance(
            first,
            second
          )
        );

      const currentCenter =
        getPointerCenter(
          first,
          second
        );

      const pinchStart =
        pinchRef.current;

      const ratio =
        currentDistance /
        pinchStart.distance;

      const nextScale =
        clampScale(
          pinchStart.scale *
            ratio
        );

      const viewport =
        viewportRef.current;

      if (!viewport) {
        applyScale(
          nextScale
        );

        return;
      }

      const viewportRect =
        viewport.getBoundingClientRect();

      const viewportCenter = {
        x:
          viewportRect.left +
          viewportRect.width /
            2,

        y:
          viewportRect.top +
          viewportRect.height /
            2,
      };

      /*
       * Keep the area between the user's
       * fingers approximately under the same
       * point while scaling.
       *
       * This also means that moving both
       * fingers together pans the map.
       */
      const scaleRatio =
        nextScale /
        pinchStart.scale;

      const nextPosition = {
        x:
          currentCenter.x -
          viewportCenter.x -
          scaleRatio *
            (pinchStart.center.x -
              viewportCenter.x -
              pinchStart.position.x),

        y:
          currentCenter.y -
          viewportCenter.y -
          scaleRatio *
            (pinchStart.center.y -
              viewportCenter.y -
              pinchStart.position.y),
      };

      applyScale(
        nextScale
      );

      if (
        nextScale ===
        MIN_SCALE
      ) {
        applyPosition({
          x: 0,
          y: 0,
        });
      } else {
        applyPosition(
          nextPosition
        );
      }

      return;
    }

    /*
     * ============================================
     * ONE FINGER / MOUSE DRAG
     * ============================================
     */

    if (!dragging) {
      return;
    }

    if (
      scaleRef.current <=
      MIN_SCALE
    ) {
      return;
    }

    const deltaX =
      event.clientX -
      dragStartRef.current.x;

    const deltaY =
      event.clientY -
      dragStartRef.current.y;

    applyPosition({
      x:
        positionStartRef.current.x +
        deltaX,

      y:
        positionStartRef.current.y +
        deltaY,
    });
  }

  /* =========================================================
     POINTER UP / CANCEL
  ========================================================= */

  function handlePointerUp(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    activePointersRef.current.delete(
      event.pointerId
    );

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      //
    }

    /*
     * If one finger remains after a pinch,
     * allow it to continue dragging without
     * requiring the user to lift it first.
     */
    if (
      activePointersRef.current.size ===
      1
    ) {
      pinchRef.current =
        null;

      const remainingPointer =
        Array.from(
          activePointersRef.current.values()
        )[0];

      if (
        scaleRef.current >
        MIN_SCALE
      ) {
        setDragging(true);

        dragStartRef.current = {
          ...remainingPointer,
        };

        positionStartRef.current = {
          ...positionRef.current,
        };
      } else {
        setDragging(false);
      }

      return;
    }

    /*
     * No pointers remain.
     */
    if (
      activePointersRef.current.size ===
      0
    ) {
      pinchRef.current =
        null;

      setDragging(false);
    }
  }

  /* =========================================================
     FULLSCREEN
  ========================================================= */

  async function toggleFullscreen() {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    try {
      if (
        !document.fullscreenElement
      ) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error(
        "FULLSCREEN ERROR:",
        error
      );
    }
  }

  /* =========================================================
     FILTER
  ========================================================= */

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
      setSelectedMarker(
        null
      );
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
        {/* TOPBAR */}

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

        {/* FILTERS */}

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

        {/* MAP */}

        <div
          ref={viewportRef}
          className={
            dragging
              ? "mapViewport dragging"
              : "mapViewport"
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
              transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            }}
          >
            <div
              ref={stageRef}
              className="publicMapStage"
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
                        left: `${Number(
                          marker.x
                        )}%`,

                        top: `${Number(
                          marker.y
                        )}%`,
                      }}
                      onPointerDown={(
                        event
                      ) => {
                        event.stopPropagation();
                      }}
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        setSelectedMarker(
                          marker
                        );
                      }}
                      title={
                        marker.name
                      }
                      aria-label={
                        marker.name
                      }
                    >
                      <span className="publicMarkerCircle">
                        {marker.icon ||
                          markerTypeSymbol(
                            marker.type
                          )}
                      </span>

                      <strong className="publicMarkerLabel">
                        {
                          marker.name
                        }
                      </strong>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* CONTROLS */}

          <div className="mapControls">
            <button
              type="button"
              onClick={
                zoomIn
              }
              disabled={
                scale >=
                MAX_SCALE
              }
              title="Zoom in"
            >
              +
            </button>

            <button
              type="button"
              onClick={
                zoomOut
              }
              disabled={
                scale <=
                MIN_SCALE
              }
              title="Zoom out"
            >
              −
            </button>

            <button
              type="button"
              onClick={
                resetView
              }
              title="Reset view"
            >
              ↺
            </button>

            <button
              type="button"
              onClick={
                toggleFullscreen
              }
              title="Fullscreen"
            >
              {fullscreen
                ? "×"
                : "⛶"}
            </button>
          </div>

          {/* LOCATION INFO */}

          {selectedMarker && (
            <div className="mapLocationPanel">
              <button
                type="button"
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
                  {getMarkerTypeLabel(
                    selectedMarker.type
                  )}
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

          <div className="mapViewerHint">
            <span>
              Scroll to zoom
            </span>

            <span>
              Drag to move
            </span>

            <span>
              Click location for details
            </span>
          </div>
        </div>

        {/* BOTTOM BAR */}

        <div className="mapViewerBottomBar">
          <div>
            <span className="statusDot" />

            {visibleMarkers.length}{" "}
            {visibleMarkers.length === 1
              ? "location"
              : "locations"}{" "}
            visible
          </div>

          <div>
            Zoom {zoomPercent}%
          </div>
        </div>
      </div>

      <style jsx global>{`
        .interactiveMapViewer {
          position: relative;

          width: 100%;

          overflow: hidden;

          border:
            1px solid
            rgba(
              107,
              150,
              210,
              0.15
            );

          border-radius: 20px;

          background: #02060d;

          box-shadow:
            0 30px 80px
            rgba(
              0,
              0,
              0,
              0.24
            );
        }

        .interactiveMapViewer.fullscreen {
          width: 100vw;
          height: 100vh;

          display: grid;

          grid-template-rows:
            auto
            auto
            minmax(0, 1fr)
            auto;

          border: none;
          border-radius: 0;
        }

        /* ===============================
           TOPBAR
        ================================ */

        .mapViewerTopbar {
          min-height: 52px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 16px;

          padding:
            0
            15px;

          border-bottom:
            1px solid
            rgba(
              107,
              150,
              210,
              0.1
            );

          background:
            #050c18;
        }

        .mapViewerTopbar
          > div:first-child {
          display: flex;
          align-items: center;

          gap: 9px;
        }

        .mapViewerTopbar span {
          color: #63ddff;

          font-size: 8px;
          font-weight: 900;

          letter-spacing:
            0.11em;
        }

        .mapViewerTopbar strong {
          color: #e5efff;

          font-size: 11px;
        }

        .mapViewerZoomLabel {
          color: #7187a8;

          font-size: 9px;
          font-weight: 800;
        }

        /* ===============================
           FILTERS
        ================================ */

        .mapFilterBar {
          min-height: 43px;

          display: flex;
          align-items: center;

          gap: 6px;

          padding:
            0
            13px;

          overflow-x: auto;

          overscroll-behavior-x:
            contain;

          scrollbar-width:
            none;

          border-bottom:
            1px solid
            rgba(
              107,
              150,
              210,
              0.08
            );

          background:
            rgba(
              5,
              12,
              24,
              0.96
            );
        }

        .mapFilterBar::-webkit-scrollbar {
          display: none;
        }

        .mapFilterBar > span {
          margin-right: 2px;

          color: #63ddff;

          font-size: 7px;
          font-weight: 900;

          letter-spacing:
            0.1em;
        }

        .mapTypeFilter {
          flex-shrink: 0;

          min-height: 29px;

          padding:
            0
            10px;

          border:
            1px solid
            rgba(
              110,
              148,
              205,
              0.14
            );

          border-radius: 999px;

          background:
            rgba(
              8,
              18,
              34,
              0.8
            );

          color: #7388a7;

          font-size: 7px;
          font-weight: 800;

          cursor: pointer;
        }

        .mapTypeFilter:hover {
          color: #c7d9ef;

          border-color:
            rgba(
              99,
              221,
              255,
              0.22
            );
        }

        .mapTypeFilter.active {
          color: white;

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
              0.11
            );
        }

        /* ===============================
           VIEWPORT
        ================================ */

        .mapViewport {
          position: relative;

          width: 100%;

          height:
            min(
              70vh,
              760px
            );

          min-height: 500px;

          overflow: hidden;

          /*
           * Required for custom mobile gestures.
           *
           * Browser-native pan / pinch is disabled
           * only inside the actual map viewport.
           */
          touch-action: none;

          overscroll-behavior:
            contain;

          -webkit-user-select:
            none;

          user-select: none;

          cursor: grab;

          background:
            radial-gradient(
              circle at center,
              rgba(
                21,
                48,
                73,
                0.16
              ),
              transparent
              70%
            ),
            #01040a;
        }

        .interactiveMapViewer.fullscreen
          .mapViewport {
          height: auto;
          min-height: 0;
        }

        .mapViewport.dragging {
          cursor: grabbing;
        }

        /* ===============================
           TRANSFORM LAYER
        ================================ */

        .mapTransformLayer {
          position: absolute;

          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          transform-origin:
            center center;

          /*
           * Transform is the only continuously
           * changing visual property during
           * drag / pinch.
           */
          will-change:
            transform;
        }

        /* ===============================
           EXACT MAP STAGE
        ================================ */

        .publicMapStage {
          position: relative;

          display: inline-block;

          max-width: 100%;
          max-height: 100%;

          line-height: 0;
        }

        .publicMapStage > img {
          display: block;

          width: auto;
          height: auto;

          max-width: 100%;

          max-height:
            min(
              70vh,
              760px
            );

          object-fit: contain;

          pointer-events: none;

          -webkit-user-drag:
            none;

          user-select: none;
        }

        .interactiveMapViewer.fullscreen
          .publicMapStage
          > img {
          max-width:
            calc(
              100vw - 30px
            );

          max-height:
            calc(
              100vh - 145px
            );
        }

        /* ===============================
           MARKERS
        ================================ */

        .publicMarkersLayer {
          position: absolute;

          inset: 0;

          pointer-events: none;
        }

        .publicMapMarker {
          position: absolute;

          z-index: 20;

          width: 0;
          height: 0;

          padding: 0;

          border: none;

          background:
            transparent;

          color: white;

          cursor: pointer;

          pointer-events: auto;
        }

        .publicMarkerCircle {
          position: absolute;

          left: 0;
          top: 0;

          width: 29px;
          height: 29px;

          display: grid;
          place-items: center;

          border:
            2px solid
            rgba(
              255,
              255,
              255,
              0.95
            );

          border-radius: 50%;

          background:
            #63ddff;

          color: #04101b;

          font-size: 9px;
          font-weight: 950;

          transform:
            translate(
              -50%,
              -50%
            );

          box-shadow:
            0 4px 16px
            rgba(
              0,
              0,
              0,
              0.58
            );

          pointer-events: none;
        }

        .publicMarkerLabel {
          position: absolute;

          left: 20px;
          top: 0;

          max-width: 170px;

          overflow: hidden;

          padding:
            5px
            7px;

          border-radius: 7px;

          background:
            rgba(
              3,
              9,
              20,
              0.88
            );

          color: #edf6ff;

          font-size: 8px;
          line-height: 1;

          white-space: nowrap;

          text-overflow:
            ellipsis;

          transform:
            translateY(
              -50%
            );

          box-shadow:
            0 4px 14px
            rgba(
              0,
              0,
              0,
              0.38
            );

          pointer-events: none;
        }

        .publicMapMarker.poi
          .publicMarkerCircle {
          background:
            #63ddff;
        }

        .publicMapMarker.landmark
          .publicMarkerCircle {
          background:
            #65e8a8;
        }

        .publicMapMarker.story
          .publicMarkerCircle {
          background:
            #ab87ff;
        }

        .publicMapMarker.event
          .publicMarkerCircle {
          background:
            #ff9e55;
        }

        .publicMapMarker.spawn
          .publicMarkerCircle {
          background:
            #ffd866;
        }

        .publicMapMarker.other
          .publicMarkerCircle {
          background:
            #9baac2;
        }

        .publicMapMarker.selected
          .publicMarkerCircle {
          width: 35px;
          height: 35px;

          box-shadow:
            0 0 0 6px
              rgba(
                99,
                221,
                255,
                0.18
              ),
            0 4px 18px
              rgba(
                0,
                0,
                0,
                0.62
              );
        }

        @media (
          hover: hover
        ) and (
          pointer: fine
        ) {
          .publicMapMarker:hover
            .publicMarkerCircle {
            transform:
              translate(
                -50%,
                -50%
              )
              scale(1.1);
          }
        }

        /* ===============================
           CONTROLS
        ================================ */

        .mapControls {
          position: absolute;

          z-index: 50;

          top: 13px;
          right: 13px;

          display: grid;

          gap: 6px;
        }

        .mapControls button {
          width: 40px;
          height: 40px;

          display: grid;
          place-items: center;

          border:
            1px solid
            rgba(
              119,
              156,
              211,
              0.17
            );

          border-radius: 10px;

          background:
            rgba(
              4,
              12,
              25,
              0.92
            );

          color: white;

          font-size: 15px;
          font-weight: 800;

          cursor: pointer;

          backdrop-filter:
            blur(7px);
        }

        .mapControls
          button:hover:not(:disabled) {
          color: #63ddff;

          border-color:
            rgba(
              99,
              221,
              255,
              0.32
            );
        }

        .mapControls button:disabled {
          opacity: 0.35;

          cursor: default;
        }

        /* ===============================
           LOCATION PANEL
        ================================ */

        .mapLocationPanel {
          position: absolute;

          z-index: 60;

          left: 14px;
          bottom: 14px;

          width:
            min(
              350px,
              calc(
                100% - 28px
              )
            );

          overflow: hidden;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.2
            );

          border-radius: 15px;

          background:
            rgba(
              5,
              13,
              27,
              0.97
            );

          box-shadow:
            0 24px 60px
            rgba(
              0,
              0,
              0,
              0.42
            );
        }

        .mapLocationPanel > img {
          display: block;

          width: 100%;

          aspect-ratio:
            16 / 8;

          object-fit: cover;
        }

        .locationPanelContent {
          padding: 14px;
        }

        .locationPanelContent > span {
          color: #63ddff;

          font-size: 7px;
          font-weight: 900;

          letter-spacing:
            0.1em;
        }

        .locationPanelContent h3 {
          margin:
            5px
            0;

          color: white;

          font-size: 18px;
        }

        .locationPanelContent p {
          margin: 0;

          color: #8398b7;

          font-size: 9px;

          line-height: 1.6;
        }

        .closeLocation {
          position: absolute;

          z-index: 2;

          top: 8px;
          right: 8px;

          width: 29px;
          height: 29px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.13
            );

          border-radius: 8px;

          background:
            rgba(
              3,
              9,
              20,
              0.86
            );

          color: white;

          cursor: pointer;
        }

        /* ===============================
           HINT
        ================================ */

        .mapViewerHint {
          position: absolute;

          z-index: 30;

          left: 14px;
          top: 14px;

          display: flex;

          gap: 6px;

          pointer-events: none;
        }

        .mapViewerHint span {
          padding:
            6px
            8px;

          border:
            1px solid
            rgba(
              119,
              156,
              211,
              0.1
            );

          border-radius: 999px;

          background:
            rgba(
              4,
              12,
              25,
              0.72
            );

          color: #7186a4;

          font-size: 7px;
          font-weight: 800;
        }

        /* ===============================
           BOTTOM BAR
        ================================ */

        .mapViewerBottomBar {
          min-height: 36px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding:
            0
            14px;

          border-top:
            1px solid
            rgba(
              107,
              150,
              210,
              0.09
            );

          background:
            #050c18;

          color: #546c8e;

          font-size: 8px;
        }

        .mapViewerBottomBar
          > div:first-child {
          display: flex;
          align-items: center;

          gap: 6px;
        }

        .statusDot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background:
            #42e5a7;

          box-shadow:
            0 0 8px
            rgba(
              66,
              229,
              167,
              0.55
            );
        }

        /* ===============================
           MOBILE / TOUCH
        ================================ */

        @media (
          max-width: 700px
        ) {
          .mapViewport {
            min-height: 420px;

            height: 62vh;
          }

          .mapFilterBar
            > span {
            display: none;
          }

          .mapViewerHint {
            display: none;
          }

          .publicMarkerLabel {
            display: none;
          }

          .publicMarkerCircle {
            width: 25px;
            height: 25px;

            font-size: 8px;
          }

          /*
           * Slightly larger touch controls.
           */
          .mapControls button {
            width: 44px;
            height: 44px;
          }

          .closeLocation {
            width: 36px;
            height: 36px;
          }

          .mapTypeFilter {
            min-height: 34px;

            padding:
              0
              12px;
          }
        }

        /* ===============================
           REDUCED MOTION
        ================================ */

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .publicMarkerCircle,
          .mapControls button {
            transition: none;
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

function getMarkerTypeLabel(
  type: MapMarkerType
) {
  switch (type) {
    case "poi":
      return "POINT OF INTEREST";

    case "landmark":
      return "LANDMARK";

    case "story":
      return "STORY LOCATION";

    case "event":
      return "EVENT LOCATION";

    case "spawn":
      return "SPAWN";

    default:
      return "LOCATION";
  }
}