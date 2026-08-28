"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminSectionKey =
  | "overview"
  | "applications"
  | "jobs"
  | "patchnotes"
  | "logs";

type AdminSidebarProps = {
  activeSection: AdminSectionKey;
  setActiveSection: (
    section: AdminSectionKey
  ) => void;
};

export default function AdminSidebar({
  activeSection,
  setActiveSection,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="adminSidebar">
        <div className="adminSidebarHeader">
          <div className="adminSidebarIcon">
            A
          </div>

          <div className="adminSidebarBrandText">
            <strong>
              AUROS ADMIN
            </strong>

            <span>
              CONTROL CENTER
            </span>
          </div>
        </div>

        <NavGroup title="GENERAL">
          <SidebarButton
            label="Overview"
            description="Dashboard"
            icon="⌂"
            active={
              activeSection ===
              "overview"
            }
            onClick={() =>
              setActiveSection(
                "overview"
              )
            }
          />
        </NavGroup>

        <NavGroup title="CONTENT">
          <SidebarLink
            href="/admin/patchnotes"
            label="Patchnotes"
            description="Updates & releases"
            icon="P"
            active={pathname.startsWith(
              "/admin/patchnotes"
            )}
          />

          <SidebarLink
            href="/admin/news"
            label="News"
            description="Announcements"
            icon="N"
            active={pathname.startsWith(
              "/admin/news"
            )}
          />

          <SidebarLink
            href="/admin/gallery"
            label="Gallery"
            description="Screenshots & media"
            icon="G"
            active={pathname.startsWith(
              "/admin/gallery"
            )}
          />

          <SidebarLink
            href="/admin/maps"
            label="Maps"
            description="Interactive world archive"
            icon="M"
            active={pathname.startsWith(
              "/admin/maps"
            )}
          />
        </NavGroup>

        <NavGroup title="RECRUITING">
          <SidebarButton
            label="Applications"
            description="Manage applicants"
            icon="A"
            active={
              activeSection ===
              "applications"
            }
            onClick={() =>
              setActiveSection(
                "applications"
              )
            }
          />

          <SidebarButton
            label="Jobs"
            description="Open positions"
            icon="J"
            active={
              activeSection ===
              "jobs"
            }
            onClick={() =>
              setActiveSection(
                "jobs"
              )
            }
          />
        </NavGroup>

        <NavGroup title="SYSTEM">
          <SidebarButton
            label="Logs"
            description="Admin activity"
            icon="L"
            active={
              activeSection ===
              "logs"
            }
            onClick={() =>
              setActiveSection(
                "logs"
              )
            }
          />
        </NavGroup>

        <div className="adminSidebarFooter">
          <div className="adminSidebarStatus">
            <span className="statusDot" />

            <div>
              <strong>
                System Online
              </strong>

              <small>
                Auros Website
              </small>
            </div>
          </div>

          <Link
            href="/"
            className="adminSidebarWebsiteLink"
          >
            Open Website

            <span>↗</span>
          </Link>
        </div>
      </aside>

      <style jsx global>{`
        .adminSidebar {
          position: sticky;
          top: 18px;

          width: 100%;
          min-width: 0;

          display: flex;
          flex-direction: column;
          gap: 20px;

          padding: 16px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.15
            );

          border-radius: 22px;

          background:
            rgba(
              8,
              17,
              34,
              0.96
            );

          box-shadow:
            0 22px 60px
            rgba(
              0,
              0,
              0,
              0.22
            );
        }

        .adminSidebarHeader {
          display: flex;
          align-items: center;
          gap: 11px;

          padding-bottom: 15px;

          border-bottom:
            1px solid
            rgba(
              118,
              153,
              214,
              0.09
            );
        }

        .adminSidebarIcon {
          width: 38px;
          height: 38px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.2
            );

          border-radius: 11px;

          background:
            rgba(
              99,
              221,
              255,
              0.07
            );

          color: #63ddff;

          font-size: 14px;
          font-weight: 950;
        }

        .adminSidebarBrandText {
          min-width: 0;
        }

        .adminSidebarBrandText strong {
          display: block;

          color: #f3f7ff;

          font-size: 11px;
          font-weight: 900;

          letter-spacing:
            0.02em;
        }

        .adminSidebarBrandText span {
          display: block;

          margin-top: 2px;

          color: #5d7394;

          font-size: 7px;
          font-weight: 800;

          letter-spacing:
            0.14em;
        }

        .adminNavGroup {
          display: grid;
          gap: 6px;
        }

        .adminNavGroupTitle {
          margin:
            0
            0
            4px
            3px;

          color: #4f6688;

          font-size: 7px;
          font-weight: 900;

          letter-spacing:
            0.16em;
        }

        .sidebarButton,
        .sidebarLink {
          width: 100%;
          min-width: 0;

          min-height: 47px;

          display: flex;
          align-items: center;
          gap: 10px;

          padding:
            7px
            9px;

          border:
            1px solid
            transparent;

          border-radius: 11px;

          background:
            transparent;

          color: #9eb0cc;

          text-align: left;
          text-decoration: none;

          cursor: pointer;

          transition:
            color 0.14s ease,
            background 0.14s ease,
            border-color 0.14s ease;
        }

        .sidebarButton:hover,
        .sidebarLink:hover {
          color: #f3f7ff;

          border-color:
            rgba(
              118,
              153,
              214,
              0.12
            );

          background:
            rgba(
              15,
              29,
              54,
              0.68
            );
        }

        .sidebarButton.active,
        .sidebarLink.active {
          color: white;

          border-color:
            rgba(
              99,
              221,
              255,
              0.2
            );

          background:
            linear-gradient(
              100deg,
              rgba(
                99,
                221,
                255,
                0.095
              ),
              rgba(
                139,
                114,
                255,
                0.07
              )
            );
        }

        .sidebarNavIcon {
          width: 29px;
          height: 29px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          border-radius: 8px;

          background:
            rgba(
              99,
              221,
              255,
              0.055
            );

          color: #63ddff;

          font-size: 9px;
          font-weight: 900;
        }

        .sidebarButton.active
          .sidebarNavIcon,
        .sidebarLink.active
          .sidebarNavIcon {
          background:
            rgba(
              99,
              221,
              255,
              0.1
            );
        }

        .sidebarNavText {
          min-width: 0;
          flex: 1;
        }

        .sidebarNavText strong {
          display: block;

          overflow: hidden;

          color: inherit;

          font-size: 10px;
          font-weight: 800;

          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .sidebarNavText small {
          display: block;

          overflow: hidden;

          margin-top: 2px;

          color: #586f90;

          font-size: 7px;

          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .adminSidebarFooter {
          display: grid;
          gap: 8px;

          margin-top: auto;

          padding-top: 14px;

          border-top:
            1px solid
            rgba(
              118,
              153,
              214,
              0.08
            );
        }

        .adminSidebarStatus {
          display: flex;
          align-items: center;
          gap: 9px;

          padding: 9px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.08
            );

          border-radius: 10px;

          background:
            rgba(
              4,
              12,
              26,
              0.52
            );
        }

        .statusDot {
          width: 7px;
          height: 7px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #54dfa0;

          box-shadow:
            0 0 10px
            rgba(
              84,
              223,
              160,
              0.45
            );
        }

        .adminSidebarStatus strong {
          display: block;

          color: #a9bad2;

          font-size: 8px;
        }

        .adminSidebarStatus small {
          display: block;

          margin-top: 1px;

          color: #4f6687;

          font-size: 7px;
        }

        .adminSidebarWebsiteLink {
          min-height: 38px;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;

          padding:
            0
            10px;

          border:
            1px solid
            rgba(
              118,
              153,
              214,
              0.1
            );

          border-radius: 10px;

          background:
            rgba(
              7,
              16,
              32,
              0.64
            );

          color: #8399ba;

          font-size: 8px;
          font-weight: 800;

          text-decoration: none;
        }

        .adminSidebarWebsiteLink:hover {
          color: #63ddff;

          border-color:
            rgba(
              99,
              221,
              255,
              0.18
            );
        }

        @media (max-width: 980px) {
          .adminSidebar {
            position: static;
          }
        }
      `}</style>
    </>
  );
}

function NavGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="adminNavGroup">
      <div className="adminNavGroupTitle">
        {title}
      </div>

      {children}
    </div>
  );
}

function SidebarButton({
  label,
  description,
  icon,
  active,
  onClick,
}: {
  label: string;
  description: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "sidebarButton active"
          : "sidebarButton"
      }
      onClick={onClick}
    >
      <span className="sidebarNavIcon">
        {icon}
      </span>

      <div className="sidebarNavText">
        <strong>
          {label}
        </strong>

        <small>
          {description}
        </small>
      </div>
    </button>
  );
}

function SidebarLink({
  href,
  label,
  description,
  icon,
  active = false,
}: {
  href: string;
  label: string;
  description: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "sidebarLink active"
          : "sidebarLink"
      }
    >
      <span className="sidebarNavIcon">
        {icon}
      </span>

      <div className="sidebarNavText">
        <strong>
          {label}
        </strong>

        <small>
          {description}
        </small>
      </div>
    </Link>
  );
}