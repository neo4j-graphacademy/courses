import { CourseWithProgress } from "../model/course";
import { User } from "../model/user";

export class UserCompletedCourse {
    constructor(
        public readonly user: User,
        public readonly course: CourseWithProgress,
        public readonly token: string | undefined,
        public readonly throughQuiz: boolean = false
    ) { }
}