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
    <div className="rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-3 space-y-3 text-sm text-[var(--gaia-text-default)]">
      <h3 className="font-medium text-[var(--gaia-text-strong)]">Reflections</h3>

      <textarea
        className="w-full rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-2 text-[var(--gaia-text-default)]"
        rows={3}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What did you notice? What did this teach you?"
      />

      <button
        className="rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-3 py-1 text-[var(--gaia-text-strong)] hover:bg-[var(--gaia-surface-soft)]"
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
            <li key={r.id} className="rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-2">
              <div className="text-xs text-[var(--gaia-text-muted)]">
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
