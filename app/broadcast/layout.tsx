import type { ReactNode } from "react";

import "./broadcast.css";

type BroadcastLayoutProps = {
  children: ReactNode;
};

export default function BroadcastLayout({
  children,
}: BroadcastLayoutProps) {
  return <>{children}</>;
}
