import path from 'path'
import asciidoctor, { Asciidoctor } from '@asciidoctor/core'
import './converter'
import { inputBlockProcessor } from './extensions/input-block-processor.extension'
import { browserBlockProcessor } from './extensions/browser-block-processor.extension'

// Reader
const doc = asciidoctor()

// Register Custom Blocks
// @ts-ignore
const registry = doc.Extensions.create()
inputBlockProcessor(registry)
browserBlockProcessor(registry)

// Convert options
const options: Asciidoctor.ProcessorOptions = {
    safe: 'safe',
    backend: 'html5',
    template_dir: path.join(__dirname, '..', '..', '..', 'views', '_asciidoc'),
    extension_registry: registry,
}

export function loadFile(path: string): Asciidoctor.Document {
    const file = doc.loadFile(path, options)

    return file
}

export function convert(document: Asciidoctor.Document, attributes = {}) {
    // TODO: Extend Options
    return document.convert({
        ...options,
        attributes,
    })
}

export async function convertCourseOverview(slug: string) {
    const folder = path.join(__dirname, '..', '..', '..', 'asciidoc', 'courses', slug)
    const document = loadFile(path.join(folder, 'overview.adoc'))

    return convert(document)
}

export async function convertModuleOverview(course: string, module: string) {
    const folder = path.join(__dirname, '..', '..', '..', 'asciidoc', 'courses', course, 'modules', module)
    const document = loadFile(path.join(folder, 'overview.adoc'))

    return convert(document)
}

export async function getLessonOverview(course: string, module: string, lesson: string): Promise<Asciidoctor.Document> {
    const file = path.join(__dirname, '..', '..', '..', 'asciidoc', 'courses', course, 'modules', module, 'lessons', lesson, 'index.adoc')
    return loadFile(file)
}

export async function convertLessonOverview(course: string, module: string, lesson: string, attributes: Record<string, any> = {}) {
    const document = await getLessonOverview(course, module, lesson)

    return convert(document, attributes)
}