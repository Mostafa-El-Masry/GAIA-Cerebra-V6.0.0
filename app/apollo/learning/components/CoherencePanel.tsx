"use client"

import { CoherenceSignal } from "../lib/coherence"

export default function CoherencePanel({
  signals
}: {
  signals: CoherenceSignal[]
}) {
  if (signals.length === 0) {
    return (
      <div className="rounded border border-[var(--gaia-positive-border)] bg-[var(--gaia-positive-bg)] p-4 text-sm text-[var(--gaia-positive)]">
        All systems coherent.
      </div>
    )
  }

  return (
    <div className="rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-4 space-y-2 text-sm text-[var(--gaia-text-default)]">
      <h2 className="font-semibold text-[var(--gaia-text-strong)]">
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
