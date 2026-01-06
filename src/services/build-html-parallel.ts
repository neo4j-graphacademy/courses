import buildCourseHtml from "./build/build-course-html-parallel";
import buildLessonHtml from "./build/build-lesson-html-parallel";
import buildModuleHtml from "./build/build-module-html-parallel";
import load from "./load";
import { WorkerPool } from "../workers/worker-pool";
import { join } from "path";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { BUILD_DIRECTORY } from "../constants";

async function preCreateDirectories(
  courses: any[],
  modules: any[],
  lessons: any[]
): Promise<void> {
  console.log("   -- Pre-creating directories...");

  const dirsToCreate = new Set<string>();

  // Build directory
  dirsToCreate.add(join(BUILD_DIRECTORY, "html"));

  // Course directories
  for (const course of courses) {
    dirsToCreate.add(join(BUILD_DIRECTORY, "html", course.slug));
  }

  // Module directories
  for (const module of modules) {
    dirsToCreate.add(join(BUILD_DIRECTORY, "html", module.course.slug));
    dirsToCreate.add(
      join(BUILD_DIRECTORY, "html", module.course.slug, module.slug)
    );
  }

  // Lesson directories
  for (const lesson of lessons) {
    dirsToCreate.add(join(BUILD_DIRECTORY, "html", lesson.course.slug));
    dirsToCreate.add(
      join(BUILD_DIRECTORY, "html", lesson.course.slug, lesson.module.slug)
    );
    dirsToCreate.add(
      join(
        BUILD_DIRECTORY,
        "html",
        lesson.course.slug,
        lesson.module.slug,
        lesson.slug
      )
    );
  }

  // Create all directories in parallel
  await Promise.all(
    Array.from(dirsToCreate).map(async (dir) => {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    })
  );

  console.log(`   -- Created ${dirsToCreate.size} directories`);
}

export default async function buildHtml(): Promise<void> {
  const { courses, modules, lessons } = await load();

  console.log(`↔️  Building HTML with Worker Threads`);

  // Pre-create all directories to avoid race conditions
  await preCreateDirectories(courses, modules, lessons);

  // Get the worker script path - use .ts file with ts-node
  const workerPath = join(__dirname, "..", "workers", "build-html.worker.ts");

  // Create worker pool
  const workerPool = new WorkerPool(workerPath);
  console.log(
    `   -- Created worker pool with ${workerPool.getPoolSize()} workers`
  );

  try {
    // Build all HTML in parallel using worker threads
    const startTime = Date.now();

    let completed = 0;
    const total = courses.length * 2 + modules.length + lessons.length; // courses have 2 files each

    // Progress tracking wrapper
    const trackProgress = async (promise: Promise<void>, name: string) => {
      try {
        await promise;
        completed++;
        if (completed % 50 === 0 || completed === total) {
          console.log(
            `   -- Progress: ${completed}/${total} files (${(
              (completed / total) *
              100
            ).toFixed(1)}%)`
          );
        }
      } catch (error) {
        completed++;
        console.error(`❌ Failed to build: ${name}`);
        throw error;
      }
    };

    await Promise.all([
      // Build all courses in parallel
      ...courses.flatMap((course) => [
        trackProgress(
          buildCourseHtml(course, workerPool),
          `${course.slug}/course.adoc`
        ),
      ]),

      // Build all modules in parallel
      ...modules.map((module) =>
        trackProgress(
          buildModuleHtml(module, workerPool),
          `${module.course.slug}/${module.slug}/module.adoc`
        )
      ),

      // Build all lessons in parallel
      ...lessons.map((lesson) =>
        trackProgress(
          buildLessonHtml(lesson, workerPool),
          `${lesson.course.slug}/${lesson.module.slug}/${lesson.slug}/lesson.adoc`
        )
      ),
    ]);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ Build completed successfully!`);
    console.log(
      `   -- ${courses.length} courses (${courses.length * 2} files)`
    );
    console.log(`   -- ${modules.length} modules`);
    console.log(`   -- ${lessons.length} lessons`);
    console.log(`   -- Total: ${total} files in ${duration}s`);
    console.log(
      `   -- Speed: ${(total / parseFloat(duration)).toFixed(1)} files/second`
    );
  } finally {
    // Always terminate workers
    await workerPool.terminate();
  }
}
