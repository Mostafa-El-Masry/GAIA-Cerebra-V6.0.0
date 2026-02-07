"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

type LessonData = {
  content: string;
  pathId: string;
  pathName: string;
  lessonId: string;
  videoUrl: string | null;
};

export default function HardSkillsLessonPage() {
  const params = useParams();
  const pathId = params.pathId as string;
  const lessonId = params.lessonId as string;
  const [data, setData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    if (!pathId || !lessonId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/apollo/academy/lessons/content?pathId=${encodeURIComponent(pathId)}&lessonId=${encodeURIComponent(lessonId)}`,
      );
      if (!res.ok) return;
      const json = (await res.json()) as LessonData;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [pathId, lessonId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (loading || !data) return null;

  return (
    <div>
      <Link href="/academy/tracks/hard-skills">Back</Link>
      <p>{data.pathName}</p>
      {data.videoUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
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
      <article>
        <ReactMarkdown>{data.content}</ReactMarkdown>
      </article>
    </div>
  );
}
