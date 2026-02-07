import type { ReactNode } from "react"

export const metadata = {
  title: "GAIA | Learning",
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--gaia-surface)] text-[var(--gaia-text-default)]">
      <div className="p-4">{children}</div>
    </div>
  )
}
