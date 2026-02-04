import { Lesson } from "../models/Lesson"

const KEY = "gaia.lessons"

export function loadLessons(): Lesson[] {
  if (typeof window === "undefined") return []
  return JSON.parse(window.localStorage.getItem(KEY) || "[]")
}

export function saveLessons(lessons: Lesson[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(lessons))
}
