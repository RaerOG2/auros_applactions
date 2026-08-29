"use client";

import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import type { AurosMap } from "../../types/maps";

type MapCompareSliderProps = {
  leftMap: AurosMap;
  rightMap: AurosMap;
};

export default function MapCompareSlider({
  leftMap,
  rightMap,
}: MapCompareSliderProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const [position, setPosition] =
    useState(50);

  const [dragging, setDragging] =
    useState(false);

  useEffect(() => {
    setPosition(50);
  }, [
    leftMap.id,
    rightMap.id,
  ]);

  function clamp(
    value: number
  ) {
    return Math.min(
      100,
      Math.max(
        0,
        value
      )
    );
  }

  function updatePosition(
    clientX: number
  ) {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const rect =
      container.getBoundingClientRect();

    const percentage =
      ((clientX - rect.left) /
        rect.width) *
      100;

    setPosition(
      clamp(
        percentage
      )
    );
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    setDragging(true);

    updatePosition(
      event.clientX
    );

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

    updatePosition(
      event.clientX
    );
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

  const rightClip =
    100 - position;

  return (
    <>
      <div
        ref={containerRef}
        className={
          dragging
            ? "mapCompareViewport dragging"
            : "mapCompareViewport"
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
        {/* =================================================
            MAP B / RIGHT MAP

            Diese Map liegt IMMER komplett
            im Hintergrund.
        ================================================= */}

        <div className="mapCompareLayer mapCompareRightLayer">
          <div className="mapCompareImageStage">
            <img
              src={
                rightMap.image_url
              }
              alt={
                rightMap.name
              }
              draggable={false}
            />
          </div>
        </div>

        {/* =================================================
            MAP A / LEFT MAP

            Auch diese Map bleibt IMMER
            100% groß.

            Wir schneiden lediglich den
            rechten Bereich weg.

            Dadurch kann sich das Bild
            beim Slider NIEMALS verschieben.
        ================================================= */}

        <div
          className="mapCompareLayer mapCompareLeftLayer"
          style={{
            clipPath:
              `inset(0 ${rightClip}% 0 0)`,
          }}
        >
          <div className="mapCompareImageStage">
            <img
              src={
                leftMap.image_url
              }
              alt={
                leftMap.name
              }
              draggable={false}
            />
          </div>
        </div>

        {/* =================================================
            LABEL MAP A
        ================================================= */}

        <div className="mapCompareLabel left">
          <span>
            MAP A
          </span>

          <strong>
            {leftMap.name}
          </strong>

          {leftMap.version && (
            <small>
              {leftMap.version}
            </small>
          )}
        </div>

        {/* =================================================
            LABEL MAP B
        ================================================= */}

        <div className="mapCompareLabel right">
          <span>
            MAP B
          </span>

          <strong>
            {rightMap.name}
          </strong>

          {rightMap.version && (
            <small>
              {rightMap.version}
            </small>
          )}
        </div>

        {/* =================================================
            SLIDER LINE
        ================================================= */}

        <div
          className="mapCompareDivider"
          style={{
            left: `${position}%`,
          }}
        >
          <div className="mapCompareHandle">
            <span>
              ‹
            </span>

            <span>
              ›
            </span>
          </div>
        </div>

        {/* =================================================
            BOTTOM HINT
        ================================================= */}

        <div className="mapCompareHint">
          Drag to compare
        </div>

        {/* =================================================
            CURRENT PERCENTAGE
        ================================================= */}

        <div className="mapComparePercentage">
          {Math.round(
            position
          )}
          %
        </div>
      </div>

      <style jsx global>{`
        /* =====================================================
           VIEWPORT
        ===================================================== */

        .mapCompareViewport {
          position: relative;

          width: 100%;

          height:
            min(
              72vh,
              780px
            );

          min-height: 520px;

          overflow: hidden;

          border:
            1px solid
            rgba(
              107,
              150,
              210,
              0.15
            );

          border-radius: 18px;

          background:
            #01040a;

          cursor:
            ew-resize;

          user-select: none;

          touch-action: none;

          isolation: isolate;
        }

        .mapCompareViewport.dragging {
          cursor:
            ew-resize;
        }

        /* =====================================================
           MAP LAYERS

           WICHTIG:

           Beide Layer sind IMMER exakt gleich groß.

           Keine width: position%
           Keine 100vw Tricks
           Keine verschobenen Bilder
        ===================================================== */

        .mapCompareLayer {
          position: absolute;

          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          pointer-events: none;
        }

        .mapCompareRightLayer {
          z-index: 1;
        }

        .mapCompareLeftLayer {
          z-index: 2;

          will-change:
            clip-path;
        }

        /* =====================================================
           IMAGE STAGE

           Beide Maps bekommen exakt denselben
           verfügbaren Bereich.
        ===================================================== */

        .mapCompareImageStage {
          position: absolute;

          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mapCompareImageStage img {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: contain;

          object-position:
            center center;

          user-select: none;

          pointer-events: none;
        }

        /* =====================================================
           DIVIDER
        ===================================================== */

        .mapCompareDivider {
          position: absolute;

          z-index: 20;

          top: 0;
          bottom: 0;

          width: 2px;

          background:
            rgba(
              255,
              255,
              255,
              0.96
            );

          transform:
            translateX(-1px);

          pointer-events: none;

          box-shadow:
            0 0 18px
            rgba(
              99,
              221,
              255,
              0.45
            );
        }

        /* =====================================================
           HANDLE
        ===================================================== */

        .mapCompareHandle {
          position: absolute;

          top: 50%;
          left: 50%;

          width: 56px;
          height: 56px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          border:
            2px solid
            rgba(
              255,
              255,
              255,
              0.95
            );

          border-radius:
            50%;

          background:
            rgba(
              5,
              13,
              27,
              0.97
            );

          color:
            #63ddff;

          font-size: 22px;
          font-weight: 900;

          transform:
            translate(
              -50%,
              -50%
            );

          box-shadow:
            0 10px 30px
            rgba(
              0,
              0,
              0,
              0.45
            );
        }

        /* =====================================================
           MAP LABELS
        ===================================================== */

        .mapCompareLabel {
          position: absolute;

          z-index: 30;

          top: 14px;

          min-width: 145px;

          padding:
            10px
            12px;

          border:
            1px solid
            rgba(
              120,
              150,
              200,
              0.15
            );

          border-radius: 11px;

          background:
            rgba(
              3,
              10,
              22,
              0.9
            );

          backdrop-filter:
            blur(9px);

          pointer-events: none;

          box-shadow:
            0 10px 26px
            rgba(
              0,
              0,
              0,
              0.2
            );
        }

        .mapCompareLabel.left {
          left: 14px;
        }

        .mapCompareLabel.right {
          right: 14px;

          text-align: right;
        }

        .mapCompareLabel span {
          display: block;

          margin-bottom: 4px;

          color:
            #63ddff;

          font-size: 7px;
          font-weight: 900;

          letter-spacing:
            0.11em;
        }

        .mapCompareLabel strong {
          display: block;

          color: white;

          font-size: 11px;

          line-height: 1.2;
        }

        .mapCompareLabel small {
          display: block;

          margin-top: 3px;

          color:
            #6f84a4;

          font-size: 7px;
        }

        /* =====================================================
           HINT
        ===================================================== */

        .mapCompareHint {
          position: absolute;

          z-index: 30;

          bottom: 14px;
          left: 50%;

          padding:
            7px
            11px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.08
            );

          border-radius:
            999px;

          background:
            rgba(
              3,
              10,
              22,
              0.88
            );

          color:
            #8296b2;

          font-size: 7px;
          font-weight: 800;

          transform:
            translateX(-50%);

          pointer-events: none;
        }

        /* =====================================================
           PERCENTAGE
        ===================================================== */

        .mapComparePercentage {
          position: absolute;

          z-index: 30;

          right: 14px;
          bottom: 14px;

          padding:
            6px
            8px;

          border-radius: 7px;

          background:
            rgba(
              3,
              10,
              22,
              0.82
            );

          color:
            #657b9c;

          font-size: 7px;
          font-weight: 800;

          pointer-events: none;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (
          max-width: 700px
        ) {
          .mapCompareViewport {
            height: 60vh;

            min-height: 420px;
          }

          .mapCompareHandle {
            width: 48px;
            height: 48px;

            font-size: 18px;
          }

          .mapCompareLabel {
            min-width: 0;

            max-width: 42%;
          }

          .mapCompareLabel strong {
            overflow: hidden;

            white-space: nowrap;

            text-overflow:
              ellipsis;
          }

          .mapComparePercentage {
            display: none;
          }
        }
      `}</style>
    </>
  );
}