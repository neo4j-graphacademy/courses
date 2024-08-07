import { join } from "path";
import { CourseToImport } from "./load-courses";
import { ATTRIBUTE_DESCRIPTION, COURSE_DIRECTORY } from "../../constants";
import { readdir } from "fs/promises";
import { loadFile } from "../../modules/asciidoc";
import { getOrderAttribute, moduleOverviewPath } from "../../utils";
import { existsSync } from "fs";

export type ModuleToImport = {
  course: CourseToImport;
  slug: string;
  link: string;
  order: number;
  title: string;
  description: string;
}


async function loadModule(course: CourseToImport, slug: string): Promise<ModuleToImport> {
  const file = loadFile(join(COURSE_DIRECTORY, course.slug, 'modules', slug, 'module.adoc'), { parse_header_only: true })
  const order = getOrderAttribute(slug, file)

  return {
    course,
    slug,
    link: `/courses/${course.slug}/${slug}/`,
    order,
    title: file.getTitle() as string,
    description: file.getAttribute(ATTRIBUTE_DESCRIPTION),
  }
}

export default async function loadModules(courses: CourseToImport[]): Promise<ModuleToImport[]> {
  const output: ModuleToImport[] = []

  // Filter courses with a module directory
  const filtered = courses.filter(
    course => existsSync(join(COURSE_DIRECTORY, course.slug, 'modules'))
  )

  for (const course of filtered) {
    const path = join(COURSE_DIRECTORY, course.slug, 'modules')
    const modules = await readdir(path)
      .then(slugs =>
        slugs.filter(
          slug => existsSync(moduleOverviewPath(course.slug, slug))
        )
      )

    for (const slug of modules) {
      const module = await loadModule(course, slug)
      output.push(module)
    }
  }

  return output
}
