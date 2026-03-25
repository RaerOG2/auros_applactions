"use client";

import { usePathname } from "next/navigation";
import AurosBackground from "./AurosBackground";
import AurosTopbar from "./AurosTopbar";
import AurosFooter from "./AurosFooter";

type AurosSiteShellProps = {
  children: React.ReactNode;
};

export default function AurosSiteShell({ children }: AurosSiteShellProps) {
  const pathname = usePathname();

  function getCurrentPage():
    | "home"
    | "apply"
    | "status"
    | "patchnotes"
    | "faq"
    | "contact"
    | "admin"
    | undefined {
    if (pathname === "/") return "home";
    if (pathname === "/apply") return "apply";
    if (pathname === "/status") return "status";
    if (pathname === "/patchnotes") return "patchnotes";
    if (pathname === "/faq") return "faq";
    if (pathname === "/contact") return "contact";
    if (pathname === "/admin") return "admin";
    return undefined;
  }

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "transparent",
    color: "white",
    padding: "32px 20px 60px",
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1280px",
    margin: "0 auto",
    width: "100%",
    flex: 1,
  };

  return (
    <>
      <AurosBackground />

      <main style={pageStyle}>
        <div style={containerStyle}>
          <AurosTopbar current={getCurrentPage()} />
          {children}
        </div>

        <AurosFooter />
      </main>
    </>
  );
}