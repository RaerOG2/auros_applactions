"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useReloadstar } from "../../event/reloadstar/ReloadstarProvider";
import { Nexuspoint } from "../../event/reloadstar/ReloadstarOverlay";
import "./developers.css";

type TeamMember = {
  name: string;
  role: string;
  focus: string[];
  lead?: boolean;
  mark: string;
};

const leadership: TeamMember[] = [
  {
    name: "RaerOG",
    role: "Owner · Main Developer",
    focus: ["Landscape", "Buildings", "Mechanics"],
    lead: true,
    mark: "RO",
  },
  {
    name: "Neoxynite",
    role: "CCO · Co-Owner",
    focus: ["Creative Direction"],
    lead: true,
    mark: "NX",
  },
];

const developers: TeamMember[] = [
  {
    name: "Spider537funny",
    role: "Developer",
    focus: ["Mechanics"],
    mark: "S5",
  },
  {
    name: "RISHABH SHARMA",
    role: "Developer",
    focus: ["Development"],
    mark: "RS",
  },
  {
    name: "SFExtras",
    role: "Event Developer",
    focus: ["Events"],
    mark: "SF",
  },
  {
    name: "Harmo",
    role: "Developer",
    focus: ["Development"],
    mark: "HA",
  },
];

export default function DevelopersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { phase } = useReloadstar();

  const isDevPreview = searchParams.get("reloadstar-dev") === "1";
  const unlocked = phase === "released" || isDevPreview;

  useEffect(() => {
    if (!unlocked) {
      router.replace("/");
    }
  }, [router, unlocked]);

  if (!unlocked) {
    return (
      <div
        className="developersLocked"
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="developersPage">
      <section className="developersHero">
        <div className="developersHeroGrid" />
        <div className="developersHeroNoise" />

        <div className="developersBeam developersBeamLeft" />
        <div className="developersBeam developersBeamRight" />

        <div
          className="developersNexusStage"
          aria-hidden="true"
        >
          <div className="developersNexusHalo" />
          <Nexuspoint />
        </div>

        <div className="developersHeroCopy">
          <div className="developersEyebrow">
            <span className="developersEyebrowDot" />

            AUROS DEVELOPMENT

            <span className="developersEyebrowLine" />

            1.3.0
          </div>

          <h1>
            THE PEOPLE
            <span>BEHIND AUROS.</span>
          </h1>

          <p>
            A small team building a Battle Royale world through environment
            design, mechanics, events and creative direction.
          </p>

          <div className="developersHeroMeta">
            <div>
              <strong>06</strong>
              <span>TEAM MEMBERS</span>
            </div>

            <div>
              <strong>01</strong>
              <span>SHARED WORLD</span>
            </div>

            <div>
              <strong>∞</strong>
              <span>IDEAS AHEAD</span>
            </div>
          </div>
        </div>

        <div
          className="developersScrollCue"
          aria-hidden="true"
        >
          <span>MEET THE TEAM</span>
          <i />
        </div>
      </section>

      <section className="developersSection">
        <SectionHeading
          kicker="CORE TEAM"
          title="Leadership"
          copy="Creative direction and development leadership shaping the identity, systems and world of AUROS."
        />

        <div className="developersLeadershipGrid">
          {leadership.map((member, index) => (
            <MemberCard
              key={member.name}
              member={member}
              index={index + 1}
            />
          ))}
        </div>
      </section>

      <section className="developersSection">
        <SectionHeading
          kicker="DEVELOPMENT"
          title="The Team"
          copy="Developers turning AUROS concepts into playable locations, mechanics and live moments."
        />

        <div className="developersTeamGrid">
          {developers.map((member, index) => (
            <MemberCard
              key={member.name}
              member={member}
              index={index + 3}
            />
          ))}
        </div>
      </section>

      <section className="developersManifesto">
        <div className="developersManifestoGlow" />

        <div className="developersManifestoMark">
          A
        </div>

        <div className="developersManifestoCopy">
          <span>BUILDING THE NEXT REALITY</span>

          <h2>
            AUROS is built together.
          </h2>

          <p>
            Every system, structure, event and detail contributes to one
            connected world. This is the team behind it.
          </p>
        </div>

        <Link
          href="/"
          className="developersBackLink"
        >
          <span>RETURN TO AUROS</span>
          <b>↗</b>
        </Link>
      </section>
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="developersSectionHeading">
      <div>
        <span>{kicker}</span>
        <h2>{title}</h2>
      </div>

      <p>{copy}</p>
    </div>
  );
}

function MemberCard({
  member,
  index,
}: {
  member: TeamMember;
  index: number;
}) {
  return (
    <article
      className={
        member.lead
          ? "developerCard developerCardLead"
          : "developerCard"
      }
    >
      <div className="developerCardGlow" />
      <div className="developerCardScan" />

      <div className="developerCardTopline">
        <span>
          AUROS // {String(index).padStart(2, "0")}
        </span>

        <i />
      </div>

      <div className="developerIdentity">
        <div
          className="developerMark"
          aria-hidden="true"
        >
          <span>{member.mark}</span>
        </div>

        <div>
          <h3>{member.name}</h3>
          <p>{member.role}</p>
        </div>
      </div>

      <div className="developerFocus">
        {member.focus.map((focus) => (
          <span key={focus}>
            {focus}
          </span>
        ))}
      </div>

      <div className="developerCardFooter">
        <span>ACTIVE DEVELOPER</span>

        <span className="developerStatus">
          <i />
          ONLINE
        </span>
      </div>
    </article>
  );
}