"use client";

export default function RealityWaves() {
  return (
    <>
      <svg className="waves" viewBox="0 0 800 800">
        <defs>
          <radialGradient id="waveColor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6fe7ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#7b61ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#42bfff" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        <g className="wave1">
          <path
            d="
              M400 140
              C520 120 660 200 680 350
              C700 520 560 650 400 660
              C240 670 110 560 120 400
              C130 250 250 160 400 140
              Z
            "
            fill="none"
            stroke="url(#waveColor)"
            strokeWidth="2"
          />
        </g>

        <g className="wave2">
          <path
            d="
              M400 80
              C600 60 760 240 740 420
              C720 620 540 760 400 740
              C240 720 60 560 80 400
              C100 240 240 100 400 80
              Z
            "
            fill="none"
            stroke="url(#waveColor)"
            strokeWidth="1.5"
          />
        </g>

        <g className="wave3">
          <path
            d="
              M400 200
              C500 160 650 260 640 400
              C630 540 520 620 400 630
              C260 640 180 540 170 420
              C160 300 260 220 400 200
              Z
            "
            fill="none"
            stroke="url(#waveColor)"
            strokeWidth="1.5"
          />
        </g>
      </svg>

      <style jsx>{`
        .waves {
          position: absolute;
          width: 1600px;
          height: 1600px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.7;
          pointer-events: none;
        }

        .wave1 {
          animation: rotateSlow 28s linear infinite;
        }

        .wave2 {
          animation: rotateReverse 36s linear infinite;
        }

        .wave3 {
          animation: pulse 12s ease-in-out infinite;
        }

        @keyframes rotateSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes rotateReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}