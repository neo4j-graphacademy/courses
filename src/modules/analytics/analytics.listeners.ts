import { UserAttemptedLesson } from '../../domain/events/UserAttemptedLesson'
import { UserCompletedCourse } from '../../domain/events/UserCompletedCourse'
import { UserCompletedLesson } from '../../domain/events/UserCompletedLesson'
import { UserEnrolled } from '../../domain/events/UserEnrolled'
import { UserExecutedQuery } from '../../domain/events/UserExecutedQuery'
import { UserLogin } from '../../domain/events/UserLogin'
import { UserResetDatabase } from '../../domain/events/UserResetDatabase'
import { UI_EVENT_SANDBOX_TOGGLE, UI_EVENT_SHOW_HINT, UI_EVENT_SHOW_SOLUTION, UI_EVENT_SHOW_TRANSCRIPT, UI_EVENT_SHOW_VIDEO, UI_EVENT_SUPPORT_TOGGLE, UI_EVENT_VIDEO_ENDED, UI_EVENT_VIDEO_PAUSED, UI_EVENT_VIDEO_PLAYING, UserUiEvent } from '../../domain/events/UserUiEvent'
import { UserUnenrolled } from '../../domain/events/UserUnenrolled'
import { UserUpdatedAccount } from '../../domain/events/UserUpdatedAccount'
import { UserViewedCourse } from '../../domain/events/UserViewedCourse'
import { UserViewedLesson } from '../../domain/events/UserViewedLesson'
import { emitter } from '../../events'
import {
    analyticsApiKey,
    ANALYTICS_EVENT_COMMAND_CYPHER,
    ANALYTICS_EVENT_COURSE_COMPLETION,
    ANALYTICS_EVENT_COURSE_ENROLL,
    ANALYTICS_EVENT_COURSE_UNENROLL,
    ANALYTICS_EVENT_COURSE_VIEW,
    ANALYTICS_EVENT_LESSON_COMPLETION,
    ANALYTICS_EVENT_LESSON_VIEW,
    ANALYTICS_EVENT_LOGIN,
    trackEvent,
    ANALYTICS_EVENT_LESSON_ATTEMPT,
    ANALYTICS_EVENT_TOGGLE_SANDBOX,
    ANALYTICS_EVENT_TOGGLE_SUPPORT,
    ANALYTICS_EVENT_SHOW_HINT,
    ANALYTICS_EVENT_SHOW_SOLUTION,
    ANALYTICS_EVENT_VIDEO_PLAYING,
    ANALYTICS_EVENT_VIDEO_PAUSED,
    ANALYTICS_EVENT_VIDEO_ENDED,
    ANALYTICS_EVENT_SHOW_VIDEO,
    ANALYTICS_EVENT_SHOW_TRANSCRIPT,
    ANALYTICS_EVENT_USER_UPDATED_ACCOUNT,
    ANALYTICS_EVENT_USER_RESET_DATABASE
} from './analytics.module'

export default function initAnalyticsListeners(): Promise<void> {
    if (analyticsApiKey()) {
        emitter.on<UserLogin>(UserLogin, (event: UserLogin) => {
            trackEvent(ANALYTICS_EVENT_LOGIN, event.payload.sub as string, {
                userId: event.payload.sub,
                email: event.payload.email,
            })
        })

        emitter.on<UserViewedCourse>(UserViewedCourse, event => {
            trackEvent(ANALYTICS_EVENT_COURSE_VIEW, event.user.sub, {
                courseSlug: event.course.slug,
                courseName: event.course.title,
                usecase: event.course.usecase,
                categories: event.course.categories?.map(category => category.title),
            })
        })

        emitter.on<UserViewedLesson>(UserViewedLesson, event => {
            trackEvent(ANALYTICS_EVENT_LESSON_VIEW, event.user.sub, {
                courseSlug: event.course.slug,
                courseName: event.course.title,
                moduleSlug: event.module.slug,
                moduleName: event.module.title,
                lessonSlug: event.lesson.slug,
                lessonName: event.lesson.title,
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
                ref: event.course.ref,
            })
        })

        emitter.on<UserAttemptedLesson>(UserAttemptedLesson, event => {
            trackEvent(ANALYTICS_EVENT_LESSON_ATTEMPT, event.user.sub, {
                courseSlug: event.course.slug,
                courseName: event.course.title,
                moduleSlug: event.module.slug,
                moduleName: event.module.title,
                lessonSlug: event.lesson.slug,
                lessonName: event.lesson.title,
                usecase: event.course.usecase,
                categories: event.course.categories.map(category => category.title),
                passed: event.passed,
                answers: event.answers,
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
                categories: event.course.categories.map(category => category.title),
                moduleSlug: event.module.slug,
                moduleName: event.module.title,
                lessonSlug: event.lesson.slug,
                lessonName: event.lesson.title,
            })
        })

        emitter.on<UserCompletedCourse>(UserCompletedCourse, event => {
            trackEvent(ANALYTICS_EVENT_COURSE_COMPLETION, event.user.sub, {
                courseSlug: event.course.slug,
                courseName: event.course.title,
                usecase: event.course.usecase,
                categories: event.course.categories?.map(category => category.title),
                throughQuiz: event.throughQuiz
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

                case UI_EVENT_SHOW_HINT:
                    trackEvent(ANALYTICS_EVENT_SHOW_HINT, event.user.sub, event.meta)
                    break;

                case UI_EVENT_SHOW_SOLUTION:
                    trackEvent(ANALYTICS_EVENT_SHOW_SOLUTION, event.user.sub, event.meta)
                    break;

                case UI_EVENT_VIDEO_PLAYING:
                    trackEvent(ANALYTICS_EVENT_VIDEO_PLAYING, event.user.sub, event.meta)
                    break;

                case UI_EVENT_VIDEO_PAUSED:
                    trackEvent(ANALYTICS_EVENT_VIDEO_PAUSED, event.user.sub, event.meta)
                    break;

                case UI_EVENT_VIDEO_ENDED:
                    trackEvent(ANALYTICS_EVENT_VIDEO_ENDED, event.user.sub, event.meta)
                    break;

                case UI_EVENT_SHOW_VIDEO:
                    trackEvent(ANALYTICS_EVENT_SHOW_VIDEO, event.user.sub, event.meta)
                    break;

                case UI_EVENT_SHOW_TRANSCRIPT:
                    trackEvent(ANALYTICS_EVENT_SHOW_TRANSCRIPT, event.user.sub, event.meta)
                    break;
            }
        })

        emitter.on<UserExecutedQuery>(UserExecutedQuery, event => {
            const {
                user,
                metaData,
                ...other
            } = event

            trackEvent(ANALYTICS_EVENT_COMMAND_CYPHER, user.sub, {
                ...metaData,
                ...other,
            })
        })

        emitter.on<UserUpdatedAccount>(UserUpdatedAccount, event => {
            trackEvent(ANALYTICS_EVENT_USER_UPDATED_ACCOUNT, event.user.sub, {
                ...event.user,
                ...event.updates
            })
        })

        emitter.on<UserResetDatabase>(UserResetDatabase, event => {
            trackEvent(ANALYTICS_EVENT_USER_RESET_DATABASE, event.user.sub, {
                ...event.user,
                courseSlug: event.course.slug,
                courseName: event.course.title,
                usecase: event.course.usecase,
                categories: event.course.categories.map(category => category.title),
                moduleSlug: event.module.slug,
                moduleName: event.module.title,
                lessonSlug: event.lesson.slug,
                lessonName: event.lesson.title,
            })
        })
    }

    return Promise.resolve()
}
