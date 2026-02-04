import { LearningNode } from "../models/LearningNode"
import { Skill } from "../models/Skill"
import { Lesson } from "../models/Lesson"

export function buildGraph(
  nodes: LearningNode[],
  skills: Skill[],
  lessons: Lesson[]
) {
  const graphNodes: { id: string; data: { label: string }; position: { x: number; y: number }; type?: string }[] = []
  const edges: { id: string; source: string; target: string }[] = []

  nodes.forEach(n => {
    graphNodes.push({
      id: `project-${n.id}`,
      data: { label: n.title },
      position: { x: 0, y: 0 },
      type: "default"
    })

    n.skills?.forEach(skillId => {
      edges.push({
        id: `p-${n.id}-s-${skillId}`,
        source: `project-${n.id}`,
        target: `skill-${skillId}`
      })
    })
  })

  skills.forEach(s => {
    graphNodes.push({
      id: `skill-${s.id}`,
      data: { label: s.title },
      position: { x: 0, y: 0 }
    })

    s.lessons?.forEach(lessonId => {
      edges.push({
        id: `s-${s.id}-l-${lessonId}`,
        source: `skill-${s.id}`,
        target: `lesson-${lessonId}`
      })
    })
  })

  lessons.forEach(l => {
    graphNodes.push({
      id: `lesson-${l.id}`,
      data: { label: l.title },
      position: { x: 0, y: 0 }
    })
  })

  return { graphNodes, edges }
}
