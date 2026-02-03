"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";
import LessonGate from "@/components/permissions/LessonGate";

export default function LockedLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.title = "GAIA | Locked";
  }, []);
  return (
    <PermissionGate permission="locked">
      <LessonGate featureLabel="Locked">{children}</LessonGate>
    </PermissionGate>
  );
}
