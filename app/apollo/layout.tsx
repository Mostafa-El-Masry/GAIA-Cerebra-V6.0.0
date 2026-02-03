"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export default function ApolloLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.title = "GAIA | Apollo";
  }, []);
  return <>{children}</>;
}
