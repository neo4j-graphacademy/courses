import path from 'path'
import asciidoctor, { Asciidoctor } from '@asciidoctor/core'
import './converter'
import { inputBlockProcessor } from './extensions/input-block-processor.extension'
import { browserBlockProcessor } from './extensions/browser-block-processor.extension'
import { ASCIIDOC_DIRECTORY } from '../../constants'

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
    const document = loadFile(path.join(folder, 'course.adoc'))

    return convert(document)
}

export async function convertModuleOverview(course: string, module: string) {
    const folder = path.join('courses', course, 'modules', module)
    const document = loadFile(path.join(folder, 'module.adoc'))

    return convert(document)
}

export async function getLessonOverview(course: string, module: string, lesson: string): Promise<Asciidoctor.Document> {
    const file = path.join('courses', course, 'modules', module, 'lessons', lesson, 'lesson.adoc')
    return loadFile(file)
}

export async function convertLessonOverview(course: string, module: string, lesson: string, attributes: Record<string, any> = {}) {
    const document = await getLessonOverview(course, module, lesson)

    return convert(document, attributes)
}