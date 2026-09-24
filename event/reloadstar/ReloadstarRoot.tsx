"use client";

import ReloadstarAudioController from "./ReloadstarAudioController";
import ReloadstarDevPanel from "./ReloadstarDevPanel";
import ReloadstarOverlay from "./ReloadstarOverlay";

import ReloadstarProvider, {
  useReloadstar,
} from "./ReloadstarProvider";


export default function ReloadstarRoot({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <ReloadstarProvider>
      <ReloadstarExperience>
        {children}
      </ReloadstarExperience>
    </ReloadstarProvider>
  );
}


function ReloadstarExperience({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const {
    phase,
    eventTime,
  } =
    useReloadstar();


  const arrivalShake =
    phase ===
      "nexus_arrival" &&
    eventTime >= 2 &&
    eventTime <= 13;


  const launchShake =
    phase ===
      "nexus_arrival" &&
    eventTime >= 6 &&
    eventTime <= 11.5;


  const destabilizing =
    phase ===
    "destabilizing";


  const explosion =
    phase ===
    "explosion";


  return (
    <>
      <div
        className={[
          "reloadstarWebsite",

          arrivalShake
            ? "reloadstarWebsiteArrivalShake"
            : "",

          launchShake
            ? "reloadstarWebsiteLaunchShake"
            : "",

          destabilizing
            ? "reloadstarWebsiteUnstable"
            : "",

          explosion
            ? "reloadstarWebsiteExplosion"
            : "",
        ]
          .filter(
            Boolean
          )
          .join(" ")}
      >
        {children}
      </div>


      <ReloadstarOverlay />

      <ReloadstarAudioController />

      <ReloadstarDevPanel />
    </>
  );
}