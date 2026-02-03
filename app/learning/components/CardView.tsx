"use client"

import { LearningNode } from "../models/LearningNode"
import NodeCard from "./NodeCard"

export default function CardView({
  nodes,
  onStatusChange
}: {
  nodes: LearningNode[]
  onStatusChange: (id: string, status: LearningNode["status"]) => void
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
          />
        ))}
    </div>
  )
}
