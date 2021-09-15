import path from 'path'
import { STATUS_DRAFT } from './domain/model/course'
const {
    DISCOURSE_BASE_URL,
    DISCOURSE_CATEGORY_ID,
    DISCOURSE_CATEGORY_SLUG,
    DISCORD_ID
} = process.env

export const BASE_URL = process.env.BASE_URL

export const DEFAULT_COURSE_THUMBNAIL = '/img/course-placeholder.jpg'
export const DEFAULT_COURSE_STATUS = STATUS_DRAFT

export const ASCIIDOC_DIRECTORY = path.resolve(__dirname, '..', process.env.ASCIIDOC_DIRECTORY || 'asciidoc')
export const PUBLIC_DIRECTORY = path.resolve(__dirname, '..', 'public')

// Community
export const COMMUNITY_BASE_URL = DISCOURSE_BASE_URL
export const COMMUNITY_TITLE = 'Neo4j Community Site'
export const COMMUNITY_LINK = `${DISCOURSE_BASE_URL}/c/${DISCOURSE_CATEGORY_SLUG}`
export const COMMUNITY_POSTS = `${DISCOURSE_BASE_URL}/c/${DISCOURSE_CATEGORY_SLUG}/${DISCOURSE_CATEGORY_ID}.json`

// Chat
export const CHAT_TITLE = 'Neo4j Discord'
export const CHAT_LINK = 'https://discord.gg/adFrdwKrvf'
export const CHAT_JSON = `https://discord.com/api/guilds/${DISCORD_ID}/widget.json`