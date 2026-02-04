"use client"

import ReactFlow from "reactflow"
import "reactflow/dist/style.css"

import { useEffect, useState } from "react"
import { loadLearningNodes } from "../actions"
import { loadSkills } from "../lib/skillManager"
import { loadLessons } from "../lib/lessonManager"
import { buildGraph } from "../lib/graphBuilder"
import type { Node } from "reactflow"
import type { Edge } from "reactflow"

export default function LearningGraphPage() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  useEffect(() => {
    loadLearningNodes().then(learningNodes => {
      const skills = loadSkills()
      const lessons = loadLessons()
      const graph = buildGraph(learningNodes, skills, lessons)
      setNodes(graph.graphNodes as Node[])
      setEdges(graph.edges as Edge[])
    })
  }, [])

  return (
    <div style={{ height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView />
    </div>
  )
}
