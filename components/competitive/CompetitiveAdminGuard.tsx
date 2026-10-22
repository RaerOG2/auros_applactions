"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCompetitiveStaffAccess } from "../../services/competitive.service";
import type { CompetitiveStaffAccess } from "../../types/competitive";

export default function CompetitiveAdminGuard({
  children,
}: {
  children: React.ReactNode | ((access: CompetitiveStaffAccess) => React.ReactNode);
}) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "logged-out" }
    | { status: "forbidden" }
    | { status: "ready"; access: CompetitiveStaffAccess }
  >({ status: "loading" });

  useEffect(() => {
    let alive = true;

    getCompetitiveStaffAccess()
      .then((access) => {
        if (!alive) return;
        if (!access) {
          setState({ status: "forbidden" });
          return;
        }
        setState({ status: "ready", access });
      })
      .catch((error) => {
        console.error("Competitive access check failed:", error);
        if (alive) setState({ status: "forbidden" });
      });

    return () => {
      alive = false;
    };
  }, []);

  if (state.status === "loading") {
    return <div className="competitiveGate">Initializing Competitive Operations…</div>;
  }

  if (state.status === "logged-out") {
    return null;
  }

  if (state.status === "forbidden") {
    return (
      <div className="competitiveGate">
        <span>COMPETITIVE OPERATIONS</span>
        <h1>Access restricted</h1>
        <p>This area is reserved for Auros Competitive staff.</p>
        <Link href="/competitive">Return to Competitive</Link>
      </div>
    );
  }

  return <>{typeof children === "function" ? children(state.access) : children}</>;
}
