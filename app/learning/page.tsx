"use client"

import { useEffect, useMemo, useState } from "react"
import { LearningNode } from "./models/LearningNode"
import {
  loadLearningNodes,
  loadProjectsFromPublicFolder,
  loadProjectFolders,
  updateLearningNodeStatus,
  updateLearningNodeMeta
} from "./actions"

import ViewToggle from "./components/ViewToggle"
import ListView from "./components/ListView"
import CardView from "./components/CardView"
import TruthPanel from "./components/TruthPanel"

const FOLDER_NODE_PREFIX = "folder-"

function folderProjectsToNodes(
  projects: {
    path: string
    section: string
    name: string
    track: string
    category: string
  }[]
): LearningNode[] {
  return projects.map((p, i) => ({
    id: `${FOLDER_NODE_PREFIX}${p.path.replace(/\//g, "-")}`,
    title: p.name,
    status: "not started" as const,
    track: p.track,
    category: p.category,
    projectPath: p.path,
    order: i + 1,
  }))
}

export default function LearningPage() {
  const [nodes, setNodes] = useState<LearningNode[]>([])
  const [folderProjects, setFolderProjects] = useState<
    { path: string; section: string; name: string; track: string; category: string }[]
  >([])
  const [folders, setFolders] = useState<string[]>([])
  const [view, setView] = useState<"list" | "cards">("list")

  useEffect(() => {
    loadLearningNodes().then(setNodes)
    loadProjectsFromPublicFolder().then(setFolderProjects)
    loadProjectFolders().then(setFolders)
  }, [])

  const displayNodes = useMemo(() => {
    const fromJson = nodes
    const fromFolder = folderProjectsToNodes(folderProjects)
    const jsonPaths = new Set(
      fromJson.map(n => n.projectPath).filter(Boolean) as string[]
    )
    const folderOnly = fromFolder.filter(n => !jsonPaths.has(n.projectPath ?? ""))
    return [...fromJson, ...folderOnly]
  }, [nodes, folderProjects])

  async function onStatusChange(
    id: string,
    status: LearningNode["status"]
  ) {
    if (id.startsWith(FOLDER_NODE_PREFIX)) return
    await updateLearningNodeStatus(id, status)
    setNodes(prev =>
      prev.map(n => (n.id === id ? { ...n, status } : n))
    )
  }

  async function onMetaChange(
    id: string,
    field: "track" | "category" | "order" | "projectPath",
    value: string | number
  ) {
    if (id.startsWith(FOLDER_NODE_PREFIX)) return
    await updateLearningNodeMeta(id, field, value)
    setNodes(prev =>
      prev.map(n => (n.id === id ? { ...n, [field]: value } : n))
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Learning Map</h1>

      <TruthPanel nodes={nodes} folders={folders} />

      <ViewToggle view={view} onChange={setView} />

      {view === "list" ? (
        <ListView
          nodes={displayNodes}
          onStatusChange={onStatusChange}
          onMetaChange={onMetaChange}
        />
      ) : (
        <CardView
          nodes={displayNodes}
          onStatusChange={onStatusChange}
          onMetaChange={onMetaChange}
        />
      )}
    </div>
  )
}
