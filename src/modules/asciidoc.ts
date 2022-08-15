import path from 'path'
import asciidoctor, { Asciidoctor } from '@asciidoctor/core'
import { ASCIIDOC_DIRECTORY } from '../constants'

// Reader
const doc = asciidoctor()

export function loadFile(filepath: string, options: Asciidoctor.ProcessorOptions = {}): Asciidoctor.Document {
    const file = doc.loadFile(filepath, options)

    return file
}
