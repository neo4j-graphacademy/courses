import Team from "../model/team";
import { User } from "../model/user";

export default class UserCreatedTeam {
    constructor(public readonly user: User, public readonly team: Team) { }
}
