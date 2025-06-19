import { Course } from "../model/course";
import { User } from "../model/user";
import { DomainEvent } from "../../events/domain-event";
import { Instance } from "../model/instance";

export class UserUnenrolled implements DomainEvent {
    constructor(
        public readonly user: User,
        public readonly token: string,
        public readonly course: Course,
        public readonly sandbox?: Instance,
    ) { }
}