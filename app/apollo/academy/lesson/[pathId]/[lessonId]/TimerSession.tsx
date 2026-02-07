"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  pathId: string;
  lessonId: string;
  durationMinutes: number;
  lessonType: "learning" | "sanctum";
  disabled?: boolean;
  onTimeRequirementMet?: () => void;
  onSanctumCompleted?: () => void;
};

export default function TimerSession({
  pathId,
  lessonId,
  durationMinutes,
  lessonType,
  disabled,
  onTimeRequirementMet,
  onSanctumCompleted,
}: Props) {
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durationSeconds = durationMinutes * 60;

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  useEffect(() => {
    if (!started || completed || disabled) return;
    if (elapsedSeconds >= durationSeconds) {
      stopTimer();
      setCompleted(true);
      const completeSession = async () => {
        if (!sessionId) return;
        const res = await fetch("/api/apollo/academy/lessons/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pathId,
            lessonId,
            action: "complete",
            sessionId,
            durationCompleted: durationSeconds,
          }),
        });
        if (res.ok) {
          if (lessonType === "learning") {
            onTimeRequirementMet?.();
          } else {
            onSanctumCompleted?.();
          }
        }
      };
      completeSession();
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [started, completed, disabled, elapsedSeconds, durationSeconds, sessionId, lessonType, pathId, lessonId, onTimeRequirementMet, onSanctumCompleted, stopTimer]);

  const handleStart = useCallback(async () => {
    if (disabled || started) return;
    const res = await fetch("/api/apollo/academy/lessons/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathId, lessonId, action: "start" }),
    });
    if (!res.ok) return;
    const json = (await res.json()) as { sessionId?: string };
    if (json.sessionId) {
      setSessionId(json.sessionId);
      setStarted(true);
    }
  }, [pathId, lessonId, disabled, started]);

  if (disabled) {
    return (
      <div className="mb-4 rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-4 py-2 text-sm text-[var(--gaia-text-muted)]">
        Session complete
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mb-4 rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-4 py-3">
        <p className="text-sm text-[var(--gaia-text-default)] mb-2">
          Duration: {durationMinutes} min. Timer runs only while this page is open. Navigating away resets progress.
        </p>
        <button
          type="button"
          onClick={handleStart}
          className="rounded-lg bg-[var(--gaia-contrast-bg)] px-4 py-2 text-sm font-medium text-[var(--gaia-contrast-text)]"
        >
          Start Session
        </button>
      </div>
    );
  }

  const remaining = Math.max(0, durationSeconds - elapsedSeconds);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const display = `${m}:${String(s).padStart(2, "0")}`;

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-4 py-2">
      <span className="text-sm font-medium text-[var(--gaia-text-default)]">
        Time: {display} remaining
      </span>
      {completed && (
        <span className="text-xs font-semibold text-[var(--gaia-positive)]">
          {lessonType === "sanctum" ? "Session complete" : "Time requirement met"}
        </span>
      )}
    </div>
  );
}
