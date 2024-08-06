import { join } from "path";
import { BUILD_DIRECTORY, COURSE_DIRECTORY, STATUS_ACTIVE } from "../../constants";
import { CourseToImport } from "../load/load-courses";
import { checkFolder, formatRepositoryLinks } from "./build.utils";
import { convert, loadFile } from "../../modules/asciidoc";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";
import { ModuleToImport } from "../load/load-modules";

async function createAndWriteModule(module, html): Promise<void> {
  const courseFolder = join(BUILD_DIRECTORY, 'html', module.course.slug)
  await checkFolder(courseFolder)

  const moduleFolder = join(courseFolder, module.slug)
  await checkFolder(moduleFolder)

  const writePath = join(
    moduleFolder,
    `index.html`
  )

  await writeFile(writePath, html)
}


export default async function buildModuleHtml(module: ModuleToImport): Promise<void> {
  const attributes = formatRepositoryLinks(module.course)

  const filepath = join(
    COURSE_DIRECTORY, module.course.slug,
    'modules', module.slug,
    `module.adoc`
  )

  if (existsSync(filepath)) {
    const file = loadFile(
      filepath,
      {
        attributes,
      }
    )

    const html = convert(file)
    await createAndWriteModule(module, html)
  }
}
