import Link from "next/link";
import type { PublicCompetitivePlayer } from "../../services/competitive-players.service";

type Props = {
  player: PublicCompetitivePlayer;
  featured?: boolean;
};

export default function CompetitivePlayerCard({
  player,
  featured = false,
}: Props) {
  return (
    <Link
      href={`/competitive/players/${encodeURIComponent(player.competitiveId)}`}
      className={`compPlayerCard ${featured ? "compPlayerCard--featured" : ""}`}
    >
      <div className="compPlayerCardTop">
        <span className="compPlayerAvatar" aria-hidden="true">
          {player.displayName.slice(0, 1).toUpperCase()}
        </span>

        <div className="compPlayerCardIdentity">
          <span className="competitiveEyebrow">COMPETITIVE PLAYER</span>
          <strong>{player.displayName}</strong>
          <small>
            {player.competitiveId}
            {player.countryCode ? ` · ${player.countryCode}` : ""}
          </small>
        </div>

        <span className="compPlayerCardArrow" aria-hidden="true">
          ↗
        </span>
      </div>

      <div className="compPlayerCardBadges">
        {player.epicVerified && (
          <span className="compPlayerBadge compPlayerBadge--gold">
            EPIC VERIFIED
          </span>
        )}
        <span className="compPlayerBadge">SOLO</span>
      </div>

      <div className="compPlayerCardStats">
        <div>
          <span>EVENTS</span>
          <strong>{player.tournamentsPlayed}</strong>
        </div>
        <div>
          <span>ELIMS</span>
          <strong>{player.eliminations}</strong>
        </div>
        <div>
          <span>ROUND WINS</span>
          <strong>{player.roundWins}</strong>
        </div>
      </div>

      <span className="compPlayerCardBottom">VIEW PLAYER PROFILE →</span>
    </Link>
  );
}
