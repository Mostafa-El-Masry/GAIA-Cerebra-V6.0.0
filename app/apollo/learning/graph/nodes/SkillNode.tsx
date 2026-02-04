import { Handle, Position } from "reactflow"

export default function SkillNode({ data }: any) {
  const label = data?.label ?? ""
  return (
    <div
      className="rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-4 py-2.5 min-w-[140px] max-w-[200px] shadow-sm"
      title={label}
    >
      <div className="text-[10px] uppercase tracking-wider text-[var(--gaia-text-muted)] mb-1 font-medium">
        Skill
      </div>
      <div className="font-medium text-[var(--gaia-text-strong)] text-sm truncate">
        {label}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !border-2 !border-[var(--gaia-border)] !bg-[var(--gaia-surface)]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !border-2 !border-[var(--gaia-border)] !bg-[var(--gaia-surface)]"
      />
    </div>
  )
}
