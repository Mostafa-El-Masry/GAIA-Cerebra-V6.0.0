"use client"

import { useState } from "react"
import Link from "next/link"
import { LearningNode } from "../models/LearningNode"
import { suggestSkills } from "../lib/suggestions"
import ReflectionPanel from "./ReflectionPanel"
import SkillSuggestionPanel from "./SkillSuggestionPanel"

export default function NodeCard({
  node,
  onStatusChange,
  onMetaChange,
  onAddReflection,
  onAcceptSkill
}: {
  node: LearningNode
  onStatusChange: (id: string, status: LearningNode["status"]) => void
  onMetaChange: (
    id: string,
    field: "track" | "category" | "order" | "projectPath",
    value: string | number
  ) => void
  onAddReflection?: (text: string) => void
  onAcceptSkill?: (title: string) => void
}) {
  const projectUrl = node.projectPath
    ? `${encodeURI(node.projectPath)}/index.html`
    : null
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="border rounded overflow-hidden">
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-semibold">{node.title}</h3>
          {projectUrl && node.projectPath && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-sm border rounded px-2 py-1 hover:bg-black/5"
              >
                {showPreview ? "Hide preview" : "Preview"}
              </button>
              <Link
                href={`/apollo/learning/preview?path=${encodeURIComponent(node.projectPath)}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View page
              </Link>
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>

        {projectUrl && showPreview && (
          <div className="rounded border bg-white overflow-hidden">
            <iframe
              src={projectUrl}
              title={`Preview: ${node.title}`}
              className="w-full h-[280px] border-0"
              sandbox="allow-scripts"
            />
          </div>
        )}

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

        {onAddReflection && (
          <ReflectionPanel
            reflections={node.reflections}
            onAdd={onAddReflection}
          />
        )}

        {onAcceptSkill && (
          <SkillSuggestionPanel
            suggestions={suggestSkills(node)}
            onAccept={onAcceptSkill}
          />
        )}
      </div>
    </div>
  )
}
