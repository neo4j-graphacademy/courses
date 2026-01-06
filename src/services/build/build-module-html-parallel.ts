import { join } from "path";
import { BUILD_DIRECTORY, COURSE_DIRECTORY } from "../../constants";
import { formatRepositoryLinks } from "./build.utils";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { ModuleToImport } from "../load/load-modules";
import { WorkerPool } from "../../workers/worker-pool";
import { BuildWorkerTask } from "../../workers/build-html.worker";

async function createAndWriteModule(module: ModuleToImport, html: string): Promise<void> {
  const courseFolder = join(BUILD_DIRECTORY, 'html', module.course.slug);
  const moduleFolder = join(courseFolder, module.slug);

  // Create folders if they don't exist
  if (!existsSync(courseFolder)) {
    await mkdir(courseFolder, { recursive: true });
  }
  if (!existsSync(moduleFolder)) {
    await mkdir(moduleFolder, { recursive: true });
  }

  const writePath = join(moduleFolder, 'index.html');
  await writeFile(writePath, html);
}

export default async function buildModuleHtml(
  module: ModuleToImport,
  workerPool: WorkerPool
): Promise<void> {
  const attributes = formatRepositoryLinks(module.course);
  const filepath = join(
    COURSE_DIRECTORY,
    module.course.slug,
    'modules',
    module.slug,
    'module.adoc'
  );

  if (existsSync(filepath)) {
    const task: BuildWorkerTask = {
      type: 'module',
      filepath,
      attributes,
    };

    const result = await workerPool.exec(task);

    if (result.success && result.html) {
      await createAndWriteModule(module, result.html);

      // Display any warnings or logs from asciidoctor
      if (result.warnings && result.warnings.length > 0) {
        console.warn(`⚠️  Warnings in ${module.course.slug}/${module.slug}/module.adoc:`);
        result.warnings.forEach(w => console.warn(`   ${w}`));
      }
      if (result.logs && result.logs.length > 0) {
        result.logs.forEach(l => console.log(`   ${module.course.slug}/${module.slug}: ${l}`));
      }
    } else if (!result.success) {
      console.error(`❌ Error building ${module.course.slug}/${module.slug}:`);
      console.error(`   File: ${filepath}`);
      console.error(`   Error: ${result.error}`);

      // Display any captured warnings/logs
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(w => console.error(`   ${w}`));
      }
    }
  }
}

