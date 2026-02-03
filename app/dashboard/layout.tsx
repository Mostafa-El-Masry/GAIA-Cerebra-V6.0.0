"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.title = "GAIA | Dashboard";
  }, []);
  return <>{children}</>;
}
