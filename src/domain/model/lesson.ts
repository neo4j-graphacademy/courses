import { Pagination } from "./pagination";
import { Question } from "./question";

export const ATTRIBUTE_TYPE = 'type'
export const ATTRIBUTE_ORDER = 'order'
export const ATTRIBUTE_DURATION = 'duration'
export const ATTRIBUTE_SANDBOX = 'sandbox'
export const ATTRIBUTE_CYPHER = 'cypher'
export const ATTRIBUTE_VERIFY = 'verify'

export const LESSON_TYPE_VIDEO = 'video'
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
    order: number;
    duration: number;
    sandbox: boolean;
    cypher: string | undefined;
    answer: string | undefined;
    verify: string | undefined;
    questions: Question[];
    previous: Pagination | undefined;
    next: Pagination | undefined;
}

export interface LessonWithProgress extends Lesson {
    completed: boolean;
}
