import { Category } from "./category";
import { Module, ModuleWithProgress } from "./module";
import { Pagination } from "./pagination";
import { Integer } from "neo4j-driver";
import { Sandbox } from "./sandbox";

// Status
export const STATUS_COMPLETED = 'completed'
export const STATUS_ACTIVE = 'active'
export const STATUS_DRAFT = 'draft'
export const STATUS_TEST = 'test'
export const STATUS_DISABLED = 'disabled'

export type CourseStatus = typeof STATUS_COMPLETED | typeof STATUS_ACTIVE | typeof STATUS_DRAFT | typeof STATUS_TEST | typeof STATUS_DISABLED

export const NEGATIVE_STATUSES = [
    STATUS_TEST,
    STATUS_DISABLED
]

export const STATUS_PRIORITIES: CourseStatus[] = [
    STATUS_ACTIVE,
    STATUS_DRAFT,
    STATUS_TEST,
    STATUS_DISABLED,
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
export const ATTRIBUTE_LANGUAGE = 'lang'
export const ATTRIBUTE_TRANSLATIONS = 'translations'
export const ATTRIBUTE_CERTIFICATION = 'certification'
export const ATTRIBUTE_CLASSMARKER_ID = 'classmarker-id'
export const ATTRIBUTE_CLASSMARKER_REFERENCE = 'classmarker-reference'

export const LANGUAGE_EN = 'en'
export const LANGUAGE_JP = 'jp'
export const LANGUAGE_CN = 'cn'

export const LANGUAGES = [LANGUAGE_EN, LANGUAGE_JP, LANGUAGE_CN,]

export type Language = typeof LANGUAGE_EN | typeof LANGUAGE_JP | typeof LANGUAGE_CN


export interface Course {
    slug: string;
    language: Language;
    title: string;
    link: string;
    video?: string;
    repository?: string;
    duration?: string;
    redirect?: string;
    thumbnail: string;
    caption: string;
    status: CourseStatus;
    interested?: string[];
    isInterested?: boolean;
    usecase: string | undefined;
    emails: string[];
    modules: Module[];
    categories: Category<any>[];
    prerequisites?: Course[];
    progressTo?: Course[];
    badge?: string;
    verify: string | undefined;
    cypher: string | undefined;
    summary: boolean;
    passed: boolean;
    failed: boolean;
    certification: boolean;
    classmarkerId?: string;
    classmarkerReference?: string;
    certificateNumber: Integer | boolean | undefined;
    translations: Course[];
    enrolledAt: Date | string;
    quizAvailable: boolean;
    // Additional attributes extracted from Asciidoc
    [key: string]: any;
}

export interface CourseWithProgress extends Course {
    enrolmentId: string;
    enrolled: boolean;
    ref: string;
    endrolledAt: Date;
    completed: boolean;
    completedAt: Date;
    lastSeenAt: Date;
    completedCount: number;
    completedPercentage: number | string;
    modules: ModuleWithProgress[];
    next?: Pagination;
    sandbox?: Sandbox;
}

export interface CourseStatusInformation {
    slug: CourseStatus;
    name: string;
    order: number;
    description: string | undefined;
}

export interface CourseStatusInformationWithCourses extends CourseStatusInformation {
    courses: Course[];
}

export type CoursesByStatus = {
    [key in CourseStatus]: CourseStatusInformationWithCourses;
}