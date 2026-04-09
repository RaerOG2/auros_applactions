"use client";

type ApplyHeroProps = {
  glassCardStyle: React.CSSProperties;
  ghostButtonStyle: React.CSSProperties;
  pillStyle: React.CSSProperties;
};

export default function ApplyHero({
  glassCardStyle,
  ghostButtonStyle,
  pillStyle,
}: ApplyHeroProps) {
  return (
    <>
      <div className="topRow">
        <a href="/" style={ghostButtonStyle}>
          ← Back to Home
        </a>

        <div className="topActions">
          <span style={pillStyle}>AUROS APPLICATIONS</span>
          <a href="/status" style={ghostButtonStyle}>
            Check Status
          </a>
        </div>
      </div>

      <section
        className="heroCard"
        style={{ ...glassCardStyle, padding: "34px", marginBottom: "22px" }}
      >
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
              OPEN STAFF APPLICATIONS
            </p>

            <h1
              className="heroTitle"
              style={{
                margin: 0,
                fontSize: "46px",
                lineHeight: 1.05,
                marginBottom: "16px",
              }}
            >
              Apply for Auros
            </h1>

            <p
              style={{
                color: "#9fb0d0",
                lineHeight: 1.75,
                fontSize: "17px",
                marginTop: 0,
                marginBottom: 0,
                maxWidth: "760px",
              }}
            >
              Choose an open role, review the full role details, answer the
              required questions, and submit your staff application directly to
              the Auros team.
            </p>
          </div>

          <div
            style={{
              background: "rgba(11, 21, 43, 0.84)",
              border: "1px solid #22304d",
              borderRadius: "20px",
              padding: "20px",
            }}
          >
            <p
              style={{
                marginTop: 0,
                marginBottom: "10px",
                color: "#4cc9f0",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.08em",
              }}
            >
              APPLICANT TOOLS
            </p>

            <div style={{ display: "grid", gap: "12px" }}>
              <a href="/status" style={ghostButtonStyle}>
                Check Application Status
              </a>
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "14px",
                  background: "#081225",
                  border: "1px solid #22304d",
                  color: "#dbe7ff",
                }}
              >
                After submitting, you receive a tracking code for status checks.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}