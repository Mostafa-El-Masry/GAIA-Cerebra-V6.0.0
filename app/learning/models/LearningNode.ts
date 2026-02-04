export type ReflectionEntry = {
  id: string
  date: string
  text: string
}

export type LearningNode = {
  id: string
  title: string
  description?: string
  prerequisites?: string[]
  status: 'not started' | 'in progress' | 'completed'
  score?: number
  phase?: number

  track?: string
  category?: string
  order?: number

  projectPath?: string   // e.g. "/projects/javascript-01"

  reflections?: ReflectionEntry[]
}
