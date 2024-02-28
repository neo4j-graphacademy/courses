import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export class UserLogin {
    constructor(
        public payload: JwtPayload,
        public request: Request
    ) { }
}