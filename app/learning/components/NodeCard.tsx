"use client"

import { LearningNode } from "../models/LearningNode"

export default function NodeCard({
  node,
  onStatusChange
}: {
  node: LearningNode
  onStatusChange: (id: string, status: LearningNode["status"]) => void
}) {
  return (
    <div className="border rounded p-3 space-y-2">
      <h3 className="font-semibold">{node.title}</h3>

      {node.description && (
        <p className="text-sm text-gray-600">{node.description}</p>
      )}

      <div className="flex gap-2">
        <select
          value={node.status}
          onChange={e =>
            onStatusChange(
              node.id,
              e.target.value as LearningNode["status"]
            )
          }
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="not started">Not started</option>
          <option value="in progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  )
}
