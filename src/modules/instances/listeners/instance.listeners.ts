import { UserCompletedCourse } from '../../../domain/events/UserCompletedCourse'
import { UserUnenrolled } from '../../../domain/events/UserUnenrolled'
import { emitter } from '../../../events'
import databaseProvider from '../index'

export default function initInstanceListeners(): Promise<void> {
    const stopSandboxHandler = async (event: UserCompletedCourse | UserUnenrolled) => {
        const { course, token, user } = event
        const { usecase } = course

        // If no token or usecase, ignore
        if (!token || !usecase) {
            return;
        }

        // Try to get a sandbox for the user
        const provider = await databaseProvider(course.databaseProvider)
        const instance = await provider.getInstanceForUseCase(token, user, usecase)

        // If it exists, stop it
        if (instance) {
            await provider.stopInstance(token, user, instance.id)
        }
    }

    // emitter.on<UserCompletedCourse>(UserCompletedCourse, stopSandboxHandler)
    emitter.on<UserUnenrolled>(UserUnenrolled, stopSandboxHandler)

    return Promise.resolve()
}
