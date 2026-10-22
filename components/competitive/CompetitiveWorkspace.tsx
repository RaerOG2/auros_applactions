"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getCompetitiveStaffAccess } from "../../services/competitive.service";

type NavItem = {
  label: string;
  href: string;
  symbol: string;
  match?: string;
};

const publicNavigation: NavItem[] = [
  { label: "Overview", href: "/competitive", symbol: "◈" },
  { label: "Tournaments", href: "/competitive/tournaments", symbol: "▤" },
  { label: "Rankings", href: "/competitive/rankings", symbol: "▥" },
  { label: "Players", href: "/competitive/players", symbol: "◎" },
  { label: "Divisions", href: "/competitive/divisions", symbol: "◇" },
  { label: "My Player Card", href: "/competitive/me", symbol: "◉" },
];

const adminNavigation: NavItem[] = [
  { label: "Dashboard", href: "/competitive/admin", symbol: "▦" },
  { label: "All Tournaments", href: "/competitive/admin/tournaments", symbol: "▤" },
  { label: "Create Tournament", href: "/competitive/admin/tournaments/new", symbol: "+" },
  { label: "Scoring Rules", href: "/competitive/admin/scoring", symbol: "≡" },
  { label: "Auros Points", href: "/competitive/admin/points", symbol: "◆" },
  { label: "Production", href: "/competitive/admin/production", symbol: "◫" },
  { label: "Rehearsal Studio", href: "/competitive/admin/rehearsal", symbol: "▶" },
  { label: "Test Tournament Lab", href: "/competitive/admin/test-players", symbol: "⚙" },
];

function isCurrentPath(path: string, item: NavItem) {
  if (item.href === "/competitive" || item.href === "/competitive/admin") {
    return path === item.href;
  }

  if (item.href.endsWith("/new")) {
    return path === item.href;
  }

  if (item.href === "/competitive/admin/tournaments") {
    return path === item.href || (
      path.startsWith(`${item.href}/`) &&
      !path.startsWith(`${item.href}/new`)
    );
  }

  return path === item.href || path.startsWith(`${item.href}/`);
}

function SidebarLink({
  item,
  path,
  onNavigate,
}: {
  item: NavItem;
  path: string;
  onNavigate: () => void;
}) {
  const active = isCurrentPath(path, item);

  return (
    <Link
      href={item.href}
      className={`comp3NavItem${active ? " is-active" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
    >
      <span className="comp3NavIcon" aria-hidden="true">{item.symbol}</span>
      <span>{item.label}</span>
      {active && <span className="comp3ActiveIndicator" aria-hidden="true" />}
    </Link>
  );
}

export default function CompetitiveWorkspace({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hasStaffAccess, setHasStaffAccess] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compactSidebar, setCompactSidebar] = useState(false);

  const inAdmin = pathname === "/competitive/admin" || pathname.startsWith("/competitive/admin/");

  useEffect(() => {
    let mounted = true;
    getCompetitiveStaffAccess()
      .then((access) => {
        if (mounted) setHasStaffAccess(Boolean(access));
      })
      .catch(() => {
        if (mounted) setHasStaffAccess(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeItem = useMemo(() => {
    return [...adminNavigation, ...publicNavigation]
      .filter((item) => isCurrentPath(pathname, item))
      .sort((first, second) => second.href.length - first.href.length)[0];
  }, [pathname]);

  return (
    <div className={`comp3Shell${compactSidebar ? " comp3Shell--compact" : ""}`}>
      {mobileOpen && (
        <button
          className="comp3MobileScrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close Competitive navigation"
        />
      )}

      <aside className={`comp3Sidebar${mobileOpen ? " is-open" : ""}`}>
        <Link href="/competitive" className="comp3Brand" onClick={() => setMobileOpen(false)}>
          <span className="comp3BrandMark">A</span>
          <span className="comp3BrandText">
            <strong>AUROS</strong>
            <small>COMPETITIVE</small>
          </span>
        </Link>

        <div className="comp3SidebarScroll">
          <div className="comp3NavSection">
            <span className="comp3NavLabel">COMPETE</span>
            <nav aria-label="Competitive main navigation">
              {publicNavigation.map((item) => (
                <SidebarLink key={item.href} item={item} path={pathname} onNavigate={() => setMobileOpen(false)} />
              ))}
            </nav>
          </div>

          {hasStaffAccess && (
            <div className="comp3NavSection comp3NavSection--staff">
              <span className="comp3NavLabel">MANAGEMENT</span>
              <nav aria-label="Competitive staff navigation">
                {adminNavigation.map((item) => (
                  <SidebarLink key={item.href} item={item} path={pathname} onNavigate={() => setMobileOpen(false)} />
                ))}
              </nav>
            </div>
          )}
        </div>

        <div className="comp3SidebarFooter">
          <Link href="/" className="comp3ExitLink">← <span>Back to AUROS</span></Link>
          <button
            type="button"
            className="comp3Collapse"
            onClick={() => setCompactSidebar((current) => !current)}
            aria-label={compactSidebar ? "Expand sidebar" : "Collapse sidebar"}
          >
            {compactSidebar ? "→" : "←"}
          </button>
        </div>
      </aside>

      <div className="comp3Main">
        <header className="comp3Topbar">
          <div className="comp3TopbarLeft">
            <button
              type="button"
              className="comp3MenuButton"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label="Toggle Competitive navigation"
              aria-expanded={mobileOpen}
            >
              ☰
            </button>
            <div className="comp3Breadcrumb">
              <span>COMPETITIVE</span>
              <span aria-hidden="true">/</span>
              <strong>{activeItem?.label ?? (inAdmin ? "Tournament Control" : "Event Center")}</strong>
            </div>
          </div>
          <div className="comp3TopbarRight">
            {hasStaffAccess && (
              <Link className={`comp3ModeSwitch${inAdmin ? " is-active" : ""}`} href={inAdmin ? "/competitive" : "/competitive/admin"}>
                {inAdmin ? "← Public View" : "Admin Workspace →"}
              </Link>
            )}
            <span className="comp3StatusDot" aria-label="Competitive platform" />
          </div>
        </header>

        <main className="comp3Content" id="competitive-content">{children}</main>
        <footer className="comp3Footer"><span>AUROS COMPETITIVE</span><span>One platform. Every competition.</span></footer>
      </div>
    </div>
  );
}
