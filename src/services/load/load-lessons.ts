import { join, parse } from "path";
import { loadFile } from "../../modules/asciidoc";
import { CourseToImport } from "./load-courses";
import { ModuleToImport } from "./load-modules";
import { attributeIsTruthy, getDateAttribute, getOrderAttribute } from "../../utils";
import { ASCIIDOC_DIRECTORY, ATTRIBUTE_BRANCH, ATTRIBUTE_DURATION, ATTRIBUTE_LAB, ATTRIBUTE_OPTIONAL, ATTRIBUTE_SANDBOX, ATTRIBUTE_TYPE, ATTRIBUTE_UPDATED_AT, COURSE_DIRECTORY, DEFAULT_LESSON_TYPE } from "../../constants";
import { readdir } from "fs/promises";
import { existsSync } from "fs";

export type LessonType = 'video' | 'lesson' | 'text' | 'quiz' | 'activity' | 'challenge'



export type LessonToImport = {
  course: CourseToImport;
  module: ModuleToImport;
  link: string;
  slug: string;
  title: string;
  type: LessonType;
  duration: string;
  order: number;
  lab: string;
  optional: boolean;
  sandbox: boolean;
  updatedAt: string | undefined;
  branch: string | undefined;
}



// const loadQuestions = async (module: ModuleToImport, slug: string): Promise<QuestionToImport[]> => {
//   const questionsDir = join(COURSE_DIRECTORY, module.course.slug, 'modules', module.slug, 'lessons', slug, 'questions')
//   const output: QuestionToImport[] = []

//   if (existsSync(questionsDir)) {
//     const questions = await readdir(questionsDir)
//       .then(filenames => filenames.filter(
//         filename => filename.endsWith('.adoc')
//       ))

//     for (const filename of questions) {
//       const question = loadQuestion(questionsDir, filename)

//       output.push(question)
//     }
//   }

//   return output
// }

async function getLesson(module: ModuleToImport, slug: string): Promise<LessonToImport> {
  const file = loadFile(join(COURSE_DIRECTORY, module.course.slug, 'modules', module.slug, 'lessons', slug, 'lesson.adoc'), { parse_header_only: true })
  const order = getOrderAttribute(slug, file)

  return {
    course: module.course,
    module: module,
    link: `/courses/${module.course.slug}/${module.slug}/${slug}/`,
    slug,
    title: file.getTitle() as string,
    type: file.getAttribute(ATTRIBUTE_TYPE, DEFAULT_LESSON_TYPE),
    order,
    duration: file.getAttribute(ATTRIBUTE_DURATION, null),
    sandbox: attributeIsTruthy(file, ATTRIBUTE_SANDBOX),
    lab: file.getAttribute(ATTRIBUTE_LAB),
    optional: attributeIsTruthy(file, ATTRIBUTE_OPTIONAL, false),
    updatedAt: getDateAttribute(file, ATTRIBUTE_UPDATED_AT),
    branch: file.getAttribute(ATTRIBUTE_BRANCH, 'main'),
  }
}

export default async function loadLessons(modules: ModuleToImport[]): Promise<LessonToImport[]> {
  const output: LessonToImport[] = []

  for (const module of modules) {
    const lessons = await readdir(
      join(COURSE_DIRECTORY, module.course.slug, 'modules', module.slug, 'lessons')
    )
      .then(lessons => lessons.filter(
        slug => existsSync(
          join(COURSE_DIRECTORY, module.course.slug, 'modules', module.slug, 'lessons', slug, 'lesson.adoc')
        )
      ))


    for (const slug of lessons) {
      const lesson = await getLesson(module, slug)
      output.push(lesson)
    }
  }

  return output
}