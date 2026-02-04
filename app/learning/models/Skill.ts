export type Skill = {
  id: string
  title: string
  description?: string
  level: 1 | 2 | 3 | 4 | 5
  lessons: string[]
  tags?: string[]
}
