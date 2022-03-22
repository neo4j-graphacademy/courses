import { Express } from 'express'
import { Server } from 'http'

export class AppInit {
    constructor(public readonly app: Express, public readonly server: Server) {}
}