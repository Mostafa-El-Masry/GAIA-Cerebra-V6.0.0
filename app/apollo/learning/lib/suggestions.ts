import { LearningNode } from "../models/LearningNode"

const SKILL_KEYWORDS: Record<string, string[]> = {
  javascript: ["Variables", "Functions", "Async", "DOM"],
  async: ["Promises", "Async/Await"],
  dom: ["DOM Manipulation", "Events"],
}

export function suggestSkills(node: LearningNode): string[] {
  const text = `${node.title} ${node.category || ""}`.toLowerCase()
  const suggestions = new Set<string>()

  Object.entries(SKILL_KEYWORDS).forEach(([key, skills]) => {
    if (text.includes(key)) {
      skills.forEach((s) => suggestions.add(s))
    }
  })

  return Array.from(suggestions)
}
