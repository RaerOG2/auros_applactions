"use client";

import Link from "next/link";
import { chatTheme, chatUi } from "../../../lib/chat-theme";

type ChatGuildSidebarProps = {
  currentView: "friends" | "dm" | "channel";
  totalDmUnread?: number;
  totalChannelUnread?: number;
};

function unreadBadge(count: number) {
  if (count <= 0) return null;

  return (
    <span
      style={{
        position: "absolute",
        right: -4,
        top: -4,
        minWidth: 22,
        height: 22,
        padding: "0 6px",
        borderRadius: 999,
        background: "#ef4444",
        color: "white",
        fontSize: 12,
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${chatTheme.shellBg}`,
      }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

function itemStyle(active: boolean): React.CSSProperties {
  return {
    ...chatUi.ghostButton,
    width: 52,
    height: 52,
    padding: 0,
    borderRadius: 18,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: active ? chatTheme.accentSoftStrong : chatTheme.panelAlt,
    border: active
      ? `1px solid ${chatTheme.borderStrong}`
      : `1px solid ${chatTheme.border}`,
    fontWeight: 900,
    textDecoration: "none",
  };
}

function activeRail(active: boolean) {
  if (!active) return null;

  return (
    <span
      style={{
        position: "absolute",
        left: -10,
        top: "50%",
        transform: "translateY(-50%)",
        width: 4,
        height: 30,
        borderRadius: 999,
        background: chatTheme.accentStrong,
      }}
    />
  );
}

export default function ChatGuildSidebar({
  currentView,
  totalDmUnread = 0,
  totalChannelUnread = 0,
}: ChatGuildSidebarProps) {
  return (
    <aside
      style={{
        ...chatUi.shellCard,
        padding: 12,
        display: "grid",
        gap: 12,
        alignContent: "start",
        background: chatTheme.panelSoft,
      }}
    >
      <Link href="/chat?view=friends" style={itemStyle(currentView === "friends")}>
        {activeRail(currentView === "friends")}
        AU
      </Link>

      <Link href="/chat?view=friends" style={itemStyle(currentView === "friends")}>
        {activeRail(currentView === "friends")}
        F
      </Link>

      <Link href="/chat?channel=general" style={itemStyle(currentView === "channel")}>
        {activeRail(currentView === "channel")}
        #
        {unreadBadge(totalChannelUnread)}
      </Link>

      <Link href="/chat?dm=home" style={itemStyle(currentView === "dm")}>
        {activeRail(currentView === "dm")}
        DM
        {unreadBadge(totalDmUnread)}
      </Link>
    </aside>
  );
}