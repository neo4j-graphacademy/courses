import { User } from "../model/user";

type UiEventType = string

export class UserUiEvent {
    constructor(
        public readonly user: User,
        public readonly type: UiEventType,
        public readonly meta: Record<string, any>
    ) {}
}