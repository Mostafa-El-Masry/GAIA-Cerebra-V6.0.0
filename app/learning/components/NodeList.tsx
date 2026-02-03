import { LearningNode } from '../models/LearningNode'
import NodeCard from './NodeCard'

export default function NodeList({ nodes }: { nodes: LearningNode[] }) {
  return (
    <div className='space-y-2'>
      {nodes.map(node => (
        <NodeCard key={node.id} node={node} />
      ))}
    </div>
  )
}
