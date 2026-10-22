"use client";

import { useSearchParams } from "next/navigation";

import {
  useReloadstar,
} from "../event/reloadstar/ReloadstarProvider";

import {
  Nexuspoint,
} from "../event/reloadstar/ReloadstarOverlay";


const nexusParticles = [
  { x: 8, y: 22, size: 2, delay: 0.2, duration: 7.4 },
  { x: 18, y: 72, size: 3, delay: 1.4, duration: 8.2 },
  { x: 27, y: 38, size: 2, delay: 2.1, duration: 6.8 },
  { x: 36, y: 84, size: 2, delay: 0.8, duration: 9.1 },
  { x: 44, y: 18, size: 3, delay: 3.2, duration: 7.8 },
  { x: 53, y: 63, size: 2, delay: 1.8, duration: 8.7 },
  { x: 61, y: 31, size: 2, delay: 4.1, duration: 7.1 },
  { x: 68, y: 77, size: 3, delay: 2.7, duration: 9.4 },
  { x: 75, y: 13, size: 2, delay: 0.5, duration: 8.5 },
  { x: 82, y: 52, size: 2, delay: 3.7, duration: 7.6 },
  { x: 89, y: 27, size: 3, delay: 1.1, duration: 9.2 },
  { x: 94, y: 68, size: 2, delay: 4.6, duration: 8.1 },
];


export default function AurosBackground() {
  const {
    phase,
  } = useReloadstar();

  const searchParams = useSearchParams();

  const isDevPreview =
    searchParams.get("reloadstar-dev") === "1";

  const showPersistentNexus =
    phase === "released" ||
    isDevPreview;


  return (
    <div
      className={
        showPersistentNexus
          ? "auros-background auros-background-v130"
          : "auros-background"
      }
      aria-hidden="true"
    >
      {/* Existing AUROS background */}
      <div className="auros-bg-grid" />

      <div className="auros-bg-orb auros-bg-orb-a" />
      <div className="auros-bg-orb auros-bg-orb-b" />

      <div className="auros-bg-stars" />


      {/* =====================================================
          AUROS 1.3.0 — NEXUS ENVIRONMENT
          ===================================================== */}
      {showPersistentNexus && (
        <>
          <div className="aurosNexusRealityField" />

          <div className="aurosNexusEnergyArc aurosNexusEnergyArcA" />
          <div className="aurosNexusEnergyArc aurosNexusEnergyArcB" />

          <div className="aurosNexusParticles">
            {nexusParticles.map((particle, index) => (
              <span
                key={index}
                className="aurosNexusParticle"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`,
                }}
              />
            ))}
          </div>

          <div className="aurosPersistentNexus">
            <div className="aurosPersistentNexusField" />
            <div className="aurosPersistentNexusHalo" />
            <div className="aurosPersistentNexusPulse" />

            <Nexuspoint />
          </div>
        </>
      )}
    </div>
  );
}