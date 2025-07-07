import { z } from 'zod'
import { tool } from '@langchain/core/tools'
import { RunnableConfig } from '@langchain/core/runnables'
import { resetDatabase } from '../../../domain/services/reset-database'
import { getCourseWithProgress } from '../../../domain/services/get-course-with-progress'

const resetDatabaseSchema = z.object({
    course: z.string().describe('The course slug'),
    module: z.string().describe('The module slug'),
    lesson: z.string().describe('The lesson slug'),
})

async function resetDatabaseHandler(input: z.infer<typeof resetDatabaseSchema>, config?: RunnableConfig) {
    const { user, token } = config?.configurable || {}

    if (!user || !token) {
        return `Authentication required: user and token must be provided`
    }

    try {
        // Get course progress to obtain database provider and usecase
        const progress = await getCourseWithProgress(input.course, user)
        const { usecase, databaseProvider } = progress

        if (!usecase) {
            return `No usecase found for course ${input.course}`
        }

        if (!databaseProvider) {
            return `No database provider found for course ${input.course}`
        }

        const result = await resetDatabase(
            token,
            user,
            input.course,
            input.module,
            input.lesson,
            databaseProvider,
            usecase
        )

        if (result) {
            return `Database has been successfully reset for lesson ${input.lesson} in module ${input.module} of course ${input.course}.`
        } else {
            return `Could not reset database - no reset.cypher file found for lesson ${input.lesson} in module ${input.module} of course ${input.course}.`
        }
    } catch (error: any) {
        return `Error resetting database: ${error.message}`
    }
}

const description = `
Reset the database for a given lesson. You must have the course, module and lesson in the context.
This tool will run the reset.cypher file for the specified lesson to restore the database to its initial state.

You can use this tool if the user is frustrated that they can't pass a challenge but you must ask them for 
confirmation first and only after the verifyChallenge tool has been used and guidance has been provided.
`

export const resetDatabaseTool = tool(resetDatabaseHandler, {
    name: 'resetDatabase',
    description,
    schema: resetDatabaseSchema,
})
