"use client";

import AurosBackground from "../components/AurosBackground";

export default function HomePage() {
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "transparent",
    color: "white",
    padding: "32px 20px",
    position: "relative",
    zIndex: 1,
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  };

  const heroStyle: React.CSSProperties = {
    background: "rgba(15, 27, 52, 0.72)",
    border: "1px solid rgba(34, 48, 77, 0.95)",
    borderRadius: "28px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
    backdropFilter: "blur(10px)",
  };

  const smallCardStyle: React.CSSProperties = {
    background: "rgba(11, 21, 43, 0.82)",
    border: "1px solid #22304d",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
  };

  const infoPanelStyle: React.CSSProperties = {
    background: "rgba(15, 27, 52, 0.72)",
    border: "1px solid rgba(34, 48, 77, 0.95)",
    borderRadius: "22px",
    padding: "26px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
  };

  const primaryButtonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "14px 18px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
    color: "white",
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 10px 24px rgba(76, 201, 240, 0.18)",
    textAlign: "center",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "14px 18px",
    borderRadius: "12px",
    border: "1px solid #22304d",
    background: "rgba(11, 21, 43, 0.82)",
    color: "white",
    fontWeight: 600,
    textDecoration: "none",
    textAlign: "center",
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(76, 201, 240, 0.12)",
    border: "1px solid rgba(76, 201, 240, 0.2)",
    color: "#8ee6ff",
    fontSize: "13px",
    fontWeight: 700,
  };

  return (
    <>
      <AurosBackground />

      <main style={pageStyle}>
        <div style={containerStyle}>
          <style jsx>{`
            .heroGrid {
              display: grid;
              grid-template-columns: 1.2fr 0.8fr;
              gap: 24px;
              align-items: center;
            }

            .buttonRow {
              display: flex;
              gap: 12px;
              flex-wrap: wrap;
              margin-bottom: 20px;
            }

            .badgeRow {
              display: flex;
              gap: 10px;
              flex-wrap: wrap;
            }

            .cardGrid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 18px;
              margin-top: 28px;
            }

            .sectionGrid {
              display: grid;
              grid-template-columns: 1.2fr 0.8fr;
              gap: 24px;
              margin-top: 28px;
              align-items: stretch;
            }

            .quickGrid {
              display: grid;
              gap: 12px;
            }

            @media (max-width: 980px) {
              .heroGrid,
              .cardGrid,
              .sectionGrid {
                grid-template-columns: 1fr;
              }
            }

            @media (max-width: 640px) {
              .heroCard {
                padding: 24px !important;
              }

              .heroTitle {
                font-size: 36px !important;
              }

              .heroText {
                font-size: 16px !important;
              }

              .buttonRow a {
                width: 100%;
              }
            }
          `}</style>

          <section className="heroCard" style={heroStyle}>
            <div className="heroGrid">
              <div>
                <p
                  style={{
                    color: "#4cc9f0",
                    fontWeight: 700,
                    marginBottom: 10,
                    fontSize: "13px",
                    letterSpacing: "0.08em",
                  }}
                >
                  AUROS STAFF SYSTEM
                </p>

                <h1
                  className="heroTitle"
                  style={{
                    margin: 0,
                    fontSize: "52px",
                    lineHeight: 1.05,
                    marginBottom: "16px",
                  }}
                >
                  Auros Applications
                </h1>

                <p
                  className="heroText"
                  style={{
                    color: "#9fb0d0",
                    fontSize: "18px",
                    lineHeight: 1.7,
                    maxWidth: "760px",
                    marginTop: 0,
                    marginBottom: "28px",
                  }}
                >
                  Apply for open staff roles, manage incoming applications, and
                  publish website updates through one central Auros dashboard.
                </p>

                <div className="buttonRow">
                  <a href="/apply" style={primaryButtonStyle}>
                    Apply Now
                  </a>
                  <a href="/admin" style={secondaryButtonStyle}>
                    Admin Dashboard
                  </a>
                  <a href="/patchnotes" style={secondaryButtonStyle}>
                    Patchnotes
                  </a>
                  <a href="/status" style={secondaryButtonStyle}>
                    Check Status
                  </a>
                </div>

                <div className="badgeRow">
                  <span style={badgeStyle}>Reality Theme</span>
                  <span style={badgeStyle}>Staff Recruitment</span>
                  <span style={badgeStyle}>Admin Dashboard</span>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(11, 21, 43, 0.82)",
                  border: "1px solid #22304d",
                  borderRadius: "22px",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                }}
              >
                <p
                  style={{
                    color: "#4cc9f0",
                    fontWeight: 700,
                    marginTop: 0,
                    marginBottom: "10px",
                    fontSize: "13px",
                    letterSpacing: "0.08em",
                  }}
                >
                  LIVE OVERVIEW
                </p>

                <div style={{ display: "grid", gap: "14px" }}>
                  <div
                    style={{
                      border: "1px solid #22304d",
                      borderRadius: "16px",
                      padding: "16px",
                      background: "#081225",
                    }}
                  >
                    <p style={{ margin: 0, color: "#9fb0d0", fontSize: "14px" }}>
                      Public Area
                    </p>
                    <h3 style={{ margin: "8px 0 0 0" }}>Applications & Jobs</h3>
                  </div>

                  <div
                    style={{
                      border: "1px solid #22304d",
                      borderRadius: "16px",
                      padding: "16px",
                      background: "#081225",
                    }}
                  >
                    <p style={{ margin: 0, color: "#9fb0d0", fontSize: "14px" }}>
                      Protected Area
                    </p>
                    <h3 style={{ margin: "8px 0 0 0" }}>
                      Admin Tools & Patchnotes
                    </h3>
                  </div>

                  <div
                    style={{
                      border: "1px solid #22304d",
                      borderRadius: "16px",
                      padding: "16px",
                      background: "#081225",
                    }}
                  >
                    <p style={{ margin: 0, color: "#9fb0d0", fontSize: "14px" }}>
                      Design Direction
                    </p>
                    <h3 style={{ margin: "8px 0 0 0" }}>
                      Reality Waves • Energy • AUROS
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="cardGrid">
              <div style={smallCardStyle}>
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>
                  Public Applications
                </h3>
                <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.6 }}>
                  Applicants can choose open roles and send their staff
                  application directly through the Auros system.
                </p>
              </div>

              <div style={smallCardStyle}>
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>
                  Protected Admin Area
                </h3>
                <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.6 }}>
                  Staff members with admin access can review applications,
                  manage jobs, and publish patchnotes securely.
                </p>
              </div>

              <div style={smallCardStyle}>
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>
                  Live Job Management
                </h3>
                <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.6 }}>
                  Create, edit, open, fill, and remove roles so the
                  application form always stays up to date.
                </p>
              </div>
            </div>
          </section>

          <section className="sectionGrid">
            <div style={infoPanelStyle}>
              <p
                style={{
                  color: "#4cc9f0",
                  fontWeight: 700,
                  marginBottom: 10,
                  fontSize: "13px",
                  letterSpacing: "0.08em",
                }}
              >
                WHAT THIS SYSTEM DOES
              </p>

              <h2 style={{ marginTop: 0, marginBottom: 14 }}>
                One place for staff recruitment
              </h2>

              <p style={{ color: "#9fb0d0", lineHeight: 1.7, marginTop: 0 }}>
                The Auros application system combines public staff applications,
                role management, internal admin notes, status handling, and
                patchnotes into one website. This keeps recruitment organized and
                makes it easier to track changes over time.
              </p>
            </div>

            <div style={infoPanelStyle}>
              <p
                style={{
                  color: "#4cc9f0",
                  fontWeight: 700,
                  marginBottom: 10,
                  fontSize: "13px",
                  letterSpacing: "0.08em",
                }}
              >
                QUICK ACCESS
              </p>

              <div className="quickGrid">
                <a href="/apply" style={secondaryButtonStyle}>
                  Open Application Form
                </a>
                <a href="/admin" style={secondaryButtonStyle}>
                  Open Admin Dashboard
                </a>
                <a href="/patchnotes" style={secondaryButtonStyle}>
                  View Patchnotes
                </a>
                <a href="/status" style={secondaryButtonStyle}>
                  Check Status
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
