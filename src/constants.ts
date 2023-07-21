import { config } from 'dotenv'
import path from 'path'
import { STATUS_DRAFT } from './domain/model/course'

// Load from .env
config({
    path: process.env.ENV_FILE ? process.env.ENV_FILE : '.env',
})

const { PROFILE, CACHE_ASCIIDOC, DISCOURSE_BASE_URL, DISCOURSE_CATEGORY_ID, DISCOURSE_CATEGORY_SLUG, COMMUNITY_RSS_FEED, DISCORD_ID } = process.env

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const BASE_URL = process.env.BASE_URL
export const DOMAIN = new URL(BASE_URL as string).hostname

export const DEFAULT_COURSE_THUMBNAIL = '/img/static/course-placeholder.jpg'
export const DEFAULT_COURSE_STATUS = STATUS_DRAFT

export const ASCIIDOC_DIRECTORY = path.resolve(__dirname, '..', process.env.ASCIIDOC_DIRECTORY || 'asciidoc')
export const PUBLIC_DIRECTORY = path.resolve(__dirname, '..', 'public')

// Community
export const COMMUNITY_HAS_BASE_URL = !!DISCOURSE_BASE_URL
export const COMMUNITY_BASE_URL = DISCOURSE_BASE_URL
export const COMMUNITY_TITLE = 'Neo4j Community Site'
export const COMMUNITY_LINK = `${DISCOURSE_BASE_URL}/c/${DISCOURSE_CATEGORY_SLUG}/${DISCOURSE_CATEGORY_ID}`
export const COMMUNITY_RSS_URL = COMMUNITY_RSS_FEED

// Chat
export const CHAT_TITLE = 'Neo4j Discord'
export const CHAT_LINK = 'https://discord.gg/adFrdwKrvf'
export const CHAT_JSON = `https://discord.com/api/guilds/${DISCORD_ID}/widget.json`

// CDN
export const CDN_URL = process.env.CDN_URL || ''

// Port
export const PORT: string = process.env.PORT || ('3000' as string)

// Neo4j Credentials
export const NEO4J_HOST: string = process.env.NEO4J_HOST as string
export const NEO4J_USERNAME: string = process.env.NEO4J_USERNAME as string
export const NEO4J_PASSWORD: string = process.env.NEO4J_PASSWORD as string

// Community Graph
export const COMMUNITY_GRAPH_HOST: string = process.env.COMMUNITY_GRAPH_HOST as string
export const COMMUNITY_GRAPH_USERNAME: string = process.env.COMMUNITY_GRAPH_USERNAME as string
export const COMMUNITY_GRAPH_PASSWORD: string = process.env.COMMUNITY_GRAPH_PASSWORD as string

// Enrolment Reminder Emails
export const ENROLMENT_REMINDER_LIMIT: string = process.env.ENROLMENT_REMINDER_LIMIT as string
export const ENROLMENT_REMINDER_DAYS: string = process.env.ENROLMENT_REMINDER_DAYS as string

const truthy = (value: string | undefined) => value && value !== 'false'

// Enable Profiling
export const PROFILING_ENABLED = truthy(PROFILE)

// Cache Asciidoc content?
export const ASCIIDOC_CACHING_ENABLED = IS_PRODUCTION || truthy(CACHE_ASCIIDOC) || false

// Redis host
export const REDIS_HOST = process.env.REDIS_HOST

// Classmarker secret for webhook
export const CLASSMARKER_SECRET: string | undefined = process.env.CLASSMARKER_SECRET

// Segment
export const SEGMENT_API_KEY: string | undefined = process.env.SEGMENT_API_KEY

// Course
export const COURSE_QUIZ_AVAILABLE_AFTER = 7

// Printful
export const PRINTFUL_API_KEY: string | undefined = process.env.PRINTFUL_API_KEY
export const PRINTFUL_STORE_ID: string | undefined = process.env.PRINTFUL_STORE_ID

// Slack
export const SLACK_TOKEN: string | undefined = process.env.SLACK_TOKEN
export const SLACK_CHANNEL: string | undefined = process.env.SLACK_CHANNEL

// Google Analytics
export const GOOGLE_ANALYTICS_MEASUREMENT_ID: string | undefined = process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID

// Twitter
export const TWITTER_TAG_ID: string | undefined = process.env.TWITTER_TAG_ID

// Bugsnag
export const BUGSNAG_API_KEY: string | undefined = process.env.BUGSNAG_API_KEY
export const PUBLIC_BUGSNAG_API_KEY: string | undefined = process.env.PUBLIC_BUGSNAG_API_KEY

// Google Auth & Sheets
export const GOOGLE_KEY_FILE: string | undefined = process.env.GOOGLE_KEY_FILE
export const TSHIRT_SHEET_ID: string | undefined = process.env.TSHIRT_SHEET_ID

// Workspace
export const WORKSPACE_URL = process.env.WORKSPACE_URL || 'https://workspace-preview.neo4j.io'

// Sandbox
export const SANDBOX_URL = process.env.SANDBOX_URL

// GraphQL Toolbox
export const GRAPHQL_TOOLBOX_URL = process.env.GRAPHQL_TOOLBOX_URL || 'https://graphql-toolbox.neo4j.io/'

// GraphAcademy bot
export const GRAPHACADEMY_CHATBOT_USERAGENT = 'GraphAcademyElaineBot/1.0'

export const COHERE_API_URL = 'https://api.cohere.ai/v1/'
export const COHERE_API_KEY = process.env.COHERE_API_KEY

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY
export const OPENAI_CHAT_MODEL = 'gpt-3.5-turbo'

export const CHATBOT_NEO4J_HOST = process.env.CHATBOT_NEO4J_HOST
export const CHATBOT_NEO4J_USERNAME = process.env.CHATBOT_NEO4J_USERNAME
export const CHATBOT_NEO4J_PASSWORD = process.env.CHATBOT_NEO4J_PASSWORD
export const CHATBOT_NEO4J_DATABASE = process.env.CHATBOT_NEO4J_DATABASE

// Auth0
export const AUTH0_ISSUER_BASE_URL = new URL(process.env.AUTH0_ISSUER_BASE_URL as string).hostname
