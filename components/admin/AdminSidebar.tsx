"use client";

type AdminSectionKey =
  | "overview"
  | "applications"
  | "jobs"
  | "patchnotes"
  | "logs";

type AdminSidebarProps = {
  activeSection: AdminSectionKey;
  setActiveSection: (section: AdminSectionKey) => void;
};

const navItems: Array<{ key: AdminSectionKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "applications", label: "Applications" },
  { key: "jobs", label: "Jobs" },
  { key: "patchnotes", label: "Patchnotes" },
  { key: "logs", label: "Logs" },
];

export default function AdminSidebar({
  activeSection,
  setActiveSection,
}: AdminSidebarProps) {
  return (
    <aside
      style={{
        background: "rgba(15, 27, 52, 0.74)",
        border: "1px solid rgba(34, 48, 77, 0.95)",
        borderRadius: "24px",
        padding: "18px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
        height: "fit-content",
        position: "sticky",
        top: 16,
      }}
    >
      <p
        style={{
          color: "#4cc9f0",
          fontWeight: 800,
          marginTop: 0,
          marginBottom: 14,
          fontSize: "12px",
          letterSpacing: "0.08em",
        }}
      >
        ADMIN NAVIGATION
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {navItems.map((item) => {
          const active = activeSection === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: "14px",
                border: active
                  ? "1px solid rgba(76, 201, 240, 0.35)"
                  : "1px solid #22304d",
                background: active
                  ? "linear-gradient(90deg, rgba(76, 201, 240, 0.16) 0%, rgba(123, 97, 255, 0.14) 100%)"
                  : "rgba(11, 21, 43, 0.9)",
                color: "white",
                cursor: "pointer",
                fontWeight: active ? 800 : 600,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}