import path from 'path'
import { STATUS_DRAFT } from './domain/model/course'

export const DEFAULT_COURSE_THUMBNAIL = '/img/course-thumbnail.png'
export const DEFAULT_COURSE_STATUS = STATUS_DRAFT

export const ASCIIDOC_DIRECTORY = path.resolve(__dirname, '..', process.env.ASCIIDOC_DIRECTORY || 'asciidoc')
