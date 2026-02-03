"use client";

import type { ReactNode } from "react";

type PermissionGateProps = {
  permission?: string;
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Permission gating removed: always renders children.
 */
export default function PermissionGate({
  children,
}: PermissionGateProps) {
  return <>{children}</>;
}
