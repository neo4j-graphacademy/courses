import buildCourseHtml from "./build/build-course-html"
import buildLessonHtml from "./build/build-lesson-html"
import buildModuleHtml from "./build/build-module-html"
import load from "./load"

export default async function buildHtml(): Promise<void> {
  const { courses, modules, lessons } = await load()

  console.log(`↔️  Building HTML`)

  // Build all HTML in parallel for maximum speed
  const [courseResults, moduleResults, lessonResults] = await Promise.all([
    // Build all courses in parallel
    Promise.all(courses.map(course => buildCourseHtml(course))),
    
    // Build all modules in parallel
    Promise.all(modules.map(module => {
      console.log(`   -- ${module.course.slug}/${module.slug}`)
      return buildModuleHtml(module)
    })),
    
    // Build all lessons in parallel
    Promise.all(lessons.map(lesson => {
      console.log(`   -- ${lesson.course.slug}/${lesson.module.slug}/${lesson.slug}`)
      return buildLessonHtml(lesson)
    }))
  ])

  console.log(`   -- ${courses.length} courses`)
  console.log(`   -- ${modules.length} modules`)
  console.log(`   -- ${lessons.length} lessons`)
}
