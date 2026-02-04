import { Handle, Position } from "reactflow"

export default function LessonNode({ data }: any) {
  const label = data?.label ?? ""
  return (
    <div
      className="rounded-xl border border-[var(--gaia-positive-border)] bg-[var(--gaia-positive-bg)] px-4 py-2.5 min-w-[120px] max-w-[200px] shadow-sm"
      title={label}
    >
      <div className="text-[10px] uppercase tracking-wider text-[var(--gaia-positive)] mb-1 font-medium">
        Lesson
      </div>
      <div className="text-sm text-[var(--gaia-text-strong)] truncate">
        {label}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !border-2 !border-[var(--gaia-positive)] !bg-[var(--gaia-surface)]"
      />
    </div>
  )
}
