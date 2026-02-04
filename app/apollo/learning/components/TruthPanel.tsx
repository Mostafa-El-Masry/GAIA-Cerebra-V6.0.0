"use client"

import { LearningNode } from "../models/LearningNode"

function folderFromProjectPath(projectPath: string): string {
  return projectPath.replace(/^\/?projects\/?/, "").split("/")[0] ?? projectPath
}

export default function TruthPanel({
  nodes,
  folders
}: {
  nodes: LearningNode[]
  folders: string[]
}) {
  const linked = nodes.filter(n =>
    n.projectPath && folders.includes(folderFromProjectPath(n.projectPath))
  )

  const broken = nodes.filter(
    n =>
      n.projectPath &&
      !folders.includes(folderFromProjectPath(n.projectPath))
  )

  const unlinked = folders.filter(
    f => !nodes.some(n => folderFromProjectPath(n.projectPath ?? "") === f)
  )

  return (
    <div className="border rounded p-4 space-y-4 text-sm">
      <h2 className="font-semibold">Project Truth Panel</h2>

      <div>
        <strong>Linked Projects:</strong> {linked.length}
      </div>

      <div>
        <strong>Broken Links:</strong>
        <ul className="list-disc ml-4">
          {broken.map(n => (
            <li key={n.id}>{n.title}</li>
          ))}
        </ul>
      </div>

      <div>
        <strong>Unlinked Folders:</strong>
        <ul className="list-disc ml-4">
          {unlinked.map(f => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
