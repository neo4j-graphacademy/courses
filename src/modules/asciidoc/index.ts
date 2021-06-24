import fs from 'fs'
import path from 'path'
import asciidoctor, { Asciidoctor } from '@asciidoctor/core'
import './converter'
import { inputBlockProcessor } from './extensions/input-block-processor.extension'
import { browserBlockProcessor } from './extensions/browser-block-processor.extension'
import { ASCIIDOC_DIRECTORY } from '../../constants'
import NotFoundError from '../../errors/not-found.error'

// Reader
const doc = asciidoctor()

// Register Custom Blocks
// @ts-ignore
const registry = doc.Extensions.create()
inputBlockProcessor(registry)
browserBlockProcessor(registry)

// Convert options
const baseOptions: Asciidoctor.ProcessorOptions = {
    safe: 'safe',
    backend: 'html5',
    template_dir: path.join(__dirname, '..', '..', '..', 'views', '_asciidoc'),
    extension_registry: registry,
}

export function loadFile(filepath: string, options: Record<string, any> = {}): Asciidoctor.Document {
    // TODO: Remove
    const doc = asciidoctor()
    doc.TemplateConverter.clearCache()

    const file = doc.loadFile(path.join(ASCIIDOC_DIRECTORY, filepath), {
        ...baseOptions,
        ...options,
    })

    return file
}

export function convert(document: Asciidoctor.Document, options: Record<string, any> = {}) {
    // TODO: Extend Options
    return document.convert({
        ...baseOptions,
        ...options,
    })
}

export async function convertCourseOverview(slug: string) {
    const folder = path.join('courses', slug)

    const file = path.join(folder, 'course.adoc')

    if ( !fs.existsSync(file) ) {
        throw new NotFoundError(`Module ${slug} could not be found`)
    }

    const document = loadFile(file)

    return convert(document)
}

export async function convertModuleOverview(course: string, module: string) {
    const folder = path.join('courses', course, 'modules', module)
    const file = path.join(folder, 'module.adoc')

    if ( !fs.existsSync(file) ) {
        throw new NotFoundError(`Module ${module} could not be found in ${course}`)
    }

    const document = loadFile(file)

    return convert(document)
}

export async function getLessonOverview(course: string, module: string, lesson: string): Promise<Asciidoctor.Document> {
    const file = path.join('courses', course, 'modules', module, 'lessons', lesson, 'lesson.adoc')

    if ( !fs.existsSync(file) ) {
        throw new NotFoundError(`Module ${lesson} could not be found in ${course}/${module}`)
    }

    return loadFile(file)
}

export async function convertLessonOverview(course: string, module: string, lesson: string, attributes: Record<string, any> = {}) {
    const document = await getLessonOverview(course, module, lesson)

    return convert(document, attributes)
}