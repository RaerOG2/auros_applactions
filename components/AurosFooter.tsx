"use client";

export default function AurosFooter() {
  const footerStyle: React.CSSProperties = {
    marginTop: "32px",
    padding: "22px 20px",
    borderTop: "1px solid rgba(34, 48, 77, 0.9)",
    background: "rgba(8, 18, 37, 0.72)",
    backdropFilter: "blur(12px)",
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 1fr",
    gap: "20px",
    alignItems: "start",
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
    color: "white",
  };

  const textStyle: React.CSSProperties = {
    margin: "8px 0 0 0",
    color: "#9fb0d0",
    lineHeight: 1.7,
    fontSize: "14px",
  };

  const sectionTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "14px",
    fontWeight: 800,
    color: "#dbe7ff",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  const listStyle: React.CSSProperties = {
    display: "grid",
    gap: "10px",
    marginTop: "12px",
  };

  const linkStyle: React.CSSProperties = {
    color: "#9fb0d0",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  };

  const bottomStyle: React.CSSProperties = {
    maxWidth: "1280px",
    margin: "18px auto 0 auto",
    paddingTop: "16px",
    borderTop: "1px solid rgba(34, 48, 77, 0.8)",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    color: "#7f93b6",
    fontSize: "13px",
  };

  return (
    <>
      <style jsx>{`
        @media (max-width: 900px) {
          .auros-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <footer style={footerStyle}>
        <div className="auros-footer-grid" style={innerStyle}>
          <div>
            <h3 style={titleStyle}>Auros</h3>
            <p style={textStyle}>
              Official Auros portal for applications, updates, projects, and
              community information.
            </p>
          </div>

          <div>
            <p style={sectionTitleStyle}>Navigation</p>
            <div style={listStyle}>
              <a href="/" style={linkStyle}>
                Home
              </a>
              <a href="/apply" style={linkStyle}>
                Apply
              </a>
              <a href="/status" style={linkStyle}>
                Status
              </a>
              <a href="/patchnotes" style={linkStyle}>
                Patchnotes
              </a>
              <a href="/faq" style={linkStyle}>
                FAQ
              </a>
              <a href="/contact" style={linkStyle}>
                Contact
              </a>
            </div>
          </div>

          <div>
            <p style={sectionTitleStyle}>Community</p>
            <div style={listStyle}>
              <a href="/projects" style={linkStyle}>
                Projects
              </a>
              <a href="/news" style={linkStyle}>
                News
              </a>
              <a
                href="https://discord.gg/wYAmfDXJp6"
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
              >
                Discord Server
              </a>
            </div>
          </div>
        </div>

        <div style={bottomStyle}>
          <span>© 2026 Auros. All rights reserved.</span>
          <span>Built with the Auros Applications System</span>
        </div>
      </footer>
    </>
  );
}