import asciidoctor, { Asciidoctor } from '@asciidoctor/core'
import { inputBlockProcessor } from './extensions/input-block-processor.extension'
import { browserBlockProcessor } from './extensions/browser-block-processor.extension'
import { verifyBlockProcessor } from './extensions/verify.extension'
import { labBlockProcessor } from './extensions/lab-block-processor.extension'
import { workspaceBlockProcessor } from './extensions/workspace-block-processor.extension'
import { ASCIIDOC_DIRECTORY } from '../../constants'
import { join } from 'path'
import { mergeDeep } from '../../utils'
import { kgBuilderBlockProcessor } from './extensions/kgbuilder-block-processor.extension'

// Reader
export const doc = asciidoctor()

// Register Custom Blocks
const registry = doc.Extensions.create()

inputBlockProcessor(registry)
browserBlockProcessor(registry)
verifyBlockProcessor(registry)
labBlockProcessor(registry)
workspaceBlockProcessor(registry)
kgBuilderBlockProcessor(registry)

// Convert options
const baseOptions: Asciidoctor.ProcessorOptions = {
    // TODO: Note: this is dangerous once we start including remote files
    safe: 'unsafe',
    backend: 'html5',
    template_dir: join(__dirname, '..', '..', '..', 'views', '_asciidoc'),
    extension_registry: registry,
    attributes: {
        shared: join(ASCIIDOC_DIRECTORY, 'shared'),
        'allow-uri-read': true,
    },
}


export function loadFile(filepath: string, options: Asciidoctor.ProcessorOptions = {}): Asciidoctor.Document {
    const file = doc.loadFile(filepath, mergeDeep(baseOptions, options))

    return file
}

export function convert(document: Asciidoctor.Document, options: Asciidoctor.ProcessorOptions = {}) {
    return document.convert(mergeDeep(baseOptions, options))
}
