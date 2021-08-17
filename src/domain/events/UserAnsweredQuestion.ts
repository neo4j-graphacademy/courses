import { Answer } from "../model/answer";
import { LessonWithProgress } from "../model/lesson";
import { User } from "../model/user";

export class UserAnsweredQuestion {
    constructor(
        public readonly user: User,
        public readonly lesson: LessonWithProgress,
        public readonly answer: Answer
    ) {}
}