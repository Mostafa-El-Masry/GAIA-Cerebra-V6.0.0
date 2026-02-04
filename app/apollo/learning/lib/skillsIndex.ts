import { loadAllLessons } from "./lessonsSource"

export type Skill = {
  id: string
  title: string
  sourceLessons: string[]
}

function normalizeSkillName(name: string) {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\.(md|tsx)$/, "")
    .trim()
}

export function extractSkills(): Skill[] {
  const lessons = loadAllLessons()
  const skillMap = new Map<string, Skill>()

  lessons.forEach((lesson) => {
    const parts = [
      lesson.category,
      ...lesson.title.split(" ")
    ]

    parts.forEach((raw) => {
      const title = normalizeSkillName(raw)
      if (!title) return

      const id = title.toLowerCase().replace(/\s+/g, "-")

      if (!skillMap.has(id)) {
        skillMap.set(id, {
          id,
          title,
          sourceLessons: []
        })
      }

      skillMap.get(id)!.sourceLessons.push(lesson.id)
    })
  })

  return Array.from(skillMap.values())
}
