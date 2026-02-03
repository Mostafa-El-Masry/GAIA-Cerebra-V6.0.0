import { LearningNode } from '../models/LearningNode'
import NodeCard from './NodeCard'

export default function NodeList({
  nodes,
  onStatusChange,
}: {
  nodes: LearningNode[]
  onStatusChange: (id: string, status: LearningNode['status']) => void
}) {
  return (
    <div className='space-y-2'>
      {nodes.map(node => (
        <NodeCard
          key={node.id}
          node={node}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
