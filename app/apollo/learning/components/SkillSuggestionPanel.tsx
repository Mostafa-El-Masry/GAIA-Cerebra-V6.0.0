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
    <div className="border rounded p-3 space-y-2 text-sm">
      <h3 className="font-medium">Suggested Skills</h3>
      {suggestions.map((s) => (
        <div key={s} className="flex justify-between">
          <span>{s}</span>
          <button
            className="border px-2 rounded"
            onClick={() => onAccept(s)}
          >
            Add
          </button>
        </div>
      ))}
    </div>
  )
}
