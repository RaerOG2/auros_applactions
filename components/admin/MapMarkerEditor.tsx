"use client";

import {
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
  WheelEvent as ReactWheelEvent,
} from "react";

import type { AurosMap } from "../../types/maps";

import {
  emptyMapMarkerForm,
  type MapMarker,
  type MapMarkerForm,
  type MapMarkerType,
} from "../../types/map-markers";

import {
  createMapMarker,
  deleteMapMarker,
  getAdminMapMarkers,
  updateMapMarker,
  uploadMarkerImage,
} from "../../services/map-marker-admin.service";

interface MapMarkerEditorProps {
  map: AurosMap;
}

interface Position {
  x: number;
  y: number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const ZOOM_STEP = 0.4;

const markerTypes: {
  value: MapMarkerType;
  label: string;
  symbol: string;
}[] = [
  {
    value: "poi",
    label: "POI",
    symbol: "P",
  },
  {
    value: "landmark",
    label: "Landmark",
    symbol: "L",
  },
  {
    value: "story",
    label: "Story",
    symbol: "S",
  },
  {
    value: "event",
    label: "Event",
    symbol: "E",
  },
  {
    value: "spawn",
    label: "Spawn",
    symbol: "★",
  },
  {
    value: "other",
    label: "Other",
    symbol: "•",
  },
];

export default function MapMarkerEditor({
  map,
}: MapMarkerEditorProps) {
  const fullscreenRef =
    useRef<HTMLDivElement | null>(null);

  const stageRef =
    useRef<HTMLDivElement | null>(null);

  const [markers, setMarkers] =
    useState<MapMarker[]>([]);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<MapMarkerForm>({
      ...emptyMapMarkerForm,
    });

  const [placingNew, setPlacingNew] =
    useState(false);

  const [
    waitingForPlacement,
    setWaitingForPlacement,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [scale, setScale] =
    useState(1);

  const [position, setPosition] =
    useState<Position>({
      x: 0,
      y: 0,
    });

  const [draggingMap, setDraggingMap] =
    useState(false);

  const [
    draggingMarkerId,
    setDraggingMarkerId,
  ] = useState<string | null>(null);

  const [fullscreen, setFullscreen] =
    useState(false);

  const mapDragStartRef =
    useRef<Position>({
      x: 0,
      y: 0,
    });

  const positionStartRef =
    useRef<Position>({
      x: 0,
      y: 0,
    });

  const markerDraggedRef =
    useRef(false);

  const suppressMapClickRef =
    useRef(false);

  async function loadMarkers() {
    setLoading(true);

    try {
      const data =
        await getAdminMapMarkers(
          map.id
        );

      setMarkers(data);
    } catch (loadError) {
      console.error(
        "MARKER LOAD ERROR:",
        loadError
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load markers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarkers();
  }, [map.id]);

  useEffect(() => {
    function handleFullscreenChange() {
      setFullscreen(
        document.fullscreenElement ===
          fullscreenRef.current
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

  function updateField<
    K extends keyof MapMarkerForm
  >(
    key: K,
    value: MapMarkerForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
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

  function resetView() {
    setScale(1);

    setPosition({
      x: 0,
      y: 0,
    });
  }

  function zoomIn() {
    setScale((current) =>
      clampScale(
        current + ZOOM_STEP
      )
    );
  }

  function zoomOut() {
    setScale((current) => {
      const next =
        clampScale(
          current - ZOOM_STEP
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

    setScale((current) =>
      clampScale(
        current + direction
      )
    );
  }

  function handleMapPointerDown(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    const target =
      event.target as HTMLElement;

    if (
      target.closest(
        ".markerAnchor"
      ) ||
      target.closest(
        ".markerMapControls"
      ) ||
      target.closest(
        ".fullscreenEditorPanel"
      ) ||
      target.closest(
        ".fullscreenNewMarker"
      )
    ) {
      return;
    }

    if (scale <= 1) {
      return;
    }

    setDraggingMap(true);

    mapDragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    positionStartRef.current = {
      ...position,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function handleMapPointerMove(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (!draggingMap) {
      return;
    }

    const deltaX =
      event.clientX -
      mapDragStartRef.current.x;

    const deltaY =
      event.clientY -
      mapDragStartRef.current.y;

    if (
      Math.abs(deltaX) > 3 ||
      Math.abs(deltaY) > 3
    ) {
      suppressMapClickRef.current =
        true;
    }

    setPosition({
      x:
        positionStartRef.current.x +
        deltaX,

      y:
        positionStartRef.current.y +
        deltaY,
    });
  }

  function handleMapPointerUp(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    setDraggingMap(false);

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      //
    }

    setTimeout(() => {
      suppressMapClickRef.current =
        false;
    }, 0);
  }

  function getCoordinatesFromClientPoint(
    clientX: number,
    clientY: number
  ) {
    const stage =
      stageRef.current;

    if (!stage) {
      return null;
    }

    const rect =
      stage.getBoundingClientRect();

    const rawX =
      ((clientX - rect.left) /
        rect.width) *
      100;

    const rawY =
      ((clientY - rect.top) /
        rect.height) *
      100;

    if (
      rawX < 0 ||
      rawX > 100 ||
      rawY < 0 ||
      rawY > 100
    ) {
      return null;
    }

    return {
      x: Number(
        rawX.toFixed(4)
      ),
      y: Number(
        rawY.toFixed(4)
      ),
    };
  }

  function handleStageClick(
    event: MouseEvent<HTMLDivElement>
  ) {
    if (
      suppressMapClickRef.current ||
      draggingMarkerId
    ) {
      return;
    }

    const target =
      event.target as HTMLElement;

    if (
      target.closest(
        ".markerAnchor"
      )
    ) {
      return;
    }

    const coords =
      getCoordinatesFromClientPoint(
        event.clientX,
        event.clientY
      );

    if (!coords) {
      return;
    }

    setSelectedId(null);

    setWaitingForPlacement(false);

    setPlacingNew(true);

    setForm({
      ...emptyMapMarkerForm,
      x: coords.x,
      y: coords.y,
    });

    setError("");
  }

  function selectMarker(
    marker: MapMarker
  ) {
    setSelectedId(
      marker.id
    );

    setPlacingNew(false);

    setWaitingForPlacement(
      false
    );

    setForm({
      name:
        marker.name,

      type:
        marker.type,

      description:
        marker.description ?? "",

      image_url:
        marker.image_url ?? "",

      icon:
        marker.icon ?? "",

      x:
        Number(marker.x),

      y:
        Number(marker.y),

      published:
        marker.published,

      sort_order:
        marker.sort_order,
    });

    setError("");
  }

  function handleMarkerPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    marker: MapMarker
  ) {
    event.stopPropagation();

    setDraggingMarkerId(
      marker.id
    );

    markerDraggedRef.current =
      false;

    selectMarker(
      marker
    );

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function handleMarkerPointerMove(
    event: ReactPointerEvent<HTMLButtonElement>,
    markerId: string
  ) {
    if (
      draggingMarkerId !==
      markerId
    ) {
      return;
    }

    event.stopPropagation();

    const coords =
      getCoordinatesFromClientPoint(
        event.clientX,
        event.clientY
      );

    if (!coords) {
      return;
    }

    markerDraggedRef.current =
      true;

    setForm((current) => ({
      ...current,
      x: coords.x,
      y: coords.y,
    }));

    setMarkers((current) =>
      current.map((marker) =>
        marker.id === markerId
          ? {
              ...marker,
              x: coords.x,
              y: coords.y,
            }
          : marker
      )
    );
  }

  function handleMarkerPointerUp(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    event.stopPropagation();

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      //
    }

    setDraggingMarkerId(
      null
    );

    setTimeout(() => {
      markerDraggedRef.current =
        false;
    }, 0);
  }

  async function toggleFullscreen() {
    const element =
      fullscreenRef.current;

    if (!element) {
      return;
    }

    try {
      if (
        !document.fullscreenElement
      ) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (fullscreenError) {
      console.error(
        "FULLSCREEN ERROR:",
        fullscreenError
      );
    }
  }

  function startNewMarker() {
    setSelectedId(null);

    setPlacingNew(false);

    setWaitingForPlacement(
      true
    );

    setForm({
      ...emptyMapMarkerForm,
    });

    setError("");
  }

  function cancelMarker() {
    setSelectedId(null);

    setPlacingNew(false);

    setWaitingForPlacement(
      false
    );

    setForm({
      ...emptyMapMarkerForm,
    });

    setError("");

    loadMarkers();
  }

  async function saveMarker() {
    if (!form.name.trim()) {
      setError(
        "Please enter a marker name."
      );

      return;
    }

    if (
      form.x < 0 ||
      form.x > 100 ||
      form.y < 0 ||
      form.y > 100
    ) {
      setError(
        "Marker coordinates must be between 0 and 100."
      );

      return;
    }

    setSaving(true);

    setError("");

    try {
      if (selectedId) {
        const updated =
          await updateMapMarker(
            selectedId,
            map.id,
            form
          );

        setMarkers(
          (current) =>
            current.map(
              (marker) =>
                marker.id ===
                updated.id
                  ? updated
                  : marker
            )
        );

        selectMarker(
          updated
        );
      } else {
        const created =
          await createMapMarker(
            map.id,
            form
          );

        setMarkers(
          (current) => [
            ...current,
            created,
          ]
        );

        selectMarker(
          created
        );
      }
    } catch (saveError) {
      console.error(
        "MARKER SAVE ERROR:",
        saveError
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save marker."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeMarker() {
    if (!selectedId) {
      return;
    }

    const marker =
      markers.find(
        (item) =>
          item.id ===
          selectedId
      );

    if (
      !window.confirm(
        `Delete "${
          marker?.name ??
          "marker"
        }"?`
      )
    ) {
      return;
    }

    try {
      await deleteMapMarker(
        selectedId
      );

      setMarkers(
        (current) =>
          current.filter(
            (marker) =>
              marker.id !==
              selectedId
          )
      );

      setSelectedId(null);

      setPlacingNew(false);

      setWaitingForPlacement(
        false
      );

      setForm({
        ...emptyMapMarkerForm,
      });
    } catch (deleteError) {
      console.error(
        "MARKER DELETE ERROR:",
        deleteError
      );

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete marker."
      );
    }
  }

  async function handleImageUpload(
    file: File
  ) {
    setUploading(true);

    setError("");

    try {
      const url =
        await uploadMarkerImage(
          file
        );

      updateField(
        "image_url",
        url
      );
    } catch (uploadError) {
      console.error(
        "MARKER IMAGE ERROR:",
        uploadError
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  const selectedMarker =
    selectedId
      ? markers.find(
          (marker) =>
            marker.id ===
            selectedId
        ) ?? null
      : null;

  const zoomPercent =
    Math.round(
      scale * 100
    );

  const editorFields = (
    <>
      <div className="markerPanelHeading">
        <div>
          <span>
            {selectedMarker
              ? "EDIT LOCATION"
              : placingNew
              ? "NEW LOCATION"
              : waitingForPlacement
              ? "PLACEMENT MODE"
              : "LOCATION EDITOR"}
          </span>

          <h3>
            {selectedMarker?.name ||
              (placingNew
                ? "New Marker"
                : waitingForPlacement
                ? "Click the Map"
                : "Select a Marker")}
          </h3>
        </div>

        {(selectedMarker ||
          placingNew ||
          waitingForPlacement) && (
          <button
            type="button"
            className="cancelMarkerButton"
            onClick={
              cancelMarker
            }
          >
            ×
          </button>
        )}
      </div>

      {waitingForPlacement ? (
        <div className="markerNothingSelected placement">
          <div>＋</div>

          <strong>
            Click the exact position
          </strong>

          <p>
            You can zoom and pan first.
            Then click directly on the map
            where the marker should be
            placed.
          </p>
        </div>
      ) : !selectedMarker &&
        !placingNew ? (
        <div className="markerNothingSelected">
          <div>+</div>

          <strong>
            Select or create a marker
          </strong>

          <p>
            Click an existing marker or use
            New Marker to start placement.
          </p>
        </div>
      ) : (
        <>
          <label className="markerField">
            <span>
              Location Name *
            </span>

            <input
              value={
                form.name
              }
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              placeholder="Auros City"
            />
          </label>

          <label className="markerField">
            <span>
              Location Type
            </span>

            <select
              value={
                form.type
              }
              onChange={(event) =>
                updateField(
                  "type",
                  event.target
                    .value as MapMarkerType
                )
              }
            >
              {markerTypes.map(
                (type) => (
                  <option
                    key={
                      type.value
                    }
                    value={
                      type.value
                    }
                  >
                    {type.label}
                  </option>
                )
              )}
            </select>
          </label>

          <div className="coordinateGrid">
            <label className="markerField">
              <span>
                X Position
              </span>

              <input
                type="number"
                step="0.0001"
                min="0"
                max="100"
                value={
                  form.x
                }
                onChange={(event) =>
                  updateField(
                    "x",
                    Number(
                      event.target.value
                    )
                  )
                }
              />
            </label>

            <label className="markerField">
              <span>
                Y Position
              </span>

              <input
                type="number"
                step="0.0001"
                min="0"
                max="100"
                value={
                  form.y
                }
                onChange={(event) =>
                  updateField(
                    "y",
                    Number(
                      event.target.value
                    )
                  )
                }
              />
            </label>
          </div>

          <div className="coordinateInfo">
            PRECISE POSITION ·{" "}
            {Number(
              form.x
            ).toFixed(4)}
            % /{" "}
            {Number(
              form.y
            ).toFixed(4)}
            %
          </div>

          <label className="markerField">
            <span>
              Custom Icon
            </span>

            <input
              value={
                form.icon
              }
              maxLength={8}
              onChange={(event) =>
                updateField(
                  "icon",
                  event.target.value
                )
              }
              placeholder="Optional · ★"
            />
          </label>

          <label className="markerField">
            <span>
              Description
            </span>

            <textarea
              rows={5}
              value={
                form.description
              }
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe this location..."
            />
          </label>

          <div className="markerImageSection">
            <span>
              LOCATION IMAGE
            </span>

            {form.image_url && (
              <img
                src={
                  form.image_url
                }
                alt=""
              />
            )}

            <label className="markerImageButton">
              {uploading
                ? "Uploading..."
                : form.image_url
                ? "Replace Image"
                : "Upload Image"}

              <input
                type="file"
                hidden
                accept="image/png,image/jpeg,image/webp"
                disabled={
                  uploading
                }
                onChange={(event) => {
                  const file =
                    event.target
                      .files?.[0];

                  if (file) {
                    handleImageUpload(
                      file
                    );
                  }

                  event.target.value =
                    "";
                }}
              />
            </label>
          </div>

          <label className="markerPublished">
            <div>
              <strong>
                Published
              </strong>

              <span>
                Visible on public map
              </span>
            </div>

            <input
              type="checkbox"
              checked={
                form.published
              }
              onChange={(event) =>
                updateField(
                  "published",
                  event.target.checked
                )
              }
            />
          </label>

          <div className="markerPanelActions">
            <button
              type="button"
              className="saveMarker"
              onClick={
                saveMarker
              }
              disabled={
                saving ||
                uploading
              }
            >
              {saving
                ? "Saving..."
                : selectedId
                ? "Save Changes"
                : "Create Marker"}
            </button>

            {selectedId && (
              <button
                type="button"
                className="deleteMarker"
                onClick={
                  removeMarker
                }
              >
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      <section className="markerEditor">
        <header className="markerEditorHeader">
          <div>
            <span>
              AUROS WORLD EDITOR
            </span>

            <h2>
              Map Markers
            </h2>

            <p>
              Place, edit and drag locations
              with precise map coordinates.
            </p>
          </div>

          <div className="markerHeaderActions">
            <div className="markerCount">
              <strong>
                {markers.length}
              </strong>

              <span>
                MARKERS
              </span>
            </div>

            <button
              type="button"
              className="createMarkerButton"
              onClick={
                startNewMarker
              }
            >
              {waitingForPlacement
                ? "Click Map..."
                : "+ New Marker"}
            </button>
          </div>
        </header>

        {error && (
          <div className="markerError">
            {error}
          </div>
        )}

        <div className="markerEditorLayout">
          <div
            ref={fullscreenRef}
            className={
              fullscreen
                ? "markerMapWorkspace fullscreen"
                : "markerMapWorkspace"
            }
          >
            <div className="markerMapTopbar">
              <div>
                <span>
                  WORLD EDITOR
                </span>

                <strong>
                  {map.name}
                </strong>
              </div>

              <div className="markerTopbarStatus">
                {waitingForPlacement && (
                  <span className="placementBadge">
                    PLACEMENT MODE
                  </span>
                )}

                <span>
                  {zoomPercent}%
                </span>
              </div>
            </div>

            <div
              className={
                draggingMap
                  ? "markerViewport dragging"
                  : waitingForPlacement
                  ? "markerViewport placementMode"
                  : "markerViewport"
              }
              onWheel={
                handleWheel
              }
              onPointerDown={
                handleMapPointerDown
              }
              onPointerMove={
                handleMapPointerMove
              }
              onPointerUp={
                handleMapPointerUp
              }
              onPointerCancel={
                handleMapPointerUp
              }
            >
              <div
                className="markerTransformLayer"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                }}
              >
                <div
                  ref={stageRef}
                  className="markerMapStage"
                  onClick={
                    handleStageClick
                  }
                >
                  <img
                    src={
                      map.image_url
                    }
                    alt={map.name}
                    draggable={false}
                  />

                  {markers.map(
                    (marker) => {
                      const type =
                        markerTypes.find(
                          (item) =>
                            item.value ===
                            marker.type
                        );

                      return (
                        <button
                          key={
                            marker.id
                          }
                          type="button"
                          className={
                            selectedId ===
                            marker.id
                              ? `markerAnchor ${marker.type} selected`
                              : `markerAnchor ${marker.type}`
                          }
                          style={{
                            left: `${marker.x}%`,
                            top: `${marker.y}%`,
                          }}
                          title={
                            marker.name
                          }
                          onPointerDown={(event) =>
                            handleMarkerPointerDown(
                              event,
                              marker
                            )
                          }
                          onPointerMove={(event) =>
                            handleMarkerPointerMove(
                              event,
                              marker.id
                            )
                          }
                          onPointerUp={
                            handleMarkerPointerUp
                          }
                          onPointerCancel={
                            handleMarkerPointerUp
                          }
                          onClick={(event) => {
                            event.stopPropagation();

                            if (
                              !markerDraggedRef.current
                            ) {
                              selectMarker(
                                marker
                              );
                            }
                          }}
                        >
                          <span className="markerCircle">
                            {marker.icon ||
                              type?.symbol ||
                              "•"}
                          </span>

                          <strong className="markerLabel">
                            {
                              marker.name
                            }
                          </strong>
                        </button>
                      );
                    }
                  )}

                  {placingNew && (
                    <div
                      className={`markerAnchor draft ${form.type}`}
                      style={{
                        left: `${form.x}%`,
                        top: `${form.y}%`,
                      }}
                    >
                      <span className="markerCircle">
                        {form.icon ||
                          markerTypes.find(
                            (type) =>
                              type.value ===
                              form.type
                          )?.symbol ||
                          "+"}
                      </span>

                      <strong className="markerLabel">
                        {form.name ||
                          "New Marker"}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="markerMapControls">
                <button
                  type="button"
                  title="Zoom in"
                  onClick={
                    zoomIn
                  }
                  disabled={
                    scale >=
                    MAX_SCALE
                  }
                >
                  +
                </button>

                <button
                  type="button"
                  title="Zoom out"
                  onClick={
                    zoomOut
                  }
                  disabled={
                    scale <=
                    MIN_SCALE
                  }
                >
                  −
                </button>

                <button
                  type="button"
                  title="Reset view"
                  onClick={
                    resetView
                  }
                >
                  ↺
                </button>

                <button
                  type="button"
                  title="Fullscreen"
                  onClick={
                    toggleFullscreen
                  }
                >
                  {fullscreen
                    ? "×"
                    : "⛶"}
                </button>
              </div>

              <button
                type="button"
                className={
                  waitingForPlacement
                    ? "fullscreenNewMarker active"
                    : "fullscreenNewMarker"
                }
                onClick={
                  startNewMarker
                }
              >
                {waitingForPlacement
                  ? "Click Map..."
                  : "+ New Marker"}
              </button>

              <div className="markerMapInstructions">
                <strong>
                  {waitingForPlacement
                    ? "CLICK TO PLACE MARKER"
                    : "PRECISE MARKER MODE"}
                </strong>

                <span>
                  {waitingForPlacement
                    ? "Choose the exact position on the map"
                    : "Drag marker to move · Scroll to zoom · Drag map to pan"}
                </span>
              </div>

              {fullscreen && (
                <aside className="fullscreenEditorPanel">
                  {editorFields}
                </aside>
              )}
            </div>

            <div className="markerMapBottomBar">
              <div>
                <span className="markerOnlineDot" />

                {markers.length} locations
              </div>

              <div>
                Zoom {zoomPercent}%
              </div>
            </div>
          </div>

          {!fullscreen && (
            <aside className="markerEditorPanel">
              {editorFields}
            </aside>
          )}
        </div>

        {loading && (
          <div className="markerLoading">
            Loading markers...
          </div>
        )}
      </section>

      <style jsx global>{`
        .markerEditor {
          padding: 22px;
          border: 1px solid rgba(112, 149, 205, 0.13);
          border-radius: 18px;
          background: rgba(7, 16, 32, 0.8);
        }

        .markerEditorHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 22px;
          margin-bottom: 18px;
        }

        .markerEditorHeader
          > div:first-child
          > span {
          color: #a98aff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .markerEditorHeader h2 {
          margin: 6px 0 4px;
          font-size: 25px;
        }

        .markerEditorHeader p {
          margin: 0;
          color: #758ba9;
          font-size: 11px;
        }

        .markerHeaderActions {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .markerCount {
          display: flex;
          flex-direction: column;
          text-align: right;
        }

        .markerCount strong {
          color: #63ddff;
          font-size: 22px;
        }

        .markerCount span {
          color: #667d9e;
          font-size: 7px;
          font-weight: 900;
        }

        .createMarkerButton,
        .fullscreenNewMarker {
          border: 1px solid rgba(99, 221, 255, 0.25);
          border-radius: 9px;
          background: #63ddff;
          color: #04101b;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .createMarkerButton {
          min-height: 40px;
          padding: 0 14px;
        }

        .markerError {
          margin-bottom: 14px;
          padding: 11px 13px;
          border: 1px solid rgba(255, 100, 115, 0.22);
          border-radius: 9px;
          background: rgba(130, 24, 35, 0.12);
          color: #ff9ca6;
          font-size: 9px;
        }

        .markerEditorLayout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            350px;
          gap: 16px;
          align-items: start;
        }

        .markerMapWorkspace {
          min-width: 0;
          overflow: hidden;
          border: 1px solid rgba(112, 149, 205, 0.14);
          border-radius: 15px;
          background: #02060c;
        }

        .markerMapWorkspace.fullscreen {
          width: 100vw;
          height: 100vh;
          display: grid;
          grid-template-rows:
            auto
            minmax(0, 1fr)
            auto;
          border: 0;
          border-radius: 0;
          background: #02060c;
        }

        .markerMapTopbar {
          min-height: 47px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 0 13px;
          border-bottom: 1px solid rgba(112, 149, 205, 0.09);
          background: #050c18;
        }

        .markerMapTopbar
          > div:first-child {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .markerMapTopbar span {
          color: #63ddff;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .markerMapTopbar strong {
          color: white;
          font-size: 10px;
        }

        .markerTopbarStatus {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #7187a8;
          font-size: 8px;
        }

        .markerTopbarStatus
          .placementBadge {
          padding: 4px 7px;
          border-radius: 999px;
          background: rgba(99, 221, 255, 0.1);
          color: #63ddff;
        }

        .markerViewport {
          position: relative;
          height: min(68vh, 760px);
          min-height: 560px;
          overflow: hidden;
          touch-action: none;
          user-select: none;
          cursor: crosshair;
          background:
            radial-gradient(
              circle at center,
              rgba(28, 57, 80, 0.16),
              transparent 70%
            ),
            #01040a;
        }

        .markerViewport.dragging {
          cursor: grabbing;
        }

        .markerViewport.placementMode {
          cursor: crosshair;
        }

        .markerMapWorkspace.fullscreen
          .markerViewport {
          height: auto;
          min-height: 0;
        }

        .markerTransformLayer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-origin: center center;
          will-change: transform;
        }

        .markerMapStage {
          position: relative;
          display: inline-block;
          max-width: 100%;
          max-height: 100%;
          line-height: 0;
          cursor: crosshair;
        }

        .markerMapStage > img {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: min(68vh, 760px);
          object-fit: contain;
          pointer-events: none;
          user-select: none;
        }

        .markerMapWorkspace.fullscreen
          .markerMapStage
          > img {
          max-width: calc(100vw - 40px);
          max-height: calc(100vh - 120px);
        }

        .markerAnchor {
          position: absolute;
          z-index: 20;
          width: 0;
          height: 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: white;
          cursor: grab;
          touch-action: none;
        }

        .markerAnchor:active {
          cursor: grabbing;
        }

        .markerCircle {
          position: absolute;
          left: 0;
          top: 0;
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border: 2px solid rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          background: #63ddff;
          color: #04101b;
          font-size: 9px;
          font-weight: 950;
          transform: translate(-50%, -50%);
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.58);
          pointer-events: none;
        }

        .markerLabel {
          position: absolute;
          left: 20px;
          top: 0;
          max-width: 170px;
          overflow: hidden;
          padding: 5px 7px;
          border-radius: 7px;
          background: rgba(3, 9, 20, 0.86);
          color: #e3efff;
          font-size: 8px;
          line-height: 1;
          white-space: nowrap;
          text-overflow: ellipsis;
          transform: translateY(-50%);
          box-shadow:
            0 3px 10px rgba(0, 0, 0, 0.28);
          pointer-events: none;
        }

        .markerAnchor.landmark
          .markerCircle {
          background: #65e8a8;
        }

        .markerAnchor.story
          .markerCircle {
          background: #ab87ff;
        }

        .markerAnchor.event
          .markerCircle {
          background: #ff9e55;
        }

        .markerAnchor.spawn
          .markerCircle {
          background: #ffd866;
        }

        .markerAnchor.other
          .markerCircle {
          background: #9baac2;
        }

        .markerAnchor.selected
          .markerCircle {
          width: 36px;
          height: 36px;
          box-shadow:
            0 0 0 6px rgba(99, 221, 255, 0.2),
            0 4px 18px rgba(0, 0, 0, 0.62);
        }

        .markerAnchor.draft
          .markerCircle {
          border-style: dashed;
          box-shadow:
            0 0 0 5px rgba(99, 221, 255, 0.13),
            0 4px 18px rgba(0, 0, 0, 0.55);
        }

        .markerMapControls {
          position: absolute;
          top: 13px;
          right: 13px;
          z-index: 70;
          display: grid;
          gap: 6px;
        }

        .markerMapControls button {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(119, 156, 211, 0.17);
          border-radius: 10px;
          background: rgba(4, 12, 25, 0.92);
          color: white;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          backdrop-filter: blur(7px);
        }

        .markerMapControls
          button:hover:not(:disabled) {
          color: #63ddff;
          border-color: rgba(99, 221, 255, 0.32);
        }

        .markerMapControls
          button:disabled {
          opacity: 0.35;
          cursor: default;
        }

        .fullscreenNewMarker {
          position: absolute;
          left: 13px;
          top: 13px;
          z-index: 70;
          min-height: 38px;
          padding: 0 13px;
        }

        .fullscreenNewMarker.active {
          background: #ffffff;
          color: #06101d;
        }

        .markerMapInstructions {
          position: absolute;
          left: 13px;
          bottom: 13px;
          z-index: 60;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 8px 10px;
          border: 1px solid rgba(99, 221, 255, 0.13);
          border-radius: 9px;
          background: rgba(3, 10, 22, 0.82);
          pointer-events: none;
        }

        .markerMapInstructions
          strong {
          color: #63ddff;
          font-size: 7px;
        }

        .markerMapInstructions
          span {
          color: #7187a8;
          font-size: 7px;
        }

        .markerMapBottomBar {
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 13px;
          border-top: 1px solid rgba(112, 149, 205, 0.08);
          background: #050c18;
          color: #5d7596;
          font-size: 7px;
        }

        .markerMapBottomBar
          > div:first-child {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .markerOnlineDot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #42e5a7;
        }

        .markerEditorPanel,
        .fullscreenEditorPanel {
          padding: 17px;
          border: 1px solid rgba(112, 149, 205, 0.11);
          border-radius: 14px;
          background: rgba(4, 11, 24, 0.94);
        }

        .fullscreenEditorPanel {
          position: absolute;
          top: 65px;
          right: 65px;
          z-index: 65;
          width: 340px;
          max-height: calc(100% - 90px);
          overflow-y: auto;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .markerPanelHeading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 15px;
        }

        .markerPanelHeading span {
          color: #63ddff;
          font-size: 7px;
          font-weight: 900;
        }

        .markerPanelHeading h3 {
          margin: 4px 0 0;
          font-size: 18px;
        }

        .cancelMarkerButton {
          width: 30px;
          height: 30px;
          border: 1px solid rgba(112, 149, 205, 0.14);
          border-radius: 8px;
          background: rgba(10, 20, 38, 0.8);
          color: #94a8c4;
          cursor: pointer;
        }

        .markerNothingSelected {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: #7086a5;
        }

        .markerNothingSelected
          > div {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          margin-bottom: 12px;
          border: 1px dashed rgba(99, 221, 255, 0.25);
          border-radius: 50%;
          color: #63ddff;
          font-size: 21px;
        }

        .markerNothingSelected
          strong {
          color: #c1cfe1;
          font-size: 11px;
        }

        .markerNothingSelected p {
          max-width: 220px;
          margin: 6px 0 0;
          color: #667c9c;
          font-size: 8px;
          line-height: 1.55;
        }

        .markerNothingSelected.placement
          > div {
          border-style: solid;
          background: rgba(99, 221, 255, 0.08);
        }

        .markerField {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 11px;
        }

        .markerField > span,
        .markerImageSection
          > span {
          color: #8196b5;
          font-size: 7px;
          font-weight: 850;
        }

        .markerField input,
        .markerField textarea,
        .markerField select {
          width: 100%;
          border: 1px solid rgba(112, 149, 205, 0.14);
          border-radius: 8px;
          outline: none;
          background: #071122;
          color: white;
          font: inherit;
          font-size: 9px;
        }

        .markerField input,
        .markerField select {
          min-height: 38px;
          padding: 0 10px;
        }

        .markerField textarea {
          resize: vertical;
          padding: 10px;
          line-height: 1.55;
        }

        .coordinateGrid {
          display: grid;
          grid-template-columns:
            1fr
            1fr;
          gap: 8px;
        }

        .coordinateInfo {
          margin:
            -4px
            0
            12px;
          color: #63ddff;
          font-size: 7px;
          font-weight: 800;
        }

        .markerImageSection {
          margin-bottom: 12px;
        }

        .markerImageSection img {
          width: 100%;
          aspect-ratio: 16 / 9;
          display: block;
          object-fit: cover;
          margin: 7px 0;
          border-radius: 9px;
        }

        .markerImageButton {
          min-height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 7px;
          border: 1px dashed rgba(99, 221, 255, 0.2);
          border-radius: 8px;
          color: #8be9ff;
          font-size: 8px;
          font-weight: 800;
          cursor: pointer;
        }

        .markerPublished {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin: 13px 0;
          padding: 12px 0;
          border-top: 1px solid rgba(112, 149, 205, 0.08);
          border-bottom: 1px solid rgba(112, 149, 205, 0.08);
        }

        .markerPublished
          > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .markerPublished strong {
          font-size: 9px;
        }

        .markerPublished span {
          color: #637a9a;
          font-size: 7px;
        }

        .markerPublished input {
          width: 18px;
          height: 18px;
          accent-color: #63ddff;
        }

        .markerPanelActions {
          display: flex;
          gap: 7px;
        }

        .markerPanelActions
          button {
          min-height: 39px;
          padding: 0 13px;
          border-radius: 8px;
          font-size: 8px;
          font-weight: 900;
          cursor: pointer;
        }

        .saveMarker {
          flex: 1;
          border: none;
          background: #63ddff;
          color: #04101b;
        }

        .saveMarker:disabled {
          opacity: 0.55;
          cursor: default;
        }

        .deleteMarker {
          border: 1px solid rgba(255, 98, 110, 0.22);
          background: rgba(135, 27, 38, 0.1);
          color: #ff9da7;
        }

        .markerLoading {
          margin-top: 10px;
          color: #637b9c;
          font-size: 8px;
        }

        @media (max-width: 1050px) {
          .markerEditorLayout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .markerEditorHeader {
            align-items: flex-start;
            flex-direction: column;
          }

          .markerViewport {
            min-height: 440px;
          }

          .markerMapInstructions {
            display: none;
          }

          .fullscreenEditorPanel {
            right: 10px;
            top: 65px;
            width: min(
              340px,
              calc(100% - 20px)
            );
          }
        }
      `}</style>
    </>
  );
}