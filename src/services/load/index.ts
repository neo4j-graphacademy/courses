import loadCourses, { CourseToImport } from "./load-courses";
import loadLessons, { LessonToImport } from "./load-lessons";
import loadModules, { ModuleToImport } from "./load-modules";
import loadQuestions, { QuestionToImport } from "./load-questions";

type LoadOutput = {
  courses: CourseToImport[];
  modules: ModuleToImport[];
  lessons: LessonToImport[];
  questions: QuestionToImport[];
}

export default async function load(): Promise<LoadOutput> {
  const courses = await loadCourses()
  const modules = await loadModules(courses)
  const lessons = await loadLessons(modules)
  const questions = await loadQuestions(lessons)

  return { courses, modules, lessons, questions }
}
