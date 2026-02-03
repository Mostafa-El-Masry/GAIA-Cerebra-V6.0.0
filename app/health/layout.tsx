"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import HealthShell from "./components/HealthShell";

export default function HealthAwakeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = "GAIA | Health";
  }, []);
  return <HealthShell>{children}</HealthShell>;
}
