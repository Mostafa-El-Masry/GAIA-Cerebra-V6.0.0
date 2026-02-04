import { loadAllLessons } from "./lessonsSource"
import { extractSkills } from "./skillsIndex"

export type LearningNode =
  | {
      type: "skill"
      id: string
      title: string
      lessons: string[]
    }
  | {
      type: "lesson"
      id: string
      title: string
      category: string
      path: string
    }

export function getLearningNodes(): LearningNode[] {
  const lessons = loadAllLessons()
  const skills = extractSkills()

  const skillNodes = skills.map((s) => ({
    type: "skill" as const,
    id: s.id,
    title: s.title,
    lessons: s.sourceLessons
  }))

  return [
    ...skillNodes,
    ...lessons.map((l) => ({
      type: "lesson" as const,
      id: l.id,
      title: l.title,
      category: l.category,
      path: l.path
    }))
  ]
}
