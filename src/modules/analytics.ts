import Analytics from 'analytics-node'
import { Request } from 'express'
import { User } from '../domain/model/user'

let analytics: Analytics


export function initAnalytics() {
    const key = analyticsApiKey()

    if ( key ) {
        analytics = new Analytics(key)
    }
}

export function trackEvent(event: any) {
    if  ( analytics ) {
        analytics.track(event)
    }
}

export function trackPageview(user: User, req: Request) {
    if  ( analytics ) {
        analytics.page({
            userId: user.sub,
            properties: {
                url: process.env.BASE_URL + req.originalUrl,
                referrer: req.get('Referrer'),
            }
        })
    }
}

export function analyticsApiKey() {
    return process.env.SEGMENT_API_KEY
}