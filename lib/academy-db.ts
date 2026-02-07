/**
 * Academy Supabase layer: lesson meta, completion, quizzes.
 * When Supabase is not configured or tables are missing, returns safe defaults (no completion).
 */

import { supabase } from "@/lib/supabase-server";

export type LessonMeta = {
  lessonUuid: string;
  videoUrl: string | null;
  requiredMinutes: number;
  completed: boolean;
  completedAt: string | null;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

/** Get lesson row by path key and lesson slug. Returns null if not in DB. */
export async function getLessonMeta(
  pathKey: string,
  lessonSlug: string,
): Promise<LessonMeta | null> {
  if (!supabase) return null;
  try {
    const { data: pathRow, error: pathErr } = await supabase
      .from("academy_paths")
      .select("id")
      .eq("key", pathKey)
      .limit(1)
      .maybeSingle();
    if (pathErr || !pathRow?.id) return null;

    const { data: lesson, error } = await supabase
      .from("academy_lessons")
      .select("id, video_url, required_minutes, completed, completed_at")
      .eq("path_id", pathRow.id)
      .eq("slug", lessonSlug)
      .limit(1)
      .maybeSingle();
    if (error || !lesson) return null;

    return {
      lessonUuid: lesson.id,
      videoUrl: lesson.video_url ?? null,
      requiredMinutes: lesson.required_minutes ?? 15,
      completed: Boolean(lesson.completed),
      completedAt: lesson.completed_at ?? null,
    };
  } catch {
    return null;
  }
}

/** Get completed lesson slugs for a path (from DB only). */
export async function getCompletedIdsFromDb(pathKey: string): Promise<string[]> {
  if (!supabase) return [];
  try {
    const { data: pathRow, error: pathErr } = await supabase
      .from("academy_paths")
      .select("id")
      .eq("key", pathKey)
      .limit(1)
      .maybeSingle();
    if (pathErr || !pathRow?.id) return [];

    const { data: rows, error } = await supabase
      .from("academy_lessons")
      .select("slug")
      .eq("path_id", pathRow.id)
      .eq("completed", true);
    if (error) return [];
    return (rows ?? []).map((r) => r.slug);
  } catch {
    return [];
  }
}

/** Set lesson completed (irreversible). Only updates if not already completed. */
export async function setLessonCompleted(
  pathKey: string,
  lessonSlug: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Supabase not configured" };
  try {
    const client = supabase;

    const { data: pathRow, error: pathErr } = await client
      .from("academy_paths")
      .select("id")
      .eq("key", pathKey)
      .limit(1)
      .maybeSingle();
    if (pathErr || !pathRow?.id) return { ok: false, error: "Path not found" };

    const { data: lesson, error: lessonErr } = await client
      .from("academy_lessons")
      .select("id, completed")
      .eq("path_id", pathRow.id)
      .eq("slug", lessonSlug)
      .limit(1)
      .maybeSingle();
    if (lessonErr || !lesson) return { ok: false, error: "Lesson not found" };
    if (lesson.completed) return { ok: true }; // idempotent

    const { error: updateErr } = await client
      .from("academy_lessons")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", lesson.id);
    if (updateErr) return { ok: false, error: updateErr.message };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/** Get 10 quiz questions for a lesson (by lesson UUID). */
export async function getQuizzesForLesson(
  lessonUuid: string,
): Promise<QuizQuestion[]> {
  if (!supabase) return [];
  try {
    const { data: rows, error } = await supabase
      .from("academy_quizzes")
      .select("id, question, options, correct_answer")
      .eq("lesson_id", lessonUuid)
      .order("created_at", { ascending: true });
    if (error) return [];
    const list = (rows ?? []) as Array<{
      id: string;
      question: string;
      options: string[];
      correct_answer: string;
    }>;
    if (list.length !== 10) return []; // require exactly 10
    return list.map((r) => ({
      id: r.id,
      question: r.question,
      options: r.options,
      correctAnswer: r.correct_answer,
    }));
  } catch {
    return [];
  }
}
