"use client"

import { LearningNode } from "../models/LearningNode"
import NodeCard from "./NodeCard"

const FOLDER_NODE_PREFIX = "folder-"

export default function ListView({
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
  const grouped = nodes.reduce<Record<string, LearningNode[]>>(
    (acc, node) => {
      const key = `${node.track ?? "General"} / ${node.category ?? "Uncategorized"}`
      acc[key] = acc[key] || []
      acc[key].push(node)
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([group, groupNodes]) => (
        <div key={group}>
          <h2 className="font-semibold mb-2">{group}</h2>
          <div className="space-y-2">
            {groupNodes
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
        </div>
      ))}
    </div>
  )
}
