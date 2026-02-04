import { LearningNode } from '../models/LearningNode'
import NodeCard from './NodeCard'

const FOLDER_NODE_PREFIX = 'folder-'

export default function NodeList({
  nodes,
  onStatusChange,
  onMetaChange,
  onAddReflection,
}: {
  nodes: LearningNode[]
  onStatusChange: (id: string, status: LearningNode['status']) => void
  onMetaChange: (
    id: string,
    field: 'track' | 'category' | 'order' | 'projectPath',
    value: string | number
  ) => void
  onAddReflection?: (nodeId: string, text: string) => void
}) {
  return (
    <div className='space-y-2'>
      {nodes.map(node => (
        <NodeCard
          key={node.id}
          node={node}
          onStatusChange={onStatusChange}
          onMetaChange={onMetaChange}
          onAddReflection={
            onAddReflection && !node.id.startsWith(FOLDER_NODE_PREFIX)
              ? (text) => onAddReflection(node.id, text)
              : undefined
          }
        />
      ))}
    </div>
  )
}
