import { Category } from "./category";
import { Course, CourseWithProgress } from "./course";
import { Module } from "./module";
import { Sandbox } from "./sandbox";
import { User } from "./user";


export const STATUS_BOOKMARKED = 'bookmarked';
export const STATUS_COMPLETED = 'completed';
export const STATUS_FAILED = 'failed';
export const STATUS_ENROLLED = 'enrolled';
export const STATUS_AVAILABLE = 'available';
export const STATUS_RECENTLY_COMPLETED = 'recently-completed';

export type EnrolmentStatus = typeof STATUS_BOOKMARKED | typeof STATUS_AVAILABLE | typeof STATUS_COMPLETED | typeof STATUS_ENROLLED | typeof STATUS_FAILED | typeof STATUS_BOOKMARKED | typeof STATUS_RECENTLY_COMPLETED

export interface Enrolment {
    user: User;
    course: Partial<CourseWithProgress>;
    nextModule: Partial<Module>;
    createdAt: Date;
    sandbox?: Sandbox;
}

export type EnrolmentsByStatus = {
    user: User | false;
    enrolments: {
        [key in EnrolmentStatus]?: CourseWithProgress[]
    };
    paths: Category<Course>[];
}

export type CategoryEnrolments = {
    category: Category<any>;
    completedCount: number;
    completedPercentage: number;
    courses: CourseWithProgress[];
}
