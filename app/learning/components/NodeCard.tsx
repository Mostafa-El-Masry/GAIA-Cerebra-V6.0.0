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
    field: "track" | "category" | "order" | "projectPath",
    value: string | number
  ) => void
}) {
  const previewSrc = node.projectPath
    ? `${encodeURI(node.projectPath)}/preview.png`
    : null
  const projectUrl = node.projectPath
    ? `${encodeURI(node.projectPath)}/index.html`
    : null

  return (
    <div className="border rounded overflow-hidden">
      {previewSrc && (
        <img
          src={previewSrc}
          alt={node.title}
          className="w-full h-32 object-cover"
          onError={e => {
            ;(e.currentTarget as HTMLImageElement).style.display = "none"
          }}
        />
      )}

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold">{node.title}</h3>
          {projectUrl && (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline shrink-0"
            >
              Open
            </a>
          )}
        </div>

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

          <input
            placeholder="/projects/javascript-01"
            value={node.projectPath ?? ""}
            onChange={e =>
              onMetaChange(node.id, "projectPath", e.target.value)
            }
            className="border rounded px-2 py-1 w-56"
          />
        </div>
      </div>
    </div>
  )
}
