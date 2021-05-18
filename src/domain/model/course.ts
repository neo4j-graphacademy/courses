import { Module, ModuleWithProgress } from "./module";

// Status
export const STATUS_ACTIVE = 'active'
export const STATUS_DRAFT = 'draft'
export const STATUS_DISABLED = 'disabled'

type CourseStatus = typeof STATUS_ACTIVE | typeof STATUS_DRAFT | typeof STATUS_DISABLED

// Attributes
export const ATTRIBUTE_STATUS = 'status'
export const ATTRIBUTE_THUMBNAIL = 'thumbnail'
export const ATTRIBUTE_CAPTION = 'caption'
export const ATTRIBUTE_USECASE = 'usecase'

export interface Course {
    slug: string;
    title: string;
    thumbnail: string;
    caption: string;
    status: CourseStatus;
    usecase: string | undefined;
    modules: Module[];
}

export interface CourseWithProgress extends Course {
    enrolled: boolean;
    completed: boolean;
    completedCount: number;
    completedPercentage: number;
    modules: ModuleWithProgress[];
}


export type CoursesByStatus = {
    [key in CourseStatus]: Course[];
}