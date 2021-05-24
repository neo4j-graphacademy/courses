import { Module } from "../model/module";
import { User } from "../model/user";

export class UserCompletedModule {
    constructor(
        public readonly user: User,
        public readonly module: Module,
    ) {}
}