import fs from 'fs'
import path from 'path'
import asciidoctor, { Asciidoctor } from '@asciidoctor/core'
import './converter'
import { inputBlockProcessor } from './extensions/input-block-processor.extension'
import { browserBlockProcessor } from './extensions/browser-block-processor.extension'
import { verifyBlockProcessor } from './extensions/verify.extension'
import { ASCIIDOC_CACHING_ENABLED, ASCIIDOC_DIRECTORY } from '../../constants'
import NotFoundError from '../../errors/not-found.error'
import { mergeDeep } from '../../utils'
import { CourseStatus, CourseStatusInformation } from '../../domain/model/course'
import { ATTRIBUTE_DISABLE_CACHE, ATTRIBUTE_ORDER } from '../../domain/model/lesson'
import { labBlockProcessor } from './extensions/lab-block-processor.extension'
import { workspaceBlockProcessor } from './extensions/workspace-block-processor.extension'

// Cached Pages
const cache: Map<string, string> = new Map()

// Reader
const doc = asciidoctor()

// Register Custom Blocks
const registry = doc.Extensions.create()

inputBlockProcessor(registry)
browserBlockProcessor(registry)
verifyBlockProcessor(registry)
labBlockProcessor(registry)
workspaceBlockProcessor(registry)

// Convert options
const baseOptions: Asciidoctor.ProcessorOptions = {
    // TODO: Note: this is dangerous once we start including remote files
    safe: 'unsafe',
    backend: 'html5',
    template_dir: path.join(__dirname, '..', '..', '..', 'views', '_asciidoc'),
    extension_registry: registry,
    attributes: {
        shared: path.join(ASCIIDOC_DIRECTORY, 'shared'),
        'allow-uri-read': true,
    },
}

export function fileExists(filepath: string): boolean {
    return fs.existsSync(path.join(ASCIIDOC_DIRECTORY, filepath))
}

export function loadFile(filepath: string, options: Asciidoctor.ProcessorOptions = {}): Asciidoctor.Document {
    const mergedOptions = mergeDeep(baseOptions, options)
    const file = doc.loadFile(path.join(ASCIIDOC_DIRECTORY, filepath), mergedOptions)

    return file
}

export function convert(document: Asciidoctor.Document, options: Asciidoctor.ProcessorOptions = {}) {
    return document.convert(mergeDeep(baseOptions, options))
}

export function convertCourseOverview(slug: string, attributes?: Record<string, any>): Promise<string> {
    const folder = path.join('courses', slug)

    const file = path.join(folder, 'course.adoc')

    if (!fileExists(file)) {
        throw new NotFoundError(`Course ${slug} could not be found`)
    }

    const document = loadFile(file, { attributes })

    return Promise.resolve(convert(document))
}

export function convertCourseSummary(slug: string, attributes: Record<string, any> = {}): Promise<string> {
    const folder = path.join('courses', slug)
    const file = path.join(folder, 'summary.adoc')

    if (!fileExists(file)) {
        throw new NotFoundError(`Summary for course ${slug} could not be found`)
    }

    const document = loadFile(file, { attributes })

    return Promise.resolve(convert(document))
}

export function courseSummaryExists(slug: string): Promise<boolean> {
    const folder = path.join('courses', slug)
    const file = path.join(folder, 'summary.adoc')

    return Promise.resolve(fileExists(file))
}

export function convertModuleOverview(course: string, module: string, attributes: Record<string, any> = {}): Promise<string> {
    const folder = path.join('courses', course, 'modules', module)
    const file = path.join(folder, 'module.adoc')

    if (!fileExists(file)) {
        throw new NotFoundError(`Module ${module} could not be found in ${course}`)
    }

    const document = loadFile(file, { attributes })

    return Promise.resolve(convert(document))
}

export function getCourseDirectory(course: string): string {
    return path.join('courses', course)
}

export function getModuleDirectory(course: string, module: string): string {
    return path.join('courses', course, 'modules', module)
}

export function getLessonDirectory(course: string, module: string, lesson: string): string {
    return path.join('courses', course, 'modules', module, 'lessons', lesson)
}

export function getLessonOverview(course: string, module: string, lesson: string, attributes: Record<string, any> = {}): Promise<Asciidoctor.Document> {
    const file = path.join(getLessonDirectory(course, module, lesson), 'lesson.adoc')

    if (!fileExists(file)) {
        throw new NotFoundError(`Lesson ${lesson} could not be found in ${course}/${module}`)
    }

    return Promise.resolve(loadFile(file, { attributes }))
}

export async function convertLessonOverview(course: string, module: string, lesson: string, attributes: Record<string, any> = {}): Promise<string> {
    const key = generateLessonCacheKey(course, module, lesson)

    if (cache.has(key)) {
        return cache.get(key) as string
    }

    const document = await getLessonOverview(course, module, lesson, attributes)

    const html = convert(document, { attributes })

    // Cache for future visits?
    checkAddToCache(key, html, document)

    return html
}


function checkAddToCache(key: string, html: string, document: Asciidoctor.Document) {
    if (document.getAttribute(ATTRIBUTE_DISABLE_CACHE, 'false') !== 'true' && ASCIIDOC_CACHING_ENABLED) {
        cache.set(key, html)
    }
}

export function addToCache(key: string, html: string): void {
    cache.set(key, html)
}

export function generateLessonCacheKey(course: string, module: string, lesson: string): string {
    return `${course}/${module}/${lesson}`
}


const statusCache: Map<CourseStatus, CourseStatusInformation> = new Map()

export function getStatusDetails(slug: CourseStatus): CourseStatusInformation {
    if (statusCache.has(slug)) {
        return statusCache.get(slug) as CourseStatusInformation
    }

    // Load from asciidoc/status/{status}.adoc
    const folder = path.join('statuses', `${slug}.adoc`)

    const info = loadFile(folder)

    const output = {
        slug,
        name: info.getTitle() as string,
        order: parseInt(info.getAttribute(ATTRIBUTE_ORDER, 999)),
        description: info.convert(),
    }

    // Add to cache
    statusCache.set(slug, output)

    return output
}
