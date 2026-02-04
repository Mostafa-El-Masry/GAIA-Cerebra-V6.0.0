"use client"

import { LearningNode } from "../models/LearningNode"
import NodeCard from "./NodeCard"

const FOLDER_NODE_PREFIX = "folder-"

export default function CardView({
  nodes,
  onStatusChange,
  onMetaChange,
  onAddReflection
}: {
  nodes: LearningNode[]
  onStatusChange: (id: string, status: LearningNode["status"]) => void
  onMetaChange: (
    id: string,
    field: "track" | "category" | "order" | "projectPath",
    value: string | number
  ) => void
  onAddReflection?: (nodeId: string, text: string) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {nodes
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(node => (
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
