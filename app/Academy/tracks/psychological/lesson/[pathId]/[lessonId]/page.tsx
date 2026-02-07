"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const MAX_RESPONSE_LENGTH = 500;

type LessonData = {
  content: string;
  pathId: string;
  pathName: string;
  lessonId: string;
};

export default function PsychologicalLessonPage() {
  const params = useParams();
  const pathId = params.pathId as string;
  const lessonId = params.lessonId as string;
  const [data, setData] = useState<LessonData | null>(null);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [response, setResponse] = useState("");

  const todayIso = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/apollo/academy/calendar?start=2026-03-01&end=2026-12-31")
      .then((r) => r.json())
      .then((json: { entries?: { date: string; pathId: string; lessonId: string }[] }) => {
        if (cancelled) return;
        const entries = json.entries ?? [];
        const entry = entries.find(
          (e: { date: string; pathId: string; lessonId: string }) =>
            e.pathId === pathId && e.lessonId === lessonId,
        );
        setUnlocked(entry ? entry.date <= todayIso : false);
      })
      .catch(() => setUnlocked(false));
    return () => {
      cancelled = true;
    };
  }, [pathId, lessonId, todayIso]);

  const fetchContent = useCallback(async () => {
    if (!pathId || !lessonId) return;
    try {
      const res = await fetch(
        `/api/apollo/academy/lessons/content?pathId=${encodeURIComponent(pathId)}&lessonId=${encodeURIComponent(lessonId)}`,
      );
      if (!res.ok) return;
      const json = (await res.json()) as LessonData;
      setData(json);
    } catch {
      setData(null);
    }
  }, [pathId, lessonId]);

  useEffect(() => {
    if (unlocked === true) fetchContent();
  }, [unlocked, fetchContent]);

  if (unlocked === null) return null;
  if (unlocked === false) return null;
  if (!data) return null;

  return (
    <div>
      <p>{data.pathName}</p>
      <article>
        <ReactMarkdown>{data.content}</ReactMarkdown>
      </article>
      <label>
        Response
        <textarea
          value={response}
          onChange={(e) => {
            const next = e.target.value;
            if (next.length <= MAX_RESPONSE_LENGTH) setResponse(next);
          }}
          maxLength={MAX_RESPONSE_LENGTH}
        />
      </label>
      <p>{response.length} / {MAX_RESPONSE_LENGTH}</p>
    </div>
  );
}
