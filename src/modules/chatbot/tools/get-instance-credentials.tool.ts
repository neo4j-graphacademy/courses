import { z } from 'zod'
import databaseProvider from '../../instances'
import { RunnableConfig } from '@langchain/core/runnables'
import { routing } from 'neo4j-driver'
import { tool } from '@langchain/core/tools'
import { Instance } from '../../../domain/model/instance'

async function getInstanceCredentials(input_: unknown, config?: RunnableConfig) {
    if (!config?.configurable?.enrolment) {
        throw new Error('This tool must be accessed from a course page where the user is currently enrolled.')
    }

    if (!config?.configurable?.instance) {
        return `There is no instance for this user associated with this course.`
    }

    const { ip, boltPort, scheme, username, password, database }: Instance = config.configurable.instance

    return JSON.stringify({
        scheme,
        ip,
        port: boltPort,
        username,
        password,
        database,
    })
}

export const getInstanceCredentialsTool = tool(getInstanceCredentials, {
    name: 'getInstanceCredentials',
    description: `
    Get the credentials for the instance used within the course.
    If the user is asking for this information, it is because they are trying to run a cypher query on the database or they are trying to build an application using the instance.
    Use your judgement to know whether to also provide the user with a code snippet in the language of their choice.
    `,
})
