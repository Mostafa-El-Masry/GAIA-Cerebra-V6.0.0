"use client"

import { useEffect, useState } from "react"
import { LearningNode } from "./models/LearningNode"
import { loadLearningNodes, updateLearningNodeStatus } from "./actions"

import ViewToggle from "./components/ViewToggle"
import ListView from "./components/ListView"
import CardView from "./components/CardView"

export default function LearningPage() {
  const [nodes, setNodes] = useState<LearningNode[]>([])
  const [view, setView] = useState<"list" | "cards">("list")

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
      <h1 className="text-xl font-bold">Learning Map</h1>

      <ViewToggle view={view} onChange={setView} />

      {view === "list" ? (
        <ListView nodes={nodes} onStatusChange={onStatusChange} />
      ) : (
        <CardView nodes={nodes} onStatusChange={onStatusChange} />
      )}
    </div>
  )
}
