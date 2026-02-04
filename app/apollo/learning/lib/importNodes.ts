import fs from 'fs'
import path from 'path'
import { LearningNode } from '../models/LearningNode'

const dataPath = path.join(process.cwd(), 'app/apollo/learning/data/nodes.json')

export function importNodesFromArray(nodes: LearningNode[]) {
  fs.writeFileSync(dataPath, JSON.stringify(nodes, null, 2))
}
