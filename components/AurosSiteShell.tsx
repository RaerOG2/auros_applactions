"use client";

import { usePathname } from "next/navigation";

import AurosBackground from "./AurosBackground";
import AurosTopbar from "./AurosTopbar";
import AurosFooter from "./AurosFooter";

export default function AurosSiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const current =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/news")
      ? "news"
      : pathname.startsWith("/gallery")
      ? "gallery"
      : pathname.startsWith("/patchnotes")
      ? "patchnotes"
      : pathname.startsWith("/apply")
      ? "apply"
      : pathname.startsWith("/status")
      ? "status"
      : pathname.startsWith("/admin")
      ? "admin"
      : pathname.startsWith("/login")
      ? "login"
      : undefined;

  return (
    <>
      <AurosBackground />

      <main
        style={{
          minHeight: "100vh",
          padding: "24px 20px 56px",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            flex: 1,
          }}
        >
          <AurosTopbar current={current as never} />

          {children}
        </div>

        <AurosFooter />
      </main>
    </>
  );
}