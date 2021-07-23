import path from 'path'
import { STATUS_DRAFT } from './domain/model/course'

export const BASE_URL = process.env.BASE_URL

export const DEFAULT_COURSE_THUMBNAIL = '/img/course-placeholder.jpg'
export const DEFAULT_COURSE_STATUS = STATUS_DRAFT

export const ASCIIDOC_DIRECTORY = path.resolve(__dirname, '..', process.env.ASCIIDOC_DIRECTORY || 'asciidoc')

export const RESET_CYPHER_FILENAME = 'reset.cypher'