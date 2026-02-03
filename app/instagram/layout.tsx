"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export default function InstagramLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.title = "GAIA | Instagram";
  }, []);
  return <>{children}</>;
}
