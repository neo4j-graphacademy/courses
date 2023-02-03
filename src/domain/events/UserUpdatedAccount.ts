import { DomainEvent } from "../../events/domain-event";
import { User } from "../model/user";

export class UserUpdatedAccount implements DomainEvent {
    constructor(
        public readonly user: User
    ) { }
}
