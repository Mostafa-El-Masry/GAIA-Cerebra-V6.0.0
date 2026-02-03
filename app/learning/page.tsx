"use client"

import { useEffect, useState } from "react"
import { LearningNode } from "./models/LearningNode"
import { loadLearningNodes, updateLearningNodeStatus } from "./actions"
import NodeCard from "./components/NodeCard"

export default function LearningPage() {
  const [nodes, setNodes] = useState<LearningNode[]>([])

  useEffect(() => {
    loadLearningNodes().then(setNodes)
  }, [])

  async function onStatusChange(id: string, status: LearningNode["status"]) {
    await updateLearningNodeStatus(id, status)
    setNodes(prev =>
      prev.map(n => (n.id === id ? { ...n, status } : n))
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Learning Nodes</h1>

      {nodes.length === 0 && (
        <p className="text-sm text-gray-500">No learning nodes found.</p>
      )}

      {nodes.map(node => (
        <NodeCard
          key={node.id}
          node={node}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
