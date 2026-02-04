import { LearningNode } from "../models/LearningNode"
import { Skill } from "../models/Skill"
import { Lesson } from "../models/Lesson"
import type { LearningNode as FileLearningNode } from "./learningIndex"

type NodeType = "project" | "skill" | "lesson"

const PROJECT_X = 0
const SKILL_X = 420
const LESSON_X = 880
const ROW_HEIGHT = 72
const GROUP_GAP = 96

function groupBy<T>(arr: T[], key: (t: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  arr.forEach((item) => {
    const k = key(item)
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(item)
  })
  return map
}

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
  const nodeIds = new Set<string>()

  function addNode(
    id: string,
    type: NodeType,
    label: string,
    x: number,
    y: number
  ) {
    if (nodeIds.has(id)) return
    nodeIds.add(id)
    graphNodes.push({
      id,
      type,
      data: { label, type },
      position: { x, y }
    })
  }

  // Projects: group by track/category for clearer layout
  const projectGroups = groupBy(
    nodes,
    (n) => `${n.track ?? "General"}|${n.category ?? "Uncategorized"}`
  )
  let projectY = 0
  projectGroups.forEach((group) => {
    const sorted = [...group].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    sorted.forEach((n) => {
      addNode(`project-${n.id}`, "project", n.title, PROJECT_X, projectY)
      n.skills?.forEach((skillId) => {
        edges.push({
          id: `p-${n.id}-s-${skillId}`,
          source: `project-${n.id}`,
          target: `skill-${skillId}`
        })
      })
      projectY += ROW_HEIGHT
    })
    projectY += GROUP_GAP
  })

  // Manager skills + lessons
  skills.forEach((s, i) => {
    addNode(`skill-${s.id}`, "skill", s.title, SKILL_X, i * ROW_HEIGHT)
    s.lessons?.forEach((lessonId) => {
      edges.push({
        id: `s-${s.id}-l-${lessonId}`,
        source: `skill-${s.id}`,
        target: `lesson-${lessonId}`
      })
    })
  })

  lessons.forEach((l, i) => {
    addNode(`lesson-${l.id}`, "lesson", l.title, LESSON_X, i * ROW_HEIGHT)
  })

  const learningNodes = fileLessons ?? []
  const skillCount = skills.length
  const lessonCount = lessons.length

  learningNodes
    .filter((n): n is FileLearningNode => n.type === "skill")
    .forEach((skill, index) => {
      addNode(
        `skill-${skill.id}`,
        "skill",
        skill.title,
        SKILL_X,
        (skillCount + index) * ROW_HEIGHT
      )
      skill.lessons?.forEach((lessonId) => {
        edges.push({
          id: `s-${skill.id}-l-${lessonId}`,
          source: `skill-${skill.id}`,
          target: `lesson-${lessonId}`
        })
      })
    })

  learningNodes
    .filter((n): n is FileLearningNode => n.type === "lesson")
    .forEach((lesson, index) => {
      addNode(
        `lesson-${lesson.id}`,
        "lesson",
        lesson.title,
        LESSON_X,
        (lessonCount + index) * ROW_HEIGHT
      )
    })

  return { graphNodes, edges }
}
