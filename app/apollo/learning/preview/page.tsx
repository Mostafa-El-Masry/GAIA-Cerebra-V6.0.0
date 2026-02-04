"use client"

import { Suspense, useRef, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

const FRAME_WIDTH = 1920
const FRAME_HEIGHT = 1080

function PreviewContent() {
  const searchParams = useSearchParams()
  const path = searchParams.get("path")
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const updateScale = () => {
      if (!el) return
      const w = el.clientWidth
      const h = el.clientHeight
      const s = Math.min(w / FRAME_WIDTH, h / FRAME_HEIGHT, 1)
      setScale(s)
    }
    updateScale()
    const ro = new ResizeObserver(updateScale)
    ro.observe(el)
    return () => ro.disconnect()
  }, [path])

  if (!path) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-gray-600">No project path provided.</p>
        <Link
          href="/apollo/learning"
          className="text-blue-600 hover:underline"
        >
          Back to Learning
        </Link>
      </div>
    )
  }

  const indexUrl = `${path}/index.html`

  return (
    <div className="fixed inset-0 flex flex-col bg-white z-50">
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-gray-50 shrink-0">
        <Link
          href="/apollo/learning"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Learning
        </Link>
        <span className="text-sm text-gray-500 truncate flex-1" title={indexUrl}>
          {indexUrl}
        </span>
        <a
          href={indexUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline shrink-0"
        >
          Open in new tab
        </a>
      </div>
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-hidden flex items-center justify-center bg-gray-100"
      >
        <div
          style={{
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
            position: "absolute",
            left: "50%",
            top: "50%",
          }}
        >
          <iframe
            src={indexUrl}
            title="Project preview"
            className="w-full h-full border-0 block"
            sandbox="allow-scripts"
            style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
          />
        </div>
      </div>
    </div>
  )
}

export default function LearningPreviewPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <PreviewContent />
    </Suspense>
  )
}
