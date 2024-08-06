import { join } from "path";
import { BUILD_DIRECTORY, COURSE_DIRECTORY, STATUS_ACTIVE } from "../../constants";
import { CourseToImport } from "../load/load-courses";
import { checkFolder, formatRepositoryLinks } from "./build.utils";
import { convert, loadFile } from "../../modules/asciidoc";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";

async function createAndWriteCourse(course, filename, html) {
  const courseFolder = join(BUILD_DIRECTORY, 'html', course)
  await checkFolder(courseFolder)

  const writePath = join(
    courseFolder,
    `${filename}.html`
  )

  await writeFile(writePath, html)
}


async function buildAndSave(course, filename: 'course' | 'summary'): Promise<void> {
  const attributes = formatRepositoryLinks(course)

  const filepath = join(
    COURSE_DIRECTORY, course.slug,
    `${filename}.adoc`
  )

  if (existsSync(filepath)) {
    const file = loadFile(
      filepath,
      {
        attributes,
      }
    )

    const html = convert(file)
    await createAndWriteCourse(course.slug, filename, html)
  }
}

export default async function buildCourseHtml(course: CourseToImport) {
  await buildAndSave(course, 'course')
  await buildAndSave(course, 'summary')
}
