"use client";

import type { ReactNode } from "react";

type LessonGateProps = {
  children: ReactNode;
  minLessons?: number;
  featureLabel?: string;
  fallback?: ReactNode;
};

/**
 * Lesson-based gating removed: always renders children.
 */
export default function LessonGate({ children }: LessonGateProps) {
  return <>{children}</>;
}
