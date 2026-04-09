"use client";

import { glassCard } from "../../styles/ui";

export default function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <section style={{ ...glassCard, ...style }}>{children}</section>;
}