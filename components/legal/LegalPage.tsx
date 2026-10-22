"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <main className="legalPage">
        <header className="legalHero">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </header>

        <div className="legalLayout">
          <article className="legalCard">
            {children}
          </article>

          <aside className="legalNav">
            <small>LEGAL</small>
            <Link href="/imprint">Legal Notice</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </aside>
        </div>
      </main>

      <style jsx global>{`
        .legalPage { display:grid; gap:18px; width:100%; min-width:0; }
        .legalHero,.legalCard,.legalNav { border:1px solid rgba(118,153,214,.15); background:rgba(7,16,32,.72); backdrop-filter:blur(16px); }
        .legalHero { padding:clamp(28px,5vw,58px); border-radius:26px; background:radial-gradient(circle at 85% 10%,rgba(99,221,255,.11),transparent 32%),rgba(7,16,32,.76); }
        .legalHero>span,.legalCard h2,.legalNav small { color:#63ddff; font-size:9px; font-weight:950; letter-spacing:.14em; }
        .legalHero h1 { margin:9px 0 13px; color:#fff; font-size:clamp(42px,7vw,72px); line-height:1; letter-spacing:-.05em; }
        .legalHero p { max-width:760px; margin:0; color:#9eb0cb; line-height:1.7; }
        .legalLayout { display:grid; grid-template-columns:minmax(0,1fr) 250px; gap:16px; align-items:start; }
        .legalCard { padding:clamp(24px,4vw,42px); border-radius:22px; }
        .legalCard section+section { margin-top:34px; padding-top:30px; border-top:1px solid rgba(118,153,214,.09); }
        .legalCard h2 { margin:0 0 12px; font-size:11px; }
        .legalCard h3 { margin:22px 0 8px; color:#e4efff; font-size:16px; }
        .legalCard p,.legalCard li { color:#a8b8cf; font-size:14px; line-height:1.78; }
        .legalCard p { margin:0 0 12px; }
        .legalCard ul { margin:10px 0 0; padding-left:20px; }
        .legalCard a { color:#72ddff; }
        .legalPlaceholder { padding:14px 16px; border:1px solid rgba(255,190,92,.2); border-radius:13px; color:#f2c77d!important; background:rgba(255,177,61,.055); }
        .legalNav { position:sticky; top:92px; display:grid; gap:8px; padding:18px; border-radius:18px; }
        .legalNav small { margin-bottom:4px; }
        .legalNav a { padding:10px 11px; border-radius:10px; color:#9eb0cb; text-decoration:none; background:rgba(255,255,255,.018); }
        .legalNav a:hover { color:#fff; background:rgba(99,221,255,.06); }
        @media(max-width:800px){.legalLayout{grid-template-columns:1fr}.legalNav{position:static;order:-1;grid-template-columns:repeat(3,minmax(0,1fr))}.legalNav small{grid-column:1/-1}.legalNav a{text-align:center}}
        @media(max-width:520px){.legalHero{border-radius:20px}.legalCard{border-radius:18px}.legalNav{grid-template-columns:1fr}.legalNav small{grid-column:auto}}
      `}</style>
    </>
  );
}
