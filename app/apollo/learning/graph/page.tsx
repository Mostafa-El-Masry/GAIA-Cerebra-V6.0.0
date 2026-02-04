"use client"

import ReactFlow, {
  ReactFlowProvider,
  Controls,
  MiniMap,
  type Node,
  type Edge
} from "reactflow"
import "reactflow/dist/style.css"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  loadLearningNodes,
  loadLearningNodesFromFiles,
  loadProjectsFromPublicFolder
} from "../actions"
import { loadSkills } from "../lib/skillManager"
import { loadLessons } from "../lib/lessonManager"
import { buildGraph } from "../lib/graphBuilder"
import { getLayoutedElements } from "../lib/graphLayout"
import ProjectNode from "./nodes/ProjectNode"
import SkillNode from "./nodes/SkillNode"
import LessonNode from "./nodes/LessonNode"
import type { LearningNode } from "../models/LearningNode"

const FOLDER_NODE_PREFIX = "folder-"

function folderProjectsToNodes(
  projects: { path: string; section: string; name: string; track: string; category: string }[]
): LearningNode[] {
  return projects.map((p, i) => ({
    id: `${FOLDER_NODE_PREFIX}${p.path.replace(/\//g, "-")}`,
    title: p.name,
    status: "not started" as const,
    track: p.track,
    category: p.category,
    projectPath: p.path,
    order: i + 1
  }))
}

const nodeTypes = {
  project: ProjectNode,
  skill: SkillNode,
  lesson: LessonNode
}

export default function LearningGraphPage() {
  const [nodes, setNodes] = useState<any[]>([])
  const [edges, setEdges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [learningNodes, fileLessons, folderProjects] = await Promise.all([
          loadLearningNodes(),
          loadLearningNodesFromFiles(),
          loadProjectsFromPublicFolder()
        ])
        const skills = loadSkills()
        const lessons = loadLessons()

        const fromJson = learningNodes
        const fromFolder = folderProjectsToNodes(folderProjects)
        const jsonPaths = new Set(
          fromJson.map((n) => n.projectPath).filter(Boolean) as string[]
        )
        const folderOnly = fromFolder.filter(
          (n) => !jsonPaths.has(n.projectPath ?? "")
        )
        const displayNodes: LearningNode[] = [...fromJson, ...folderOnly]

        const graph = buildGraph(displayNodes, skills, lessons, fileLessons)
        const reactFlowNodes: Node[] = graph.graphNodes.map((n) => ({
          id: n.id,
          position: n.position,
          data: n.data,
          type: n.type
        }))
        const reactFlowEdges: Edge[] = graph.edges
        const layoutedNodes = getLayoutedElements(reactFlowNodes, reactFlowEdges, {
          rankdir: "LR",
          nodesep: 64,
          ranksep: 120
        })
        setNodes(layoutedNodes)
        setEdges(reactFlowEdges)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[100vh] w-full items-center justify-center bg-[var(--gaia-surface)]">
        <p className="text-sm text-[var(--gaia-text-muted)]">Loading graph…</p>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="flex min-h-[100vh] w-full flex-col items-center justify-center gap-4 bg-[var(--gaia-surface)] px-4">
        <p className="text-center text-sm text-[var(--gaia-text-default)]">
          No graph data yet. Add learning nodes on the Learning map, then link skills and lessons to see the graph here.
        </p>
        <Link
          href="/apollo/learning"
          className="text-sm font-medium text-[var(--gaia-accent)] hover:underline"
        >
          ← Back to Learning map
        </Link>
      </div>
    )
  }

  return (
    <div
      className="wealth-theme learning-graph"
      style={{ width: "100%", height: "100vh", minHeight: "100vh" }}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1.2, minZoom: 0.1 }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          defaultEdgeOptions={{
            style: { strokeWidth: 1.5 },
            type: "smoothstep"
          }}
          minZoom={0.05}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Controls className="learning-graph-controls" />
          <MiniMap className="learning-graph-minimap" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
