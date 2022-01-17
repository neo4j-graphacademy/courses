import { JwtPayload } from "jsonwebtoken";

export class UserLogin {
    constructor(public payload: JwtPayload) {}
}