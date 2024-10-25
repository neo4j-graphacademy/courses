import { join } from "path";
import { loadFile } from "../../modules/asciidoc";
import { LessonToImport } from "../load/load-lessons";
import { BUILD_DIRECTORY, COURSE_DIRECTORY, STATUS_ACTIVE } from "../../constants";
import { writeFile } from "fs/promises";
import { checkFolder, formatRepositoryLinks } from "./build.utils";

function getPageAttributes(lesson: LessonToImport) {
  const combined = {
    ...lesson.course,
    ...lesson.course.repositories,
    ...lesson.module,
    ...lesson,
  }

  return formatRepositoryLinks(combined)
}

async function createAndWriteLesson(course, module, lesson, html) {
  const courseFolder = join(BUILD_DIRECTORY, 'html', course)
  await checkFolder(courseFolder)

  const moduleFolder = join(courseFolder, module)
  await checkFolder(moduleFolder)

  const lessonFolder = join(courseFolder, module, lesson)
  await checkFolder(lessonFolder)

  const writePath = join(
    lessonFolder,
    'index.html'
  )

  await writeFile(writePath, html)
}

export default async function buildLessonHtml(lesson: LessonToImport): Promise<void> {
  if (lesson.course.status === STATUS_ACTIVE) {
    const attributes = getPageAttributes(lesson)

    const filepath = join(
      COURSE_DIRECTORY, lesson.course.slug,
      'modules', lesson.module.slug,
      'lessons', lesson.slug,
      'lesson.adoc'
    )

    const file = loadFile(
      filepath,
      {
        attributes,
      }
    )

    const buildAttributes = {
      ...attributes,
      ...file.getAttributes(),
    }

    // Build
    const html = file.convert({
      attributes: getPageAttributes(buildAttributes),
    })

    await createAndWriteLesson(lesson.course.slug, lesson.module.slug, lesson.slug, html)
  }
}
