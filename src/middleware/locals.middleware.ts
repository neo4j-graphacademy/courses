import { Express } from 'express'
import { LANGUAGE_CN, LANGUAGE_EN, LANGUAGE_JP, STATUS_DRAFT, STATUS_ACTIVE } from '../domain/model/course'
import {
    LESSON_TYPE_VIDEO,
    LESSON_TYPE_TEXT,
    LESSON_TYPE_QUIZ,
    LESSON_TYPE_ACTIVITY,
    LESSON_TYPE_CHALLENGE,
} from '../domain/model/lesson'
import { getPhrase } from '../modules/localisation'
const { GOOGLE_ANALYTICS_MEASUREMENT_ID, TWITTER_TAG_ID } = process.env
import { getSvgs } from '../utils'


export function registerLocals(app: Express) {
    app.use((req, res, next) => {
        // Load constants into locals
        res.locals.statuses = {
            STATUS_DRAFT,
            STATUS_ACTIVE,
        }
        res.locals.lessonType = {
            LESSON_TYPE_VIDEO,
            LESSON_TYPE_TEXT,
            LESSON_TYPE_QUIZ,
            LESSON_TYPE_ACTIVITY,
            LESSON_TYPE_CHALLENGE,
        }

        // GA
        res.locals.ga = {
            id: GOOGLE_ANALYTICS_MEASUREMENT_ID,
        }

        res.locals.twitter = {
            tagId: TWITTER_TAG_ID,
        }

        // Language Dropdown
        res.locals.languages = {
            [LANGUAGE_EN]: getPhrase(LANGUAGE_EN, 'language', LANGUAGE_EN),
            [LANGUAGE_CN]: getPhrase(LANGUAGE_CN, 'language', LANGUAGE_CN),
            [LANGUAGE_JP]: getPhrase(LANGUAGE_JP, 'language', LANGUAGE_JP),
        }

        res.locals.path = req.path

        res.locals.baseUrl = process.env.BASE_URL
        res.locals.cdnUrl = process.env.CDN_URL || ''

        res.locals.env = process.env.NODE_ENV

        // Load CSVs from resources/svg
        res.locals.svg = getSvgs()

        // Default translator - just use the default value
        res.locals.translate = (_: string, defaultValue: string) => defaultValue

        next()
    })
}