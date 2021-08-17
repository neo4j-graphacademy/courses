import { Answer } from "../model/answer";
import { LessonWithProgress } from "../model/lesson";
import { User } from "../model/user";

export class UserAttemptedLesson {
    constructor(
        public readonly user: User,
        public readonly lesson: LessonWithProgress,
        public readonly passed: boolean,
        public readonly answers: Answer[],
    ) {}
}