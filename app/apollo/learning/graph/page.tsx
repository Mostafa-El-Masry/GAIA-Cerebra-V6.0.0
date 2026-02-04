"use client"

import ReactFlow, { ReactFlowProvider } from "reactflow"
import "reactflow/dist/style.css"

import { useEffect, useState } from "react"
import Link from "next/link"
import { loadLearningNodes, loadLearningNodesFromFiles } from "../actions"
import { loadSkills } from "../lib/skillManager"
import { loadLessons } from "../lib/lessonManager"
import { buildGraph } from "../lib/graphBuilder"
import ProjectNode from "./nodes/ProjectNode"
import SkillNode from "./nodes/SkillNode"
import LessonNode from "./nodes/LessonNode"

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
        const [learningNodes, fileLessons] = await Promise.all([
          loadLearningNodes(),
          loadLearningNodesFromFiles()
        ])
        const skills = loadSkills()
        const lessons = loadLessons()

        const graph = buildGraph(learningNodes, skills, lessons, fileLessons)
        setNodes(graph.graphNodes)
        setEdges(graph.edges)
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
    <div style={{ width: "100%", height: "100vh", minHeight: "100vh" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          defaultEdgeOptions={{ style: { strokeWidth: 1.5 } }}
        />
      </ReactFlowProvider>
    </div>
  )
}
