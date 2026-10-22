import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Legal Notice",
  description: "Legal information and contact details for the official AUROS Royale website.",
};

export default function ImprintPage() {
  return (
    <LegalPage
      eyebrow="LEGAL INFORMATION"
      title="Legal Notice"
      intro="Provider identification, contact information and legal notices for the official AUROS Royale website."
    >
      <section>
        <h2>INFORMATION PURSUANT TO SECTION 5 DDG</h2>

        <p>
          <strong>AUROS Royale</strong>
          <br />
          Operator: Maurice Edel
          <br />
          Address: Limburger Straße 30
          <br />
          65555 Limburg an der Lahn
          <br />
          Germany
        </p>
      </section>

      <section>
        <h2>CONTACT</h2>
        <p>
          Email:{" "}
          <a href="mailto:maurice.edel@outlook.com">
            maurice.edel@outlook.com
          </a>
        </p>
      </section>

      <section>
        <h2>RESPONSIBLE FOR EDITORIAL CONTENT</h2>
        <p>
          Responsible person: Maurice Edel
          <br />
          Address: Limburger Straße 30, 65555 Limburg an der Lahn
        </p>
      </section>

      <section>
        <h2>EPIC GAMES / FORTNITE</h2>
        <p>
          AUROS Royale is an independently created Fortnite island. This is not sponsored, endorsed, or administered by Epic Games, Inc.
        </p>
        <p>
          AUROS Royale is created with Unreal Editor for Fortnite (UEFN). Fortnite, Unreal Editor for Fortnite, Epic Games and related names and marks are the property of their respective rights holders. AUROS does not claim ownership of Epic Games intellectual property.
        </p>
      </section>

      <section>
        <h2>EXTERNAL LINKS</h2>
        <p>
          This website may contain links to third-party websites and services, including community and social-media platforms. Third-party services are operated under their own terms and privacy policies. AUROS has no control over content or processing performed by those external providers after you leave this website.
        </p>
      </section>
    </LegalPage>
  );
}
