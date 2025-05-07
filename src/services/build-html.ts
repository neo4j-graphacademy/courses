import buildCourseHtml from "./build/build-course-html"
import buildLessonHtml from "./build/build-lesson-html"
import buildModuleHtml from "./build/build-module-html"
import load from "./load"

export default async function buildHtml(): Promise<void> {
  const { courses, modules, lessons } = await load()

  console.log(`↔️  Building HTML`)

  // Build HTML
  for (const course of courses) {
    void buildCourseHtml(course)
  }
  console.log(`   -- ${courses.length} courses`)

  for (const module of modules) {
    console.log(`   -- ${module.slug}`)
    void buildModuleHtml(module)
  }
  console.log(`   -- ${modules.length} modules`)

  for (const lesson of lessons) {
    console.log(`   -- ${lesson.slug}`)
    void buildLessonHtml(lesson)
  }
  console.log(`   -- ${lessons.length} lessons`)
}
