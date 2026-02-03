import { LearningNode } from '../models/LearningNode'
import NodeCard from './NodeCard'

export default function NodeList({
  nodes,
  onStatusChange,
  onMetaChange,
}: {
  nodes: LearningNode[]
  onStatusChange: (id: string, status: LearningNode['status']) => void
  onMetaChange: (
    id: string,
    field: 'track' | 'category' | 'order',
    value: string | number
  ) => void
}) {
  return (
    <div className='space-y-2'>
      {nodes.map(node => (
        <NodeCard
          key={node.id}
          node={node}
          onStatusChange={onStatusChange}
          onMetaChange={onMetaChange}
        />
      ))}
    </div>
  )
}
