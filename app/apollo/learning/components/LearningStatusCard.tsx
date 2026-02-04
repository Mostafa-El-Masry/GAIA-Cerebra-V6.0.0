"use client"

import { LearningNode } from "../models/LearningNode"
import type { AlignmentSignal } from "../lib/alignment"
import type { CoherenceSignal } from "../lib/coherence"

export default function LearningStatusCard({
  displayNodes,
  folderProjectPaths,
  alignmentSignals,
  coherenceSignals
}: {
  /** All nodes shown on the map (JSON + folder-derived). */
  displayNodes: LearningNode[]
  /** Paths of projects that exist on disk (e.g. from public/JS-Projects). */
  folderProjectPaths: string[]
  alignmentSignals: AlignmentSignal[]
  coherenceSignals: CoherenceSignal[]
}) {
  const knownPaths = new Set(folderProjectPaths)
  const linked = displayNodes.filter(
    n => n.projectPath && knownPaths.has(n.projectPath)
  )
  const broken = displayNodes.filter(
    n => n.projectPath && !knownPaths.has(n.projectPath)
  )
  const unlinked = folderProjectPaths.filter(
    path => !displayNodes.some(n => n.projectPath === path)
  )

  const allGood =
    broken.length === 0 &&
    unlinked.length === 0 &&
    alignmentSignals.length === 0 &&
    coherenceSignals.length === 0

  return (
    <div className="rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)]">
        <h2 className="text-sm font-semibold text-[var(--gaia-text-strong)]">
          Status
        </h2>
      </div>

      <div className="p-4 space-y-4 text-sm text-[var(--gaia-text-default)]">
        {/* Project truth */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--gaia-text-muted)] mb-2">
            Projects
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-[var(--gaia-surface-soft)] border border-[var(--gaia-border)] p-3">
              <div className="text-[var(--gaia-text-muted)] text-xs">Linked</div>
              <div className="font-semibold text-[var(--gaia-text-strong)] mt-0.5">
                {linked.length}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--gaia-border)] p-3 min-w-0">
              <div className="text-[var(--gaia-text-muted)] text-xs">Broken links</div>
              {broken.length === 0 ? (
                <div className="text-[var(--gaia-positive)] mt-0.5">None</div>
              ) : (
                <ul className="mt-1 space-y-0.5 list-none text-[var(--gaia-text-default)]">
                  {broken.slice(0, 3).map(n => (
                    <li key={n.id} className="truncate" title={n.title}>
                      {n.title}
                    </li>
                  ))}
                  {broken.length > 3 && (
                    <li className="text-[var(--gaia-text-muted)]">
                      +{broken.length - 3} more
                    </li>
                  )}
                </ul>
              )}
            </div>
            <div className="rounded-lg border border-[var(--gaia-border)] p-3 min-w-0">
              <div className="text-[var(--gaia-text-muted)] text-xs">Unlinked folders</div>
              {unlinked.length === 0 ? (
                <div className="text-[var(--gaia-positive)] mt-0.5">None</div>
              ) : (
                <ul className="mt-1 space-y-0.5 list-none text-[var(--gaia-text-default)]">
                  {unlinked.slice(0, 3).map(f => (
                    <li key={f} className="truncate">
                      {f}
                    </li>
                  ))}
                  {unlinked.length > 3 && (
                    <li className="text-[var(--gaia-text-muted)]">
                      +{unlinked.length - 3} more
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Alignment & Coherence in one row when both ok, or stacked when there are signals */}
        <section className="pt-3 border-t border-[var(--gaia-border)]">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--gaia-text-muted)] mb-2">
            Alignment &amp; Coherence
          </h3>
          {allGood ? (
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gaia-positive-bg)] border border-[var(--gaia-positive-border)] px-3 py-1.5 text-[var(--gaia-positive)] text-xs font-medium">
                <span aria-hidden>✓</span> All nodes aligned
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gaia-positive-bg)] border border-[var(--gaia-positive-border)] px-3 py-1.5 text-[var(--gaia-positive)] text-xs font-medium">
                <span aria-hidden>✓</span> All systems coherent
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {alignmentSignals.length > 0 && (
                <div>
                  <span className="text-[var(--gaia-text-muted)] text-xs">Alignment</span>
                  <ul className="mt-1 list-disc ml-4 space-y-0.5">
                    {alignmentSignals.map(s => (
                      <li key={s.id}>{s.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {alignmentSignals.length === 0 && (
                <div className="text-[var(--gaia-positive)] text-xs">
                  ✓ All learning nodes are aligned.
                </div>
              )}
              {coherenceSignals.length > 0 && (
                <div>
                  <span className="text-[var(--gaia-text-muted)] text-xs">Coherence</span>
                  <ul className="mt-1 list-disc ml-4 space-y-0.5">
                    {coherenceSignals.map(s => (
                      <li key={s.id}>{s.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {coherenceSignals.length === 0 && (
                <div className="text-[var(--gaia-positive)] text-xs">
                  ✓ All systems coherent.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
