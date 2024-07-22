import { Express } from 'express'
import { BASE_URL, CDN_URL, CHATBOT_NEO4J_HOST, CHATBOT_NEO4J_PASSWORD, CHATBOT_NEO4J_USERNAME, GOOGLE_TAG_MANAGER_ID, IS_PRODUCTION, PUBLIC_BUGSNAG_API_KEY, TWITTER_TAG_ID } from '../constants'
import { LANGUAGE_CN, LANGUAGE_EN, LANGUAGE_JP, STATUS_DRAFT, STATUS_ACTIVE, NEGATIVE_STATUSES } from '../domain/model/course'
import {
    LESSON_TYPE_VIDEO,
    LESSON_TYPE_TEXT,
    LESSON_TYPE_QUIZ,
    LESSON_TYPE_ACTIVITY,
    LESSON_TYPE_CHALLENGE,
} from '../domain/model/lesson'
import { getPhrase } from '../modules/localisation'
import { getSvgs, relativeTime } from '../utils'


export function registerLocals(app: Express) {
    app.use((req, res, next) => {
        // Load constants into locals
        res.locals.statuses = {
            STATUS_DRAFT,
            STATUS_ACTIVE,
        }
        res.locals.negativeStatuses = NEGATIVE_STATUSES

        res.locals.lessonType = {
            LESSON_TYPE_VIDEO,
            LESSON_TYPE_TEXT,
            LESSON_TYPE_QUIZ,
            LESSON_TYPE_ACTIVITY,
            LESSON_TYPE_CHALLENGE,
        }

        // GA
        res.locals.ga = {
            gtm_id: GOOGLE_TAG_MANAGER_ID,
        }

        // Bugsnag
        res.locals.bugsnag = {
            apiKey: PUBLIC_BUGSNAG_API_KEY,
        }

        res.locals.twitter = {
            tagId: TWITTER_TAG_ID,
        }

        // Language Dropdown
        res.locals.languages = {
            [LANGUAGE_EN]: getPhrase(LANGUAGE_EN, 'language', LANGUAGE_EN),
            // [LANGUAGE_CN]: getPhrase(LANGUAGE_CN, 'language', LANGUAGE_CN),
            // [LANGUAGE_JP]: getPhrase(LANGUAGE_JP, 'language', LANGUAGE_JP),
        }

        res.locals.path = req.path

        res.locals.baseUrl = BASE_URL
        res.locals.cdnUrl = CDN_URL
        res.locals.cdn = value => `${CDN_URL}/${value}`

        res.locals.env = process.env.NODE_ENV
        res.locals.production = IS_PRODUCTION

        // Hide sidebar in
        res.locals.classroomHideSidebar = req.session['classroomHideSidebar']
        res.locals.prefersTranscript = req.session['prefersTranscript']

        // Load CSVs from resources/svg
        res.locals.svg = getSvgs()

        // Default translator - just use the default value
        res.locals.translate = (_: string, defaultValue: string) => defaultValue

        // Relative time function
        res.locals.relativeTime = relativeTime

        res.locals.chatbotAvailable = CHATBOT_NEO4J_HOST && CHATBOT_NEO4J_USERNAME && CHATBOT_NEO4J_PASSWORD

        next()
    })
}