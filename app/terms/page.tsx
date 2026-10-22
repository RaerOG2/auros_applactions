import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for AUROS Accounts, community features and competitive services.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="AUROS ACCOUNT"
      title="Terms of Use"
      intro="Rules for AUROS Accounts, community features and competitive services. Last updated: October 2026."
    >
      <section>
        <h2>1. SCOPE</h2>
        <p>
          These Terms of Use apply to voluntary AUROS Accounts and to website, community and competitive features made available through those accounts. Publicly available content may generally be viewed without creating an account unless a feature is specifically restricted.
        </p>
      </section>

      <section>
        <h2>2. OPERATOR AND CONTACT</h2>
        <p>
          The operator of AUROS Royale is identified in the <a href="/imprint">Legal Notice</a>. Questions relating to these Terms can be sent to{" "}
          <a href="mailto:maurice.edel@outlook.com">
            maurice.edel@outlook.com
          </a>.
        </p>
      </section>

      <section>
        <h2>3. ACCOUNT REGISTRATION</h2>
        <p>
          You must provide accurate information when creating an account and must not impersonate another person or organisation. You are responsible for keeping your login credentials reasonably secure and for notifying AUROS if you suspect unauthorised access to your account.
        </p>
        <p>
          You may not create or use an account where doing so would violate applicable law. If applicable law requires permission from a parent or legal guardian for a minor to use the service, that permission must be obtained before the account is created or used.
        </p>
      </section>

      <section>
        <h2>4. COMMUNITY CONDUCT</h2>
        <p>
          You must not use AUROS services to publish or distribute unlawful content, harassment, threats, hateful or discriminatory content, spam, fraud, malicious code, impersonation, unauthorised personal data, or content that infringes third-party rights.
        </p>
        <p>
          Attempts to bypass access controls, exploit security vulnerabilities, interfere with the website or its infrastructure, gain unauthorised privileges, manipulate competitive systems, or abuse other users are prohibited.
        </p>
      </section>

      <section>
        <h2>5. USER CONTENT</h2>
        <p>
          You remain responsible for content you submit through AUROS features and may only submit content that you are legally entitled to use and share. By submitting content to a feature that is designed to display or transmit that content, you grant AUROS the limited rights necessary to technically store, process, moderate, display and transmit that content for the purpose of providing the relevant feature.
        </p>
        <p>
          Content may be moderated, restricted or removed where reasonably necessary to enforce these Terms, protect users or systems, respond to abuse, or comply with legal obligations.
        </p>
      </section>

      <section>
        <h2>6. COMPETITIVE FEATURES</h2>
        <p>
          Competitive features may be experimental, temporarily disabled, limited to specific users, or changed during development. Individual tournaments, events or competitions may have additional rules. Where separate event rules are provided, those rules apply in addition to these Terms and take priority for the specific event where they conflict with these general Terms.
        </p>
        <p>
          If AUROS conducts a promotion, contest or prize-based event connected to a Fortnite island, additional official promotion rules and disclosures may be required and will be published separately where applicable.
        </p>
      </section>

      <section>
        <h2>7. AVAILABILITY AND CHANGES</h2>
        <p>
          Free website and community features are provided without a guarantee of uninterrupted availability. AUROS may maintain, modify, restrict, replace or discontinue features where reasonably necessary for development, security, legal compliance or operation of the project.
        </p>
      </section>

      <section>
        <h2>8. SUSPENSION AND TERMINATION</h2>
        <p>
          AUROS may restrict or suspend an account where there is a reasonable basis to believe that the account has materially or repeatedly violated these Terms, endangered users or systems, attempted to bypass security or permissions, or been used for unlawful activity.
        </p>
        <p>
          Where appropriate and legally required, the circumstances of the individual case and the interests of the affected user will be considered. Mandatory statutory rights remain unaffected.
        </p>
      </section>

      <section>
        <h2>9. AUROS CONTENT AND INTELLECTUAL PROPERTY</h2>
        <p>
          Unless stated otherwise, original AUROS website content, branding, graphics, text and project materials may not be copied, redistributed or represented as your own without permission, except where applicable law permits such use.
        </p>
        <p>
          Third-party trademarks, game assets and intellectual property remain the property of their respective rights holders.
        </p>
      </section>

      <section>
        <h2>10. EPIC GAMES / FORTNITE</h2>
        <p>
          AUROS Royale is an independently created Fortnite island. This is not sponsored, endorsed, or administered by Epic Games, Inc.
        </p>
        <p>
          AUROS Accounts and the AUROS website are separate from Epic Games accounts and services unless a feature explicitly states that an external account or service is being connected.
        </p>
      </section>

      <section>
        <h2>11. THIRD-PARTY SERVICES</h2>
        <p>
          AUROS may link to or integrate third-party services such as Discord or X. Those services are governed by their own terms and privacy policies. AUROS is not able to control the availability, rules or data processing of an external provider after you access that provider's service.
        </p>
      </section>

      <section>
        <h2>12. LIABILITY</h2>
        <p>
          Liability is governed by applicable statutory law. Nothing in these Terms excludes or limits liability where such exclusion or limitation is prohibited by law. Mandatory rights, including mandatory consumer-protection rights, remain unaffected.
        </p>
      </section>

      <section>
        <h2>13. PRIVACY</h2>
        <p>
          Information about the processing of personal data is available in the <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2>14. CHANGES TO THESE TERMS</h2>
        <p>
          These Terms may be updated where reasonably necessary because AUROS features, legal requirements or technical systems change. Material changes affecting registered users should be communicated appropriately before or when the updated Terms take effect, where required by law.
        </p>
      </section>

      <section>
        <h2>15. APPLICABLE LAW</h2>
        <p>
          To the extent permitted by law, these Terms are governed by the laws of the Federal Republic of Germany. If you are a consumer, mandatory consumer-protection provisions of the country in which you habitually reside remain unaffected where applicable.
        </p>
      </section>
    </LegalPage>
  );
}
