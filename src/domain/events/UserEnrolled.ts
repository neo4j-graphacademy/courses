import { CourseWithProgress } from "../model/course";
import { User } from "../model/user";
import { DomainEvent } from "../../events/domain-event";
import { Instance } from "../model/instance";


export class UserEnrolled implements DomainEvent {
    constructor(
        public readonly user: User,
        public readonly course: CourseWithProgress,
        public readonly sandbox?: Instance,
        public readonly ref?: string,
        public readonly team?: string,
    ) { }
}