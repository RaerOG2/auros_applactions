"use client";

import { primaryButton, ghostButton } from "../../styles/ui";

export default function Button({
  children,
  variant = "primary",
  style,
  ...props
}: any) {
  const base = variant === "ghost" ? ghostButton : primaryButton;

  return (
    <button style={{ ...base, ...style }} {...props}>
      {children}
    </button>
  );
}