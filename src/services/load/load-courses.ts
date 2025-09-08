import { readdir } from "fs/promises"
import { ATTRIBUTE_BRANCH, ATTRIBUTE_CAPTION, ATTRIBUTE_CATEGORIES, ATTRIBUTE_CERTIFICATION, ATTRIBUTE_CLASSMARKER_ID, ATTRIBUTE_CLASSMARKER_REFERENCE, ATTRIBUTE_DURATION, ATTRIBUTE_KEY_POINTS, ATTRIBUTE_LANGUAGE, ATTRIBUTE_NEXT, ATTRIBUTE_PREREQUISITES, ATTRIBUTE_REDIRECT, ATTRIBUTE_REPOSITORY, ATTRIBUTE_REWARD_FORM, ATTRIBUTE_REWARD_IMAGE, ATTRIBUTE_REWARD_PRODUCT_ID, ATTRIBUTE_REWARD_PROVIDER, ATTRIBUTE_REWARD_TYPE, ATTRIBUTE_STATUS, ATTRIBUTE_THUMBNAIL, ATTRIBUTE_TRANSLATIONS, ATTRIBUTE_USECASE, ATTRIBUTE_DATABASE_PROVIDER, ATTRIBUTE_VIDEO, COURSE_DIRECTORY, DEFAULT_COURSE_STATUS, DEFAULT_COURSE_THUMBNAIL, DEFAULT_LANGUAGE, Language, ATTRIBUTE_GRAPH_ANALYTICS_PLUGIN, ATTRIBUTE_VECTOR_OPTIMIZED } from "../../constants"
import { existsSync } from "fs";
import { courseOverviewPath } from "../../utils";
import { join, sep } from "path";
import { loadFile } from "../../modules/asciidoc";

export interface CategoryWithOrder {
  category: string;
  order: number;
}

export type CourseToImport = {
  slug: string;
  language: Language;
  title: string;
  link: string;
  video: string | null;
  repository: string | null;
  duration: string | null;
  redirect: string | null;
  thumbnail: string;
  caption: string;
  status: 'completed' | 'active' | 'draft' | 'test' | 'disabled';
  interested?: string[];
  isInterested?: boolean;
  usecase: string | undefined;
  vectorOptimized?: boolean;
  graphAnalyticsPlugin?: boolean;
  badge?: string;
  prerequisiteSlugs: string[];
  progressToSlugs: string[];
  translationSlugs: string[];
  attributes: Record<string, any>;
  repositories: Record<string, string>;
}

const loadCourse = (slug: string): Promise<CourseToImport> => {
  const file = loadFile(courseOverviewPath(slug), { parse_header_only: true })

  const categories = file.getAttribute(ATTRIBUTE_CATEGORIES, '')
    .split(',')
    .map((e: string) => e?.trim() || '')
    .filter((e: string) => e !== '')
    .map((entry: string) => entry.split(':'))
    // @ts-ignore
    .map(([category, order]) => ({ order: order || '1', category: category?.trim() }))

  const progressToSlugs = file.getAttribute(ATTRIBUTE_NEXT, '')
    .split(',')
    .map((e: string) => e?.trim() || '')
    .filter((e: string) => e !== '')

  // Extract additional properties from course asciidoc attributes
  // (ends with repository, eg :cypher-repository:)
  const repositories = Object.fromEntries(
    Object.entries(file.getAttributes())
      .filter(([key]) => key.endsWith('repository'))
  ) as Record<string, string>

  const language = file.getAttribute(ATTRIBUTE_LANGUAGE, DEFAULT_LANGUAGE)
  const translationSlugs = file.getAttribute(ATTRIBUTE_TRANSLATIONS, '')
    .split(',')
    .filter((e: string) => e !== '')

  // Certification?
  const certification = file.getAttribute(ATTRIBUTE_CERTIFICATION, 'false') === 'true'

  // Key points for
  let keyPoints = file.getAttribute(ATTRIBUTE_KEY_POINTS, null)
  if (typeof keyPoints === 'string') {
    keyPoints = keyPoints.split(',').map(text => text.trim())
  }

  // Repository & branch
  const repository = file.getAttribute(ATTRIBUTE_REPOSITORY, null)
  const branch = repository !== undefined ? file.getAttribute(ATTRIBUTE_BRANCH, 'main') : undefined

  // Prerequisites
  const prerequisites = file.getAttribute(ATTRIBUTE_PREREQUISITES, null)
  const prerequisiteSlugs: string[] = []
  if (typeof prerequisites === 'string') {
    for (const slug of prerequisites.split(',')) {
      prerequisiteSlugs.push(slug.trim())
    }
  }

  return Promise.resolve({
    slug,
    link: `/courses/${slug}/`,
    language,
    translationSlugs,
    title: file.getTitle() as string,
    status: file.getAttribute(ATTRIBUTE_STATUS, DEFAULT_COURSE_STATUS),
    thumbnail: file.getAttribute(ATTRIBUTE_THUMBNAIL, DEFAULT_COURSE_THUMBNAIL),
    caption: file.getAttribute(ATTRIBUTE_CAPTION, null),
    video: file.getAttribute(ATTRIBUTE_VIDEO, null),
    usecase: file.getAttribute(ATTRIBUTE_USECASE, null),
    databaseProvider: file.getAttribute(ATTRIBUTE_DATABASE_PROVIDER, null),
    vectorOptimized: file.getAttribute(ATTRIBUTE_VECTOR_OPTIMIZED, null) === 'true',
    graphAnalyticsPlugin: file.getAttribute(ATTRIBUTE_GRAPH_ANALYTICS_PLUGIN, null) === 'true',
    redirect: file.getAttribute(ATTRIBUTE_REDIRECT, null),
    duration: file.getAttribute(ATTRIBUTE_DURATION, null),
    repository,
    branch,
    certification,
    classmarkerId: file.getAttribute(ATTRIBUTE_CLASSMARKER_ID, null),
    classmarkerReference: file.getAttribute(ATTRIBUTE_CLASSMARKER_REFERENCE, null),
    attributes: {
      rewardType: file.getAttribute(ATTRIBUTE_REWARD_TYPE, null),
      rewardForm: file.getAttribute(ATTRIBUTE_REWARD_FORM, null),
      rewardImage: file.getAttribute(ATTRIBUTE_REWARD_IMAGE, null),
      rewardProvider: file.getAttribute(ATTRIBUTE_REWARD_PROVIDER, null),
      rewardProductId: file.getAttribute(ATTRIBUTE_REWARD_PRODUCT_ID, null),
      keyPoints,
    },
    repositories,
    prerequisiteSlugs,
    progressToSlugs,
    categories,
  })
}

export default async function loadCourses(): Promise<CourseToImport[]> {
  const courses = await readdir(COURSE_DIRECTORY)
    .then(courses => courses.filter(
      slug => existsSync(courseOverviewPath(slug))
    ))

  const output: CourseToImport[] = []

  for (const slug of courses) {
    const course = await loadCourse(slug)

    output.push(course)
  }

  return output
}
