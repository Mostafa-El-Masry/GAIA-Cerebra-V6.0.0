"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const HARD_SKILLS_PATH_IDS = ["web-fundamentals", "financial-literacy"] as const;

type PathItem = {
  id: string;
  name: string;
  totalLessons: number;
  completedLessons: number;
  lessons: { id: string; completed: boolean; title?: string | null }[];
};

export default function HardSkillsTrackPage() {
  const [paths, setPaths] = useState<PathItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaths = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apollo/academy/paths");
      if (!res.ok) return;
      const data = (await res.json()) as { paths: PathItem[] };
      const filtered = (data.paths ?? []).filter((p) =>
        HARD_SKILLS_PATH_IDS.includes(p.id as (typeof HARD_SKILLS_PATH_IDS)[number]),
      );
      setPaths(filtered);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  if (loading) return null;

  return (
    <div>
      {paths.map((path) => (
        <div key={path.id}>
          <p>{path.name}</p>
          {path.lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/academy/tracks/hard-skills/lesson/${path.id}/${lesson.id}`}
            >
              {lesson.title ?? lesson.id}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
