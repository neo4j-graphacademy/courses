import { join } from "path";
import { BUILD_DIRECTORY, COURSE_DIRECTORY } from "../../constants";
import { CourseToImport } from "../load/load-courses";
import { formatRepositoryLinks } from "./build.utils";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { WorkerPool } from "../../workers/worker-pool";
import { BuildWorkerTask } from "../../workers/build-html.worker";

async function createAndWriteCourse(course: string, filename: string, html: string) {
  const courseFolder = join(BUILD_DIRECTORY, 'html', course);

  // Create folder if it doesn't exist
  if (!existsSync(courseFolder)) {
    await mkdir(courseFolder, { recursive: true });
  }

  const writePath = join(courseFolder, `${filename}.html`);
  await writeFile(writePath, html);
}

async function buildAndSave(
  course: CourseToImport,
  filename: 'course' | 'summary',
  workerPool: WorkerPool
): Promise<void> {
  const attributes = formatRepositoryLinks(course);
  const filepath = join(COURSE_DIRECTORY, course.slug, `${filename}.adoc`);

  if (existsSync(filepath)) {
    const task: BuildWorkerTask = {
      type: 'course',
      filepath,
      attributes,
    };

    const result = await workerPool.exec(task);

    if (result.success && result.html) {
      await createAndWriteCourse(course.slug, filename, result.html);

      // Display any warnings or logs from asciidoctor
      if (result.warnings && result.warnings.length > 0) {
        console.warn(`⚠️  Warnings in ${course.slug}/${filename}.adoc:`);
        result.warnings.forEach(w => console.warn(`   ${w}`));
      }
      if (result.logs && result.logs.length > 0) {
        result.logs.forEach(l => console.log(`   ${course.slug}/${filename}: ${l}`));
      }
    } else if (!result.success) {
      console.error(`❌ Error building ${course.slug}/${filename}:`);
      console.error(`   File: ${filepath}`);
      console.error(`   Error: ${result.error}`);

      // Display any captured warnings/logs
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(w => console.error(`   ${w}`));
      }
    }
  }
}

export default async function buildCourseHtml(
  course: CourseToImport,
  workerPool: WorkerPool
): Promise<void> {
  await Promise.all([
    buildAndSave(course, 'course', workerPool),
    buildAndSave(course, 'summary', workerPool),
  ]);
}

