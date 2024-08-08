import Analytics from 'analytics-node'
import { Request } from 'express'
import { BASE_URL, SEGMENT_API_KEY } from '../../constants'
import { User } from '../../domain/model/user'
import { notify } from '../../middleware/bugsnag.middleware'

let analytics: Analytics

export const ANALYTICS_EVENT_STARTED = 'GA_SERVER_UP'
export const ANALYTICS_EVENT_LOGIN = 'GA_LOGIN'
export const ANALYTICS_EVENT_COURSE_VIEW = 'GA_COURSE_VIEW'
export const ANALYTICS_EVENT_COURSE_ENROLL = 'GA_COURSE_ENROLL'
export const ANALYTICS_EVENT_COURSE_COMPLETION = 'GA_COURSE_COMPLETION'
export const ANALYTICS_EVENT_COURSE_CONTINUE = 'GA_COURSE_CONTINUE'
export const ANALYTICS_EVENT_COURSE_UNENROLL = 'GA_COURSE_UNENROLL'
export const ANALYTICS_EVENT_LESSON_VIEW = 'GA_LESSON_VIEW'
export const ANALYTICS_EVENT_LESSON_COMPLETION = 'GA_LESSON_COMPLETION'
export const ANALYTICS_EVENT_LESSON_ATTEMPT = 'GA_LESSON_ATTEMPT'
export const ANALYTICS_EVENT_COMMAND_CYPHER = 'GA_COMMAND_CYPHER'
export const ANALYTICS_EVENT_TOGGLE_SANDBOX = 'GA_TOGGLE_SANDBOX'
export const ANALYTICS_EVENT_TOGGLE_SUPPORT = 'GA_TOGGLE_SUPPORT'
export const ANALYTICS_EVENT_PAGEVIEW = 'GA_PAGEVIEW'
export const ANALYTICS_EVENT_SHOW_HINT = 'GA_SHOW_HINT'
export const ANALYTICS_EVENT_SHOW_SOLUTION = 'GA_SHOW_SOLUTION'
export const ANALYTICS_EVENT_VIDEO_PLAYING = 'GA_VIDEO_PLAYING'
export const ANALYTICS_EVENT_VIDEO_PAUSED = 'GA_VIDEO_PAUSED'
export const ANALYTICS_EVENT_VIDEO_ENDED = 'GA_VIDEO_ENDED'
export const ANALYTICS_EVENT_SHOW_VIDEO = 'GA_SHOW_VIDEO'
export const ANALYTICS_EVENT_SHOW_TRANSCRIPT = 'GA_SHOW_TRANSCRIPT'
export const ANALYTICS_EVENT_USER_UPDATED_ACCOUNT = 'GA_USER_UPDATED_ACCOUNT'
export const ANALYTICS_EVENT_USER_COMPLETED_ACCOUNT = 'GA_USER_COMPLETED_ACCOUNT'
export const ANALYTICS_EVENT_USER_RESET_DATABASE = 'GA_USER_RESET_DATABASE'

export function initAnalytics() {
    const key = analyticsApiKey()

    if (key) {
        console.log(`[analytics] Init with key ${key.substring(0, 3)}...`)

        analytics = new Analytics(key)

        analytics.track({ event: ANALYTICS_EVENT_STARTED, anonymousId: 'server' })

        return analytics
    }
    else {
        return {
            track: console.log,
        }
    }
}

export function trackEvent(event: string, userId: string, properties: Record<string, any> = {}) {
    if (analytics) {
        return analytics.track(
            { event, userId, properties },
            err => {
                if (err) {
                    notify(err, e => {
                        e.addMetadata('event', { event, properties })
                    })
                }
            })
    }
}

export function trackPageview(user: User, req: Request) {
    if (analytics) {
        analytics.page({
            userId: user.sub,
            properties: {
                url: `${BASE_URL}${req.originalUrl}`,
                referrer: req.get('Referrer'),
            }
        })
    }
}

export function analyticsApiKey() {
    return SEGMENT_API_KEY
}
