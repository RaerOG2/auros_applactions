"use client";

type PatchnotesHeroProps = {
  glassCardStyle: React.CSSProperties;
};

export default function PatchnotesHero({
  glassCardStyle,
}: PatchnotesHeroProps) {
  return (
    <section
      className="heroCard"
      style={{
        ...glassCardStyle,
        padding: "34px",
        marginBottom: "22px",
      }}
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
            WEBSITE / APP CHANGELOG
          </p>

          <h1
            className="heroTitle"
            style={{
              margin: 0,
              fontSize: "46px",
              lineHeight: 1.05,
              marginBottom: 12,
            }}
          >
            Patchnotes
          </h1>

          <p
            style={{
              color: "#9fb0d0",
              lineHeight: 1.7,
              marginTop: 0,
              marginBottom: 0,
              fontSize: "17px",
              maxWidth: "720px",
            }}
          >
            Here you can find all updates, fixes, design changes, admin
            improvements, and feature releases for the Auros application
            website.
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
            PATCHNOTE SYSTEM
          </p>

          <div style={{ display: "grid", gap: "12px" }}>
            {[
              "Written directly from the admin dashboard",
              "Loaded live from Supabase",
              "Sorted automatically by newest entry",
              "Publicly visible on this page",
            ].map((item, index) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "start",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  background: "#081225",
                  border: "1px solid #22304d",
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "999px",
                    background:
                      "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "13px",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ color: "#dbe7ff", lineHeight: 1.5 }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}