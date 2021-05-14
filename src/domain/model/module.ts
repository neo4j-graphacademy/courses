import { Lesson, LessonWithProgress } from "./lesson";
// import { Pagination } from "./pagination";

export const ATTRIBUTE_ORDER = 'order'

export interface Module {
    path: string;
    slug: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

export interface ModuleWithProgress extends Module {
    completed: boolean;
    lessons: LessonWithProgress[];
}