"use client";

export default function AurosBackground() {
  return (
    <>
      <div className="auros-bg">
        <div className="deep-space-glow glow-a" />
        <div className="deep-space-glow glow-b" />
        <div className="deep-space-glow glow-c" />

        <svg className="reality-waves waves-a" viewBox="0 0 1600 1600">
          <defs>
            <radialGradient id="waveStrokeA" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d7fbff" stopOpacity="0.9" />
              <stop offset="28%" stopColor="#6fe7ff" stopOpacity="0.75" />
              <stop offset="58%" stopColor="#42bfff" stopOpacity="0.5" />
              <stop offset="82%" stopColor="#7b61ff" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#7b61ff" stopOpacity="0.02" />
            </radialGradient>
          </defs>

          <g className="wave-rotate wave-r1">
            <path
              d="
                M800 220
                C1010 170 1260 310 1320 570
                C1380 840 1180 1220 850 1290
                C520 1360 220 1180 200 860
                C180 530 420 260 800 220
                Z
              "
              fill="none"
              stroke="url(#waveStrokeA)"
              strokeWidth="2.2"
            />
          </g>

          <g className="wave-rotate wave-r2">
            <path
              d="
                M800 120
                C1080 90 1380 280 1460 610
                C1540 940 1300 1370 910 1450
                C500 1530 130 1240 120 850
                C110 430 390 150 800 120
                Z
              "
              fill="none"
              stroke="url(#waveStrokeA)"
              strokeWidth="1.7"
            />
          </g>

          <g className="wave-pulse wave-r3">
            <path
              d="
                M800 320
                C960 250 1180 360 1210 610
                C1240 860 1080 1140 820 1200
                C560 1260 300 1070 290 810
                C280 530 470 360 800 320
                Z
              "
              fill="none"
              stroke="url(#waveStrokeA)"
              strokeWidth="1.5"
            />
          </g>
        </svg>

        <svg className="reality-waves waves-b" viewBox="0 0 1600 1600">
          <defs>
            <linearGradient id="fractureStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6fe7ff" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7b61ff" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          <path
            className="fracture fracture-1"
            d="M790 600 C830 560 870 520 920 470 C970 420 1010 365 1045 300"
            fill="none"
            stroke="url(#fractureStroke)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            className="fracture fracture-2"
            d="M760 690 C700 650 645 620 590 560 C540 505 500 445 455 360"
            fill="none"
            stroke="url(#fractureStroke)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            className="fracture fracture-3"
            d="M840 760 C930 780 1010 800 1110 860 C1195 910 1270 980 1340 1080"
            fill="none"
            stroke="url(#fractureStroke)"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            className="fracture fracture-4"
            d="M720 760 C620 820 520 870 430 960 C360 1030 305 1110 250 1210"
            fill="none"
            stroke="url(#fractureStroke)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        <div className="core-ambient"></div>
        <div className="core-halo"></div>
        <div className="core-shell"></div>
        <div className="core-inner"></div>
        <div className="core-white"></div>

        <div className="pulse pulse-1"></div>
        <div className="pulse pulse-2"></div>
        <div className="pulse pulse-3"></div>
        <div className="pulse pulse-4"></div>

        <div className="ring ring-1"></div>
        <div className="ring ring-2"></div>
        <div className="ring ring-3"></div>
        <div className="ring ring-4"></div>

        <div className="arc arc-1"></div>
        <div className="arc arc-2"></div>
        <div className="arc arc-3"></div>
        <div className="arc arc-4"></div>

        <div className="beam beam-1"></div>
        <div className="beam beam-2"></div>
        <div className="beam beam-3"></div>
        <div className="beam beam-4"></div>
        <div className="beam beam-5"></div>

        <div className="mist mist-1"></div>
        <div className="mist mist-2"></div>
        <div className="mist mist-3"></div>

        <div className="particles"></div>
        <div className="noise"></div>
        <div className="edge-fade"></div>
      </div>

      <style jsx>{`
        .auros-bg {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(circle at 50% 48%, rgba(255,255,255,0.05), transparent 5%),
            radial-gradient(circle at 50% 48%, rgba(111, 231, 255, 0.08), transparent 18%),
            radial-gradient(circle at 50% 48%, rgba(123, 97, 255, 0.10), transparent 28%),
            linear-gradient(180deg, #03060d 0%, #06101d 28%, #081225 58%, #09172b 100%);
        }

        .deep-space-glow,
        .core-ambient,
        .core-halo,
        .core-shell,
        .core-inner,
        .core-white,
        .pulse,
        .ring,
        .arc,
        .beam,
        .mist {
          position: absolute;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%);
        }

        .deep-space-glow {
          border-radius: 999px;
          filter: blur(120px);
          mix-blend-mode: screen;
          opacity: 0.85;
        }

        .glow-a {
          width: 520px;
          height: 520px;
          background: rgba(76, 201, 240, 0.16);
          animation: driftA 12s ease-in-out infinite alternate;
        }

        .glow-b {
          width: 760px;
          height: 760px;
          background: rgba(123, 97, 255, 0.18);
          animation: driftB 16s ease-in-out infinite alternate;
        }

        .glow-c {
          width: 1100px;
          height: 1100px;
          background: rgba(66, 191, 255, 0.08);
          animation: driftC 20s ease-in-out infinite alternate;
        }

        .reality-waves {
          position: absolute;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%);
          width: 1900px;
          height: 1900px;
          opacity: 0.58;
          filter: drop-shadow(0 0 16px rgba(111, 231, 255, 0.12));
        }

        .waves-b {
          opacity: 0.4;
          filter: drop-shadow(0 0 18px rgba(123, 97, 255, 0.14));
        }

        .wave-r1 {
          animation: rotateSlow 30s linear infinite;
        }

        .wave-r2 {
          animation: rotateReverse 42s linear infinite;
        }

        .wave-r3 {
          animation: wavePulse 12s ease-in-out infinite;
        }

        .fracture {
          opacity: 0.75;
        }

        .fracture-1 {
          animation: fracturePulse 8s ease-in-out infinite;
        }

        .fracture-2 {
          animation: fracturePulse 10s ease-in-out infinite 1.2s;
        }

        .fracture-3 {
          animation: fracturePulse 9s ease-in-out infinite 0.6s;
        }

        .fracture-4 {
          animation: fracturePulse 11s ease-in-out infinite 1.8s;
        }

        .core-ambient {
          width: 380px;
          height: 380px;
          border-radius: 999px;
          background:
            radial-gradient(circle,
              rgba(255,255,255,0.16) 0%,
              rgba(111,231,255,0.16) 18%,
              rgba(66,191,255,0.12) 36%,
              rgba(123,97,255,0.14) 54%,
              transparent 76%);
          filter: blur(36px);
          animation: ambientPulse 5.5s ease-in-out infinite;
        }

        .core-halo {
          width: 250px;
          height: 250px;
          border-radius: 999px;
          background:
            radial-gradient(circle,
              rgba(255,255,255,0.38) 0%,
              rgba(111,231,255,0.28) 18%,
              rgba(76,201,240,0.20) 38%,
              rgba(123,97,255,0.18) 58%,
              transparent 80%);
          filter: blur(24px);
          animation: haloPulse 4.2s ease-in-out infinite;
        }

        .core-shell {
          width: 134px;
          height: 134px;
          border-radius: 999px;
          background:
            radial-gradient(circle,
              rgba(255,255,255,0.78) 0%,
              rgba(190,248,255,0.82) 14%,
              rgba(111,231,255,0.62) 30%,
              rgba(66,191,255,0.45) 48%,
              rgba(123,97,255,0.28) 74%,
              transparent 100%);
          box-shadow:
            0 0 24px rgba(255,255,255,0.28),
            0 0 50px rgba(111,231,255,0.35),
            0 0 110px rgba(123,97,255,0.28);
          animation: shellPulse 3.8s ease-in-out infinite;
        }

        .core-inner {
          width: 78px;
          height: 78px;
          border-radius: 999px;
          background:
            radial-gradient(circle,
              #ffffff 0%,
              #d7fbff 20%,
              #8cefff 48%,
              #4cc9f0 72%,
              #7b61ff 100%);
          box-shadow:
            0 0 22px rgba(255,255,255,0.75),
            0 0 56px rgba(111,231,255,0.48),
            0 0 100px rgba(123,97,255,0.34);
          animation: corePulse 2.8s ease-in-out infinite;
        }

        .core-white {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: #ffffff;
          box-shadow:
            0 0 16px rgba(255,255,255,0.95),
            0 0 34px rgba(255,255,255,0.5);
          animation: whiteFlash 2.6s ease-in-out infinite;
        }

        .pulse {
          border-radius: 999px;
          border: 1px solid rgba(150, 210, 255, 0.18);
          opacity: 0;
        }

        .pulse-1 {
          width: 150px;
          height: 150px;
          animation: pulseExpand 9s ease-out infinite;
        }

        .pulse-2 {
          width: 150px;
          height: 150px;
          animation: pulseExpand 9s ease-out infinite 2.2s;
        }

        .pulse-3 {
          width: 150px;
          height: 150px;
          animation: pulseExpand 9s ease-out infinite 4.4s;
        }

        .pulse-4 {
          width: 150px;
          height: 150px;
          animation: pulseExpand 9s ease-out infinite 6.6s;
        }

        .ring {
          border-radius: 999px;
          border: 1px solid rgba(145, 190, 255, 0.10);
          box-shadow: 0 0 26px rgba(76, 201, 240, 0.06);
        }

        .ring-1 {
          width: 300px;
          height: 300px;
          animation: rotateSlow 18s linear infinite;
        }

        .ring-2 {
          width: 620px;
          height: 620px;
          border-color: rgba(123, 97, 255, 0.12);
          animation: rotateReverse 28s linear infinite;
        }

        .ring-3 {
          width: 1040px;
          height: 1040px;
          border-color: rgba(111, 231, 255, 0.08);
          animation: rotateSlow 38s linear infinite;
        }

        .ring-4 {
          width: 1520px;
          height: 1520px;
          border-color: rgba(123, 97, 255, 0.06);
          animation: rotateReverse 48s linear infinite;
        }

        .arc {
          border-radius: 999px;
          border: 2px solid transparent;
          opacity: 0.92;
          filter: drop-shadow(0 0 12px rgba(111, 231, 255, 0.10));
        }

        .arc-1 {
          width: 340px;
          height: 340px;
          border-top-color: rgba(111, 231, 255, 0.38);
          border-left-color: rgba(123, 97, 255, 0.24);
          animation: spinArc 14s linear infinite;
        }

        .arc-2 {
          width: 660px;
          height: 660px;
          border-right-color: rgba(123, 97, 255, 0.28);
          border-bottom-color: rgba(76, 201, 240, 0.16);
          animation: spinArcReverse 22s linear infinite;
        }

        .arc-3 {
          width: 1120px;
          height: 1120px;
          border-top-color: rgba(111, 231, 255, 0.14);
          border-right-color: rgba(123, 97, 255, 0.16);
          animation: spinArc 32s linear infinite;
        }

        .arc-4 {
          width: 1640px;
          height: 1640px;
          border-left-color: rgba(76, 201, 240, 0.10);
          border-bottom-color: rgba(123, 97, 255, 0.08);
          animation: spinArcReverse 42s linear infinite;
        }

        .beam {
          width: 2px;
          border-radius: 999px;
          transform-origin: center center;
          opacity: 0.2;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(111,231,255,0.05) 18%,
            rgba(255,255,255,0.48) 50%,
            rgba(123,97,255,0.10) 82%,
            transparent 100%
          );
          filter: blur(0.7px);
        }

        .beam-1 {
          height: 980px;
          transform: translate(-50%, -50%) rotate(12deg);
          animation: beamPulse 7s ease-in-out infinite;
        }

        .beam-2 {
          height: 1080px;
          transform: translate(-50%, -50%) rotate(52deg);
          animation: beamPulse 8.5s ease-in-out infinite 0.7s;
        }

        .beam-3 {
          height: 1140px;
          transform: translate(-50%, -50%) rotate(96deg);
          animation: beamPulse 10s ease-in-out infinite 1.4s;
        }

        .beam-4 {
          height: 1240px;
          transform: translate(-50%, -50%) rotate(136deg);
          animation: beamPulse 9.5s ease-in-out infinite 1.9s;
        }

        .beam-5 {
          height: 1160px;
          transform: translate(-50%, -50%) rotate(-38deg);
          animation: beamPulse 11s ease-in-out infinite 2.4s;
        }

        .mist {
          border-radius: 999px;
          filter: blur(120px);
          mix-blend-mode: screen;
          opacity: 0.42;
        }

        .mist-1 {
          width: 1200px;
          height: 420px;
          background: rgba(76, 201, 240, 0.08);
          animation: mistA 20s ease-in-out infinite alternate;
        }

        .mist-2 {
          width: 1450px;
          height: 520px;
          background: rgba(123, 97, 255, 0.08);
          animation: mistB 28s ease-in-out infinite alternate;
        }

        .mist-3 {
          width: 1700px;
          height: 540px;
          background: rgba(66, 191, 255, 0.04);
          animation: mistC 34s ease-in-out infinite alternate;
        }

        .particles {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image:
            radial-gradient(rgba(111,231,255,0.62) 0.8px, transparent 0.8px),
            radial-gradient(rgba(123,97,255,0.55) 0.7px, transparent 0.7px),
            radial-gradient(rgba(255,255,255,0.45) 0.6px, transparent 0.6px);
          background-size: 100px 100px, 160px 160px, 220px 220px;
          background-position: 0 0, 40px 60px, 100px 120px;
          animation: particleDrift 26s linear infinite;
        }

        .noise {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image:
            radial-gradient(rgba(255,255,255,0.35) 0.6px, transparent 0.6px);
          background-size: 18px 18px;
          mix-blend-mode: screen;
        }

        .edge-fade {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              circle at center,
              transparent 24%,
              rgba(4, 8, 18, 0.08) 44%,
              rgba(4, 8, 18, 0.30) 62%,
              rgba(4, 8, 18, 0.74) 100%
            );
        }

        @keyframes rotateSlow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes rotateReverse {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }

        @keyframes wavePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }

        @keyframes fracturePulse {
          0%, 100% {
            opacity: 0.22;
            filter: drop-shadow(0 0 8px rgba(111, 231, 255, 0.08));
          }
          50% {
            opacity: 0.72;
            filter: drop-shadow(0 0 18px rgba(123, 97, 255, 0.16));
          }
        }

        @keyframes ambientPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.12);
          }
        }

        @keyframes haloPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.85;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.16);
            opacity: 1;
          }
        }

        @keyframes shellPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
          }
        }

        @keyframes corePulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.14);
          }
        }

        @keyframes whiteFlash {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.95;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.22);
            opacity: 1;
          }
        }

        @keyframes pulseExpand {
          0% {
            transform: translate(-50%, -50%) scale(0.26);
            opacity: 0.56;
          }
          55% {
            opacity: 0.18;
          }
          100% {
            transform: translate(-50%, -50%) scale(13.5);
            opacity: 0;
          }
        }

        @keyframes spinArc {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes spinArcReverse {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }

        @keyframes beamPulse {
          0%, 100% {
            opacity: 0.08;
          }
          50% {
            opacity: 0.28;
          }
        }

        @keyframes driftA {
          0% {
            transform: translate(-50%, -50%) translateX(-50px) translateY(-24px) scale(1);
          }
          100% {
            transform: translate(-50%, -50%) translateX(46px) translateY(30px) scale(1.08);
          }
        }

        @keyframes driftB {
          0% {
            transform: translate(-50%, -50%) translateX(36px) translateY(-34px) scale(1);
          }
          100% {
            transform: translate(-50%, -50%) translateX(-42px) translateY(34px) scale(1.1);
          }
        }

        @keyframes driftC {
          0% {
            transform: translate(-50%, -50%) translateX(-26px) translateY(24px) scale(1);
          }
          100% {
            transform: translate(-50%, -50%) translateX(24px) translateY(-20px) scale(1.06);
          }
        }

        @keyframes mistA {
          0% {
            transform: translate(-50%, -50%) scaleX(0.94) scaleY(1);
          }
          100% {
            transform: translate(-50%, -50%) scaleX(1.08) scaleY(0.92);
          }
        }

        @keyframes mistB {
          0% {
            transform: translate(-50%, -50%) scaleX(1.02) scaleY(0.94);
          }
          100% {
            transform: translate(-50%, -50%) scaleX(0.94) scaleY(1.08);
          }
        }

        @keyframes mistC {
          0% {
            transform: translate(-50%, -50%) scaleX(0.98) scaleY(1);
          }
          100% {
            transform: translate(-50%, -50%) scaleX(1.06) scaleY(0.9);
          }
        }

        @keyframes particleDrift {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-42px);
          }
        }
      `}</style>
    </>
  );
}