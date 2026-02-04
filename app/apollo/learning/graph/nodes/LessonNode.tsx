import { Handle, Position } from "reactflow"

export default function LessonNode({ data }: any) {
  return (
    <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 min-w-[140px]">
      <div className="text-xs uppercase tracking-wide text-green-600 mb-1">
        Lesson
      </div>
      <div className="text-sm text-green-900">
        {data.label}
      </div>

      <Handle type="target" position={Position.Left} />
    </div>
  )
}
