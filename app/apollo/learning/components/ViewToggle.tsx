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
        className={`px-3 py-1 border rounded ${
          view === "list" ? "bg-black text-white" : ""
        }`}
      >
        List View
      </button>

      <button
        onClick={() => onChange("cards")}
        className={`px-3 py-1 border rounded ${
          view === "cards" ? "bg-black text-white" : ""
        }`}
      >
        Card View
      </button>
    </div>
  )
}
