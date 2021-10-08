import fs from 'fs'
import path from 'path'
import asciidoctor, { Asciidoctor } from '@asciidoctor/core'
import './converter'
import { inputBlockProcessor } from './extensions/input-block-processor.extension'
import { browserBlockProcessor } from './extensions/browser-block-processor.extension'
import { verifyBlockProcessor } from './extensions/verify.extension'
import { ASCIIDOC_DIRECTORY } from '../../constants'
import NotFoundError from '../../errors/not-found.error'
import { mergeDeep } from '../../utils'

// Reader
const doc = asciidoctor()

// Register Custom Blocks
// @ts-ignore
const registry = doc.Extensions.create()
inputBlockProcessor(registry)
browserBlockProcessor(registry)
verifyBlockProcessor(registry)

// Convert options
const baseOptions: Asciidoctor.ProcessorOptions = {
    safe: 'safe',
    backend: 'html5',
    template_dir: path.join(__dirname, '..', '..', '..', 'views', '_asciidoc'),
    extension_registry: registry,
}

export function fileExists(filepath: string): boolean {
    return fs.existsSync(path.join(ASCIIDOC_DIRECTORY, filepath))
}



export function loadFile(filepath: string, options: Asciidoctor.ProcessorOptions = {}): Asciidoctor.Document {
    const file = doc.loadFile(path.join(ASCIIDOC_DIRECTORY, filepath), mergeDeep(baseOptions, options))

    return file
}

export function convert(document: Asciidoctor.Document, options: Asciidoctor.ProcessorOptions = {}) {
    // TODO: Extend Options
    return document.convert(mergeDeep(baseOptions, options))
}

export async function convertCourseOverview(slug: string, attributes?: Record<string, any>) {
    const folder = path.join('courses', slug)

    const file = path.join(folder, 'course.adoc')

    if ( !fileExists(file) ) {
        throw new NotFoundError(`Course ${slug} could not be found`)
    }

    const document = loadFile(file, { attributes })

    return convert(document)
}

export async function convertCourseSummary(slug: string, attributes: Record<string, any> = {}) {
    const folder = path.join('courses', slug)
    const file = path.join(folder, 'summary.adoc')

    if ( !fileExists(file) ) {
        throw new NotFoundError(`Summary for course ${slug} could not be found`)
    }

    const document = loadFile(file, { attributes })

    return convert(document)
}

export async function courseSummaryExists(slug: string) {
    const folder = path.join('courses', slug)
    const file = path.join(folder, 'summary.adoc')

    return fileExists(file)
}

export async function convertModuleOverview(course: string, module: string, attributes: Record<string, any> = {}) {
    const folder = path.join('courses', course, 'modules', module)
    const file = path.join(folder, 'module.adoc')

    if ( !fileExists(file) ) {
        throw new NotFoundError(`Module ${module} could not be found in ${course}`)
    }

    const document = loadFile(file, { attributes })

    return convert(document)
}

export function getLessonDirectory(course: string, module: string, lesson: string): string {
    return path.join('courses', course, 'modules', module, 'lessons', lesson)
}

export async function getLessonOverview(course: string, module: string, lesson: string, attributes: Record<string, any> = {}): Promise<Asciidoctor.Document> {
    const file = path.join(getLessonDirectory(course, module, lesson), 'lesson.adoc')

    if ( !fileExists(file) ) {
        throw new NotFoundError(`Module ${lesson} could not be found in ${course}/${module}`)
    }

    return loadFile(file, { attributes })
}

export async function convertLessonOverview(course: string, module: string, lesson: string, attributes: Record<string, any> = {}) {
    const document = await getLessonOverview(course, module, lesson, attributes)

    return convert(document, { attributes })
}