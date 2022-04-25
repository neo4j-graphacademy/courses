import { Pagination } from "./pagination";
import { Question } from "./question";

export const ATTRIBUTE_TYPE = 'type'
export const ATTRIBUTE_ORDER = 'order'
export const ATTRIBUTE_DURATION = 'duration'
export const ATTRIBUTE_SANDBOX = 'sandbox'
export const ATTRIBUTE_REPOSITORY = 'repository'
export const ATTRIBUTE_OPTIONAL = 'optional'
export const ATTRIBUTE_DISABLE_CACHE = 'disable-cache'
export const ATTRIBUTE_UPDATED_AT = 'updated-at'

export const LESSON_TYPE_VIDEO = 'video'
export const LESSON_TYPE_DEFAULT = 'lesson'
export const LESSON_TYPE_TEXT = 'text' // TODO: Page?
export const LESSON_TYPE_QUIZ = 'quiz'
export const LESSON_TYPE_ACTIVITY = 'activity'
export const LESSON_TYPE_CHALLENGE = 'challenge'


type LessonType =  typeof LESSON_TYPE_VIDEO
    | typeof LESSON_TYPE_TEXT
    | typeof LESSON_TYPE_QUIZ
    | typeof LESSON_TYPE_ACTIVITY
    | typeof LESSON_TYPE_CHALLENGE

export interface Lesson {
    path: string;
    slug: string;
    title: string;
    type: LessonType;
    updatedAt?: Date | undefined;
    order: number;
    duration: number;
    sandbox: boolean | string;
    cypher: string | undefined;
    verify: string | undefined;
    optional: boolean;
    disableCache: boolean;
    questions: Question[];
    previous: Pagination | undefined;
    next: Pagination | undefined;
    progressPercentage?: number; // %age position
}

export interface LessonWithProgress extends Lesson {
    completed: boolean;
    moduleCompleted?: boolean;
    courseCompleted?: boolean;
}
