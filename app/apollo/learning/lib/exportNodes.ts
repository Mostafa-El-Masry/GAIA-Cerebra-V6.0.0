import fs from 'fs'
import path from 'path'
import { LearningNode } from '../models/LearningNode'

const dataPath = path.join(process.cwd(), 'app/apollo/learning/data/nodes.json')

export function exportNodes(): LearningNode[] {
  if (!fs.existsSync(dataPath)) return []
  const raw = fs.readFileSync(dataPath, 'utf-8')
  return JSON.parse(raw) as LearningNode[]
}
