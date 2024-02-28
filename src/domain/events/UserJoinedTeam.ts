import { User } from "../model/user";
import { DomainEvent } from "../../events/domain-event";
import Team from "../model/team";

export class UserJoinedTeam implements DomainEvent {
  constructor(
    public readonly user: User,
    public readonly team: Team
  ) { }
}