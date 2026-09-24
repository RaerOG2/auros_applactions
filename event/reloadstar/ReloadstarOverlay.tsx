"use client";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  useReloadstar,
} from "./ReloadstarProvider";

import {
  getReloadstarPhaseStart,
} from "./config";


export default function ReloadstarOverlay() {
  const {
    phase,
    eventTime,
  } =
    useReloadstar();


  const phaseTime =
    Math.max(
      0,
      eventTime -
        getReloadstarPhaseStart(
          phase
        )
    );


  if (
    phase === "inactive" ||
    phase === "released"
  ) {
    return null;
  }


  return (
    <div
      className={`reloadstarOverlay reloadstarPhase-${phase}`}
      data-reloadstar-phase={
        phase
      }
    >
      {phase ===
        "nexus_arrival" && (
        <NexusArrival
          phaseTime={
            phaseTime
          }
        />
      )}


      {phase ===
        "destabilizing" && (
        <>
          {phaseTime < 1.6 && (
            <div
              className="reloadstarArrivalCarryover"
              style={
                {
                  "--reloadstar-transition-progress":
                    clamp(phaseTime / 1.6),
                } as React.CSSProperties
              }
            >
              <NexusArrival
                phaseTime={35}
                settled
              />
            </div>
          )}

          <div
            className="reloadstarDestabilizingEnter"
            style={
              {
                "--reloadstar-transition-progress":
                  clamp(phaseTime / 1.6),
              } as React.CSSProperties
            }
          >
            <Destabilizing
              phaseTime={
                phaseTime
              }
            />
          </div>
        </>
      )}


      {phase ===
        "explosion" && (
        <Explosion
          phaseTime={
            phaseTime
          }
        />
      )}


      {phase ===
        "blackout" && (
        <Blackout
          phaseTime={
            phaseTime
          }
        />
      )}


      {phase ===
        "recovery" && (
        <Recovery phaseTime={phaseTime} />
      )}


      {phase ===
        "release_video" && (
        <ReleaseVideo />
      )}


      {phase === "world_return" && (
        <WorldReturn
          phaseTime={phaseTime}
        />
      )}

      {phase ===
        "reconstruction" && (
        <Reconstruction
          phaseTime={
            phaseTime
          }
        />
      )}

      {phase ===
        "unlocking" && (
        <Unlocking
          eventTime={
            eventTime
          }
        />
      )}
    </div>
  );
}


/* =========================================================
   NEXUS ARRIVAL
========================================================= */

function NexusArrival({
  phaseTime,
  settled = false,
}: {
  phaseTime: number;
  settled?: boolean;
}) {
  const intensity =
    clamp(
      phaseTime / 35
    );

  const showWait =
    phaseTime >= 2.7 &&
    phaseTime < 4.8;

  const showWhat =
    phaseTime >= 4.8 &&
    phaseTime < 7.5;

  const showGroundEnergy =
    phaseTime >= 4.5 &&
    phaseTime < 11;

  const showStreaks =
    phaseTime >= 6 &&
    phaseTime < 11.5;

  const nexusHasArrived =
    phaseTime >= 8;

  const showImpact =
    phaseTime >= 10 &&
    phaseTime < 13;

  return (
    <div
      className="reloadstarNexusScene"
      style={
        {
          "--reloadstar-intensity":
            intensity,
        } as React.CSSProperties
      }
    >
      <Atmosphere />

      <div className="reloadstarArrivalFlash" />

      {showWait && (
        <div className="reloadstarIntroText reloadstarIntroWait">
          Wait...
        </div>
      )}

      {showWhat && (
        <div className="reloadstarIntroText reloadstarIntroWhat">
          What is that?
        </div>
      )}

      {showGroundEnergy && (
        <div className="reloadstarGroundEnergy">
          <div className="reloadstarGroundEnergyCore" />

          <div className="reloadstarGroundEnergyGlow" />
        </div>
      )}

      {showStreaks && (
        <div className="reloadstarArrivalStreakField">
          <span className="reloadstarArrivalStreak reloadstarArrivalStreak1" />
          <span className="reloadstarArrivalStreak reloadstarArrivalStreak2" />
          <span className="reloadstarArrivalStreak reloadstarArrivalStreak3" />
          <span className="reloadstarArrivalStreak reloadstarArrivalStreak4" />
          <span className="reloadstarArrivalStreak reloadstarArrivalStreak5" />
          <span className="reloadstarArrivalStreak reloadstarArrivalStreak6" />
          <span className="reloadstarArrivalStreak reloadstarArrivalStreak7" />
          <span className="reloadstarArrivalStreak reloadstarArrivalStreak8" />
          <span className="reloadstarArrivalStreak reloadstarArrivalStreak9" />
        </div>
      )}

      {nexusHasArrived && (
        <div
          className={`reloadstarNexusPosition reloadstarNexusArrivalPosition ${
            settled
              ? "reloadstarNexusArrivalSettled"
              : ""
          }`}
        >
          <Nexuspoint />
        </div>
      )}

      {showImpact && (
        <div className="reloadstarArrivalImpact">
          <div className="reloadstarArrivalImpactFlash" />

          <div className="reloadstarArrivalImpactRing reloadstarArrivalImpactRing1" />

          <div className="reloadstarArrivalImpactRing reloadstarArrivalImpactRing2" />

          <div className="reloadstarArrivalImpactRing reloadstarArrivalImpactRing3" />
        </div>
      )}
    </div>
  );
}


/* =========================================================
   DESTABILIZING
========================================================= */

function Destabilizing({
  phaseTime,
}: {
  phaseTime:
    number;
}) {
  const intensity =
    clamp(
      phaseTime /
        25
    );


  const stage =
    intensity > 0.72
      ? "critical"
      : intensity > 0.36
        ? "warning"
        : "unstable";


  const finalEscalation =
    phaseTime >= 22;


  return (
    <div
      className={`reloadstarNexusScene reloadstarNexusSceneUnstable reloadstarInstability-${stage} ${
        finalEscalation
          ? "reloadstarInstabilityFinal"
          : ""
      }`}
      style={
        {
          "--reloadstar-intensity":
            intensity,
        } as React.CSSProperties
      }
    >
      <Atmosphere />

      <div className="reloadstarGlitchLayer reloadstarGlitchLayerA" />

      <div className="reloadstarGlitchLayer reloadstarGlitchLayerB" />

      <div className="reloadstarVignette" />

      <ScreenDischarges
        phaseTime={
          phaseTime
        }
        intensity={
          intensity
        }
      />

      <div className="reloadstarNexusPosition">
        <Nexuspoint unstable />

        <LightningField
          intensity={
            intensity
          }
        />
      </div>

      <div
        className="reloadstarInstabilityPulse"
        aria-hidden="true"
      />

      <div
        className="reloadstarCriticalBloom"
        aria-hidden="true"
      />

      <div className="reloadstarInstabilityStatus">
        <span>
          NEXUSPOINT
        </span>

        <strong>
          {stage ===
          "critical"
            ? "CRITICAL"
            : "UNSTABLE"}
        </strong>
      </div>
    </div>
  );
}


/* =========================================================
   SCREEN DISCHARGES
========================================================= */

type DischargeDefinition = {
  at: number;
  duration: number;
  endX: number;
  endY: number;
  bendA: [number, number];
  bendB: [number, number];
};


const SCREEN_DISCHARGES: DischargeDefinition[] = [
  {
    at: 4.2,
    duration: 0.34,
    endX: 8,
    endY: 18,
    bendA: [41, 35],
    bendB: [24, 24],
  },
  {
    at: 8.8,
    duration: 0.38,
    endX: 92,
    endY: 24,
    bendA: [63, 35],
    bendB: [78, 29],
  },
  {
    at: 12.1,
    duration: 0.42,
    endX: 14,
    endY: 79,
    bendA: [39, 52],
    bendB: [27, 66],
  },
  {
    at: 15.6,
    duration: 0.42,
    endX: 88,
    endY: 82,
    bendA: [63, 54],
    bendB: [77, 68],
  },
  {
    at: 18.2,
    duration: 0.46,
    endX: 4,
    endY: 48,
    bendA: [38, 43],
    bendB: [20, 47],
  },
  {
    at: 20.4,
    duration: 0.46,
    endX: 96,
    endY: 53,
    bendA: [65, 44],
    bendB: [82, 50],
  },
  {
    at: 22.0,
    duration: 0.5,
    endX: 20,
    endY: 4,
    bendA: [42, 29],
    bendB: [31, 15],
  },
  {
    at: 23.15,
    duration: 0.5,
    endX: 82,
    endY: 5,
    bendA: [61, 29],
    bendB: [72, 15],
  },
  {
    at: 24.05,
    duration: 0.55,
    endX: 7,
    endY: 91,
    bendA: [38, 58],
    bendB: [22, 77],
  },
  {
    at: 24.62,
    duration: 0.38,
    endX: 94,
    endY: 91,
    bendA: [64, 58],
    bendB: [80, 77],
  },
];


function ScreenDischarges({
  phaseTime,
  intensity,
}: {
  phaseTime: number;
  intensity: number;
}) {
  const activeDischarges =
    useMemo(
      () =>
        SCREEN_DISCHARGES.filter(
          (discharge) =>
            phaseTime >=
              discharge.at &&
            phaseTime <=
              discharge.at +
                discharge.duration
        ),
      [phaseTime]
    );


  if (
    activeDischarges.length === 0
  ) {
    return null;
  }


  return (
    <div
      className="reloadstarScreenDischarges"
      aria-hidden="true"
    >
      {activeDischarges.map(
        (discharge, index) => {
          const progress =
            clamp(
              (
                phaseTime -
                discharge.at
              ) /
                discharge.duration
            );

          // Nexuspoint sits at left: 72%, top: 48%.
          // Starting the bolt here makes every discharge visibly
          // originate from the Nexus core instead of screen center.
          const points = [
            `72,48`,
            `${discharge.bendA[0]},${discharge.bendA[1]}`,
            `${discharge.bendB[0]},${discharge.bendB[1]}`,
            `${discharge.endX},${discharge.endY}`,
          ].join(" ");

          return (
            <div
              className="reloadstarScreenDischarge"
              key={`${discharge.at}-${index}`}
              style={
                {
                  "--reloadstar-discharge-progress":
                    progress,
                  "--reloadstar-discharge-intensity":
                    intensity,
                  "--reloadstar-impact-x":
                    `${discharge.endX}%`,
                  "--reloadstar-impact-y":
                    `${discharge.endY}%`,
                } as React.CSSProperties
              }
            >
              <svg
                className="reloadstarScreenBolt"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  className="reloadstarScreenBoltGlow"
                  points={
                    points
                  }
                />

                <polyline
                  className="reloadstarScreenBoltCore"
                  points={
                    points
                  }
                />
              </svg>

              <div className="reloadstarScreenImpact" />

              <div className="reloadstarScreenImpactRing" />
            </div>
          );
        }
      )}
    </div>
  );
}


/* =========================================================
   NEXUSPOINT
========================================================= */

function Nexuspoint({
  unstable =
    false,
}: {
  unstable?:
    boolean;
}) {
  return (
    <div
      className={`reloadstarNexus ${
        unstable
          ? "reloadstarNexusUnstable"
          : ""
      }`}
    >
      <div className="reloadstarNexusOuterGlow" />

      <div className="reloadstarNexusShockRing reloadstarNexusShockRingOne" />

      <div className="reloadstarNexusShockRing reloadstarNexusShockRingTwo" />


      <div className="reloadstarOrbit reloadstarOrbitOne">
        <span />
      </div>

      <div className="reloadstarOrbit reloadstarOrbitTwo">
        <span />
      </div>

      <div className="reloadstarOrbit reloadstarOrbitThree">
        <span />
      </div>


      <div className="reloadstarNexusAura" />


      <div className="reloadstarNexusCore">
        <div className="reloadstarNexusCoreEnergy" />

        <div className="reloadstarNexusCoreHighlight" />

        <div className="reloadstarNexusCoreCrack reloadstarNexusCoreCrackOne" />

        <div className="reloadstarNexusCoreCrack reloadstarNexusCoreCrackTwo" />

        <div className="reloadstarNexusCoreCrack reloadstarNexusCoreCrackThree" />
      </div>


      <div className="reloadstarParticle reloadstarParticle1" />
      <div className="reloadstarParticle reloadstarParticle2" />
      <div className="reloadstarParticle reloadstarParticle3" />
      <div className="reloadstarParticle reloadstarParticle4" />
      <div className="reloadstarParticle reloadstarParticle5" />
      <div className="reloadstarParticle reloadstarParticle6" />
      <div className="reloadstarParticle reloadstarParticle7" />
      <div className="reloadstarParticle reloadstarParticle8" />
    </div>
  );
}


/* =========================================================
   LIGHTNING
========================================================= */

function LightningField({
  intensity,
}: {
  intensity:
    number;
}) {
  const opacity =
    0.25 +
    intensity *
      0.75;


  return (
    <div
      className="reloadstarLightningField"
      style={{
        opacity,
      }}
    >
      <Lightning
        className="reloadstarLightning1"
        points="0,100 38,83 23,70 76,54 57,40 112,14"
      />

      <Lightning
        className="reloadstarLightning2"
        points="5,10 47,32 29,48 91,67 69,82 125,100"
      />

      <Lightning
        className="reloadstarLightning3"
        points="110,0 83,34 100,44 53,62 70,75 17,105"
      />

      <Lightning
        className="reloadstarLightning4"
        points="0,44 44,50 31,64 87,67 72,81 120,88"
      />

      <Lightning
        className="reloadstarLightning5"
        points="110,10 80,30 94,43 42,50 58,67 3,83"
      />
    </div>
  );
}


function Lightning({
  className,
  points,
}: {
  className:
    string;

  points:
    string;
}) {
  return (
    <svg
      className={`reloadstarLightning ${className}`}
      viewBox="0 0 125 110"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        className="reloadstarLightningGlow"
        points={
          points
        }
      />

      <polyline
        className="reloadstarLightningCore"
        points={
          points
        }
      />
    </svg>
  );
}


/* =========================================================
   ATMOSPHERE
========================================================= */

function Atmosphere() {
  return (
    <>
      <div className="reloadstarEventTint" />

      <div className="reloadstarScanlines" />

      <div className="reloadstarEnergyFog reloadstarEnergyFogOne" />

      <div className="reloadstarEnergyFog reloadstarEnergyFogTwo" />
    </>
  );
}


/* =========================================================
   EXPLOSION
========================================================= */

function Explosion({
  phaseTime,
}: {
  phaseTime:
    number;
}) {
  const progress =
    clamp(
      phaseTime /
        5
    );


  return (
    <div
      className="reloadstarExplosion"
      style={
        {
          "--reloadstar-explosion-progress":
            progress,
        } as React.CSSProperties
      }
    >
      <div className="reloadstarExplosionSuckIn">
        <div className="reloadstarExplosionOrb" />
      </div>

      <div className="reloadstarExplosionWave reloadstarExplosionWaveOne" />

      <div className="reloadstarExplosionWave reloadstarExplosionWaveTwo" />

      <div className="reloadstarExplosionBlast" />

      <div className="reloadstarExplosionWhiteout" />
    </div>
  );
}


/* =========================================================
   BLACKOUT
========================================================= */

function Blackout({
  phaseTime,
}: {
  phaseTime:
    number;
}) {
  return (
    <div className="reloadstarBlackout">
      {phaseTime <
        1.3 && (
        <div className="reloadstarBlackoutAfterglow" />
      )}

      {phaseTime >
        7.5 && (
        <div className="reloadstarRecoveryWake">
          <span>
            _
          </span>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   RECOVERY
========================================================= */

function Recovery({
  phaseTime,
}: {
  phaseTime: number;
}) {
  const t = phaseTime;
  const typed = (text: string, start: number, cps = 18) => {
    const count = Math.max(0, Math.min(text.length, Math.floor((t - start) * cps)));
    return text.slice(0, count);
  };
  const visible = (at: number) => t >= at;
  const inWindow = (from: number, to: number) => t >= from && t < to;
  const progress = t < 52 ? 0 : Math.min(100, Math.floor(((t - 52) / 8) * 100));
  const blocks = Math.round(progress / 5);
  const bar = `${"█".repeat(blocks)}${"░".repeat(20 - blocks)}`;

  const terminalViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewport = terminalViewportRef.current;
    if (!viewport) return;

    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [t]);

  const hardGlitch =
    inWindow(26.7, 28.1) ||
    inWindow(42.8, 43.6) ||
    inWindow(55.6, 56.5) ||
    inWindow(66.7, 67.4);

  return (
    <div className={`reloadstarRecovery reloadstarRecovery2 ${hardGlitch ? "reloadstarRecoveryErrorGlitch" : ""}`}>
      <div className="reloadstarRecoveryGlow" />
      <div className="reloadstarRecoveryScan" />
      <div className="reloadstarRecoveryNoise" />
      <div className="reloadstarRecoveryGrid" />

      {hardGlitch && (
        <div className="reloadstarRecoveryGlitchBurst" aria-hidden="true">
          <span />
          <span />
          <span />
          <b>RECOVERY SIGNAL CORRUPTED</b>
        </div>
      )}

      <div className="reloadstarRecoveryHud reloadstarRecoveryHudLeft" aria-hidden="true">
        <span>CORE / 07</span>
        <b>{t < 31 ? "UNSTABLE" : "RECOVERING"}</b>
        <i style={{ "--recovery-meter": `${Math.min(100, 18 + t * 0.92)}%` } as React.CSSProperties} />
      </div>

      <div className="reloadstarRecoveryHud reloadstarRecoveryHudRight" aria-hidden="true">
        <span>RELOADSTAR</span>
        <b>{Math.floor(t * 137.41).toString(16).toUpperCase().padStart(6, "0")}</b>
        <small>SYNC {Math.min(99.9, t * 1.22).toFixed(1)}%</small>
      </div>

      {inWindow(17.2, 22.2) && (
        <RecoveryTeaser className="reloadstarTeaserChat" eyebrow="SERVICE DISCOVERY" title="AUROS CHAT">
          <div className="reloadstarTeaserChatRows">
            <span># general <b>LINKED</b></span>
            <span># squad-ops <b>ENCRYPTED</b></span>
            <span># ███████ <b>LOCKED</b></span>
          </div>
          <small>COMMUNICATION LAYER // FUTURE SERVICE</small>
        </RecoveryTeaser>
      )}

      {inWindow(31.0, 36.2) && (
        <RecoveryTeaser className="reloadstarTeaserMap" eyebrow="WORLD CACHE // FRAGMENT 01" title="NEXUSPOINT">
          <div className="reloadstarTeaserMapGraphic">
            <i /><i /><i /><i />
            <b>NEXUS</b>
          </div>
          <small>COORDINATES CORRUPTED // RESTORING...</small>
        </RecoveryTeaser>
      )}

      {inWindow(40.2, 45.8) && (
        <RecoveryTeaser className="reloadstarTeaserIce" eyebrow="WORLD CACHE // FRAGMENT 02" title="FROZEN SECTOR">
          <div className="reloadstarTeaserTelemetry">
            <span>ICE LORD DOMAIN</span>
            <span>THERMAL: -██°C</span>
            <span>VISIBILITY: 42%</span>
          </div>
          <small>ASSET PREVIEW INTERRUPTED</small>
        </RecoveryTeaser>
      )}

      {inWindow(48.3, 53.7) && (
        <RecoveryTeaser className="reloadstarTeaserOutlander" eyebrow="WORLD CACHE // FRAGMENT 03" title="OUTLANDER SIGNAL">
          <div className="reloadstarTeaserRadar">
            <i /><i /><i /><b />
          </div>
          <small>UNKNOWN TRANSMISSION DETECTED</small>
        </RecoveryTeaser>
      )}

      {inWindow(57.0, 62.0) && (
        <RecoveryTeaser className="reloadstarTeaserCity" eyebrow="WORLD CACHE // FRAGMENT 04" title="CITY GRID">
          <div className="reloadstarTeaserCityGrid">
            <i /><i /><i /><i /><i /><i />
          </div>
          <small>DROP NETWORK // PARTIAL RESTORE</small>
        </RecoveryTeaser>
      )}

      {inWindow(64.2, 69.5) && (
        <RecoveryTeaser className="reloadstarTeaserRedacted" eyebrow="RESTRICTED PACKAGE" title="[ REDACTED ]">
          <div className="reloadstarRedactedLines">
            <span>AUROS_BR / RELEASE</span>
            <span>ISLAND_CODE: ████-████-████</span>
            <span>ACCESS: RELEASE-TIME ONLY</span>
          </div>
          <small>PUBLIC KEY WITHHELD</small>
        </RecoveryTeaser>
      )}

      <div className="reloadstarTerminalFrame">
        <div className="reloadstarTerminalTopbar">
          <span className="reloadstarTerminalLamp" />
          <span>AUROS CORE // EMERGENCY RECOVERY CONSOLE</span>
          <span className="reloadstarTerminalClock">RECOVERY +{t.toFixed(1)}s</span>
        </div>

        <div ref={terminalViewportRef} className="reloadstarTerminalViewport">
          <div className="reloadstarTerminalScroll">
            {visible(0.4) && <TerminalLine kind="dim" text="AUROS CORE RECOVERY ENVIRONMENT // BUILD 1.2.4" />}
            {visible(1.3) && <TerminalLine kind="dim" text="Copyright AUROS Systems // emergency shell" />}
            {visible(2.5) && <TerminalLine kind="gap" text="" />}

            {visible(3) && <TerminalLine kind="command" text={`> ${typed("INITIALIZE CORE_RECOVERY --FORCE", 3)}`} cursor={t < 5.1} />}
            {visible(5.3) && <TerminalLine kind="system" text="[BOOT] Acquiring recovery kernel..." />}
            {visible(6.1) && <TerminalLine kind="system" text="[BOOT] Mounting /AUROS/CORE..." />}
            {visible(7.0) && <TerminalLine kind="ok" text="[ OK ] Recovery partition mounted" />}
            {visible(8.0) && <TerminalLine kind="ok" text="[ OK ] Memory integrity check" />}
            {visible(9.0) && <TerminalLine kind="ok" text="[ OK ] Network interface" />}
            {visible(10.2) && <TerminalLine kind="system" text="[....] Rebuilding service registry" />}
            {visible(11.2) && <TerminalLine kind="system" text="[....] Loading world service manifests" />}
            {visible(12.2) && <TerminalLine kind="ok" text="[ OK ] WORLD SERVICES ................. ONLINE" />}
            {visible(13.4) && <TerminalLine kind="ok" text="[ OK ] MATCH SERVICES ................. ONLINE" />}
            {visible(14.5) && <TerminalLine kind="ok" text="[ OK ] OPERATIONS ..................... ONLINE" />}
            {visible(15.6) && <TerminalLine kind="ok" text="[ OK ] CONTENT ........................ ONLINE" />}
            {visible(16.8) && <TerminalLine kind="warning" text="[WARN] CHAT SERVICE ................... UNKNOWN BUILD" />}
            {visible(17.8) && <TerminalLine kind="system" text="[AUTO] Probing dormant communication layer..." />}
            {visible(18.8) && <TerminalLine kind="ok" text="[ OK ] CHAT GATEWAY ................... DETECTED" />}
            {visible(19) && <TerminalLine kind="command" text={`> ${typed("ANALYZE NEXUSPOINT --DEEP-SCAN", 19)}`} cursor={t < 21.3} />}
            {visible(21.5) && <TerminalLine kind="system" text="SCANNING ENERGY SIGNATURE [01/04]..." />}
            {visible(22.5) && <TerminalLine kind="system" text="SCANNING DIMENSIONAL ANCHOR [02/04]..." />}
            {visible(23.5) && <TerminalLine kind="system" text="SCANNING CORE INTEGRITY [03/04]..." />}
            {visible(24.5) && <TerminalLine kind="system" text="SCANNING STABILITY MATRIX [04/04]..." />}
            {visible(26) && <TerminalLine kind="warning" text="[WARN] NEXUSPOINT INTEGRITY ........... 14%" />}
            {visible(27) && <TerminalLine kind="danger" text="[CRIT] NEXUSPOINT STATUS .............. UNSTABLE" />}
            {visible(27.5) && <TerminalLine kind="danger" text="[ERR ] REALITY INDEX MISMATCH ......... 0x7A-14" />}
            {visible(28) && <TerminalLine kind="warning" text="[WARN] External reality link lost" />}
            {visible(28.6) && <TerminalLine kind="danger" text="[ERR ] WORLD CACHE POINTER ............ INVALID" />}
            {visible(29.3) && <TerminalLine kind="system" text="[AUTO] Isolating damaged Nexus channels..." />}
            {visible(30.5) && <TerminalLine kind="ok" text="[ OK ] Containment bypass established" />}

            {visible(33) && <TerminalLine kind="command" text={`> ${typed("LOCATE RELEASE_PAYLOAD --TARGET=AUROS_BR", 33)}`} cursor={t < 35.8} />}
            {visible(36) && <TerminalLine kind="system" text="SEARCHING /AUROS/CORE/..." />}
            {visible(37) && <TerminalLine kind="system" text="SEARCHING /AUROS/WORLD_CACHE/..." />}
            {visible(38) && <TerminalLine kind="system" text="SEARCHING /VAULT/RELOADSTAR/..." />}
            {visible(39.5) && <TerminalLine kind="ok" text="PACKAGE FOUND: AUROS_BR_RELEASE.pkg" />}
            {visible(41) && <TerminalLine kind="command" text={`> ${typed("VERIFY AUROS_BR_RELEASE.pkg --SIGNATURE", 41)}`} cursor={t < 44} />}
            {visible(42.7) && <TerminalLine kind="danger" text="[ERR ] DECRYPTION STREAM DESYNC ........ RETRY" />}
            {visible(43.5) && <TerminalLine kind="system" text="[AUTO] Re-routing through recovery channel 07..." />}
            {visible(44.2) && <TerminalLine kind="system" text="Decrypting manifest..." />}
            {visible(45.2) && <TerminalLine kind="system" text="Comparing release signature..." />}
            {visible(46.4) && <TerminalLine kind="ok" text="SIGNATURE ...................... VALID" />}
            {visible(47.4) && <TerminalLine kind="ok" text="RELEASE BUILD .................. READY" />}

            {visible(49) && <TerminalLine kind="warning" text="[WARN] 4 WORLD FRAGMENTS RECOVERED" />}
            {visible(50) && <TerminalLine kind="system" text="[CACHE] NEXUSPOINT / FROZEN / OUTLANDER / CITY" />}
            {visible(52) && <TerminalLine kind="progress" text={`VERIFYING [${bar}] ${progress.toString().padStart(3, " ")}%`} />}
            {visible(55.6) && <TerminalLine kind="danger" text="[ERR ] PACKAGE HASH SHIFT DETECTED" />}
            {visible(56.5) && <TerminalLine kind="system" text="[AUTO] Correcting corrupted blocks..." />}
            {visible(58.2) && <TerminalLine kind="ok" text="[ OK ] HASH MATRIX RESTORED" />}
            {visible(60.3) && <TerminalLine kind="ok" text="[ OK ] RELEASE PAYLOAD VERIFIED" />}
            {visible(62) && <TerminalLine kind="command" text={`> ${typed("EXECUTE RELEASE_SEQUENCE --MEDIA", 62)}`} cursor={t < 64.7} />}
            {visible(65) && <TerminalLine kind="system" text="DECRYPTING RELEASE MEDIA..." />}
            {visible(66.2) && <TerminalLine kind="system" text="ESTABLISHING VIDEO SIGNAL..." />}
            {visible(66.8) && <TerminalLine kind="danger" text="[ERR ] VIDEO CLOCK DRIFT ............... +184ms" />}
            {visible(67.5) && <TerminalLine kind="system" text="SYNCHRONIZING AUROS CORE CLOCK..." />}
            {visible(68.3) && <TerminalLine kind="ok" text="[ OK ] VIDEO CLOCK LOCKED" />}
            {visible(69) && <TerminalLine kind="ok" text="AUROS BR ....................... READY" />}
            {visible(70.5) && <TerminalLine kind="ok" text="RELEASE VIDEO SIGNAL ........... FOUND" />}
            {visible(71.3) && <TerminalLine kind="warning" text="[SEC ] ISLAND CODE REMAINS SEALED UNTIL RELEASE" />}
            {visible(72) && <TerminalLine kind="gap" text="" />}
            {visible(72.5) && <TerminalLine kind="command final" text={`> ${typed("PLAY RELEASE_MEDIA", 72.5, 12)}`} cursor />}
            {visible(76) && <TerminalLine kind="system pulse" text="HANDING CONTROL TO RELEASE PLAYER..." />}
          </div>
        </div>

        <div className="reloadstarTerminalFooter">
          <span>CORE LINK: <b>ACTIVE</b></span>
          <span>NEXUS: <b className="warn">{t < 31 ? "UNSTABLE" : "CONTAINED"}</b></span>
          <span>RECOVERY CHANNEL 07</span>
        </div>
      </div>
    </div>
  );
}

function RecoveryTeaser({
  eyebrow,
  title,
  className = "",
  children,
}: {
  eyebrow: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className={`reloadstarRecoveryTeaser ${className}`}>
      <div className="reloadstarRecoveryTeaserHeader">
        <small>{eyebrow}</small>
        <span>● LIVE CACHE</span>
      </div>
      <strong>{title}</strong>
      <div className="reloadstarRecoveryTeaserBody">{children}</div>
    </aside>
  );
}

function TerminalLine({
  text,
  kind = "system",
  cursor = false,
}: {
  text: string;
  kind?: string;
  cursor?: boolean;
}) {
  return (
    <div className={`reloadstarTerminalLine reloadstarTerminalLine-${kind}`}>
      <span>{text}</span>
      {cursor && <span className="reloadstarTerminalTypingCursor">█</span>}
    </div>
  );
}


/* =========================================================
   VIDEO
========================================================= */

function ReleaseVideo() {
  return (
    <div className="reloadstarPlaceholder">
      <div>
        <small>
          RELOADSTAR
        </small>

        <strong>
          RELEASE VIDEO
        </strong>

        <span>
          Video asset will be connected here.
        </span>
      </div>
    </div>
  );
}


/* =========================================================
   WORLD RETURN
========================================================= */

function WorldReturn({
  phaseTime,
}: {
  phaseTime: number;
}) {
  const t = phaseTime;

  // 0–20 Sekunden World Return
  const returnProgress = clamp(t / 20);

  // Website kommt in den ersten ~9 Sekunden zurück
  const websiteProgress = clamp((t - 1.2) / 7.8);

  // Nexus-Rebuild startet nach etwa 9 Sekunden
  const nexusProgress = clamp((t - 9) / 7);

  const nexusCoreProgress = clamp((t - 9) / 2.2);
  const nexusAuraProgress = clamp((t - 10.5) / 2.5);
  const nexusRingProgress = clamp((t - 12) / 2.5);
  const nexusOrbitProgress = clamp((t - 13.2) / 2.6);

  // Glitches werden zum Ende hin immer schwächer
  const glitchStrength =
    t < 3
      ? 1
      : t < 10
        ? 0.72
        : t < 16
          ? 0.35
          : 0.08;

  const rebuildingNexus =
    t >= 9 && t < 16.5;

  const nexusStable =
    t >= 16;

  const finalPulse =
    t >= 17.1 && t < 19.2;

  return (
    <div
      className={[
        "reloadstarWorldReturn",
        t < 10
          ? "reloadstarWorldReturnUnstable"
          : "",
        rebuildingNexus
          ? "reloadstarWorldReturnRebuildingNexus"
          : "",
        nexusStable
          ? "reloadstarWorldReturnStable"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--world-return-progress":
            returnProgress,

          "--world-return-website":
            websiteProgress,

          "--world-return-glitch":
            glitchStrength,

          "--world-return-nexus":
            nexusProgress,

          "--world-return-nexus-core":
            nexusCoreProgress,

          "--world-return-nexus-aura":
            nexusAuraProgress,

          "--world-return-nexus-rings":
            nexusRingProgress,

          "--world-return-nexus-orbits":
            nexusOrbitProgress,
        } as React.CSSProperties
      }
    >
      {/* Weißes Ende des Release-Videos */}
      <div className="reloadstarWorldReturnWhite" />

      {/* Dunkle/elektrische Atmosphäre */}
      <div className="reloadstarWorldReturnAtmosphere" />

      {/* Scanlines */}
      <div className="reloadstarWorldReturnScanlines" />

      {/* Digitale Bildfehler */}
      {t < 16 && (
        <div
          className="reloadstarWorldReturnGlitches"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}

      {/* Kurze System-/Reality-Meldungen */}
      <div className="reloadstarWorldReturnTelemetry">
        {t >= 2.5 && t < 5.5 && (
          <span>
            RESTORING WORLD SIGNAL
          </span>
        )}

        {t >= 5.5 && t < 8.8 && (
          <span>
            REALITY LAYER SYNCHRONIZING
          </span>
        )}

        {t >= 8.8 && t < 11.5 && (
          <span className="reloadstarWorldReturnTelemetryWarning">
            NEXUS SIGNATURE DETECTED
          </span>
        )}

        {t >= 11.5 && t < 15.8 && (
          <span>
            RECONSTRUCTING REALITY ANCHOR
          </span>
        )}

        {t >= 15.8 && t < 18.2 && (
          <span>
            NEXUSPOINT SIGNAL RESTORED
          </span>
        )}

        {t >= 18.2 && (
          <strong>
            WORLD CONNECTION STABLE
          </strong>
        )}
      </div>

      {/* Energiefragmente, die später in den Nexus gezogen werden */}
      {t >= 7.5 && t < 16.5 && (
        <div
          className="reloadstarWorldReturnFragments"
          aria-hidden="true"
        >
          {Array.from({
            length: 24,
          }).map((_, index) => (
            <span
              key={index}
              style={
                {
                  "--fragment-index":
                    index,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Nexus wird an seiner bekannten Position wieder aufgebaut */}
      {t >= 9 && (
        <div className="reloadstarWorldReturnNexusAnchor">
          {/* Vertikale Rekonstruktionslinie */}
          {rebuildingNexus && (
            <div className="reloadstarWorldReturnNexusBeam" />
          )}

          {/* Core entsteht zuerst */}
          <div className="reloadstarWorldReturnNexusCoreSeed" />

          {/* Unser echter Nexus */}
          <div className="reloadstarWorldReturnNexusObject">
            <Nexuspoint
              unstable={
                rebuildingNexus
              }
            />
          </div>

          {/* Digitale Nexus-Fragmente */}
          {rebuildingNexus && (
            <div
              className="reloadstarWorldReturnNexusSlices"
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      )}

      {/* Der Nexus meldet sich mit einem Energiepuls zurück */}
      {finalPulse && (
        <div
          className="reloadstarWorldReturnFinalPulse"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>
      )}

      {/* Kurzer Lens Flash beim Abschluss */}
      {t >= 17.1 && t < 17.8 && (
        <div className="reloadstarWorldReturnCompletionFlash" />
      )}

      {/* Restliches digitales Rauschen */}
      <div className="reloadstarWorldReturnNoise" />
    </div>
  );
}


/* =========================================================
   RECONSTRUCTION
========================================================= */

function Reconstruction({
  phaseTime,
}: {
  phaseTime: number;
}) {
  const progress =
    clamp(
      phaseTime / 35
    );

  const percent =
    Math.min(
      100,
      Math.floor(
        progress * 100
      )
    );

  const stage =
    phaseTime < 5
      ? "SCANNING"
      : phaseTime < 11
        ? "RESTORING"
        : phaseTime < 18
          ? "REBUILDING"
          : phaseTime < 26
            ? "SYNCHRONIZING"
            : phaseTime < 32
              ? "FINALIZING"
              : "COMPLETE";

  return (
    <div
      className="reloadstarReconstruction"
      style={
        {
          "--reloadstar-reconstruction-progress":
            progress,
        } as React.CSSProperties
      }
    >
      <div className="reloadstarReconstructionBackground" />

      <div className="reloadstarReconstructionGrid" />

      <div className="reloadstarReconstructionScan" />

      <div className="reloadstarReconstructionNoise" />

      <div className="reloadstarReconstructionContent">
        <div className="reloadstarReconstructionEyebrow">
          AUROS CORE
        </div>

        <h2>
          RECONSTRUCTING
        </h2>

        <div className="reloadstarReconstructionStage">
          {stage}
        </div>

        <div className="reloadstarReconstructionProgress">
          <div className="reloadstarReconstructionProgressTrack">
            <div
              className="reloadstarReconstructionProgressFill"
              style={{
                width: `${percent}%`,
              }}
            />
          </div>

          <div className="reloadstarReconstructionProgressInfo">
            <span>
              WEBSITE CORE
            </span>

            <strong>
              {percent}%
            </strong>
          </div>
        </div>

        <div className="reloadstarReconstructionModules">
          <ReconstructionModule
            label="CORE INTERFACE"
            active={phaseTime >= 4}
          />

          <ReconstructionModule
            label="NAVIGATION"
            active={phaseTime >= 9}
          />

          <ReconstructionModule
            label="WORLD SERVICES"
            active={phaseTime >= 14}
          />

          <ReconstructionModule
            label="AUROS NETWORK"
            active={phaseTime >= 19}
          />

          <ReconstructionModule
            label="RELEASE SYSTEM"
            active={phaseTime >= 24}
          />

          <ReconstructionModule
            label="PUBLIC INTERFACE"
            active={phaseTime >= 29}
          />
        </div>

        {phaseTime >= 32 && (
          <div className="reloadstarReconstructionComplete">
            <span />

            SYSTEM RECONSTRUCTION COMPLETE
          </div>
        )}
      </div>

      <div className="reloadstarReconstructionEdge reloadstarReconstructionEdgeTop" />

      <div className="reloadstarReconstructionEdge reloadstarReconstructionEdgeBottom" />
    </div>
  );
}

function ReconstructionModule({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`reloadstarReconstructionModule ${
        active
          ? "reloadstarReconstructionModuleActive"
          : ""
      }`}
    >
      <span />

      <strong>
        {label}
      </strong>

      <small>
        {active
          ? "ONLINE"
          : "WAITING"}
      </small>
    </div>
  );
}


/* =========================================================
   UNLOCKING
========================================================= */

function Unlocking({
  eventTime,
}: {
  eventTime:
    number;
}) {
  const remaining =
    Math.max(
      0,
      Math.ceil(
        300 -
          eventTime
      )
    );


  return (
    <div className="reloadstarUnlocking">
      <div className="reloadstarUnlockContent">
        <small>
          AUROS RELEASE SEQUENCE
        </small>

        <h2>
          UNLOCKING
        </h2>

        <div className="reloadstarUnlockCountdown">
          {
            remaining
          }
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   UTILS
========================================================= */

function clamp(
  value:
    number
) {
  return Math.max(
    0,
    Math.min(
      1,
      value
    )
  );
}