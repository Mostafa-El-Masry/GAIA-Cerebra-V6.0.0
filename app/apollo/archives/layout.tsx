"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export default function ArchivesLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.title = "GAIA | Archives";
  }, []);
  // Bypass gating so Archives are immediately accessible during review.
  return <>{children}</>;
}
