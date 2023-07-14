import { Course } from "../model/course";
import { Lesson } from "../model/lesson";
import { Module } from "../model/module";
import { User } from "../model/user";

export class UserResetDatabase {
    constructor(
        public readonly user: User,
        public readonly course: Course,
        public readonly module: Module,
        public readonly lesson: Lesson,
    ) { }
}