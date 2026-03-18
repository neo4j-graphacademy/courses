/**
 * Shared helpers for release commands (Asana, Slack): resolve course path and
 * read metadata from course.adoc so attributes and link building stay in sync.
 */

import path from "path";
import { existsSync } from "fs";

import { loadFile } from "../../modules/asciidoc";
import {
  ATTRIBUTE_CAPTION,
  ATTRIBUTE_CATEGORIES,
  ATTRIBUTE_KEY_POINTS,
} from "../../constants";
import { courseOverviewPath, courseBannerPath } from "../../utils";

export interface CourseMetadata {
  title: string;
  caption: string;
  link: string;
  keyPoints: string;
  categories: string;
  /** Local path to course banner.png when it exists (used by Slack). */
  bannerPath?: string;
}

/**
 * Resolve a course slug (e.g. aura-agents) or path to a course.adoc file path.
 */
export function resolveCoursePath(slugOrPath: string): string {
  if (path.isAbsolute(slugOrPath)) {
    return slugOrPath;
  }
  const hasPathSep = slugOrPath.includes(path.sep) || slugOrPath.includes("/");
  if (!hasPathSep && !slugOrPath.endsWith(".adoc")) {
    return courseOverviewPath(slugOrPath);
  }
  return path.resolve(process.cwd(), slugOrPath);
}

/**
 * Load course.adoc and return metadata (title, caption, link, key points, categories).
 * Link is built from baseUrl and course slug. Optionally includes bannerPath when banner.png exists.
 */
export function readCourseMetadata(
  courseAdocPath: string,
  baseUrl: string = "https://graphacademy.neo4j.com",
): CourseMetadata {
  const resolved = path.isAbsolute(courseAdocPath)
    ? courseAdocPath
    : path.resolve(process.cwd(), courseAdocPath);

  const file = loadFile(resolved, { parse_header_only: true });

  const title = (file.getTitle() as string) ?? "Untitled course";
  const caption = file.getAttribute(ATTRIBUTE_CAPTION, null) ?? "";
  const categories = file.getAttribute(ATTRIBUTE_CATEGORIES, "") ?? "";

  let keyPoints = file.getAttribute(ATTRIBUTE_KEY_POINTS, null);
  if (Array.isArray(keyPoints)) {
    keyPoints = keyPoints.join(", ");
  }
  const keyPointsStr = keyPoints ?? "";

  const slug = path.basename(path.dirname(resolved));
  const link = `${baseUrl.replace(/\/$/, "")}/courses/${slug}`;
  const bannerPath = courseBannerPath(slug);

  return {
    title,
    caption,
    link,
    keyPoints: keyPointsStr,
    categories,
    bannerPath: existsSync(bannerPath) ? bannerPath : undefined,
  };
}
