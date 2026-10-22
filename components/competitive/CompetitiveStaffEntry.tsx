"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCompetitiveStaffAccess } from "../../services/competitive.service";

type Props = {
  compact?: boolean;
};

export default function CompetitiveStaffEntry({ compact = false }: Props) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    getCompetitiveStaffAccess()
      .then((access) => {
        if (active) {
          setAllowed(Boolean(access));
        }
      })
      .catch(() => {
        if (active) {
          setAllowed(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!allowed) {
    return null;
  }

  return (
    <Link
      href="/competitive/admin"
      className={compact ? "compStaffEntry compStaffEntry--compact" : "compStaffEntry"}
    >
      <span className="compStaffEntryIcon">⚙</span>
      <span>Competitive Admin</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
