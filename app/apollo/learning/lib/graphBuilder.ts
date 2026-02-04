import { LearningNode } from "../models/LearningNode"
import { Skill } from "../models/Skill"
import { Lesson } from "../models/Lesson"
import type { LearningNode as FileLearningNode } from "./learningIndex"

type NodeType = "project" | "skill" | "lesson"

export function buildGraph(
  nodes: LearningNode[],
  skills: Skill[],
  lessons: Lesson[],
  fileLessons?: FileLearningNode[]
) {
  const graphNodes: {
    id: string
    data: { label: string; type: NodeType }
    position: { x: number; y: number }
    type?: string
  }[] = []
  const edges: { id: string; source: string; target: string }[] = []

  const PROJECT_X = 0
  const SKILL_X = 300
  const LESSON_X = 600
  const ROW_HEIGHT = 120

  nodes.forEach((n, i) => {
    graphNodes.push({
      id: `project-${n.id}`,
      type: "project",
      data: { label: n.title, type: "project" },
      position: { x: PROJECT_X, y: i * ROW_HEIGHT }
    })

    n.skills?.forEach(skillId => {
      edges.push({
        id: `p-${n.id}-s-${skillId}`,
        source: `project-${n.id}`,
        target: `skill-${skillId}`
      })
    })
  })

  skills.forEach((s, i) => {
    graphNodes.push({
      id: `skill-${s.id}`,
      type: "skill",
      data: { label: s.title, type: "skill" },
      position: { x: SKILL_X, y: i * ROW_HEIGHT }
    })

    s.lessons?.forEach(lessonId => {
      edges.push({
        id: `s-${s.id}-l-${lessonId}`,
        source: `skill-${s.id}`,
        target: `lesson-${lessonId}`
      })
    })
  })

  lessons.forEach((l, i) => {
    graphNodes.push({
      id: `lesson-${l.id}`,
      type: "lesson",
      data: { label: l.title, type: "lesson" },
      position: { x: LESSON_X, y: i * ROW_HEIGHT }
    })
  })

  const learningNodes = fileLessons ?? []

  learningNodes
    .filter((n): n is FileLearningNode => n.type === "skill")
    .forEach((skill, index) => {
      graphNodes.push({
        id: `skill-${skill.id}`,
        type: "skill",
        data: { label: skill.title, type: "skill" },
        position: {
          x: SKILL_X,
          y: (skills.length + index) * 140
        }
      })
    })

  learningNodes
    .filter((n): n is FileLearningNode => n.type === "lesson")
    .forEach((lesson, index) => {
      graphNodes.push({
        id: `lesson-${lesson.id}`,
        type: "lesson",
        data: { label: lesson.title, type: "lesson" },
        position: {
          x: LESSON_X,
          y: (lessons.length + index) * 120
        }
      })
    })

  return { graphNodes, edges }
}
