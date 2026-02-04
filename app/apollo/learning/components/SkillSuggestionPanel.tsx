"use client"

export default function SkillSuggestionPanel({
  suggestions,
  onAccept,
}: {
  suggestions: string[]
  onAccept: (title: string) => void
}) {
  if (suggestions.length === 0) return null

  return (
    <div className="rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-3 space-y-2 text-sm text-[var(--gaia-text-default)]">
      <h3 className="font-medium text-[var(--gaia-text-strong)]">Suggested Skills</h3>
      {suggestions.map((s) => (
        <div key={s} className="flex justify-between">
          <span>{s}</span>
          <button
            className="rounded border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-2 text-[var(--gaia-text-strong)] hover:bg-[var(--gaia-surface-soft)]"
            onClick={() => onAccept(s)}
          >
            Add
          </button>
        </div>
      ))}
    </div>
  )
}
