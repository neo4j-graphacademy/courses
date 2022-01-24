import { AppInit } from '../domain/events/AppInit'
import { UserCompletedCourse } from '../domain/events/UserCompletedCourse'
import { UserCompletedLesson } from '../domain/events/UserCompletedLesson'
import { UserEnrolled } from '../domain/events/UserEnrolled'
import { UserExecutedQuery } from '../domain/events/UserExecutedQuery'
import { UserLogin } from '../domain/events/UserLogin'
import { UI_EVENT_SANDBOX_TOGGLE, UI_EVENT_SUPPORT_TOGGLE, UserUiEvent } from '../domain/events/UserUiEvent'
import { UserUnenrolled } from '../domain/events/UserUnenrolled'
import { UserViewedCourse } from '../domain/events/UserViewedCourse'
import { emitter } from '../events'
import { analyticsApiKey, ANALYTICS_EVENT_COMMAND_CYPHER, ANALYTICS_EVENT_COURSE_COMPLETION, ANALYTICS_EVENT_COURSE_ENROLL, ANALYTICS_EVENT_COURSE_UNENROLL, ANALYTICS_EVENT_COURSE_VIEW, ANALYTICS_EVENT_LESSON_COMPLETION, ANALYTICS_EVENT_LOGIN, ANALYTICS_EVENT_TOGGLE_SANDBOX, ANALYTICS_EVENT_TOGGLE_SUPPORT, trackEvent } from '../modules/analytics'

export default async function initAnalyticsListeners(): Promise<void> {
    if ( !analyticsApiKey() ) {
        return
    }

    emitter.on<UserLogin>(UserLogin, (event: UserLogin) => {
        trackEvent(ANALYTICS_EVENT_LOGIN, event.payload.sub!, {
            userId: event.payload.sub,
            email: event.payload.email,
        })
    })

    emitter.on<UserViewedCourse>(UserViewedCourse, event => {
        trackEvent(ANALYTICS_EVENT_COURSE_VIEW, event.user.sub, {
            courseSlug: event.course.slug,
            courseName: event.course.title,
            usecase: event.course.usecase,
            categories: event.course.categories.map(category => category.title),
        })
    })

    emitter.on<UserEnrolled>(UserEnrolled, event => {
        trackEvent(ANALYTICS_EVENT_COURSE_ENROLL, event.user.sub, {
            courseSlug: event.course.slug,
            courseName: event.course.title,
            usecase: event.course.usecase,
            categories: event.course.categories.map(category => category.title),
        })
    })

    emitter.on<UserUnenrolled>(UserUnenrolled, event => {
        trackEvent(ANALYTICS_EVENT_COURSE_UNENROLL, event.user.sub, {
            courseSlug: event.course.slug,
            courseName: event.course.title,
            usecase: event.course.usecase,
            categories: event.course.categories.map(category => category.title),
        })
    })

    emitter.on<UserCompletedLesson>(UserCompletedLesson, event => {
            trackEvent(ANALYTICS_EVENT_LESSON_COMPLETION, event.user.sub, {
                courseSlug: event.course.slug,
                courseName: event.course.title,
                usecase: event.course.usecase,
                moduleName: event.module.title,
                lessonName: event.lesson.title,
                categories: event.course.categories.map(category => category.title),
            })
    })

    emitter.on<UserCompletedCourse>(UserCompletedCourse, event => {
        trackEvent(ANALYTICS_EVENT_COURSE_COMPLETION, event.user.sub, {
            courseSlug: event.course.slug,
            courseName: event.course.title,
            usecase: event.course.usecase,
            categories: event.course.categories.map(category => category.title),
        })
    })

    emitter.on<UserUiEvent>(UserUiEvent, event => {
        switch (event.type) {
            case UI_EVENT_SANDBOX_TOGGLE:
                trackEvent(ANALYTICS_EVENT_TOGGLE_SANDBOX, event.user.sub, event.meta)
                break;

            case UI_EVENT_SUPPORT_TOGGLE:
                trackEvent(ANALYTICS_EVENT_TOGGLE_SUPPORT, event.user.sub, event.meta)
                break;
        }
    })

    emitter.on<UserExecutedQuery>(UserExecutedQuery, event => {
        const {
            user,
            ...other
        } = event

        trackEvent(ANALYTICS_EVENT_COMMAND_CYPHER, event.user.sub, {
            ...other,
        })
    })
}
