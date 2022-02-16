import { Course } from "../model/course";
import { Module } from "../model/module";
import { User } from "../model/user";

export class UserViewedModule {
    constructor(
        public readonly user: User,
        public readonly course: Course,
        public readonly module: Module,
    ) {}
}