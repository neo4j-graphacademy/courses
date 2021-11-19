import { Sandbox } from "../../modules/sandbox";
import { Category } from "./category";
import { Module, ModuleWithProgress } from "./module";
import { Pagination } from "./pagination";

// Status
export const STATUS_ACTIVE = 'active'
export const STATUS_DRAFT = 'draft'
export const STATUS_TEST = 'test'
export const STATUS_DISABLED = 'disabled'

type CourseStatus = typeof STATUS_ACTIVE | typeof STATUS_DRAFT | typeof STATUS_DISABLED

export const NEGATIVE_STATUSES = [
    STATUS_TEST,
    STATUS_DISABLED
]

// Attributes
export const ATTRIBUTE_STATUS = 'status'
export const ATTRIBUTE_THUMBNAIL = 'thumbnail'
export const ATTRIBUTE_CAPTION = 'caption'
export const ATTRIBUTE_VIDEO = 'video'
export const ATTRIBUTE_USECASE = 'usecase'
export const ATTRIBUTE_CATEGORIES = 'categories'
export const ATTRIBUTE_REDIRECT = 'redirect'
export const ATTRIBUTE_PREVIOUS = 'previous'
export const ATTRIBUTE_NEXT = 'next'

export interface Course {
    slug: string;
    title: string;
    link: string;
    video?: string;
    repository?: string;
    duration?: string;
    redirect?: string;
    thumbnail: string;
    caption: string;
    status: CourseStatus;
    interested?: string;
    usecase: string | undefined;
    modules: Module[];
    categories: Category[];
    prerequisites?: Course[];
    progressTo?: Course[];
    badge?: string;
    verify: string | undefined;
    cypher: string | undefined;
    summary: boolean;
}

export interface CourseWithProgress extends Course {
    enrolmentId: string;
    enrolled: boolean;
    endrolledAt: Date;
    completed: boolean;
    completedAt: Date;
    completedCount: number;
    completedPercentage: number | string;
    modules: ModuleWithProgress[];
    next?: Pagination;
    sandbox?: Sandbox;
}


export type CoursesByStatus = {
    [key in CourseStatus]: Course[];
}