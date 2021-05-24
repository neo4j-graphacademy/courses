import { Course, CourseWithProgress } from "./course";
import { Module } from "./module";
import { User } from "./user";


export const STATUS_AVAILABLE = 'available';
export const STATUS_COMPLETED = 'completed';
export const STATUS_ENROLLED = 'enrolled';

export type EnrolmentStatus = typeof STATUS_AVAILABLE | typeof STATUS_COMPLETED | typeof STATUS_ENROLLED

export interface Enrolment {
    user: User;
    course: Partial<Course>;
    nextModule: Partial<Module>;
    createdAt: Date;
}

export type EnrolmentsByStatus = {
    user: Partial<User>;
    enrolments: {
        [key in EnrolmentStatus]?: CourseWithProgress[]
    }
}
