import { Skill } from "../models/Skill"

const KEY = "gaia.skills"

export function loadSkills(): Skill[] {
  if (typeof window === "undefined") return []
  return JSON.parse(window.localStorage.getItem(KEY) || "[]")
}

export function saveSkills(skills: Skill[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(skills))
}
