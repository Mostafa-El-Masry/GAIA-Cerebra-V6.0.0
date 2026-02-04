import { Handle, Position } from "reactflow"

export default function SkillNode({ data }: any) {
  return (
    <div className="rounded-md border border-cyan-400 bg-cyan-50 px-3 py-2 min-w-[160px]">
      <div className="text-xs uppercase tracking-wide text-cyan-600 mb-1">
        Skill
      </div>
      <div className="font-medium text-cyan-900">
        {data.label}
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
