import { post } from './http'

// src/domain/events/UserUiEvent.ts
type UiEventType =
    | 'sandbox-toggle'
    | 'support-toggle'
    | 'show-hint'
    | 'show-solution'
    | 'video-playing'
    | 'video-paused'
    | 'video-ended'
    | 'show-transcript'
    | 'show-video'
    | 'show-sidebar'
    | 'hide-sidebar'
    | 'content-copied'
    | 'content-pasted'
    | 'window-blur'
    | 'window-focus'

export function logUiEvent(type: UiEventType, data: Record<string, any> = {}) {
    post(`/account/event/${type}`, {
        courseName: window.analytics.course.title,
        courseSlug: window.analytics.course.slug,
        moduleName: window.analytics.module?.title,
        moduleSlug: window.analytics.module?.slug,
        lessonName: window.analytics.lesson?.title,
        lessonSlug: window.analytics.lesson?.slug,
        pageName: document.title,
        ...data,
    })
}
