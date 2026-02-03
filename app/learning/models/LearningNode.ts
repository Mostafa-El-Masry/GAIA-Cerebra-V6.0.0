export type LearningNode = {
  id: string
  title: string
  description?: string
  prerequisites?: string[]
  status: 'not started' | 'in progress' | 'completed'
  score?: number
  phase?: number
}
