"use server"

import fs from "fs"
import path from "path"
import { getNodes, saveNodes } from "./lib/nodeManager"
import { readProjectFolders } from "./lib/projectIndex"
import { LearningNode } from "./models/LearningNode"

export async function loadProjectFolders(): Promise<string[]> {
  return readProjectFolders()
}

export type FolderProject = {
  path: string
  section: string
  name: string
  track: string
  category: string
}

function categoryFromSectionName(sectionName: string): string {
  const dash = " - "
  const i = sectionName.indexOf(dash)
  if (i === -1) return sectionName
  return sectionName.slice(i + dash.length).trim()
}

export async function loadProjectsFromPublicFolder(): Promise<FolderProject[]> {
  const base = path.join(process.cwd(), "public", "JS-Projects")
  if (!fs.existsSync(base)) return []

  const out: FolderProject[] = []
  const sections = fs.readdirSync(base, { withFileTypes: true })

  for (const sectionDir of sections) {
    if (!sectionDir.isDirectory()) continue
    const sectionPath = path.join(base, sectionDir.name)
    const projects = fs.readdirSync(sectionPath, { withFileTypes: true })
    const category = categoryFromSectionName(sectionDir.name)

    for (const proj of projects) {
      if (!proj.isDirectory()) continue
      const projectPath = path.join(sectionPath, proj.name)
      const hasIndex = fs.existsSync(path.join(projectPath, "index.html"))
      if (!hasIndex) continue

      out.push({
        path: `/JS-Projects/${sectionDir.name}/${proj.name}`,
        section: sectionDir.name,
        name: proj.name,
        track: "javascript",
        category,
      })
    }
  }

  return out
}

export async function loadLearningNodes(): Promise<LearningNode[]> {
  return getNodes()
}

export async function updateLearningNodeStatus(
  id: string,
  status: LearningNode["status"]
) {
  const nodes = getNodes()
  const index = nodes.findIndex(n => n.id === id)
  if (index === -1) return

  nodes[index] = { ...nodes[index], status }
  saveNodes(nodes)
}

export async function updateLearningNodeMeta(
  id: string,
  field: "track" | "category" | "order" | "projectPath",
  value: string | number
) {
  const nodes = getNodes()
  const index = nodes.findIndex(n => n.id === id)
  if (index === -1) return

  nodes[index] = { ...nodes[index], [field]: value }
  saveNodes(nodes)
}
