import { Handle, Position } from "reactflow"

export default function ProjectNode({ data }: any) {
  return (
    <div className="rounded-lg border border-indigo-400 bg-indigo-50 px-4 py-3 min-w-[180px]">
      <div className="text-xs uppercase tracking-wide text-indigo-500 mb-1">
        Project
      </div>
      <div className="font-semibold text-indigo-900">
        {data.label}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  )
}
