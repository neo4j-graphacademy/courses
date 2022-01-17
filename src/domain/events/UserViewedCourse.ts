import { Course } from "../model/course";
import { User } from "../model/user";

export class UserViewedCourse {
    constructor(
        public readonly user: User,
        public readonly course: Course,
    ) {}
}