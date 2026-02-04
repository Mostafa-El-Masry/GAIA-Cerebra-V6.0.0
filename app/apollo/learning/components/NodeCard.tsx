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
    <div className="rounded overflow-hidden border border-[var(--gaia-border)] bg-[var(--gaia-surface)]">
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-semibold text-[var(--gaia-text-strong)]">{node.title}</h3>
          {projectUrl && node.projectPath && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-sm rounded border border-[var(--gaia-border)] px-2 py-1 text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]"
              >
                {showPreview ? "Hide preview" : "Preview"}
              </button>
              <Link
                href={`/apollo/learning/preview?path=${encodeURIComponent(node.projectPath)}`}
                className="text-sm text-[var(--gaia-accent)] hover:underline"
              >
                View page
              </Link>
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--gaia-accent)] hover:underline"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>

        {projectUrl && showPreview && (
          <div className="overflow-hidden rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface)]">
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
            className="rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-2 py-1 text-[var(--gaia-text-default)]"
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
            className="rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-2 py-1 w-28 text-[var(--gaia-text-default)]"
          />

          <input
            placeholder="Category"
            value={node.category ?? ""}
            onChange={e =>
              onMetaChange(node.id, "category", e.target.value)
            }
            className="rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-2 py-1 w-28 text-[var(--gaia-text-default)]"
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
            className="rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-2 py-1 w-20 text-[var(--gaia-text-default)]"
          />

          <input
            placeholder="/projects/javascript-01"
            value={node.projectPath ?? ""}
            onChange={e =>
              onMetaChange(node.id, "projectPath", e.target.value)
            }
            className="rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-2 py-1 w-56 text-[var(--gaia-text-default)]"
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
