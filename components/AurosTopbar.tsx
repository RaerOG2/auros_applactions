"use client";

import Link from "next/link";

type AurosTopbarProps = {
  current?:
    | "home"
    | "apply"
    | "status"
    | "patchnotes"
    | "faq"
    | "contact"
    | "admin";
};

export default function AurosTopbar({ current }: AurosTopbarProps) {
  const wrapperStyle: React.CSSProperties = {
    position: "sticky",
    top: 16,
    zIndex: 50,
    marginBottom: 28,
  };

  const barStyle: React.CSSProperties = {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "14px 18px",
    borderRadius: "24px",
    background:
      "linear-gradient(180deg, rgba(12, 22, 45, 0.88) 0%, rgba(8, 18, 37, 0.82) 100%)",
    border: "1px solid rgba(76, 201, 240, 0.12)",
    backdropFilter: "blur(18px)",
    boxShadow:
      "0 14px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)",
    flexWrap: "wrap",
    position: "relative",
    overflow: "hidden",
  };

  const brandStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
    textDecoration: "none",
    position: "relative",
    zIndex: 2,
  };

  const logoBoxStyle: React.CSSProperties = {
    width: 46,
    height: 46,
    borderRadius: 16,
    background: "linear-gradient(135deg, #4cc9f0 0%, #7b61ff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 900,
    fontSize: 16,
    boxShadow:
      "0 10px 24px rgba(76, 201, 240, 0.22), 0 0 0 1px rgba(255,255,255,0.08) inset",
    flexShrink: 0,
    overflow: "hidden",
    position: "relative",
  };

  const brandTextWrapStyle: React.CSSProperties = {
    minWidth: 0,
  };

  const brandTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 17,
    fontWeight: 900,
    color: "white",
    lineHeight: 1.05,
    letterSpacing: "0.01em",
  };

  const brandSubStyle: React.CSSProperties = {
    margin: "4px 0 0 0",
    fontSize: 12,
    color: "#9fb0d0",
    lineHeight: 1.1,
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  };

  function linkStyle(active: boolean): React.CSSProperties {
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "11px 15px",
      borderRadius: "14px",
      textDecoration: "none",
      fontWeight: 700,
      fontSize: 14,
      color: "white",
      border: active
        ? "1px solid rgba(76, 201, 240, 0.30)"
        : "1px solid rgba(56, 74, 108, 0.85)",
      background: active
        ? "linear-gradient(90deg, rgba(76, 201, 240, 0.18) 0%, rgba(123, 97, 255, 0.18) 100%)"
        : "linear-gradient(180deg, rgba(14, 25, 48, 0.95) 0%, rgba(10, 20, 40, 0.92) 100%)",
      boxShadow: active
        ? "0 10px 24px rgba(76, 201, 240, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)"
        : "inset 0 1px 0 rgba(255,255,255,0.03)",
      transition:
        "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease, opacity 0.22s ease",
      position: "relative",
      overflow: "hidden",
    };
  }

  return (
    <>
      <style jsx>{`
        .auros-topbar-inner::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
              circle at 12% 20%,
              rgba(76, 201, 240, 0.11),
              transparent 24%
            ),
            radial-gradient(
              circle at 82% 0%,
              rgba(123, 97, 255, 0.12),
              transparent 30%
            );
          pointer-events: none;
          z-index: 0;
        }

        .auros-topbar-inner::after {
          content: "";
          position: absolute;
          top: 0;
          left: -35%;
          width: 32%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.05),
            transparent
          );
          transform: skewX(-20deg);
          animation: topbarShine 7s linear infinite;
          pointer-events: none;
          z-index: 1;
        }

        .auros-brand {
          transition: transform 0.22s ease, opacity 0.22s ease;
        }

        .auros-brand:hover {
          transform: translateY(-1px);
        }

        .auros-brand:hover .auros-logo-box {
          box-shadow:
            0 14px 30px rgba(76, 201, 240, 0.28),
            0 0 24px rgba(123, 97, 255, 0.16),
            0 0 0 1px rgba(255,255,255,0.08) inset;
          transform: scale(1.03);
        }

        .auros-logo-box {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        .auros-logo-box::after {
          content: "";
          position: absolute;
          top: -30%;
          left: -40%;
          width: 60%;
          height: 160%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.22),
            transparent
          );
          transform: rotate(24deg);
          opacity: 0.9;
        }

        .auros-nav-link:hover {
          transform: translateY(-2px);
          border-color: rgba(76, 201, 240, 0.26) !important;
          box-shadow:
            0 12px 26px rgba(76, 201, 240, 0.10),
            inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .auros-nav-link:active {
          transform: translateY(0);
        }

        .auros-nav-link .nav-glow {
          position: absolute;
          inset: auto 12% -18px 12%;
          height: 18px;
          background: radial-gradient(
            ellipse at center,
            rgba(76, 201, 240, 0.20) 0%,
            rgba(123, 97, 255, 0.12) 45%,
            transparent 75%
          );
          filter: blur(10px);
          opacity: 0;
          transition: opacity 0.22s ease;
          pointer-events: none;
        }

        .auros-nav-link:hover .nav-glow,
        .auros-nav-link.active .nav-glow {
          opacity: 1;
        }

        .auros-nav-link.active {
          box-shadow:
            0 12px 30px rgba(76, 201, 240, 0.12),
            0 0 30px rgba(123, 97, 255, 0.06),
            inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .auros-nav-link.active::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            90deg,
            rgba(76, 201, 240, 0.35),
            rgba(123, 97, 255, 0.32)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        @keyframes topbarShine {
          0% {
            left: -40%;
          }
          100% {
            left: 120%;
          }
        }

        @media (max-width: 980px) {
          .auros-topbar-inner {
            justify-content: center !important;
          }

          .auros-topbar-brand {
            width: 100%;
            justify-content: center;
          }

          .auros-topbar-nav {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 640px) {
          .auros-topbar-nav {
            gap: 8px !important;
          }

          .auros-topbar-nav a {
            flex: 1 1 calc(50% - 8px);
            min-width: 120px;
          }

          .auros-topbar-brand {
            justify-content: center;
          }
        }
      `}</style>

      <div style={wrapperStyle}>
        <div className="auros-topbar-inner" style={barStyle}>
          <Link href="/" className="auros-brand auros-topbar-brand" style={brandStyle}>
            <div className="auros-logo-box" style={logoBoxStyle}>
              <img
                src="/auros-logo.png"
                alt="Auros"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <div style={brandTextWrapStyle}>
              <p style={brandTitleStyle}>Auros</p>
              <p style={brandSubStyle}>Applications System</p>
            </div>
          </Link>

          <nav className="auros-topbar-nav" style={navStyle}>
            <Link
              href="/apply"
              className={`auros-nav-link ${current === "apply" ? "active" : ""}`}
              style={linkStyle(current === "apply")}
            >
              Apply
              <span className="nav-glow" />
            </Link>

            <Link
              href="/status"
              className={`auros-nav-link ${current === "status" ? "active" : ""}`}
              style={linkStyle(current === "status")}
            >
              Status
              <span className="nav-glow" />
            </Link>

            <Link
              href="/patchnotes"
              className={`auros-nav-link ${current === "patchnotes" ? "active" : ""}`}
              style={linkStyle(current === "patchnotes")}
            >
              Patchnotes
              <span className="nav-glow" />
            </Link>

            <Link
              href="/faq"
              className={`auros-nav-link ${current === "faq" ? "active" : ""}`}
              style={linkStyle(current === "faq")}
            >
              FAQ
              <span className="nav-glow" />
            </Link>

            <Link
              href="/contact"
              className={`auros-nav-link ${current === "contact" ? "active" : ""}`}
              style={linkStyle(current === "contact")}
            >
              Contact
              <span className="nav-glow" />
            </Link>

            <Link
              href="/admin"
              className={`auros-nav-link ${current === "admin" ? "active" : ""}`}
              style={linkStyle(current === "admin")}
            >
              Admin
              <span className="nav-glow" />
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}