"use client"

import { useState } from "react"
import { ReflectionEntry } from "../models/LearningNode"

export default function ReflectionPanel({
  reflections = [],
  onAdd
}: {
  reflections?: ReflectionEntry[]
  onAdd: (text: string) => void
}) {
  const [text, setText] = useState("")

  return (
    <div className="border rounded p-3 space-y-3 text-sm">
      <h3 className="font-medium">Reflections</h3>

      <textarea
        className="w-full border rounded p-2"
        rows={3}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What did you notice? What did this teach you?"
      />

      <button
        className="border px-3 py-1 rounded"
        onClick={() => {
          if (!text.trim()) return
          onAdd(text)
          setText("")
        }}
      >
        Save Reflection
      </button>

      {reflections.length > 0 && (
        <ul className="space-y-2">
          {reflections.map(r => (
            <li key={r.id} className="border rounded p-2">
              <div className="text-xs opacity-60">
                {new Date(r.date).toLocaleString()}
              </div>
              <div>{r.text}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
