"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import WealthShell from "./components/WealthShell";

export default function WealthAwakeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = "GAIA | Wealth";
  }, []);
  return <WealthShell>{children}</WealthShell>;
}
