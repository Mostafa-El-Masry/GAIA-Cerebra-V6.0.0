import { LearningNode } from "../models/LearningNode"
import { Skill } from "../models/Skill"
import { Lesson } from "../models/Lesson"

export type CoherenceSignal = {
  id: string
  message: string
}

export function generateCoherenceSignals(
  nodes: LearningNode[],
  skills: Skill[],
  lessons: Lesson[]
): CoherenceSignal[] {
  const signals: CoherenceSignal[] = []

  const skillMap = new Map(skills.map(s => [s.id, s]))
  const lessonMap = new Map(lessons.map(l => [l.id, l]))

  // ---- Project checks
  nodes.forEach(node => {
    if (!node.skills || node.skills.length === 0) {
      signals.push({
        id: `${node.id}-no-skills`,
        message: `Project "${node.title}" has no linked skills`
      })
    }

    node.skills?.forEach(skillId => {
      if (!skillMap.has(skillId)) {
        signals.push({
          id: `${node.id}-missing-skill-${skillId}`,
          message: `Project "${node.title}" references missing skill`
        })
      }
    })
  })

  // ---- Skill checks
  skills.forEach(skill => {
    const usedBy = nodes.some(n => n.skills?.includes(skill.id))
    if (!usedBy) {
      signals.push({
        id: `skill-orphan-${skill.id}`,
        message: `Skill "${skill.title}" is not used by any project`
      })
    }

    if (!skill.lessons || skill.lessons.length === 0) {
      signals.push({
        id: `skill-no-lessons-${skill.id}`,
        message: `Skill "${skill.title}" has no lessons`
      })
    }

    skill.lessons?.forEach(lessonId => {
      if (!lessonMap.has(lessonId)) {
        signals.push({
          id: `skill-missing-lesson-${lessonId}`,
          message: `Skill "${skill.title}" references missing lesson`
        })
      }
    })
  })

  // ---- Lesson checks
  lessons.forEach(lesson => {
    const linked = skills.some(s =>
      s.lessons?.includes(lesson.id)
    )

    if (!linked) {
      signals.push({
        id: `lesson-orphan-${lesson.id}`,
        message: `Lesson "${lesson.title}" is not linked to any skill`
      })
    }
  })

  return signals
}
