import { Sandbox } from "../../modules/sandbox";
import { Category } from "./category";
import { CourseWithProgress } from "./course";
import { Module } from "./module";
import { User } from "./user";


export const STATUS_INTERESTED = 'interested';
export const STATUS_AVAILABLE = 'available';
export const STATUS_COMPLETED = 'completed';
export const STATUS_ENROLLED = 'enrolled';

export type EnrolmentStatus = typeof STATUS_INTERESTED | typeof STATUS_AVAILABLE | typeof STATUS_COMPLETED | typeof STATUS_ENROLLED


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
    }
}

export type CategoryEnrolments = {
    category: Category;
    completedCount: number;
    completedPercentage: number;
    courses: CourseWithProgress[];
}