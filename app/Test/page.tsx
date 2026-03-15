"use client";

import AurosBackground from "../../components/AurosBackground";

export default function BackgroundTestPage() {
  return (
    <>
      <AurosBackground />
      <main
        style={{
          minHeight: "100vh",
          background: "transparent",
          position: "relative",
          zIndex: 1,
        }}
      />
    </>
  );
}
