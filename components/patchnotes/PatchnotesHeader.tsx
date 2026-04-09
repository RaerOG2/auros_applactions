"use client";

type PatchnotesHeaderProps = {
  loading: boolean;
  count: number;
  pillStyle: React.CSSProperties;
};

export default function PatchnotesHeader({
  loading,
  count,
  pillStyle,
}: PatchnotesHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "16px",
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: "18px",
      }}
    >
      <div>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Latest Changes</h2>
        <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.6 }}>
          All website and application system updates in one place.
        </p>
      </div>

      <span
        style={{
          ...pillStyle,
          background: "rgba(123, 97, 255, 0.12)",
          color: "#d7ccff",
          border: "1px solid rgba(123, 97, 255, 0.18)",
        }}
      >
        {loading
          ? "Loading..."
          : `${count} Patchnote${count === 1 ? "" : "s"}`}
      </span>
    </div>
  );
}