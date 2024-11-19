import { Course, CourseWithProgress } from "../model/course";
import { User } from "../model/user";

export enum CompletionSource {
    WEBSITE = 'website',
    QUIZ = 'quiz',
    CRON = 'cron'
}

export class UserCompletedCourse {
    constructor(
        public readonly user: User,
        public readonly course: CourseWithProgress | Partial<Course>,
        public readonly token: string | undefined,
        public readonly source: CompletionSource = CompletionSource.WEBSITE
    ) { }
}