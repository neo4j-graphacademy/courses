import { DomainEvent } from "../../events/domain-event";
import { User } from "../model/user";
import { UserUpdates } from "../services/update-user";

export class UserCompletedAccount implements DomainEvent {
  constructor(
    public readonly user: User,
    public readonly updates: UserUpdates
  ) { }
}
