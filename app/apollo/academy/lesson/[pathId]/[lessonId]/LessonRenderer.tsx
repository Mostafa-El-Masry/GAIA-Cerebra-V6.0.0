"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import TimerSession from "./TimerSession";
import SanctumReflections from "./SanctumReflections";

export type LessonDataType = "learning" | "sanctum";

export type LessonData = {
  content: string;
  pathId: string;
  pathName: string;
  lessonId: string;
  videoUrl: string | null;
  requiredMinutes: number;
  completed: boolean;
  completedAt: string | null;
  lessonUuid: string | null;
  lessonType: LessonDataType;
  durationMinutes: number;
  allowsReflection: boolean;
  allowsAudio: boolean;
  allowsVideo: boolean;
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

type Props = {
  data: LessonData;
  pathId: string;
  lessonId: string;
  onDataUpdate?: (next: LessonData) => void;
};

export default function LessonRenderer({ data, pathId, lessonId, onDataUpdate }: Props) {
  const isLearning = data.lessonType === "learning";
  const isSanctum = data.lessonType === "sanctum";

  const [activeTab, setActiveTab] = useState<"lesson" | "quiz">("lesson");
  const [timeRequirementMet, setTimeRequirementMet] = useState(false);
  const [questionPool, setQuestionPool] = useState<QuizQuestion[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [lockedQuestionIds, setLockedQuestionIds] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizShowFeedback, setQuizShowFeedback] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionPathProgress, setCompletionPathProgress] = useState<{
    pathName: string;
    completed: number;
    total: number;
  } | null>(null);

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/apollo/academy/lessons/quizzes?pathId=${encodeURIComponent(pathId)}&lessonId=${encodeURIComponent(lessonId)}`,
      );
      if (!res.ok) throw new Error("Quiz not available");
      const json = (await res.json()) as { questions: QuizQuestion[] };
      const pool = json.questions ?? [];
      setQuestionPool(pool);
      if (pool.length >= 10) {
        const ten = shuffle([...pool]).slice(0, 10);
        setCurrentQuestions(ten);
      } else {
        setCurrentQuestions(pool);
      }
      setLockedQuestionIds(new Set());
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizPassed(false);
      setQuizShowFeedback(false);
    } catch {
      setQuestionPool([]);
      setCurrentQuestions([]);
    }
  }, [pathId, lessonId]);

  useEffect(() => {
    if (isLearning && activeTab === "quiz" && timeRequirementMet && !data.completed && !committed) {
      fetchQuiz();
    }
  }, [isLearning, activeTab, timeRequirementMet, data.completed, committed, fetchQuiz]);

  const handleCommit = useCallback(async () => {
    setCommitting(true);
    try {
      const res = await fetch("/api/apollo/academy/lessons/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathId, lessonId }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const json = (await res.json()) as {
        ok?: boolean;
        pathProgress?: { pathName: string; completed: number; total: number };
      };
      setCommitted(true);
      onDataUpdate?.({ ...data, completed: true, completedAt: new Date().toISOString() });
      if (json.pathProgress) {
        setCompletionPathProgress(json.pathProgress);
        setShowCompletionModal(true);
        try {
          window.sessionStorage.setItem("academy_recent_completion", "1");
        } catch {
          // ignore
        }
      }
    } catch {
      setCommitting(false);
    } finally {
      setCommitting(false);
    }
  }, [pathId, lessonId, data, onDataUpdate]);

  const handleQuizSubmit = useCallback(() => {
    if (!currentQuestions.length) return;
    const correctIds = new Set(
      currentQuestions
        .filter((q) => quizAnswers[q.id] === q.correctAnswer)
        .map((q) => q.id),
    );
    const allCorrect = correctIds.size === currentQuestions.length;
    setQuizSubmitted(true);
    setQuizPassed(allCorrect);
    if (allCorrect) {
      handleCommit();
    } else {
      setLockedQuestionIds(correctIds);
      setQuizShowFeedback(true);
    }
  }, [currentQuestions, quizAnswers, handleCommit]);

  const handleQuizContinue = useCallback(() => {
    const wrongIndices: number[] = [];
    currentQuestions.forEach((q, i) => {
      if (quizAnswers[q.id] !== q.correctAnswer) wrongIndices.push(i);
    });
    const usedIds = new Set(currentQuestions.map((q) => q.id));
    const replacementPool = questionPool.filter((q) => !usedIds.has(q.id));
    const newPicks = shuffle([...replacementPool]).slice(0, wrongIndices.length);
    if (newPicks.length < wrongIndices.length) {
      fetchQuiz();
      return;
    }
    let wrongIdx = 0;
    const next: QuizQuestion[] = currentQuestions.map((q, i) =>
      wrongIndices.includes(i) ? newPicks[wrongIdx++]! : q,
    );
    setCurrentQuestions(next);
    const keepAnswers = { ...quizAnswers };
    newPicks.forEach((q) => delete keepAnswers[q.id]);
    setQuizAnswers(keepAnswers);
    setQuizSubmitted(false);
    setQuizShowFeedback(false);
  }, [currentQuestions, questionPool, quizAnswers, fetchQuiz]);

  useEffect(() => {
    if (!showCompletionModal) return;
    const t = setTimeout(() => setShowCompletionModal(false), 4000);
    return () => clearTimeout(t);
  }, [showCompletionModal]);

  const handleSanctumCompleted = useCallback(() => {
    onDataUpdate?.({ ...data, completed: true, completedAt: new Date().toISOString() });
    try {
      window.sessionStorage.setItem("academy_recent_completion", "1");
    } catch {
      // ignore
    }
  }, [data, onDataUpdate]);

  const isCompleted = data.completed || committed;
  const pathPct =
    completionPathProgress && completionPathProgress.total > 0
      ? Math.round((completionPathProgress.completed / completionPathProgress.total) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {showCompletionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="completion-modal-title"
          onClick={() => setShowCompletionModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="completion-modal-title" className="text-lg font-semibold text-[var(--gaia-text-strong)]">
              Lesson completed
            </h2>
            <p className="mt-1 text-sm text-[var(--gaia-text-muted)]">You finished this lesson</p>
            {completionPathProgress && (
              <div className="mt-4">
                <p className="text-sm font-medium text-[var(--gaia-text-default)]">
                  {completionPathProgress.pathName} — {pathPct}% completed
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--gaia-surface-soft)]">
                  <div
                    className="h-full rounded-full bg-[var(--gaia-positive)] transition-all duration-300"
                    style={{ width: `${Math.min(100, pathPct)}%` }}
                  />
                </div>
              </div>
            )}
            <p className="mt-4 text-xs text-[var(--gaia-text-muted)]">Click anywhere or wait to dismiss</p>
          </div>
        </div>
      )}

      <Link
        href="/apollo/academy"
        className="mb-6 inline-block text-sm font-medium text-[var(--gaia-text-muted)] hover:text-[var(--gaia-text-default)]"
      >
        ← Back to Academy
      </Link>
      <p className="mb-2 text-xs uppercase tracking-wider text-[var(--gaia-text-muted)]">{data.pathName}</p>

      {isCompleted ? (
        <div className="rounded-lg border border-[var(--gaia-positive)] bg-[var(--gaia-positive-bg)] px-4 py-3 text-sm font-medium text-[var(--gaia-positive)]">
          Completed
        </div>
      ) : (
        <>
          {isLearning && (
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
          )}

          {((isLearning && activeTab === "lesson") || isSanctum) && (
            <>
              {!isLearning && (
                <TimerSession
                  pathId={pathId}
                  lessonId={lessonId}
                  durationMinutes={data.durationMinutes}
                  lessonType="sanctum"
                  disabled={data.completed}
                  onSanctumCompleted={handleSanctumCompleted}
                />
              )}
              {isLearning && (
                <TimerSession
                  pathId={pathId}
                  lessonId={lessonId}
                  durationMinutes={data.durationMinutes}
                  lessonType="learning"
                  disabled={data.completed || committed}
                  onTimeRequirementMet={() => setTimeRequirementMet(true)}
                />
              )}
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
              {isSanctum && (data.allowsReflection || data.allowsAudio || data.allowsVideo) && (
                <SanctumReflections
                  pathId={pathId}
                  lessonId={lessonId}
                  lessonUuid={data.lessonUuid}
                  allowsReflection={data.allowsReflection}
                  allowsAudio={data.allowsAudio}
                  allowsVideo={data.allowsVideo}
                />
              )}
            </>
          )}

          {isLearning && activeTab === "quiz" && (
            <div className="space-y-6">
              {currentQuestions.length === 0 && !quizSubmitted && (
                <p className="text-sm text-[var(--gaia-text-muted)]">Loading quiz…</p>
              )}
              {currentQuestions.length > 0 && (
                <>
                  <p className="text-xs text-[var(--gaia-text-muted)]">
                    Answer all 10 questions. You need 10/10 correct to complete. Incorrect questions will be replaced from the pool.
                  </p>
                  {currentQuestions.map((q) => {
                    const locked = lockedQuestionIds.has(q.id);
                    const userAnswer = quizAnswers[q.id];
                    const isCorrect = userAnswer === q.correctAnswer;
                    const showWrong = quizShowFeedback && !locked && userAnswer !== undefined && !isCorrect;
                    return (
                      <div
                        key={q.id}
                        className={`rounded-lg border p-4 ${
                          locked
                            ? "border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] opacity-80"
                            : showWrong
                              ? "border-red-500 bg-red-50/50 dark:bg-red-950/20"
                              : "border-[var(--gaia-border)]"
                        }`}
                      >
                        <p className="mb-3 font-medium text-[var(--gaia-text-strong)]">{q.question}</p>
                        {locked ? (
                          <p className="text-sm text-[var(--gaia-positive)]">Correct: {q.correctAnswer}</p>
                        ) : (
                          <ul className="space-y-2">
                            {shuffle(q.options).map((opt) => {
                              const showAsCorrect = quizShowFeedback && opt === q.correctAnswer;
                              const showAsWrong = quizShowFeedback && userAnswer === opt && opt !== q.correctAnswer;
                              return (
                                <li key={opt}>
                                  <label
                                    className={`flex cursor-pointer items-center gap-2 ${
                                      showAsWrong ? "text-red-600 dark:text-red-400" : ""
                                    } ${showAsCorrect ? "font-medium text-[var(--gaia-positive)]" : ""}`}
                                  >
                                    <input
                                      type="radio"
                                      name={q.id}
                                      checked={userAnswer === opt}
                                      onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                      className="rounded border-[var(--gaia-border)]"
                                      disabled={quizShowFeedback}
                                    />
                                    <span className="text-sm text-[var(--gaia-text-default)]">
                                      {opt}
                                      {showAsCorrect && " ✓"}
                                      {showAsWrong && " ✗"}
                                    </span>
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                  {!quizSubmitted ? (
                    <button
                      type="button"
                      disabled={Object.keys(quizAnswers).length !== currentQuestions.length}
                      onClick={handleQuizSubmit}
                      className="rounded-lg bg-[var(--gaia-contrast-bg)] px-4 py-2 text-sm font-semibold text-[var(--gaia-contrast-text)] disabled:opacity-50"
                    >
                      Submit quiz
                    </button>
                  ) : quizPassed ? (
                    <p className="font-medium text-[var(--gaia-positive)]">
                      {committing ? "Saving…" : "Quiz passed. Lesson completed."}
                    </p>
                  ) : quizShowFeedback ? (
                    <>
                      <p className="font-medium text-[var(--gaia-text-muted)]">
                        Some answers were incorrect. Correct answers are shown. Incorrect questions will be replaced.
                      </p>
                      <button
                        type="button"
                        onClick={handleQuizContinue}
                        className="mt-2 rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-4 py-2 text-sm font-medium"
                      >
                        Continue
                      </button>
                    </>
                  ) : null}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
