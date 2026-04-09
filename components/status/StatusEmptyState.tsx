"use client";

type StatusEmptyStateProps = {
  searched: boolean;
  loading: boolean;
  messageBoxStyle: React.CSSProperties;
};

export default function StatusEmptyState({
  searched,
  loading,
  messageBoxStyle,
}: StatusEmptyStateProps) {
  if (!searched) {
    return <div style={messageBoxStyle}>No status loaded yet.</div>;
  }

  if (!loading) {
    return <div style={messageBoxStyle}>No result found.</div>;
  }

  return null;
}