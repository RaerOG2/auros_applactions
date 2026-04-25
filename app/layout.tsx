import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "../styles/auros-channel.css";
import { Geist, Geist_Mono } from "next/font/google";
import AurosSiteShell from "../components/AurosSiteShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auros Royale Website",
  description: "Official Website for Auros Royale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AurosSiteShell>{children}</AurosSiteShell>
      </body>
    </html>
  );
}