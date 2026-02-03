import { importNodesFromArray } from '../lib/importNodes'
import { LearningNode } from '../models/LearningNode'

const sampleNodes: LearningNode[] = [
  { id: 'node-1', title: 'JS Project 1', status: 'not started' },
  { id: 'node-2', title: 'JS Project 2', status: 'not started' },
  { id: 'node-3', title: 'JS Project 3', status: 'not started' }
  // Add more nodes as needed
]

importNodesFromArray(sampleNodes)
console.log('Sample learning nodes populated')
