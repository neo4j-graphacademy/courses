import { UserCompletedCourse } from '../domain/events/UserCompletedCourse'
import { UserUnenrolled } from '../domain/events/UserUnenrolled'
import { emitter } from '../events'
import { getSandboxForUseCase, stopSandbox } from '../modules/sandbox'


export default async function initSandboxListeners(): Promise<void> {

    const stopSandboxHandler = async (event: UserCompletedCourse | UserUnenrolled) => {
        const { course, token } = event
        const { usecase } = course

        // If no token or usecase, ignore
        if ( !token || !usecase ) {
            return;
        }

        // Try to get a sandbox for the user
        const sandbox = await getSandboxForUseCase(token, usecase)

        // If it exists, stop it
        if ( sandbox ) {
            await stopSandbox(token, sandbox.sandboxHashKey)
        }
    }

    emitter.on<UserCompletedCourse>(UserCompletedCourse, stopSandboxHandler)
    emitter.on<UserUnenrolled>(UserUnenrolled, stopSandboxHandler)

}
