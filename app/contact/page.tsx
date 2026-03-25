"use client";

export default function ContactPage() {
  const glassCardStyle: React.CSSProperties = {
    background: "rgba(15, 27, 52, 0.74)",
    border: "1px solid rgba(34, 48, 77, 0.95)",
    borderRadius: "24px",
    padding: "24px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
  };

  const panelStyle: React.CSSProperties = {
    background: "rgba(11, 21, 43, 0.88)",
    border: "1px solid #22304d",
    borderRadius: "18px",
    padding: "18px",
  };

  const linkStyle: React.CSSProperties = {
    display: "inline-block",
    marginTop: "10px",
    color: "#95ecff",
    textDecoration: "none",
    fontWeight: 700,
  };

  return (
    <>
      <section style={{ ...glassCardStyle, marginBottom: "22px" }}>
        <p
          style={{
            color: "#4cc9f0",
            fontWeight: 800,
            marginBottom: 10,
            fontSize: "13px",
            letterSpacing: "0.08em",
          }}
        >
          CONTACT AUROS
        </p>

        <h1 style={{ margin: 0, fontSize: "46px", lineHeight: 1.05 }}>
          Contact & Community
        </h1>

        <p
          style={{
            color: "#9fb0d0",
            lineHeight: 1.75,
            fontSize: "17px",
            marginTop: 16,
            marginBottom: 0,
            maxWidth: "760px",
          }}
        >
          Need help, want to ask a question, or want to connect with the Auros
          community? Use the options below.
        </p>
      </section>

      <section style={glassCardStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px",
          }}
        >
          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Discord Server</h3>
            <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
              Join the Auros community server for updates, support, and team
              communication.
            </p>
            <a
              href="https://discord.gg/wYAmfDXJp6"
              target="_blank"
              rel="noreferrer"
              style={linkStyle}
            >
              Open Discord
            </a>
          </div>

          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Support</h3>
            <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
              For help with applications or website issues, contact the team
              through Discord or your official support email.
            </p>
            <a href="mailto:maurice.edel@outlook.com" style={linkStyle}>
              maurice.edel@outlook.com
            </a>
          </div>

          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Business / Project Contact</h3>
            <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
              For partnerships, project communication, or management inquiries,
              use the official business contact.
            </p>
            <a href="mailto:maurice.edel@outlook.com" style={linkStyle}>
              maurice.edel@outlook.com
            </a>
          </div>

          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Applications</h3>
            <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
              Want to join the Auros team? Visit the applications portal and
              submit your role application directly online.
            </p>
            <a href="/apply" style={linkStyle}>
              Go to Applications
            </a>
          </div>
        </div>
      </section>
    </>
  );
}