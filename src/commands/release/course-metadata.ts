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
  ATTRIBUTE_DURATION,
  ATTRIBUTE_KEY_POINTS,
  ATTRIBUTE_USECASE,
} from "../../constants";
import { courseOverviewPath, courseBannerPath } from "../../utils";

export interface CourseMetadata {
  title: string;
  caption: string;
  link: string;
  keyPoints: string;
  categories: string;
  /** Course directory slug (e.g. "workshop-gds"). */
  slug: string;
  /** Sandbox use-case identifier (e.g. "blank-sandbox", "recommendations"). */
  usecase: string;
  /**
   * Which day of a practitioner event series this course runs on (from
   * `practitioner:N` in the categories attribute). Null if not a practitioner
   * course.
   */
  practitionerDay: number | null;
  /** Workshop duration in hours, parsed from the :duration: attribute. */
  durationHours: number;
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
  const categories = (file.getAttribute(ATTRIBUTE_CATEGORIES, "") ?? "") as string;

  let keyPoints = file.getAttribute(ATTRIBUTE_KEY_POINTS, null);
  if (Array.isArray(keyPoints)) {
    keyPoints = keyPoints.join(", ");
  }
  const keyPointsStr = keyPoints ?? "";

  const slug = path.basename(path.dirname(resolved));
  const link = `${baseUrl.replace(/\/$/, "")}/courses/${slug}`;
  const bannerPath = courseBannerPath(slug);

  // use-case: some files use :usecase:, others :use-case:
  const usecase = ((file.getAttribute(ATTRIBUTE_USECASE, null) ??
    file.getAttribute("use-case", null) ??
    "") as string);

  // practitioner:N in categories → day N of the event series
  const practitionerMatch = categories.match(/\bpractitioner:(\d+)\b/);
  const practitionerDay = practitionerMatch ? parseInt(practitionerMatch[1], 10) : null;

  // :duration: "4 hours" → 4
  const durationRaw = (file.getAttribute(ATTRIBUTE_DURATION, "4") ?? "4") as string;
  const durationMatch = String(durationRaw).match(/(\d+(?:\.\d+)?)/);
  const durationHours = durationMatch ? parseFloat(durationMatch[1]) : 4;

  return {
    title,
    caption,
    link,
    keyPoints: keyPointsStr,
    categories,
    slug,
    usecase,
    practitionerDay,
    durationHours,
    bannerPath: existsSync(bannerPath) ? bannerPath : undefined,
  };
}
