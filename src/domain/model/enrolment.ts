import { Course } from "./course";
import { Module } from "./module";
import { User } from "./user";

export interface Enrolment {
    user: User;
    course: Partial<Course>;
    nextModule: Partial<Module>;
    createdAt: Date;
}