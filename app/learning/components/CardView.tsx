"use client"

import { LearningNode } from "../models/LearningNode"
import NodeCard from "./NodeCard"

export default function CardView({
  nodes,
  onStatusChange,
  onMetaChange
}: {
  nodes: LearningNode[]
  onStatusChange: (id: string, status: LearningNode["status"]) => void
  onMetaChange: (
    id: string,
    field: "track" | "category" | "order",
    value: string | number
  ) => void
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
          />
        ))}
    </div>
  )
}
