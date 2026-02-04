import { LearningNode, ReflectionEntry } from "../models/LearningNode"

export function addReflection(
  nodes: LearningNode[],
  nodeId: string,
  text: string
): LearningNode[] {
  return nodes.map(n => {
    if (n.id !== nodeId) return n

    const entry: ReflectionEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      text
    }

    return {
      ...n,
      reflections: [...(n.reflections || []), entry]
    }
  })
}
