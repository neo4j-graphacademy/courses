import { Express } from 'express'

export class AppInit {
    constructor(public readonly app: Express) {}
}