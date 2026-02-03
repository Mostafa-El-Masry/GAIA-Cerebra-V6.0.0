import type { ReactNode } from "react"

export const metadata = {
  title: "GAIA | Learning",
}

export default function Layout({ children }: { children: ReactNode }) {
  return <div className='p-4'>{children}</div>
}
