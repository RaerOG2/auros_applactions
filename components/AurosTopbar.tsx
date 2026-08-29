"use client";

import Link from "next/link";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

type PageKey =
  | "home"
  | "map"
  | "news"
  | "gallery"
  | "patchnotes"
  | "apply"
  | "status"
  | "faq"
  | "contact"
  | "admin"
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
];

export default function AurosTopbar({
  current,
}: {
  current?: PageKey;
}) {
  const [
    isLoggedIn,
    setIsLoggedIn,
  ] = useState(false);

  const [
    isAdmin,
    setIsAdmin,
  ] = useState(false);

  const navRef =
    useRef<HTMLElement | null>(
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
      const { data } =
        await supabase.auth.getUser();

      if (!alive) {
        return;
      }

      setIsLoggedIn(
        !!data.user
      );

      if (!data.user) {
        setIsAdmin(false);

        return;
      }

      const {
        data: profile,
      } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq(
          "id",
          data.user.id
        )
        .maybeSingle();

      if (alive) {
        setIsAdmin(
          !!profile?.is_admin
        );
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
     DYNAMIC NAV
  ========================================== */

  const navItems: NavItem[] = [
    ...mainNav,

    {
      label: "Apply",
      href: "/apply",
      key: "apply",
      subtle: true,
    },

    {
      label: "Status",
      href: "/status",
      key: "status",
      subtle: true,
    },
  ];

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
        (previous) => ({
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
        (previous) => ({
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
    isLoggedIn,
  ]);

  return (
    <>
      <header className="aurosTopbar">
        <div className="aurosTopbarCard auros-card">
          {/* BRAND */}

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

          {/* NAVIGATION */}

          <nav
            ref={navRef}
            className="aurosTopbarNav"
          >
            {/* SLIDING ACTIVE BACKGROUND */}

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

                transform: `translate3d(${indicator.x}px, ${indicator.y}px, 0)`,
              }}
            />

            {navItems.map(
              (item) => (
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
        </div>
      </header>

      <style jsx global>{`
        /* =========================================
           TOPBAR
        ========================================== */

        .aurosTopbar {
          position: sticky;

          top: 14px;

          z-index: 50;

          margin-bottom:
            32px;
        }

        .aurosTopbarCard {
          width: 100%;

          max-width: 1280px;

          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 16px;

          margin:
            0
            auto;

          padding:
            12px
            14px;
        }

        /* =========================================
           BRAND
        ========================================== */

        .aurosTopbarBrand {
          flex-shrink: 0;

          display: flex;

          align-items: center;

          gap: 11px;

          color: white;

          text-decoration: none;
        }

        .aurosTopbarBrand img {
          width: 44px;
          height: 44px;

          display: block;

          border-radius: 14px;

          object-fit: cover;
        }

        .aurosTopbarBrandText strong {
          display: block;

          color: #ffffff;

          font-size: 17px;

          line-height: 1.1;
        }

        .aurosTopbarBrandText span {
          display: block;

          margin-top: 4px;

          color: #91a6c7;

          font-size: 11px;

          letter-spacing:
            0.08em;
        }

        /* =========================================
           NAV
        ========================================== */

        .aurosTopbarNav {
          position: relative;

          display: flex;

          align-items: center;

          gap: 7px;

          min-width: 0;

          overflow-x: auto;
          overflow-y: hidden;

          scrollbar-width: none;

          overscroll-behavior-x:
            contain;
        }

        .aurosTopbarNav::-webkit-scrollbar {
          display: none;
        }

        /* =========================================
           SLIDING ACTIVE INDICATOR
        ========================================== */

        .aurosNavIndicator {
          position: absolute;

          z-index: 0;

          left: 0;
          top: 0;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.28
            );

          border-radius: 12px;

          background:
            rgba(
              99,
              221,
              255,
              0.1
            );

          opacity: 0;

          pointer-events: none;

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
          opacity: 1;
        }

        /* =========================================
           NAV LINKS
        ========================================== */

        .aurosNavLink {
          position: relative;

          z-index: 1;

          flex-shrink: 0;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          min-height: 39px;

          padding:
            10px
            13px;

          border:
            1px solid
            transparent;

          border-radius: 12px;

          background:
            transparent;

          color: #dce8ff;

          text-decoration: none;

          font-size: 13px;
          font-weight: 750;

          white-space: nowrap;

          transition:
            color
              140ms
              ease,
            background
              140ms
              ease;
        }

        .aurosNavLink.subtle {
          color: #9fb0cc;
        }

        .aurosNavLink.active {
          color: #ffffff;
        }

        @media (
          hover: hover
        ) and (
          pointer: fine
        ) {
          .aurosNavLink:hover:not(
              .active
            ) {
            color: #ffffff;

            background:
              rgba(
                255,
                255,
                255,
                0.035
              );
          }
        }

        /* =========================================
           FOCUS
        ========================================== */

        .aurosNavLink:focus-visible,
        .aurosTopbarBrand:focus-visible {
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

        /* =========================================
           RESPONSIVE
        ========================================== */

        @media (
          max-width: 1000px
        ) {
          .aurosTopbarCard {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap: 10px;
          }

          .aurosTopbarNav {
            width: 100%;
          }
        }

        @media (
          max-width: 700px
        ) {
          .aurosTopbar {
            top: 8px;

            margin-bottom:
              22px;
          }

          .aurosTopbarCard {
            padding:
              10px;
          }

          .aurosTopbarBrand img {
            width: 39px;
            height: 39px;

            border-radius:
              12px;
          }

          .aurosTopbarBrandText strong {
            font-size:
              15px;
          }

          .aurosTopbarBrandText span {
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
        }

        /* =========================================
           REDUCED MOTION
        ========================================== */

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .aurosNavIndicator,
          .aurosNavLink {
            transition: none;
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