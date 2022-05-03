import { Answer } from "../model/answer";
import { CourseWithProgress } from "../model/course";
import { LessonWithProgress } from "../model/lesson";
import { ModuleWithProgress } from "../model/module";
import { User } from "../model/user";

export class UserAttemptedLesson {
    constructor(
        public readonly user: User,
        public readonly course: CourseWithProgress,
        public readonly module: ModuleWithProgress,
        public readonly lesson: LessonWithProgress,
        public readonly passed: boolean,
        public readonly answers: Answer[],
    ) {}
}