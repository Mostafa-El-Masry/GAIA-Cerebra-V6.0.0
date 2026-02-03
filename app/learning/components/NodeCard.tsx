import { LearningNode } from '../models/LearningNode'

export default function NodeCard({ node }: { node: LearningNode }) {
  return (
    <div className='border p-2 rounded'>
      <h3>{node.title}</h3>
      <p>Status: {node.status}</p>
    </div>
  )
}
