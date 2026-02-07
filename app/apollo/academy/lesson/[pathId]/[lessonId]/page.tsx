"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type LessonData = {
  content: string;
  pathId: string;
  pathName: string;
  lessonId: string;
  videoUrl: string | null;
  requiredMinutes: number;
  completed: boolean;
  completedAt: string | null;
  lessonUuid: string | null;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export default function AcademyLessonPage() {
  const params = useParams();
  const pathId = params.pathId as string;
  const lessonId = params.lessonId as string;
  const [data, setData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"lesson" | "quiz">("lesson");

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timeRequirementMet, setTimeRequirementMet] = useState(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const requiredSecondsRef = useRef(0);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [committing, setCommitting] = useState(false);

  const fetchContent = useCallback(async () => {
    if (!pathId || !lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/apollo/academy/lessons/content?pathId=${encodeURIComponent(pathId)}&lessonId=${encodeURIComponent(lessonId)}`,
      );
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to load lesson");
      }
      const json = (await res.json()) as LessonData;
      setData(json);
      if (!json.completed) {
        requiredSecondsRef.current = (json.requiredMinutes ?? 15) * 60;
        setTimerSeconds(0);
        elapsedRef.current = 0;
        setTimeRequirementMet(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load lesson");
    } finally {
      setLoading(false);
    }
  }, [pathId, lessonId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Timer: only runs when page visible and on lesson tab. Resets on leave. No persistence.
  useEffect(() => {
    if (!data || data.completed || committed) return;
    const required = requiredSecondsRef.current;
    if (required <= 0) return;

    const tick = () => {
      elapsedRef.current += 1;
      setTimerSeconds(elapsedRef.current);
      if (elapsedRef.current >= required) {
        setTimeRequirementMet(true);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      } else if (document.visibilityState === "visible" && activeTab === "lesson") {
        if (!timeRequirementMet && elapsedRef.current < required) {
          timerIntervalRef.current = setInterval(tick, 1000);
        }
      }
    };

    if (activeTab === "lesson" && document.visibilityState === "visible" && !timeRequirementMet && elapsedRef.current < required) {
      timerIntervalRef.current = setInterval(tick, 1000);
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [data, activeTab, timeRequirementMet]);

  // Reset timer when navigating away (router or unmount): no persistence, so next visit starts at 0.
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/apollo/academy/lessons/quizzes?pathId=${encodeURIComponent(pathId)}&lessonId=${encodeURIComponent(lessonId)}`,
      );
      if (!res.ok) throw new Error("Quiz not available");
      const json = (await res.json()) as { questions: QuizQuestion[] };
      setQuizQuestions(json.questions ?? []);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizPassed(false);
    } catch {
      setQuizQuestions([]);
    }
  }, [pathId, lessonId]);

  useEffect(() => {
    if (activeTab === "quiz" && timeRequirementMet && data && !data.completed && !committed) {
      fetchQuiz();
    }
  }, [activeTab, timeRequirementMet, data, committed, fetchQuiz]);

  const handleCommit = useCallback(async () => {
    setCommitting(true);
    try {
      const res = await fetch("/api/apollo/academy/lessons/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathId, lessonId }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setCommitted(true);
      setData((d) => (d ? { ...d, completed: true, completedAt: new Date().toISOString() } : d));
    } catch {
      setCommitting(false);
    } finally {
      setCommitting(false);
    }
  }, [pathId, lessonId]);

  const handleQuizSubmit = useCallback(() => {
    if (!quizQuestions.length) return;
    const allCorrect = quizQuestions.every((q) => quizAnswers[q.id] === q.correctAnswer);
    setQuizSubmitted(true);
    setQuizPassed(allCorrect);
    if (allCorrect) {
      handleCommit();
    }
  }, [quizQuestions, quizAnswers, handleCommit]);

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-[var(--gaia-text-muted)]">Loading lesson…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-red-600">{error ?? "Lesson not found."}</p>
        <Link
          href="/apollo/academy"
          className="mt-4 inline-block text-sm font-medium text-[var(--gaia-text-default)] underline"
        >
          Back to Academy
        </Link>
      </div>
    );
  }

  const isCompleted = data.completed || committed;
  const requiredSeconds = (data.requiredMinutes ?? 15) * 60;
  const timerDisplay = `${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, "0")}`;
  const requiredDisplay = `${Math.floor(requiredSeconds / 60)}:${String(requiredSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/apollo/academy"
        className="mb-6 inline-block text-sm font-medium text-[var(--gaia-text-muted)] hover:text-[var(--gaia-text-default)]"
      >
        ← Back to Academy
      </Link>
      <p className="mb-2 text-xs uppercase tracking-wider text-[var(--gaia-text-muted)]">
        {data.pathName}
      </p>

      {isCompleted ? (
        <div className="rounded-lg border border-[var(--gaia-positive)] bg-[var(--gaia-positive-bg)] px-4 py-3 text-sm font-medium text-[var(--gaia-positive)]">
          Completed
        </div>
      ) : (
        <>
          <div className="mb-4 flex gap-2 border-b border-[var(--gaia-border)]">
            <button
              type="button"
              onClick={() => setActiveTab("lesson")}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                activeTab === "lesson"
                  ? "border-[var(--gaia-contrast-bg)] text-[var(--gaia-text-strong)]"
                  : "border-transparent text-[var(--gaia-text-muted)]"
              }`}
            >
              Lesson
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              disabled={!timeRequirementMet}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                activeTab === "quiz"
                  ? "border-[var(--gaia-contrast-bg)] text-[var(--gaia-text-strong)]"
                  : !timeRequirementMet
                    ? "cursor-not-allowed border-transparent text-[var(--gaia-text-muted)] opacity-60"
                    : "border-transparent text-[var(--gaia-text-muted)]"
              }`}
            >
              Quiz
            </button>
          </div>

          {activeTab === "lesson" && (
            <>
              <div className="mb-4 flex items-center justify-between rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-4 py-2">
                <span className="text-sm font-medium text-[var(--gaia-text-default)]">
                  Time: {timerDisplay} / {requiredDisplay}
                </span>
                {timeRequirementMet && (
                  <span className="text-xs font-semibold text-[var(--gaia-positive)]">Time requirement met</span>
                )}
              </div>
              {data.videoUrl && (
                <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg bg-black">
                  <iframe
                    title="Lesson video"
                    src={
                      data.videoUrl.includes("/embed/")
                        ? data.videoUrl
                        : `https://www.youtube.com/embed/${(data.videoUrl.match(/[?&]v=([^&]+)/) ?? [])[1] ?? ""}`
                    }
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-[var(--gaia-text-default)] prose-ul:text-[var(--gaia-text-default)] prose-li:text-[var(--gaia-text-default)]">
                <ReactMarkdown>{data.content}</ReactMarkdown>
              </article>
            </>
          )}

          {activeTab === "quiz" && (
            <div className="space-y-6">
              {quizQuestions.length === 0 && !quizSubmitted && (
                <p className="text-sm text-[var(--gaia-text-muted)]">Loading quiz…</p>
              )}
              {quizQuestions.length > 0 && (
                <>
                  {quizQuestions.map((q) => (
                    <div key={q.id} className="rounded-lg border border-[var(--gaia-border)] p-4">
                      <p className="mb-3 font-medium text-[var(--gaia-text-strong)]">{q.question}</p>
                      <ul className="space-y-2">
                        {shuffle(q.options).map((opt) => (
                          <li key={opt}>
                            <label className="flex cursor-pointer items-center gap-2">
                              <input
                                type="radio"
                                name={q.id}
                                checked={quizAnswers[q.id] === opt}
                                onChange={() =>
                                  setQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))
                                }
                                className="rounded border-[var(--gaia-border)]"
                              />
                              <span className="text-sm text-[var(--gaia-text-default)]">{opt}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {!quizSubmitted ? (
                    <button
                      type="button"
                      disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                      onClick={handleQuizSubmit}
                      className="rounded-lg bg-[var(--gaia-contrast-bg)] px-4 py-2 text-sm font-semibold text-[var(--gaia-contrast-text)] disabled:opacity-50"
                    >
                      Submit quiz
                    </button>
                  ) : quizPassed ? (
                    <p className="font-medium text-[var(--gaia-positive)]">
                      {committing ? "Saving…" : "Quiz passed. Lesson completed."}
                    </p>
                  ) : (
                    <>
                      <p className="font-medium text-red-600">Not passed. One or more answers were incorrect. Retake allowed.</p>
                      <button
                        type="button"
                        onClick={() => { setQuizSubmitted(false); fetchQuiz(); }}
                        className="mt-2 rounded-lg border border-[var(--gaia-border)] px-4 py-2 text-sm font-medium"
                      >
                        Retake quiz
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
