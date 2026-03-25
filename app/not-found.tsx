export default function NotFoundPage() {
  const cardStyle: React.CSSProperties = {
    background: "rgba(15, 27, 52, 0.74)",
    border: "1px solid rgba(34, 48, 77, 0.95)",
    borderRadius: "24px",
    padding: "40px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
    textAlign: "center",
    marginTop: "40px",
  };

  const ghostButtonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #22304d",
    background: "rgba(11, 21, 43, 0.9)",
    color: "white",
    textDecoration: "none",
    fontWeight: 600,
    textAlign: "center",
  };

  const primaryButtonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
    textAlign: "center",
    boxShadow: "0 14px 30px rgba(76, 201, 240, 0.18)",
  };

  return (
    <section style={cardStyle}>
      <p
        style={{
          color: "#4cc9f0",
          fontWeight: 800,
          marginBottom: 10,
          fontSize: "13px",
          letterSpacing: "0.08em",
        }}
      >
        ERROR 404
      </p>

      <h1 style={{ margin: 0, fontSize: "56px", lineHeight: 1.05 }}>
        Page not found
      </h1>

      <p
        style={{
          color: "#9fb0d0",
          lineHeight: 1.75,
          fontSize: "17px",
          maxWidth: "680px",
          margin: "18px auto 0 auto",
        }}
      >
        The page you are looking for does not exist or may have been moved.
        Return to the homepage or continue browsing the Auros website.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginTop: "24px",
        }}
      >
        <a href="/" style={primaryButtonStyle}>
          Go Home
        </a>
        <a href="/apply" style={ghostButtonStyle}>
          Open Applications
        </a>
        <a href="/status" style={ghostButtonStyle}>
          Check Status
        </a>
      </div>
    </section>
  );
}