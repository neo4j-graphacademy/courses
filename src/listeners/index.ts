/* tslint:disable */
import { Express } from 'express'
import { AppInit } from '../domain/events/AppInit'
import { UserEnrolled } from '../domain/events/UserEnrolled'
import { emitter } from '../events'
import sendEnrolmentEmail from './send-enrolment-email'

export default async function initListeners(app: Express): Promise<void> {
    emitter.on<AppInit>(AppInit, () => console.log(`\n\n--\n🚀 Listening on http://localhost:3000\n`))

    emitter.on<UserEnrolled>(UserEnrolled, event => sendEnrolmentEmail(event))
}
