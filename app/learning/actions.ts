"use server"

import { getNodes, saveNodes } from "./lib/nodeManager"
import { LearningNode } from "./models/LearningNode"

export async function loadLearningNodes(): Promise<LearningNode[]> {
  return getNodes()
}

export async function updateLearningNodeStatus(
  id: string,
  status: LearningNode["status"]
) {
  const nodes = getNodes()
  const index = nodes.findIndex(n => n.id === id)
  if (index === -1) return

  nodes[index] = { ...nodes[index], status }
  saveNodes(nodes)
}
