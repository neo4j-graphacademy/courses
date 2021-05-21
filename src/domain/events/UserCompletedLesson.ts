import { LessonWithProgress } from "../model/lesson";
import { User } from "../model/user";

export class UserCompletedLesson {
    constructor(
        public readonly user: User,
        public readonly lesson: LessonWithProgress,
    ) {}
}