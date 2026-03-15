"use client";

type AurosTopbarProps = {
  current?: "apply" | "status" | "patchnotes" | "admin";
};

export default function AurosTopbar({ current }: AurosTopbarProps) {
  const wrapperStyle: React.CSSProperties = {
    position: "sticky",
    top: 16,
    zIndex: 30,
    marginBottom: 24,
  };

  const barStyle: React.CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "14px 18px",
    borderRadius: "20px",
    background: "rgba(11, 21, 43, 0.78)",
    border: "1px solid rgba(34, 48, 77, 0.95)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
    flexWrap: "wrap",
  };

  const brandStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  };

  const logoBoxStyle: React.CSSProperties = {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: "linear-gradient(135deg, #4cc9f0 0%, #7b61ff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 900,
    fontSize: 16,
    boxShadow: "0 8px 20px rgba(76, 201, 240, 0.22)",
    flexShrink: 0,
    overflow: "hidden",
  };

  const logoImageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const brandTextWrapStyle: React.CSSProperties = {
    minWidth: 0,
  };

  const brandTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "white",
    lineHeight: 1.1,
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
  };

  function linkStyle(active: boolean): React.CSSProperties {
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "11px 14px",
      borderRadius: "12px",
      textDecoration: "none",
      fontWeight: 700,
      fontSize: 14,
      color: "white",
      border: active
        ? "1px solid rgba(76, 201, 240, 0.34)"
        : "1px solid #22304d",
      background: active
        ? "linear-gradient(90deg, rgba(76, 201, 240, 0.18) 0%, rgba(123, 97, 255, 0.18) 100%)"
        : "rgba(11, 21, 43, 0.92)",
      boxShadow: active ? "0 8px 20px rgba(76, 201, 240, 0.10)" : "none",
    };
  }

  return (
    <>
      <style jsx>{`
        .auros-topbar-inner {
          width: 100%;
        }

        @media (max-width: 760px) {
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
      `}</style>

      <div style={wrapperStyle}>
        <div className="auros-topbar-inner" style={barStyle}>
          <div className="auros-topbar-brand" style={brandStyle}>
            <div style={logoBoxStyle}>
              <img
                src="/auros_royale_pfp_draft_1.png"
                alt="Auros Logo"
                style={logoImageStyle}
              />
            </div>

            <div style={brandTextWrapStyle}>
              <p style={brandTitleStyle}>Auros</p>
              <p style={brandSubStyle}>Applications System</p>
            </div>
          </div>

          <nav className="auros-topbar-nav" style={navStyle}>
            <a href="/apply" style={linkStyle(current === "apply")}>
              Apply
            </a>
            <a href="/status" style={linkStyle(current === "status")}>
              Status
            </a>
            <a href="/patchnotes" style={linkStyle(current === "patchnotes")}>
              Patchnotes
            </a>
            <a href="/admin" style={linkStyle(current === "admin")}>
              Admin
            </a>
          </nav>
        </div>
      </div>
    </>
  );
}