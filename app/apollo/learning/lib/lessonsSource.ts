import fs from "fs"
import path from "path"

export type LessonSource = {
  id: string
  title: string
  category: string
  path: string
}

const LESSONS_ROOT = path.join(process.cwd(), "public", "learning")

export function loadAllLessons(): LessonSource[] {
  if (!fs.existsSync(LESSONS_ROOT)) return []

  const categories = fs.readdirSync(LESSONS_ROOT)
  const lessons: LessonSource[] = []

  categories.forEach((category) => {
    const categoryPath = path.join(LESSONS_ROOT, category)

    if (!fs.statSync(categoryPath).isDirectory()) return

    const files = fs.readdirSync(categoryPath)

    files.forEach((file) => {
      if (!file.endsWith(".md") && !file.endsWith(".tsx")) return

      const id = `${category}-${file.replace(/\.(md|tsx)$/, "")}`

      lessons.push({
        id,
        title: file.replace(/\.(md|tsx)$/, "").replace(/-/g, " "),
        category,
        path: `/learning/${category}/${file}`
      })
    })
  })

  return lessons
}
