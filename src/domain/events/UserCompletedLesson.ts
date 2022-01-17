import { Course } from "../model/course";
import { Module } from "../model/module";
import { LessonWithProgress } from "../model/lesson";
import { User } from "../model/user";

export class UserCompletedLesson {
    constructor(
        public readonly user: User,
        public readonly course: Course,
        public readonly module: Module,
        public readonly lesson: LessonWithProgress,
    ) {}
}