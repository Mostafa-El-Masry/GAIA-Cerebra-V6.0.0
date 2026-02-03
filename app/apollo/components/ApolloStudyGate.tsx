"use client";

import type { ReactNode } from "react";

type ApolloStudyGateProps = {
  children: ReactNode;
  featureLabel?: string;
  fallback?: ReactNode;
};

/**
 * Lesson-based gating removed: always renders children.
 */
export default function ApolloStudyGate({
  children,
}: ApolloStudyGateProps) {
  return <>{children}</>;
}
