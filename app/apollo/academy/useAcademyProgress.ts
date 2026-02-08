"use client";

import { useMemo, useState, useCallback } from "react";

/** Minimal hook for compatibility with wealth/dashboard. Not wired to file-driven Academy. */
export function useAcademyProgress() {
  const [byTrack, setByTrack] = useState<Record<string, { completedLessonIds: string[] }>>({
    "web-fundamentals": { completedLessonIds: [] },
    "financial-literacy": { completedLessonIds: [] },
  });

  const state = useMemo(
    () => ({ byTrack }),
    [byTrack],
  );

  const isLessonCompleted = useCallback(
    (_trackId: string, _lessonId: string) => false,
    [],
  );

  const toggleLessonCompleted = useCallback(
    (_trackId: string, _lessonId: string) => {
      setByTrack((prev) => ({ ...prev }));
    },
    [],
  );

  const markStudyVisit = useCallback((_trackId: string) => {}, []);

  return {
    state,
    isLessonCompleted,
    toggleLessonCompleted,
    markStudyVisit,
  };
}
