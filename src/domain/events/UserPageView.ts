import { LessonWithProgress } from "../model/lesson";
import { User } from "../model/user";

type RequestMethod = 'POST' | 'GET'

export class UserPageView {
    constructor(
        public readonly user: User | undefined,
        public readonly url: string,
        public readonly method: RequestMethod,
        public readonly meta: Record<string, any>
    ) {}
}