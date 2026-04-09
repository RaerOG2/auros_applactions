export const chatTheme = {
  pageBg: "linear-gradient(180deg, #0d0f12 0%, #14171c 100%)",
  shellBg: "rgba(17, 19, 24, 0.98)",
  panel: "rgba(28, 31, 36, 0.98)",
  panelSoft: "rgba(23, 25, 30, 0.98)",
  panelAlt: "rgba(18, 20, 24, 0.98)",
  panelHover: "rgba(36, 39, 45, 0.98)",
  border: "rgba(231, 201, 119, 0.14)",
  borderStrong: "rgba(231, 201, 119, 0.28)",
  text: "#f5f1e8",
  textSoft: "#d1c6ae",
  textMuted: "#948a76",
  accent: "#d4af37",
  accentSoft: "rgba(212, 175, 55, 0.14)",
  accentSoftStrong: "rgba(212, 175, 55, 0.22)",
  accentStrong: "#f0cc67",
  success: "#22c55e",
  danger: "#ef4444",
  idle: "#f59e0b",
  offline: "#6b7280",
  shadow: "0 20px 50px rgba(0,0,0,0.30)",
};

export const chatUi = {
  shellCard: {
    background: chatTheme.panel,
    border: `1px solid ${chatTheme.border}`,
    borderRadius: "20px",
    boxShadow: chatTheme.shadow,
    backdropFilter: "blur(12px)",
  } as React.CSSProperties,

  panelCard: {
    background: chatTheme.panelSoft,
    border: `1px solid ${chatTheme.border}`,
    borderRadius: "16px",
    boxShadow: "0 10px 28px rgba(0,0,0,0.24)",
  } as React.CSSProperties,

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: `1px solid ${chatTheme.border}`,
    background: chatTheme.panelAlt,
    color: chatTheme.text,
    outline: "none",
    fontSize: "14px",
  } as React.CSSProperties,

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 11px",
    borderRadius: "999px",
    border: `1px solid ${chatTheme.border}`,
    background: chatTheme.accentSoft,
    color: chatTheme.accentStrong,
    fontSize: "12px",
    fontWeight: 700,
  } as React.CSSProperties,

  ghostButton: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: `1px solid ${chatTheme.border}`,
    background: chatTheme.panelAlt,
    color: chatTheme.text,
    fontWeight: 700,
    cursor: "pointer",
  } as React.CSSProperties,

  accentButton: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: `1px solid ${chatTheme.borderStrong}`,
    background:
      "linear-gradient(180deg, rgba(212,175,55,0.22) 0%, rgba(240,204,103,0.10) 100%)",
    color: chatTheme.text,
    fontWeight: 800,
    cursor: "pointer",
  } as React.CSSProperties,
};