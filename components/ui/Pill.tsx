"use client";

import { pill } from "../../styles/ui";

export default function Pill({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <span style={{ ...pill, ...style }}>{children}</span>;
}