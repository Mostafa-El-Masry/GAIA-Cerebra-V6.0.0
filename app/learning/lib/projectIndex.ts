import fs from "fs"
import path from "path"

export function readProjectFolders(): string[] {
  const projectsDir = path.join(process.cwd(), "public/projects")
  if (!fs.existsSync(projectsDir)) return []

  return fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
}
