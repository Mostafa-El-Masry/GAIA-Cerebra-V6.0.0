"use client"

import { LearningNode } from "../models/LearningNode"

export default function NodeCard({
  node,
  onStatusChange,
  onMetaChange
}: {
  node: LearningNode
  onStatusChange: (id: string, status: LearningNode["status"]) => void
  onMetaChange: (
    id: string,
    field: "track" | "category" | "order",
    value: string | number
  ) => void
}) {
  return (
    <div className="border rounded p-3 space-y-2">
      <h3 className="font-semibold">{node.title}</h3>

      <div className="flex gap-2 flex-wrap text-sm">
        <select
          value={node.status}
          onChange={e =>
            onStatusChange(
              node.id,
              e.target.value as LearningNode["status"]
            )
          }
          className="border rounded px-2 py-1"
        >
          <option value="not started">Not started</option>
          <option value="in progress">In progress</option>
          <option value="completed">Completed</option>
        </select>

        <input
          placeholder="Track"
          value={node.track ?? ""}
          onChange={e =>
            onMetaChange(node.id, "track", e.target.value)
          }
          className="border rounded px-2 py-1 w-28"
        />

        <input
          placeholder="Category"
          value={node.category ?? ""}
          onChange={e =>
            onMetaChange(node.id, "category", e.target.value)
          }
          className="border rounded px-2 py-1 w-28"
        />

        <input
          type="number"
          placeholder="Order"
          value={node.order ?? ""}
          onChange={e =>
            onMetaChange(
              node.id,
              "order",
              Number(e.target.value)
            )
          }
          className="border rounded px-2 py-1 w-20"
        />
      </div>
    </div>
  )
}
