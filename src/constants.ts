import { config } from 'dotenv'
import path from 'path'

// Load from .env
config({
    path: process.env.ENV_FILE ? process.env.ENV_FILE : '.env'
})

export enum Language {
    EN = "en",
    JP = "jp",
    CN = "cn",
}

// Neo4j Credentials
export const NEO4J_HOST: string = process.env.NEO4J_HOST as string
export const NEO4J_USERNAME: string = process.env.NEO4J_USERNAME as string
export const NEO4J_PASSWORD: string = process.env.NEO4J_PASSWORD as string

// Directories
export const ASCIIDOC_DIRECTORY = path.resolve(__dirname, '..', 'asciidoc')
export const PUBLIC_DIRECTORY = path.resolve(__dirname, '..', 'public')
export const IMG_DIRECTORY = path.join(PUBLIC_DIRECTORY, 'img')

export const COURSE_DIRECTORY = path.join(ASCIIDOC_DIRECTORY, 'courses')
export const CATEGORY_DIRECTORY = path.join(ASCIIDOC_DIRECTORY, 'categories')

export const BUILD_DIRECTORY = path.resolve(__dirname, '..', 'build')
export const HTML_DIRECTORY = path.join(BUILD_DIRECTORY, 'html')


// Course Import
export const DEFAULT_COURSE_THUMBNAIL = '/img/course-placeholder.jpg'
export const DEFAULT_COURSE_STATUS = 'draft'
export const DEFAULT_LANGUAGE = 'en'
export const DEFAULT_LESSON_TYPE = 'lesson'
export const STATUS_ACTIVE = 'active'
export const STATUS_DISABLED = 'disabled'

// Asciidoc attributes
export const ATTRIBUTE_PARENT = 'parent'
export const ATTRIBUTE_SHORTNAME = 'shortname'
export const ATTRIBUTE_LINK = 'link'
export const ATTRIBUTE_STATUS = 'status'
export const ATTRIBUTE_THUMBNAIL = 'thumbnail'
export const ATTRIBUTE_CAPTION = 'caption'
export const ATTRIBUTE_VIDEO = 'video'
export const ATTRIBUTE_USECASE = 'usecase'
export const ATTRIBUTE_CATEGORIES = 'categories'
export const ATTRIBUTE_REDIRECT = 'redirect'
export const ATTRIBUTE_PREVIOUS = 'previous'
export const ATTRIBUTE_NEXT = 'next'
export const ATTRIBUTE_LANGUAGE = 'lang'
export const ATTRIBUTE_TRANSLATIONS = 'translations'
export const ATTRIBUTE_CERTIFICATION = 'certification'
export const ATTRIBUTE_CLASSMARKER_ID = 'classmarker-id'
export const ATTRIBUTE_CLASSMARKER_REFERENCE = 'classmarker-reference'
export const ATTRIBUTE_TYPE = 'type'
export const ATTRIBUTE_ORDER = 'order'

export const ATTRIBUTE_DURATION = 'duration'
export const ATTRIBUTE_SANDBOX = 'sandbox'
export const ATTRIBUTE_REPOSITORY = 'repository'
export const ATTRIBUTE_PREREQUISITES = 'prerequisites'
export const ATTRIBUTE_BRANCH = 'branch'
export const ATTRIBUTE_OPTIONAL = 'optional'
export const ATTRIBUTE_DISABLE_CACHE = 'disable-cache'
export const ATTRIBUTE_UPDATED_AT = 'updated-at'
export const ATTRIBUTE_LAB = 'lab'
export const ATTRIBUTE_REWARD_TYPE = 'reward-type'
export const ATTRIBUTE_REWARD_FORM = 'reward-form'
export const ATTRIBUTE_REWARD_IMAGE = 'reward-image'
export const ATTRIBUTE_REWARD_PROVIDER = 'reward-provider'
export const ATTRIBUTE_REWARD_PRODUCT_ID = 'reward-product-id'
export const ATTRIBUTE_DESCRIPTION = 'description'
export const ATTRIBUTE_SLIDES = 'slides'
export const ATTRIBUTE_SEQUENTIAL = 'sequential'

export const ATTRIBUTE_KEY_POINTS = 'key-points'

// Workspace
export const WORKSPACE_URL = process.env.WORKSPACE_URL || 'https://workspace-preview.neo4j.io'