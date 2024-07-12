import { Course, CourseWithProgress } from "../model/course";
import { User } from "../model/user";

export class UserCompletedCourse {
    constructor(
        public readonly user: User,
        public readonly course: CourseWithProgress | Partial<Course>,
        public readonly token: string | undefined,
        public readonly throughQuiz: boolean = false
    ) { }
}