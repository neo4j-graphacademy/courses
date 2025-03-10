import { User } from "../model/user";

export const UI_EVENT_SANDBOX_TOGGLE = 'sandbox-toggle'
export const UI_EVENT_SUPPORT_TOGGLE = 'support-toggle'
export const UI_EVENT_CHATBOT_TOGGLE = 'chatbot-toggle'
export const UI_EVENT_SHOW_HINT = 'show-hint'
export const UI_EVENT_SHOW_SOLUTION = 'show-solution'
export const UI_EVENT_VIDEO_PLAYING = 'video-playing'
export const UI_EVENT_VIDEO_PAUSED = 'video-paused'
export const UI_EVENT_VIDEO_ENDED = 'video-ended'
export const UI_EVENT_SHOW_TRANSCRIPT = 'show-transcript'
export const UI_EVENT_SHOW_VIDEO = 'show-video'
export const UI_EVENT_SHOW_SIDEBAR = 'show-sidebar'
export const UI_EVENT_HIDE_SIDEBAR = 'hide-sidebar'
export const UI_EVENT_SHARED_CERTIFICATE = 'shared-certificate'

export type UiEventType = typeof UI_EVENT_SANDBOX_TOGGLE
    | typeof UI_EVENT_CHATBOT_TOGGLE
    | typeof UI_EVENT_SUPPORT_TOGGLE
    | typeof UI_EVENT_SHOW_HINT
    | typeof UI_EVENT_SHOW_SOLUTION
    | typeof UI_EVENT_VIDEO_PLAYING
    | typeof UI_EVENT_VIDEO_PAUSED
    | typeof UI_EVENT_VIDEO_ENDED
    | typeof UI_EVENT_SHOW_TRANSCRIPT
    | typeof UI_EVENT_SHOW_VIDEO
    | typeof UI_EVENT_SHOW_SIDEBAR
    | typeof UI_EVENT_HIDE_SIDEBAR
    | typeof UI_EVENT_SHARED_CERTIFICATE

export const UI_EVENTS: UiEventType[] = [
    UI_EVENT_SANDBOX_TOGGLE,
    UI_EVENT_CHATBOT_TOGGLE,
    UI_EVENT_SUPPORT_TOGGLE,
    UI_EVENT_SHOW_HINT,
    UI_EVENT_SHOW_SOLUTION,
    UI_EVENT_VIDEO_PLAYING,
    UI_EVENT_VIDEO_PAUSED,
    UI_EVENT_VIDEO_ENDED,
    UI_EVENT_SHOW_TRANSCRIPT,
    UI_EVENT_SHOW_VIDEO,
    UI_EVENT_HIDE_SIDEBAR,
    UI_EVENT_SHOW_SIDEBAR,
    UI_EVENT_SHARED_CERTIFICATE,
]

export class UserUiEvent {
    constructor(
        public readonly user: User,
        public readonly type: UiEventType,
        public readonly meta: Record<string, any>
    ) { }
}
