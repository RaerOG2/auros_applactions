"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useReloadstar,
} from "./ReloadstarProvider";


const GROUND_RUMBLE_URL =
  "/event/reloadstar/audio/ground-rumble.mp3";

const NEXUS_LAUNCH_URL =
  "/event/reloadstar/audio/nexus-launch.mp3";

const NEXUS_IMPACT_URL =
  "/event/reloadstar/audio/nexus-impact.mp3";

const NEXUS_CRACKLE_URL =
  "/event/reloadstar/audio/nexus-crackle.mp3";

const NEXUS_DISCHARGE_URL =
  "/event/reloadstar/audio/nexus-discharge.mp3";

const NEXUS_EXPLOSION_URL =
  "/event/reloadstar/audio/nexus-explosion.mp3";

const RELOADSTAR_MUSIC_URL =
  "/event/reloadstar/audio/reloadstar-music.mp3";

const WORLD_RETURN_MUSIC_URL =
  "/event/reloadstar/audio/world-return-peaceful.mp3";

const TERMINAL_TYPING_URL = "/event/reloadstar/audio/terminal-typing.mp3";
const TERMINAL_BEEPS_URL = "/event/reloadstar/audio/terminal-beeps.mp3";
const TERMINAL_SUCCESS_URL = "/event/reloadstar/audio/terminal-success.mp3";
const TERMINAL_WARNING_URL = "/event/reloadstar/audio/terminal-warning.mp3";
const TERMINAL_PROCESSING_URL = "/event/reloadstar/audio/terminal-processing.mp3";
const TERMINAL_UI_BEEPS_URL = "/event/reloadstar/audio/terminal-ui-beeps.mp3";

const RECOVERY_START = 75;
const RECOVERY_END = 155;


const RUMBLE_START = 2;
const RUMBLE_END = 14;

const LAUNCH_TIME = 8;
const IMPACT_TIME = 10.5;

const DESTABILIZING_START = 35;
const DESTABILIZING_END = 60;
const EXPLOSION_SOUND_TIME = 62.05;

const WORLD_RETURN_START = 215;
const WORLD_RETURN_END = 235;

const WORLD_RETURN_LAUNCH_TIME = 225;
const WORLD_RETURN_IMPACT_TIME = 230;

const WORLD_RETURN_GLITCH_TIMES = [
  217.15,
  218.35,
  219.1,
  220.45,
  221.7,
  223.05,
];

const EVENT_END = 300;

const DISCHARGE_TIMES = [
  39.2,
  43.8,
  47.1,
  50.6,
  53.2,
  55.4,
  57.0,
  58.15,
  59.05,
  59.62,
];


/*
 * We intentionally do not play one-shot sounds
 * when jumping directly over their trigger point.
 *
 * Example:
 * Jumping from 00:00 -> 00:30 should NOT suddenly
 * fire the launch and impact sound.
 */
const MAX_ONE_SHOT_STEP = 0.75;


/* =========================================================
   HELPERS
========================================================= */

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}


function safePause(
  audio: HTMLAudioElement | null
) {
  if (!audio) {
    return;
  }

  audio.pause();
}


function safeReset(
  audio: HTMLAudioElement | null
) {
  if (!audio) {
    return;
  }

  audio.pause();

  try {
    audio.currentTime = 0;
  } catch {
    // Browser has not loaded metadata yet.
  }
}


async function safePlay(
  audio: HTMLAudioElement | null
) {
  if (!audio) {
    return;
  }

  try {
    await audio.play();
  } catch {
    /*
     * Browser autoplay protection can reject this.
     * The user can enable event audio using the button.
     */
  }
}


/* =========================================================
   AUDIO CONTROLLER
========================================================= */

export default function ReloadstarAudioController() {
  const {
    eventTime,
    phase,
    speed,
  } = useReloadstar();


  const rumbleRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const launchRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const impactRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const crackleRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const dischargeRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const explosionRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const musicRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const worldReturnMusicRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const terminalTypingRef = useRef<HTMLAudioElement | null>(null);
  const terminalBeepsRef = useRef<HTMLAudioElement | null>(null);
  const terminalSuccessRef = useRef<HTMLAudioElement | null>(null);
  const terminalWarningRef = useRef<HTMLAudioElement | null>(null);
  const terminalProcessingRef = useRef<HTMLAudioElement | null>(null);
  const terminalUiBeepsRef = useRef<HTMLAudioElement | null>(null);


  const previousTimeRef =
    useRef<number | null>(
      null
    );

  const previousRecoveryTimeRef = useRef<number | null>(null);


  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [showAudioButton, setShowAudioButton] =
    useState(true);


  /* =======================================================
     CREATE AUDIO OBJECTS
  ======================================================= */

  useEffect(() => {
    const rumble =
      new Audio(
        GROUND_RUMBLE_URL
      );

    const launch =
      new Audio(
        NEXUS_LAUNCH_URL
      );

    const impact =
      new Audio(
        NEXUS_IMPACT_URL
      );

    const crackle =
      new Audio(
        NEXUS_CRACKLE_URL
      );

    const discharge =
      new Audio(
        NEXUS_DISCHARGE_URL
      );

    const explosion =
      new Audio(
        NEXUS_EXPLOSION_URL
      );

    const music =
      new Audio(
        RELOADSTAR_MUSIC_URL
      );

    const worldReturnMusic =
      new Audio(
        WORLD_RETURN_MUSIC_URL
      );

    const terminalTyping = new Audio(TERMINAL_TYPING_URL);
    const terminalBeeps = new Audio(TERMINAL_BEEPS_URL);
    const terminalSuccess = new Audio(TERMINAL_SUCCESS_URL);
    const terminalWarning = new Audio(TERMINAL_WARNING_URL);
    const terminalProcessing = new Audio(TERMINAL_PROCESSING_URL);
    const terminalUiBeeps = new Audio(TERMINAL_UI_BEEPS_URL);


    rumble.preload =
      "auto";

    launch.preload =
      "auto";

    impact.preload =
      "auto";

    crackle.preload =
      "auto";

    discharge.preload =
      "auto";

    explosion.preload =
      "auto";

    music.preload =
      "auto";

    worldReturnMusic.preload =
      "auto";

    [terminalTyping, terminalBeeps, terminalSuccess, terminalWarning, terminalProcessing, terminalUiBeeps].forEach((audio) => { audio.preload = "auto"; });
    terminalTyping.loop = true;
    terminalProcessing.loop = true;
    terminalBeeps.loop = true;

    music.loop =
      true;

    worldReturnMusic.loop =
      true;


    rumble.volume =
      0;

    launch.volume =
      0.82;

    impact.volume =
      1;

    crackle.volume =
      0;

    discharge.volume =
      0.9;

    explosion.volume =
      1;

    music.volume =
      0;

    worldReturnMusic.volume =
      0;


    rumbleRef.current =
      rumble;

    launchRef.current =
      launch;

    impactRef.current =
      impact;

    crackleRef.current =
      crackle;

    dischargeRef.current =
      discharge;

    explosionRef.current =
      explosion;

    musicRef.current =
      music;

    worldReturnMusicRef.current =
      worldReturnMusic;

    terminalTypingRef.current = terminalTyping;
    terminalBeepsRef.current = terminalBeeps;
    terminalSuccessRef.current = terminalSuccess;
    terminalWarningRef.current = terminalWarning;
    terminalProcessingRef.current = terminalProcessing;
    terminalUiBeepsRef.current = terminalUiBeeps;


    return () => {
      safeReset(
        rumble
      );

      safeReset(
        launch
      );

      safeReset(
        impact
      );

      safeReset(
        crackle
      );

      safeReset(
        discharge
      );

      safeReset(
        explosion
      );

      safeReset(
        music
      );

      safeReset(
        worldReturnMusic
      );

      [terminalTyping, terminalBeeps, terminalSuccess, terminalWarning, terminalProcessing, terminalUiBeeps].forEach(safeReset);


      rumbleRef.current =
        null;

      launchRef.current =
        null;

      impactRef.current =
        null;

      crackleRef.current =
        null;

      dischargeRef.current =
        null;

      explosionRef.current =
        null;

      musicRef.current =
        null;

      worldReturnMusicRef.current =
        null;

      terminalTypingRef.current = null;
      terminalBeepsRef.current = null;
      terminalSuccessRef.current = null;
      terminalWarningRef.current = null;
      terminalProcessingRef.current = null;
      terminalUiBeepsRef.current = null;
    };
  }, []);


  /* =======================================================
     ENABLE AUDIO
  ======================================================= */

  const enableAudio =
    useCallback(
      async () => {
        const rumble =
          rumbleRef.current;

        const launch =
          launchRef.current;

        const impact =
          impactRef.current;

        const crackle =
          crackleRef.current;

        const discharge =
          dischargeRef.current;

        const explosion =
          explosionRef.current;

        const music =
          musicRef.current;

        const worldReturnMusic =
          worldReturnMusicRef.current;

        const terminalTyping = terminalTypingRef.current;
        const terminalBeeps = terminalBeepsRef.current;
        const terminalSuccess = terminalSuccessRef.current;
        const terminalWarning = terminalWarningRef.current;
        const terminalProcessing = terminalProcessingRef.current;
        const terminalUiBeeps = terminalUiBeepsRef.current;


        /*
         * A short play/pause inside the actual user click
         * unlocks audio playback in browsers that require
         * user interaction.
         */
        const audioElements = [
          rumble,
          launch,
          impact,
          crackle,
          discharge,
          explosion,
          music,
          worldReturnMusic,
          terminalTyping,
          terminalBeeps,
          terminalSuccess,
          terminalWarning,
          terminalProcessing,
          terminalUiBeeps,
        ];


        for (
          const audio
          of audioElements
        ) {
          if (!audio) {
            continue;
          }

          const previousVolume =
            audio.volume;

          audio.volume =
            0;

          try {
            await audio.play();

            audio.pause();

            audio.currentTime =
              0;
          } catch {
            // Ignore browser-specific unlock failures.
          }

          audio.volume =
            previousVolume;
        }


        setAudioEnabled(
          true
        );

        setShowAudioButton(
          false
        );
      },
      []
    );


  /* =======================================================
     RELOADSTAR BACKGROUND MUSIC
  ======================================================= */

  useEffect(() => {
    const music =
      musicRef.current;

    if (
      !music ||
      !audioEnabled
    ) {
      return;
    }

    if (
      speed > 5 ||
      eventTime < 0 ||
      eventTime >= EVENT_END
    ) {
      safePause(music);
      music.volume = 0;
      return;
    }

    /*
     * The score is the continuous musical bed for Reloadstar.
     * It stays subtle during Arrival, grows during Destabilizing,
     * ducks hard into the explosion, then returns underneath the
     * later phases. The file loops because the event is longer
     * than the selected music track.
     */
    let volume = 0.28;

    if (eventTime < 8) {
      volume = mapRange(
        eventTime,
        0,
        8,
        0.12,
        0.24
      );
    } else if (eventTime < 35) {
      volume = mapRange(
        eventTime,
        8,
        35,
        0.24,
        0.34
      );
    } else if (eventTime < 57) {
      volume = mapRange(
        eventTime,
        35,
        57,
        0.34,
        0.44
      );
    } else if (eventTime < 60) {
      volume = mapRange(
        eventTime,
        57,
        60,
        0.44,
        0.06
      );
    } else if (eventTime < 60.8) {
      volume = 0.012;
    } else if (eventTime < 62.05) {
      volume = 0.004;
    } else if (eventTime < 65) {
      volume = mapRange(
        eventTime,
        62.05,
        65,
        0.018,
        0.055
      );
    } else if (eventTime < 75) {
      volume = 0.06;
    } else if (eventTime < 155) {
      volume = 0.16;
    } else if (eventTime < 215) {
      volume = 0.22;
    } else if (eventTime < WORLD_RETURN_END) {
      volume = mapRange(
        eventTime,
        WORLD_RETURN_START,
        WORLD_RETURN_END,
        0.06,
        0.12
      );
    } else {
      volume = mapRange(
        eventTime,
        WORLD_RETURN_END,
        EVENT_END,
        0.18,
        0.42
      );
    }

    music.volume =
      clamp(volume, 0, 0.5);

    /*
     * In development mode the soundtrack follows the selected
     * timeline speed up to 5x. At 20x/60x it is muted above.
     */
    music.playbackRate =
      clamp(speed, 1, 5);

    const duration =
      Number.isFinite(music.duration) &&
      music.duration > 0
        ? music.duration
        : null;

    const desiredAudioTime =
      duration
        ? eventTime % duration
        : eventTime;

    if (music.paused) {
      try {
        music.currentTime =
          desiredAudioTime;
      } catch {
        // Metadata may not be loaded yet.
      }

      void safePlay(music);
      return;
    }

    const drift =
      Math.abs(
        music.currentTime -
          desiredAudioTime
      );

    /*
     * Only correct meaningful drift so normal playback remains
     * smooth. This also makes phase jumps land at the matching
     * point in the soundtrack.
     */
    if (drift > 1.25) {
      try {
        music.currentTime =
          desiredAudioTime;
      } catch {
        // Ignore seeking errors.
      }
    }
  }, [
    audioEnabled,
    eventTime,
    speed,
  ]);


  /* =======================================================
     WORLD RETURN — PEACEFUL MUSIC

     215s -> white image / calm return
     215-223s -> peaceful music fades in
     223-235s -> remains underneath Nexus rebuild
  ======================================================= */

  useEffect(() => {
    const worldReturnMusic =
      worldReturnMusicRef.current;

    if (
      !worldReturnMusic ||
      !audioEnabled
    ) {
      return;
    }

    const active =
      phase === "world_return" &&
      eventTime >= WORLD_RETURN_START &&
      eventTime < WORLD_RETURN_END &&
      speed <= 5;

    if (!active) {
      safeReset(worldReturnMusic);
      worldReturnMusic.volume = 0;
      return;
    }

    const localTime =
      eventTime - WORLD_RETURN_START;

    let volume = 0;

    if (localTime < 3) {
      volume = mapRange(
        localTime,
        0,
        3,
        0.02,
        0.28
      );
    } else if (localTime < 8) {
      volume = mapRange(
        localTime,
        3,
        8,
        0.28,
        0.36
      );
    } else if (localTime < 17) {
      volume = 0.36;
    } else {
      volume = mapRange(
        localTime,
        17,
        20,
        0.36,
        0.24
      );
    }

    worldReturnMusic.volume =
      clamp(
        volume,
        0,
        0.4
      );

    worldReturnMusic.playbackRate =
      clamp(
        speed,
        1,
        2
      );

    const desiredAudioTime =
      Math.max(
        0,
        localTime
      );

    if (worldReturnMusic.paused) {
      try {
        worldReturnMusic.currentTime =
          desiredAudioTime;
      } catch {
        // Metadata may not be loaded yet.
      }

      void safePlay(
        worldReturnMusic
      );
    } else {
      const drift =
        Math.abs(
          worldReturnMusic.currentTime -
            desiredAudioTime
        );

      if (drift > 1.25) {
        try {
          worldReturnMusic.currentTime =
            desiredAudioTime;
        } catch {
          // Ignore seeking errors.
        }
      }
    }
  }, [
    audioEnabled,
    eventTime,
    phase,
    speed,
  ]);


  /* =======================================================
     RUMBLE VOLUME CURVE
  ======================================================= */

  useEffect(() => {
    const rumble =
      rumbleRef.current;


    if (
      !rumble ||
      !audioEnabled
    ) {
      return;
    }


    /*
     * During high-speed development tests we mute
     * event audio. 20x/60x audio is not useful and
     * can become extremely unpleasant.
     */
    if (speed > 5) {
      safePause(
        rumble
      );

      return;
    }


    const insideRumbleWindow =
      eventTime >=
        RUMBLE_START &&
      eventTime <
        RUMBLE_END;


    if (
      !insideRumbleWindow
    ) {
      safePause(
        rumble
      );

      rumble.volume =
        0;

      return;
    }


    /*
     * -----------------------------
     * VOLUME CURVE
     * -----------------------------
     *
     * 02s -> almost silent
     * 05s -> noticeable
     * 08s -> strong
     * 10s -> extremely strong
     * 12s -> starts dropping
     * 14s -> gone
     */

    let volume =
      0;


    if (
      eventTime <
      5
    ) {
      volume =
        mapRange(
          eventTime,
          2,
          5,
          0.05,
          0.22
        );
    } else if (
      eventTime <
      8
    ) {
      volume =
        mapRange(
          eventTime,
          5,
          8,
          0.22,
          0.48
        );
    } else if (
      eventTime <
      10.5
    ) {
      volume =
        mapRange(
          eventTime,
          8,
          10.5,
          0.48,
          0.82
        );
    } else if (
      eventTime <
      12
    ) {
      volume =
        0.82;
    } else {
      volume =
        mapRange(
          eventTime,
          12,
          14,
          0.82,
          0
        );
    }


    rumble.volume =
      clamp(
        volume,
        0,
        1
      );


    /*
     * Keep the rumble synchronized with event time.
     *
     * We do not constantly force currentTime because
     * that would make audio stutter.
     */
    const desiredAudioTime =
      Math.max(
        0,
        eventTime -
          RUMBLE_START
      );


    if (
      rumble.paused
    ) {
      try {
        rumble.currentTime =
          Math.min(
            desiredAudioTime,
            Number.isFinite(
              rumble.duration
            )
              ? Math.max(
                  0,
                  rumble.duration -
                    0.05
                )
              : desiredAudioTime
          );
      } catch {
        // Metadata may not be loaded yet.
      }


      void safePlay(
        rumble
      );
    } else {
      const drift =
        Math.abs(
          rumble.currentTime -
            desiredAudioTime
        );


      /*
       * Correct larger drift caused by dev jumps.
       */
      if (drift > 1) {
        try {
          rumble.currentTime =
            desiredAudioTime;
        } catch {
          // Ignore seeking errors.
        }
      }
    }
  }, [
    audioEnabled,
    eventTime,
    speed,
  ]);


  /* =======================================================
     DESTABILIZING CRACKLE
  ======================================================= */

  useEffect(() => {
    const crackle =
      crackleRef.current;

    if (
      !crackle ||
      !audioEnabled
    ) {
      return;
    }

    if (speed > 5) {
      safePause(crackle);
      return;
    }

    const active =
      eventTime >= DESTABILIZING_START &&
      eventTime < DESTABILIZING_END;

    if (!active) {
      safePause(crackle);
      crackle.volume = 0;
      return;
    }

    const localTime =
      eventTime - DESTABILIZING_START;

    const intensity =
      clamp(localTime / 25, 0, 1);

    crackle.volume =
      clamp(
        0.12 +
          intensity * 0.68,
        0,
        0.8
      );

    /*
     * The crackle is a texture, so looping is intentional.
     * We keep it synchronized loosely instead of seeking every frame.
     */
    crackle.loop = true;

    if (crackle.paused) {
      void safePlay(crackle);
    }
  }, [
    audioEnabled,
    eventTime,
    speed,
  ]);


  /* =======================================================
     ONE-SHOT SOUNDS
  ======================================================= */

  useEffect(() => {
    const previousTime =
      previousTimeRef.current;


    previousTimeRef.current =
      eventTime;


    if (
      previousTime === null
    ) {
      return;
    }


    if (
      !audioEnabled
    ) {
      return;
    }


    /*
     * Do not fire one-shot sounds during extreme
     * fast-forward testing.
     */
    if (speed > 5) {
      return;
    }


    const delta =
      eventTime -
      previousTime;


    /*
     * Time moved backwards:
     * probably RESET or phase jump.
     */
    if (delta <= 0) {
      return;
    }


    /*
     * Large jump:
     * do not fire every sound that happened
     * between the two timestamps.
     */
    if (
      delta >
      MAX_ONE_SHOT_STEP
    ) {
      return;
    }


    if (
      crossedTime(
        previousTime,
        eventTime,
        LAUNCH_TIME
      )
    ) {
      playOneShot(
        launchRef.current
      );
    }


    if (
      crossedTime(
        previousTime,
        eventTime,
        IMPACT_TIME
      )
    ) {
      playOneShot(
        impactRef.current
      );
    }


    if (
      crossedTime(
        previousTime,
        eventTime,
        EXPLOSION_SOUND_TIME
      )
    ) {
      playOneShot(
        explosionRef.current
      );
    }


    /*
     * WORLD RETURN
     *
     * Reuse the original Nexus arrival sounds:
     * - launch when the Nexus reconstruction begins
     * - impact when it becomes stable
     *
     * Existing terminal UI beeps are reused as short digital
     * glitch accents while the white image fades back.
     */
    if (
      phase === "world_return" &&
      crossedTime(
        previousTime,
        eventTime,
        WORLD_RETURN_LAUNCH_TIME
      )
    ) {
      playOneShot(
        launchRef.current
      );
    }

    if (
      phase === "world_return" &&
      crossedTime(
        previousTime,
        eventTime,
        WORLD_RETURN_IMPACT_TIME
      )
    ) {
      playOneShot(
        impactRef.current
      );
    }

    if (
      phase === "world_return"
    ) {
      for (
        const glitchTime
        of WORLD_RETURN_GLITCH_TIMES
      ) {
        if (
          crossedTime(
            previousTime,
            eventTime,
            glitchTime
          )
        ) {
          playOneShot(
            terminalUiBeepsRef.current
          );

          break;
        }
      }
    }


    for (
      const dischargeTime
      of DISCHARGE_TIMES
    ) {
      if (
        crossedTime(
          previousTime,
          eventTime,
          dischargeTime
        )
      ) {
        playOneShot(
          dischargeRef.current
        );

        break;
      }
    }
  }, [
    audioEnabled,
    eventTime,
    speed,
  ]);


  /* =======================================================
     EXPLOSION HARD AUDIO CUT

     The final discharge at 59.62s may still be playing when
     the explosion phase begins. Stop both destabilizing
     layers immediately so the visual implosion gets a short,
     intentional moment of near-silence before the blast.
  ======================================================= */

  useEffect(() => {
    if (phase !== "explosion") {
      return;
    }

    safeReset(crackleRef.current);
    safeReset(dischargeRef.current);
  }, [phase]);


  /* =======================================================
     RECOVERY 2.0 AUDIO
  ======================================================= */

  useEffect(() => {
    if (!audioEnabled) return;

    const typing = terminalTypingRef.current;
    const beeps = terminalBeepsRef.current;
    const processing = terminalProcessingRef.current;
    const local = eventTime - RECOVERY_START;
    const active = phase === "recovery" && eventTime >= RECOVERY_START && eventTime < RECOVERY_END && speed <= 5;

    if (!active) {
      safeReset(typing);
      safeReset(beeps);
      safeReset(processing);
      return;
    }

    const typingWindows = [
      [3, 5.1], [19, 21.3], [33, 35.8], [41, 44], [62, 64.7], [72.5, 74.2],
    ];
    const isTyping = typingWindows.some(([a, b]) => local >= a && local < b);

    if (typing) {
      typing.volume = isTyping ? 0.48 : 0;
      typing.playbackRate = clamp(speed, 1, 2.2);
      if (isTyping && typing.paused) void safePlay(typing);
      if (!isTyping) safePause(typing);
    }

    if (processing) {
      const processingWindows = [[5.3, 18], [21.5, 31], [36, 48.5], [52, 61], [65, 72]];
      const isProcessing = processingWindows.some(([a, b]) => local >= a && local < b);
      processing.volume = isProcessing ? 0.22 : 0;
      processing.playbackRate = clamp(speed, 1, 2);
      if (isProcessing && processing.paused) void safePlay(processing);
      if (!isProcessing) safePause(processing);
    }

    if (beeps) {
      beeps.volume = 0.11;
      beeps.playbackRate = clamp(speed, 1, 2);
      if (beeps.paused) void safePlay(beeps);
    }
  }, [audioEnabled, eventTime, phase, speed]);

  useEffect(() => {
    const previousTime = previousRecoveryTimeRef.current;
    previousRecoveryTimeRef.current = eventTime;
    if (previousTime === null || !audioEnabled || speed > 5 || phase !== "recovery") return;
    const delta = eventTime - previousTime;
    if (delta <= 0 || delta > MAX_ONE_SHOT_STEP) return;

    const successTimes = [82,83,84,87.2,88.4,89.5,90.6,91.8,105.5,114.5,121.4,122.4,135.3,144,145.5];
    const warningTimes = [101,102,103];
    const uiTimes = [80.3,93,110,116,127,137,140,142,147,150.5,151.8];

    if (successTimes.some((t) => crossedTime(previousTime,eventTime,t))) playOneShot(terminalSuccessRef.current);
    if (warningTimes.some((t) => crossedTime(previousTime,eventTime,t))) playOneShot(terminalWarningRef.current);
    if (uiTimes.some((t) => crossedTime(previousTime,eventTime,t))) playOneShot(terminalUiBeepsRef.current);
  }, [audioEnabled, eventTime, phase, speed]);

  /* =======================================================
     RESET AUDIO OUTSIDE EVENT
  ======================================================= */

  useEffect(() => {
    if (
      phase !==
        "inactive" &&
      phase !==
        "released"
    ) {
      return;
    }


    safeReset(
      rumbleRef.current
    );

    safeReset(
      launchRef.current
    );

    safeReset(
      impactRef.current
    );

    safeReset(
      crackleRef.current
    );

    safeReset(
      dischargeRef.current
    );

    safeReset(
      explosionRef.current
    );

    safeReset(
      musicRef.current
    );

    safeReset(
      worldReturnMusicRef.current
    );

    [terminalTypingRef.current, terminalBeepsRef.current, terminalSuccessRef.current, terminalWarningRef.current, terminalProcessingRef.current, terminalUiBeepsRef.current].forEach(safeReset);
  }, [
    phase,
  ]);


  /* =======================================================
     AUDIO UI
  ======================================================= */

  if (
    !showAudioButton
  ) {
    return null;
  }


  return (
    <button
      type="button"
      className="reloadstarAudioEnable"
      onClick={
        enableAudio
      }
    >
      <span className="reloadstarAudioIcon">
        🔊
      </span>

      <span>
        <strong>
          ENABLE EVENT AUDIO
        </strong>

        <small>
          Recommended for the live experience
        </small>
      </span>
    </button>
  );
}


/* =========================================================
   AUDIO HELPERS
========================================================= */

function crossedTime(
  previous:
    number,

  current:
    number,

  target:
    number
) {
  return (
    previous <
      target &&
    current >=
      target
  );
}


function playOneShot(
  audio:
    HTMLAudioElement |
    null
) {
  if (!audio) {
    return;
  }


  audio.pause();


  try {
    audio.currentTime =
      0;
  } catch {
    // Ignore seeking error.
  }


  void safePlay(
    audio
  );
}


function mapRange(
  value:
    number,

  inputMin:
    number,

  inputMax:
    number,

  outputMin:
    number,

  outputMax:
    number
) {
  if (
    inputMax ===
    inputMin
  ) {
    return outputMin;
  }


  const progress =
    clamp(
      (
        value -
        inputMin
      ) /
        (
          inputMax -
          inputMin
        ),
      0,
      1
    );


  return (
    outputMin +
    (
      outputMax -
      outputMin
    ) *
      progress
  );
}