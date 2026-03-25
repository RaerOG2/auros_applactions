"use client";

export default function HomePage() {
  const heroStyle: React.CSSProperties = {
    background:
      "radial-gradient(circle at top left, rgba(76, 201, 240, 0.14) 0%, rgba(15, 27, 52, 0.82) 38%, rgba(15, 27, 52, 0.72) 100%)",
    border: "1px solid rgba(34, 48, 77, 0.95)",
    borderRadius: "30px",
    padding: "40px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
    backdropFilter: "blur(12px)",
    overflow: "hidden",
    position: "relative",
  };

  const sectionCardStyle: React.CSSProperties = {
    background: "rgba(15, 27, 52, 0.72)",
    border: "1px solid rgba(34, 48, 77, 0.95)",
    borderRadius: "24px",
    padding: "26px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
  };

  const featureCardStyle: React.CSSProperties = {
    background: "rgba(11, 21, 43, 0.84)",
    border: "1px solid #22304d",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
    height: "100%",
  };

  const miniPanelStyle: React.CSSProperties = {
    background: "rgba(11, 21, 43, 0.86)",
    border: "1px solid #22304d",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  };

  const primaryButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
    color: "white",
    fontWeight: 800,
    textDecoration: "none",
    boxShadow: "0 14px 30px rgba(76, 201, 240, 0.18)",
    textAlign: "center",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "1px solid #22304d",
    background: "rgba(11, 21, 43, 0.84)",
    color: "white",
    fontWeight: 700,
    textDecoration: "none",
    textAlign: "center",
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(76, 201, 240, 0.12)",
    border: "1px solid rgba(76, 201, 240, 0.2)",
    color: "#8ee6ff",
    fontSize: "13px",
    fontWeight: 700,
  };

  const statBoxStyle: React.CSSProperties = {
    border: "1px solid #22304d",
    borderRadius: "18px",
    padding: "16px",
    background: "#081225",
  };

  return (
    <>
      <style jsx>{`
        .heroGrid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 24px;
          align-items: center;
        }

        .heroButtons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .heroBadges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .featureGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 28px;
        }

        .splitGrid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 24px;
          margin-top: 28px;
          align-items: stretch;
        }

        .stepsGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 18px;
        }

        .quickGrid {
          display: grid;
          gap: 12px;
        }

        .heroGlow {
          position: absolute;
          right: -60px;
          top: -60px;
          width: 220px;
          height: 220px;
          border-radius: 999px;
          background: radial-gradient(
            circle,
            rgba(76, 201, 240, 0.18) 0%,
            rgba(123, 97, 255, 0.1) 45%,
            rgba(0, 0, 0, 0) 70%
          );
          pointer-events: none;
        }

        @media (max-width: 980px) {
          .heroGrid,
          .featureGrid,
          .splitGrid,
          .stepsGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .heroCard {
            padding: 24px !important;
          }

          .heroTitle {
            font-size: 38px !important;
          }

          .heroText {
            font-size: 16px !important;
          }

          .heroButtons a {
            width: 100%;
          }
        }
      `}</style>

      <section className="heroCard" style={heroStyle}>
        <div className="heroGlow" />

        <div className="heroGrid">
          <div>
            <p
              style={{
                color: "#4cc9f0",
                fontWeight: 800,
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
                fontSize: "58px",
                lineHeight: 1.02,
                marginBottom: "16px",
                maxWidth: "760px",
              }}
            >
              The official Auros hub for staff recruitment and website updates
            </h1>

            <p
              className="heroText"
              style={{
                color: "#9fb0d0",
                fontSize: "18px",
                lineHeight: 1.75,
                maxWidth: "760px",
                marginTop: 0,
                marginBottom: "28px",
              }}
            >
              Apply for open roles, check your application status, follow website
              updates, and manage everything through one central Auros platform
              built for recruitment, organization, and growth.
            </p>

            <div className="heroButtons">
              <a href="/apply" style={primaryButtonStyle}>
                Apply Now
              </a>
              <a href="/status" style={secondaryButtonStyle}>
                Check Status
              </a>
              <a href="/patchnotes" style={secondaryButtonStyle}>
                View Patchnotes
              </a>
              <a href="/admin" style={secondaryButtonStyle}>
                Admin Dashboard
              </a>
            </div>

            <div className="heroBadges">
              <span style={badgeStyle}>Reality Theme</span>
              <span style={badgeStyle}>Recruitment Platform</span>
              <span style={badgeStyle}>Live Admin Tools</span>
            </div>
          </div>

          <div style={miniPanelStyle}>
            <p
              style={{
                color: "#4cc9f0",
                fontWeight: 800,
                marginTop: 0,
                marginBottom: "10px",
                fontSize: "13px",
                letterSpacing: "0.08em",
              }}
            >
              LIVE OVERVIEW
            </p>

            <div style={{ display: "grid", gap: "14px" }}>
              <div style={statBoxStyle}>
                <p style={{ margin: 0, color: "#9fb0d0", fontSize: "14px" }}>
                  Public Area
                </p>
                <h3 style={{ margin: "8px 0 0 0" }}>Applications & Status</h3>
              </div>

              <div style={statBoxStyle}>
                <p style={{ margin: 0, color: "#9fb0d0", fontSize: "14px" }}>
                  Internal Area
                </p>
                <h3 style={{ margin: "8px 0 0 0" }}>
                  Admin Review & Job Control
                </h3>
              </div>

              <div style={statBoxStyle}>
                <p style={{ margin: 0, color: "#9fb0d0", fontSize: "14px" }}>
                  Website Updates
                </p>
                <h3 style={{ margin: "8px 0 0 0" }}>
                  Patchnotes & Future Expansion
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="featureGrid">
          <div style={featureCardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Open Applications</h3>
            <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
              Applicants can review open roles, choose the best fit, and submit
              their application directly through the official Auros portal.
            </p>
          </div>

          <div style={featureCardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Protected Admin Area</h3>
            <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
              Administrators can manage jobs, review candidates, change status,
              write notes, and keep recruitment organized in one system.
            </p>
          </div>

          <div style={featureCardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Patchnote System</h3>
            <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
              Public patchnotes keep everyone informed about changes, fixes,
              design updates, and new features added to the Auros website.
            </p>
          </div>
        </div>
      </section>

      <section className="splitGrid">
        <div style={sectionCardStyle}>
          <p
            style={{
              color: "#4cc9f0",
              fontWeight: 800,
              marginBottom: 10,
              fontSize: "13px",
              letterSpacing: "0.08em",
            }}
          >
            HOW IT WORKS
          </p>

          <h2 style={{ marginTop: 0, marginBottom: 14 }}>
            One place for recruitment and management
          </h2>

          <p style={{ color: "#9fb0d0", lineHeight: 1.75, marginTop: 0 }}>
            The Auros website connects public applications, staff review tools,
            application tracking, and patchnotes into one clean system. This
            keeps the process faster for applicants and far more organized for
            the internal team.
          </p>

          <div className="stepsGrid">
            <div style={featureCardStyle}>
              <p
                style={{
                  marginTop: 0,
                  color: "#4cc9f0",
                  fontWeight: 800,
                  fontSize: "13px",
                  letterSpacing: "0.06em",
                }}
              >
                STEP 01
              </p>
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>Choose a role</h3>
              <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
                Browse currently open positions and select the role that best
                matches your skills.
              </p>
            </div>

            <div style={featureCardStyle}>
              <p
                style={{
                  marginTop: 0,
                  color: "#4cc9f0",
                  fontWeight: 800,
                  fontSize: "13px",
                  letterSpacing: "0.06em",
                }}
              >
                STEP 02
              </p>
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>Submit your form</h3>
              <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
                Complete the application form and receive a tracking code after
                submitting.
              </p>
            </div>

            <div style={featureCardStyle}>
              <p
                style={{
                  marginTop: 0,
                  color: "#4cc9f0",
                  fontWeight: 800,
                  fontSize: "13px",
                  letterSpacing: "0.06em",
                }}
              >
                STEP 03
              </p>
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>Track your status</h3>
              <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
                Use your email and tracking code to see whether your application
                is new, in review, accepted, or rejected.
              </p>
            </div>
          </div>
        </div>

        <div style={sectionCardStyle}>
          <p
            style={{
              color: "#4cc9f0",
              fontWeight: 800,
              marginBottom: 10,
              fontSize: "13px",
              letterSpacing: "0.08em",
            }}
          >
            QUICK ACCESS
          </p>

          <h2 style={{ marginTop: 0, marginBottom: 14 }}>Open the right page fast</h2>

          <div className="quickGrid">
            <a href="/apply" style={secondaryButtonStyle}>
              Open Application Form
            </a>
            <a href="/status" style={secondaryButtonStyle}>
              Check Application Status
            </a>
            <a href="/patchnotes" style={secondaryButtonStyle}>
              View Patchnotes
            </a>
            <a href="/faq" style={secondaryButtonStyle}>
              Open FAQ
            </a>
            <a href="/contact" style={secondaryButtonStyle}>
              Contact Auros
            </a>
            <a href="/admin" style={secondaryButtonStyle}>
              Open Admin Dashboard
            </a>
          </div>
        </div>
      </section>

      <section style={{ ...sectionCardStyle, marginTop: 28 }}>
        <p
          style={{
            color: "#4cc9f0",
            fontWeight: 800,
            marginBottom: 10,
            fontSize: "13px",
            letterSpacing: "0.08em",
          }}
        >
          WHY THIS WEBSITE EXISTS
        </p>

        <h2 style={{ marginTop: 0, marginBottom: 14 }}>
          Built to keep Auros organized as it grows
        </h2>

        <p
          style={{
            color: "#9fb0d0",
            lineHeight: 1.8,
            marginTop: 0,
            marginBottom: 0,
            maxWidth: "920px",
          }}
        >
          This platform is more than a simple form. It gives Auros a structured
          way to recruit staff, manage updates, communicate progress, and keep
          public and internal systems connected. It is the foundation for future
          features like projects, news, staff pages, and a larger community hub.
        </p>
      </section>
    </>
  );
}