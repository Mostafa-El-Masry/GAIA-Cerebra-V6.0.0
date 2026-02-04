"use client"

export default function ViewToggle({
  view,
  onChange
}: {
  view: "list" | "cards"
  onChange: (v: "list" | "cards") => void
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange("list")}
        className={`px-3 py-1 border rounded border-[var(--gaia-border)] ${
          view === "list"
            ? "bg-[var(--gaia-contrast-bg)] text-[var(--gaia-contrast-text)]"
            : "bg-[var(--gaia-surface)] text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]"
        }`}
      >
        List View
      </button>

      <button
        onClick={() => onChange("cards")}
        className={`px-3 py-1 border rounded border-[var(--gaia-border)] ${
          view === "cards"
            ? "bg-[var(--gaia-contrast-bg)] text-[var(--gaia-contrast-text)]"
            : "bg-[var(--gaia-surface)] text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]"
        }`}
      >
        Card View
      </button>
    </div>
  )
}
