import { Handle, Position } from "reactflow"

export default function ProjectNode({ data }: any) {
  const label = data?.label ?? ""
  return (
    <div
      className="rounded-xl border border-[var(--gaia-info-border)] bg-[var(--gaia-info-bg)] px-4 py-3 min-w-[160px] max-w-[220px] shadow-sm"
      title={label}
    >
      <div className="text-[10px] uppercase tracking-wider text-[var(--gaia-info)] mb-1 font-medium">
        Project
      </div>
      <div className="font-semibold text-[var(--gaia-text-strong)] text-sm truncate">
        {label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !border-2 !border-[var(--gaia-info)] !bg-[var(--gaia-surface)]"
      />
    </div>
  )
}
