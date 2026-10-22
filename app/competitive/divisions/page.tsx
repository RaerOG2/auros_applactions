import Link from "next/link";

import { COMPETITIVE_DIVISIONS } from "../../../lib/competitive-divisions";

export default function CompetitiveDivisionsPage() {
  return (
    <section className="competitivePage">
      <div className="competitiveOpsHeader">
        <div>
          <Link href="/competitive/rankings" className="compBack">
            ← GLOBAL RANKINGS
          </Link>
          <span className="competitiveEyebrow gold">AUROS COMPETITIVE // PROGRESSION</span>
          <h1>THE DIVISIONS.</h1>
          <p className="compHeaderDescription">
            Earn Auros Points in eligible, completed Solo tournaments.
            Your division reflects your current AP, independently from match scoring.
          </p>
        </div>
      </div>

      <div className="compDivisionGrid">
        {COMPETITIVE_DIVISIONS.map((division, index) => (
          <article key={division.name} className="competitivePanel compDivisionCard">
            <span className="competitiveEyebrow">DIVISION {String(index + 1).padStart(2, "0")}</span>
            <strong>{division.name}</strong>
            <small>{division.minimum.toLocaleString("en-GB")}+ AUROS POINTS</small>
          </article>
        ))}
      </div>

      <div className="compAdminActionBar">
        <Link href="/competitive/rankings" className="compPrimaryButton">GLOBAL RANKINGS →</Link>
        <Link href="/competitive/me" className="compSecondaryButton">MY PLAYER CARD →</Link>
      </div>
    </section>
  );
}
