import fs from 'fs'
import path from 'path'
import { LearningNode } from '../models/LearningNode'

const dataPath = path.join(process.cwd(), 'app/apollo/learning/data/nodes.json')

export function getNodes(): LearningNode[] {
  if (!fs.existsSync(dataPath)) return []
  const raw = fs.readFileSync(dataPath, 'utf-8')
  return JSON.parse(raw) as LearningNode[]
}

export function saveNodes(nodes: LearningNode[]) {
  fs.writeFileSync(dataPath, JSON.stringify(nodes, null, 2))
}

export function addNode(node: LearningNode) {
  const nodes = getNodes()
  nodes.push(node)
  saveNodes(nodes)
}

export function updateNode(updatedNode: LearningNode) {
  const nodes = getNodes()
  const index = nodes.findIndex(n => n.id === updatedNode.id)
  if (index !== -1) nodes[index] = updatedNode
  saveNodes(nodes)
}
