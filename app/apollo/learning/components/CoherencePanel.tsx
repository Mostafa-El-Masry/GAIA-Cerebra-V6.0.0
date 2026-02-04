"use client"

import { CoherenceSignal } from "../lib/coherence"

export default function CoherencePanel({
  signals
}: {
  signals: CoherenceSignal[]
}) {
  if (signals.length === 0) {
    return (
      <div className="border rounded p-4 text-sm text-green-700">
        All systems coherent.
      </div>
    )
  }

  return (
    <div className="border rounded p-4 space-y-2 text-sm">
      <h2 className="font-semibold">
        Coherence Signals ({signals.length})
      </h2>

      <ul className="list-disc ml-4">
        {signals.map(s => (
          <li key={s.id}>{s.message}</li>
        ))}
      </ul>
    </div>
  )
}
