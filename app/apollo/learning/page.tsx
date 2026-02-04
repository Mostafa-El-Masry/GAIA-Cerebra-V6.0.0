"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { LearningNode } from "./models/LearningNode"
import {
  loadLearningNodes,
  loadProjectsFromPublicFolder,
  loadProjectFolders,
  updateLearningNodeStatus,
  updateLearningNodeMeta,
  addReflectionToNode,
  updateLearningNodeSkills
} from "./actions"
import { loadSkills, saveSkills } from "./lib/skillManager"
import { loadLessons } from "./lib/lessonManager"
import type { Skill } from "./models/Skill"
import type { Lesson } from "./models/Lesson"

import { generateAlignmentSignals } from "./lib/alignment"
import { generateCoherenceSignals } from "./lib/coherence"

import ViewToggle from "./components/ViewToggle"
import ListView from "./components/ListView"
import CardView from "./components/CardView"
import TruthPanel from "./components/TruthPanel"
import AlignmentPanel from "./components/AlignmentPanel"
import CoherencePanel from "./components/CoherencePanel"

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
  const [skills, setSkills] = useState<Skill[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])

  useEffect(() => {
    loadLearningNodes().then(setNodes)
    loadProjectsFromPublicFolder().then(setFolderProjects)
    loadProjectFolders().then(setFolders)
    setSkills(loadSkills())
    setLessons(loadLessons())
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

  const alignmentSignals = useMemo(
    () => generateAlignmentSignals(nodes, folders),
    [nodes, folders]
  )

  const coherenceSignals = useMemo(
    () => generateCoherenceSignals(nodes, skills, lessons),
    [nodes, skills, lessons]
  )

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

  async function onAddReflection(nodeId: string, text: string) {
    if (nodeId.startsWith(FOLDER_NODE_PREFIX)) return
    const updated = await addReflectionToNode(nodeId, text)
    if (updated) setNodes(updated)
  }

  async function onAcceptSkill(nodeId: string, title: string) {
    if (nodeId.startsWith(FOLDER_NODE_PREFIX)) return
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      title,
      level: 1,
      lessons: [],
    }
    const currentSkills = loadSkills()
    saveSkills([...currentSkills, newSkill])
    setSkills(loadSkills())
    const newSkills = [...(node.skills ?? []), newSkill.id]
    await updateLearningNodeSkills(nodeId, newSkills)
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, skills: newSkills } : n))
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-xl font-bold">Learning Map</h1>
        <Link
          href="/apollo/learning/graph"
          className="text-sm text-blue-600 hover:underline"
        >
          Graph View
        </Link>
      </div>

      <TruthPanel nodes={nodes} folders={folders} />

      <AlignmentPanel signals={alignmentSignals} />

      <CoherencePanel signals={coherenceSignals} />

      <ViewToggle view={view} onChange={setView} />

      {view === "list" ? (
        <ListView
          nodes={displayNodes}
          onStatusChange={onStatusChange}
          onMetaChange={onMetaChange}
          onAddReflection={onAddReflection}
          onAcceptSkill={onAcceptSkill}
        />
      ) : (
        <CardView
          nodes={displayNodes}
          onStatusChange={onStatusChange}
          onMetaChange={onMetaChange}
          onAddReflection={onAddReflection}
          onAcceptSkill={onAcceptSkill}
        />
      )}
    </div>
  )
}
