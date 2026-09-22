"use client";

import Link from "next/link";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase";
import { getSiteAccess } from "../services/access.service";

type PageKey =
  | "home"
  | "map"
  | "news"
  | "gallery"
  | "patchnotes"
  | "status"
  | "faq"
  | "contact"
  | "admin"
  | "dev"
  | "login";

type NavItem = {
  label: string;
  href: string;
  key: PageKey;
  subtle?: boolean;
};

type IndicatorState = {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
};

const mainNav: NavItem[] = [
  {
    label: "Home",
    href: "/",
    key: "home",
  },
  {
    label: "Map",
    href: "/map",
    key: "map",
  },
  {
    label: "News",
    href: "/news",
    key: "news",
  },
  {
    label: "Patchnotes",
    href: "/patchnotes",
    key: "patchnotes",
  },
  {
    label: "Gallery",
    href: "/gallery",
    key: "gallery",
  },
  {
    label: "Status",
    href: "/status",
    key: "status",
  },
];

export default function AurosTopbar({
  current,
}: {
  current?: PageKey;
}) {
  const router =
    useRouter();

  const [
    isLoggedIn,
    setIsLoggedIn,
  ] = useState(false);

  const [
    isAdmin,
    setIsAdmin,
  ] = useState(false);

  const [
    isDev,
    setIsDev,
  ] = useState(false);

  const [
    userEmail,
    setUserEmail,
  ] = useState<string | null>(
    null
  );

  const [
    accountOpen,
    setAccountOpen,
  ] = useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const navRef =
    useRef<HTMLElement | null>(
      null
    );

  const accountRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const linkRefs =
    useRef<
      Partial<
        Record<
          PageKey,
          HTMLAnchorElement
        >
      >
    >({});

  const [
    indicator,
    setIndicator,
  ] =
    useState<IndicatorState>({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      visible: false,
    });

  /* =========================================
     AUTH
  ========================================== */

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const access =
          await getSiteAccess();

        if (!alive) {
          return;
        }

        setIsLoggedIn(
          !!access.user
        );

        setUserEmail(
          access.user?.email ??
            null
        );

        setIsAdmin(
          access.isAdmin
        );

        setIsDev(
          access.isDev
        );

        if (!access.user) {
          setAccountOpen(
            false
          );
        }
      } catch (
        error
      ) {
        console.error(
          "Topbar access lookup failed:",
          error
        );

        if (alive) {
          setIsLoggedIn(
            false
          );

          setUserEmail(
            null
          );

          setIsAdmin(
            false
          );

          setIsDev(
            false
          );

          setAccountOpen(
            false
          );
        }
      }
    }

    load();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        load
      );

    return () => {
      alive = false;

      listener.subscription.unsubscribe();
    };
  }, []);

  /* =========================================
     ACCOUNT DROPDOWN
  ========================================== */

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    function handlePointerDown(
      event: MouseEvent
    ) {
      const target =
        event.target;

      if (
        !(target instanceof Node)
      ) {
        return;
      }

      if (
        accountRef.current &&
        !accountRef.current.contains(
          target
        )
      ) {
        setAccountOpen(
          false
        );
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setAccountOpen(
          false
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    accountOpen,
  ]);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(
      true
    );

    try {
      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setAccountOpen(
        false
      );

      setIsLoggedIn(
        false
      );

      setUserEmail(
        null
      );

      setIsAdmin(
        false
      );

      setIsDev(
        false
      );

      router.push(
        "/"
      );

      router.refresh();
    } catch (
      error
    ) {
      console.error(
        "Logout failed:",
        error
      );
    } finally {
      setIsLoggingOut(
        false
      );
    }
  }

  /* =========================================
     DYNAMIC NAV
  ========================================== */

  const navItems: NavItem[] = [
    ...mainNav,
  ];

  if (isDev) {
    navItems.push({
      label: "DEV",
      href: "/dev",
      key: "dev",
    });
  }

  if (isAdmin) {
    navItems.push({
      label: "Admin",
      href: "/admin",
      key: "admin",
    });
  }

  if (!isLoggedIn) {
    navItems.push({
      label: "Login",
      href: "/login",
      key: "login",
      subtle: true,
    });
  }

  /* =========================================
     ACTIVE INDICATOR POSITION
  ========================================== */

  function updateIndicator() {
    const nav =
      navRef.current;

    if (
      !nav ||
      !current
    ) {
      setIndicator(
        (
          previous
        ) => ({
          ...previous,
          visible: false,
        })
      );

      return;
    }

    const activeLink =
      linkRefs.current[
        current
      ];

    if (!activeLink) {
      setIndicator(
        (
          previous
        ) => ({
          ...previous,
          visible: false,
        })
      );

      return;
    }

    const navRect =
      nav.getBoundingClientRect();

    const linkRect =
      activeLink.getBoundingClientRect();

    setIndicator({
      x:
        linkRect.left -
        navRect.left +
        nav.scrollLeft,

      y:
        linkRect.top -
        navRect.top,

      width:
        linkRect.width,

      height:
        linkRect.height,

      visible: true,
    });
  }

  useLayoutEffect(() => {
    updateIndicator();
  }, [
    current,
    isAdmin,
    isDev,
    isLoggedIn,
  ]);

  useEffect(() => {
    let frame:
      | number
      | null = null;

    function scheduleUpdate() {
      if (
        frame !== null
      ) {
        cancelAnimationFrame(
          frame
        );
      }

      frame =
        requestAnimationFrame(
          updateIndicator
        );
    }

    window.addEventListener(
      "resize",
      scheduleUpdate
    );

    const nav =
      navRef.current;

    nav?.addEventListener(
      "scroll",
      scheduleUpdate,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "resize",
        scheduleUpdate
      );

      nav?.removeEventListener(
        "scroll",
        scheduleUpdate
      );

      if (
        frame !== null
      ) {
        cancelAnimationFrame(
          frame
        );
      }
    };
  }, [
    current,
    isAdmin,
    isDev,
    isLoggedIn,
  ]);

  return (
    <>
      <header className="aurosTopbar">
        <div className="aurosTopbarCard auros-card">
          <Link
            href="/"
            prefetch
            className="aurosTopbarBrand"
          >
            <img
              src="/auros_royale_pfp_draft_1.png"
              alt="Auros Royale"
              width={44}
              height={44}
            />

            <div className="aurosTopbarBrandText">
              <strong>
                AUROS ROYALE
              </strong>

              <span>
                OFFICIAL WEBSITE
              </span>
            </div>
          </Link>

          <div className="aurosTopbarRight">
            <nav
              ref={navRef}
              className="aurosTopbarNav"
            >
              <span
                aria-hidden="true"
                className={
                  indicator.visible
                    ? "aurosNavIndicator visible"
                    : "aurosNavIndicator"
                }
                style={{
                  width:
                    indicator.width,

                  height:
                    indicator.height,

                  transform:
                    `translate3d(${indicator.x}px, ${indicator.y}px, 0)`,
                }}
              />

              {navItems.map(
                (
                  item
                ) => (
                  <NavLink
                    key={
                      item.href
                    }
                    label={
                      item.label
                    }
                    href={
                      item.href
                    }
                    active={
                      current ===
                      item.key
                    }
                    subtle={
                      item.subtle
                    }
                    linkRef={(
                      element
                    ) => {
                      linkRefs.current[
                        item.key
                      ] =
                        element ??
                        undefined;
                    }}
                  />
                )
              )}
            </nav>

            {isLoggedIn && (
              <div
                ref={accountRef}
                className="aurosAccount"
              >
                <button
                  type="button"
                  className={
                    accountOpen
                      ? "aurosAccountButton active"
                      : "aurosAccountButton"
                  }
                  aria-haspopup="menu"
                  aria-expanded={
                    accountOpen
                  }
                  onClick={() => {
                    setAccountOpen(
                      (
                        previous
                      ) =>
                        !previous
                    );
                  }}
                >
                  <span className="aurosAccountAvatar">
                    <UserIcon />
                  </span>

                  <span className="aurosAccountLabel">
                    Account
                  </span>

                  <ChevronIcon
                    open={
                      accountOpen
                    }
                  />
                </button>

                {accountOpen && (
                  <div
                    className="aurosAccountMenu"
                    role="menu"
                  >
                    <div className="aurosAccountMenuHeader">
                      <span className="aurosAccountMenuEyebrow">
                        SIGNED IN
                      </span>

                      <strong>
                        Account
                      </strong>

                      {userEmail && (
                        <span className="aurosAccountEmail">
                          {
                            userEmail
                          }
                        </span>
                      )}
                    </div>

                    {(isAdmin ||
                      isDev) && (
                      <div className="aurosAccountRoles">
                        {isDev && (
                          <span>
                            DEV
                          </span>
                        )}

                        {isAdmin && (
                          <span>
                            ADMIN
                          </span>
                        )}
                      </div>
                    )}

                    <div className="aurosAccountDivider" />

                    <button
                      type="button"
                      role="menuitem"
                      className="aurosLogoutButton"
                      disabled={
                        isLoggingOut
                      }
                      onClick={
                        handleLogout
                      }
                    >
                      <LogoutIcon />

                      <span>
                        {isLoggingOut
                          ? "Logging out..."
                          : "Logout"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <style jsx global>{`
        .aurosTopbar {
          position:
            sticky;

          top:
            14px;

          z-index:
            50;

          margin-bottom:
            32px;
        }

        .aurosTopbarCard {
          width:
            100%;

          max-width:
            1280px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            16px;

          margin:
            0 auto;

          padding:
            12px
            14px;
        }

        .aurosTopbarBrand {
          flex-shrink:
            0;

          display:
            flex;

          align-items:
            center;

          gap:
            11px;

          color:
            white;

          text-decoration:
            none;
        }

        .aurosTopbarBrand
          img {
          width:
            44px;

          height:
            44px;

          display:
            block;

          border-radius:
            14px;

          object-fit:
            cover;
        }

        .aurosTopbarBrandText
          strong {
          display:
            block;

          color:
            #ffffff;

          font-size:
            17px;

          line-height:
            1.1;
        }

        .aurosTopbarBrandText
          span {
          display:
            block;

          margin-top:
            4px;

          color:
            #91a6c7;

          font-size:
            11px;

          letter-spacing:
            0.08em;
        }

        .aurosTopbarRight {
          min-width:
            0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            flex-end;

          gap:
            8px;
        }

        .aurosTopbarNav {
          position:
            relative;

          display:
            flex;

          align-items:
            center;

          gap:
            7px;

          min-width:
            0;

          overflow-x:
            auto;

          overflow-y:
            hidden;

          scrollbar-width:
            none;

          overscroll-behavior-x:
            contain;
        }

        .aurosTopbarNav::-webkit-scrollbar {
          display:
            none;
        }

        .aurosNavIndicator {
          position:
            absolute;

          z-index:
            0;

          left:
            0;

          top:
            0;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.28
            );

          border-radius:
            12px;

          background:
            rgba(
              99,
              221,
              255,
              0.1
            );

          opacity:
            0;

          pointer-events:
            none;

          transition:
            transform
              210ms
              cubic-bezier(
                0.2,
                0.8,
                0.2,
                1
              ),
            width
              210ms
              cubic-bezier(
                0.2,
                0.8,
                0.2,
                1
              ),
            height
              210ms
              cubic-bezier(
                0.2,
                0.8,
                0.2,
                1
              ),
            opacity
              100ms
              ease;

          will-change:
            transform,
            width;
        }

        .aurosNavIndicator.visible {
          opacity:
            1;
        }

        .aurosNavLink {
          position:
            relative;

          z-index:
            1;

          flex-shrink:
            0;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          min-height:
            39px;

          padding:
            10px
            13px;

          border:
            1px solid
            transparent;

          border-radius:
            12px;

          background:
            transparent;

          color:
            #dce8ff;

          text-decoration:
            none;

          font-size:
            13px;

          font-weight:
            750;

          white-space:
            nowrap;

          transition:
            color
              140ms
              ease,
            background
              140ms
              ease;
        }

        .aurosNavLink.subtle {
          color:
            #9fb0cc;
        }

        .aurosNavLink.active {
          color:
            #ffffff;
        }

        .aurosAccount {
          position:
            relative;

          flex-shrink:
            0;
        }

        .aurosAccountButton {
          min-height:
            39px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            8px;

          padding:
            6px
            10px
            6px
            7px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.18
            );

          border-radius:
            12px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          color:
            #dce8ff;

          font-family:
            inherit;

          font-size:
            13px;

          font-weight:
            750;

          cursor:
            pointer;

          transition:
            border-color
              140ms
              ease,
            background
              140ms
              ease,
            color
              140ms
              ease;
        }

        .aurosAccountButton.active {
          border-color:
            rgba(
              99,
              221,
              255,
              0.38
            );

          background:
            rgba(
              99,
              221,
              255,
              0.09
            );

          color:
            #ffffff;
        }

        .aurosAccountAvatar {
          width:
            27px;

          height:
            27px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.25
            );

          border-radius:
            9px;

          background:
            linear-gradient(
              135deg,
              rgba(
                99,
                221,
                255,
                0.16
              ),
              rgba(
                123,
                97,
                255,
                0.13
              )
            );

          color:
            #8ee9ff;
        }

        .aurosAccountAvatar
          svg {
          width:
            15px;

          height:
            15px;
        }

        .aurosAccountButton
          > svg {
          width:
            13px;

          height:
            13px;

          color:
            #8195b5;

          transition:
            transform
              150ms
              ease;
        }

        .aurosAccountButton
          > svg.open {
          transform:
            rotate(180deg);
        }

        .aurosAccountMenu {
          position:
            absolute;

          top:
            calc(
              100% + 10px
            );

          right:
            0;

          z-index:
            100;

          width:
            260px;

          padding:
            10px;

          border:
            1px solid
            rgba(
              112,
              143,
              190,
              0.22
            );

          border-radius:
            16px;

          background:
            rgba(
              8,
              14,
              27,
              0.98
            );

          box-shadow:
            0 20px 60px
            rgba(
              0,
              0,
              0,
              0.45
            );

          backdrop-filter:
            blur(20px);
        }

        .aurosAccountMenuHeader {
          display:
            flex;

          flex-direction:
            column;

          gap:
            4px;

          padding:
            8px;
        }

        .aurosAccountMenuEyebrow {
          color:
            #63ddff;

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            0.12em;
        }

        .aurosAccountMenuHeader
          strong {
          color:
            #ffffff;

          font-size:
            15px;
        }

        .aurosAccountEmail {
          max-width:
            100%;

          overflow:
            hidden;

          color:
            #91a6c7;

          font-size:
            11px;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }

        .aurosAccountRoles {
          display:
            flex;

          flex-wrap:
            wrap;

          gap:
            6px;

          padding:
            5px
            8px
            8px;
        }

        .aurosAccountRoles
          span {
          padding:
            4px
            7px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.18
            );

          border-radius:
            999px;

          background:
            rgba(
              99,
              221,
              255,
              0.07
            );

          color:
            #a9ecff;

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            0.08em;
        }

        .aurosAccountDivider {
          height:
            1px;

          margin:
            4px
            4px
            8px;

          background:
            rgba(
              255,
              255,
              255,
              0.07
            );
        }

        .aurosLogoutButton {
          width:
            100%;

          min-height:
            40px;

          display:
            flex;

          align-items:
            center;

          gap:
            9px;

          padding:
            9px
            10px;

          border:
            1px solid
            transparent;

          border-radius:
            11px;

          background:
            transparent;

          color:
            #ff9fa8;

          font-family:
            inherit;

          font-size:
            12px;

          font-weight:
            750;

          text-align:
            left;

          cursor:
            pointer;

          transition:
            background
              140ms
              ease,
            border-color
              140ms
              ease;
        }

        .aurosLogoutButton:disabled {
          opacity:
            0.6;

          cursor:
            wait;
        }

        @media (
          hover: hover
        ) and (
          pointer: fine
        ) {
          .aurosNavLink:hover:not(
              .active
            ) {
            color:
              #ffffff;

            background:
              rgba(
                255,
                255,
                255,
                0.035
              );
          }

          .aurosAccountButton:hover {
            border-color:
              rgba(
                99,
                221,
                255,
                0.34
              );

            background:
              rgba(
                99,
                221,
                255,
                0.07
              );

            color:
              #ffffff;
          }

          .aurosLogoutButton:hover:not(
              :disabled
            ) {
            border-color:
              rgba(
                255,
                100,
                115,
                0.16
              );

            background:
              rgba(
                255,
                100,
                115,
                0.08
              );
          }
        }

        .aurosNavLink:focus-visible,
        .aurosTopbarBrand:focus-visible,
        .aurosAccountButton:focus-visible,
        .aurosLogoutButton:focus-visible {
          outline:
            2px solid
            rgba(
              99,
              221,
              255,
              0.8
            );

          outline-offset:
            3px;
        }

        @media (
          max-width:
            1100px
        ) {
          .aurosTopbarCard {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap:
              10px;
          }

          .aurosTopbarRight {
            width:
              100%;
          }

          .aurosTopbarNav {
            flex:
              1;
          }
        }

        @media (
          max-width:
            700px
        ) {
          .aurosTopbar {
            top:
              8px;

            margin-bottom:
              22px;
          }

          .aurosTopbarCard {
            padding:
              10px;
          }

          .aurosTopbarBrand
            img {
            width:
              39px;

            height:
              39px;

            border-radius:
              12px;
          }

          .aurosTopbarBrandText
            strong {
            font-size:
              15px;
          }

          .aurosTopbarBrandText
            span {
            font-size:
              9px;
          }

          .aurosNavLink {
            min-height:
              36px;

            padding:
              8px
              11px;

            font-size:
              12px;
          }

          .aurosAccountButton {
            min-height:
              36px;

            padding-right:
              8px;
          }

          .aurosAccountLabel {
            display:
              none;
          }

          .aurosAccountMenu {
            position:
              fixed;

            top:
              auto;

            right:
              12px;

            bottom:
              12px;

            left:
              12px;

            width:
              auto;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .aurosNavIndicator,
          .aurosNavLink,
          .aurosAccountButton,
          .aurosAccountButton
            > svg,
          .aurosLogoutButton {
            transition:
              none;
          }
        }
      `}</style>
    </>
  );
}

function NavLink({
  label,
  href,
  active,
  subtle = false,
  linkRef,
}: {
  label: string;
  href: string;
  active?: boolean;
  subtle?: boolean;

  linkRef?: (
    element:
      | HTMLAnchorElement
      | null
  ) => void;
}) {
  return (
    <Link
      ref={linkRef}
      href={href}
      prefetch
      className={[
        "aurosNavLink",

        active
          ? "active"
          : "",

        subtle
          ? "subtle"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </Link>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M4.5 20c.8-3.4 3.5-5.5 7.5-5.5s6.7 2.1 7.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({
  open,
}: {
  open: boolean;
}) {
  return (
    <svg
      className={
        open
          ? "open"
          : ""
      }
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m7 9.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M14.5 8.5 18 12l-3.5 3.5M9 12h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}