import { join } from "path";
import { LessonToImport } from "../load/load-lessons";
import { BUILD_DIRECTORY, COURSE_DIRECTORY, STATUS_ACTIVE } from "../../constants";
import { writeFile, mkdir } from "fs/promises";
import { formatRepositoryLinks } from "./build.utils";
import { existsSync } from "fs";
import { WorkerPool } from "../../workers/worker-pool";
import { BuildWorkerTask } from "../../workers/build-html.worker";

export function getPageAttributes(lesson: LessonToImport) {
  const combined = {
    ...lesson.course,
    ...lesson.course.repositories,
    ...lesson.module,
    ...lesson,
  };

  return formatRepositoryLinks(combined);
}

async function createAndWriteLesson(
  course: string,
  module: string,
  lesson: string,
  html: string
): Promise<void> {
  const courseFolder = join(BUILD_DIRECTORY, 'html', course);
  const moduleFolder = join(courseFolder, module);
  const lessonFolder = join(courseFolder, module, lesson);

  // Create all folders if they don't exist
  if (!existsSync(courseFolder)) {
    await mkdir(courseFolder, { recursive: true });
  }
  if (!existsSync(moduleFolder)) {
    await mkdir(moduleFolder, { recursive: true });
  }
  if (!existsSync(lessonFolder)) {
    await mkdir(lessonFolder, { recursive: true });
  }

  const writePath = join(lessonFolder, 'index.html');
  await writeFile(writePath, html);
}

export default async function buildLessonHtml(
  lesson: LessonToImport,
  workerPool: WorkerPool
): Promise<void> {
  if (lesson.course.status === STATUS_ACTIVE) {
    const attributes = getPageAttributes(lesson);
    const filepath = join(
      COURSE_DIRECTORY,
      lesson.course.slug,
      'modules',
      lesson.module.slug,
      'lessons',
      lesson.slug,
      'lesson.adoc'
    );

    const task: BuildWorkerTask = {
      type: 'lesson',
      filepath,
      attributes,
    };

    const result = await workerPool.exec(task);

    if (result.success && result.html) {
      await createAndWriteLesson(
        lesson.course.slug,
        lesson.module.slug,
        lesson.slug,
        result.html
      );

      // Display any warnings or logs from asciidoctor
      if (result.warnings && result.warnings.length > 0) {
        console.warn(`⚠️  Warnings in ${lesson.course.slug}/${lesson.module.slug}/${lesson.slug}/lesson.adoc:`);
        result.warnings.forEach(w => console.warn(`   ${w}`));
      }
      if (result.logs && result.logs.length > 0) {
        result.logs.forEach(l => console.log(`   ${lesson.course.slug}/${lesson.module.slug}/${lesson.slug}: ${l}`));
      }
    } else if (!result.success) {
      console.error(`❌ Error building ${lesson.course.slug}/${lesson.module.slug}/${lesson.slug}:`);
      console.error(`   File: ${filepath}`);
      console.error(`   Error: ${result.error}`);

      // Display any captured warnings/logs
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(w => console.error(`   ${w}`));
      }
    }
  }
}

