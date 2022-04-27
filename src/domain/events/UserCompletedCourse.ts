import { Course } from "../model/course";
import { User } from "../model/user";

export class UserCompletedCourse {
    constructor(
        public readonly user: User,
        public readonly course: Course,
        public readonly token: string | undefined,
    ) {}
}