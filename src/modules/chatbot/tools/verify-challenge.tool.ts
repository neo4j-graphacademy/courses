import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import { verifyCodeChallenge } from "../../../domain/services/verify-code-challenge";

const verifyChallengeSchema = z.object({
    course: z.string().describe('The course slug'),
    module: z.string().describe('The module slug'),
    lesson: z.string().describe('The lesson slug'),
})

async function verifyChallenge(input: z.infer<typeof verifyChallengeSchema>, config?: RunnableConfig) {
    const { user, token } = config?.configurable || {}
    const result = await verifyCodeChallenge(user, token, input.course, input.module, input.lesson)

    if (result === false) {
        return `I could not find enrolment for this course`
    }

    const reasons = result.answers.map(answer => answer.reason)

    if (result.courseCompleted) {
        return `You have already completed the course.`
    }
    else if (result.completed) {
        return `Congratulations! You have completed the lesson.`
    }

    return JSON.stringify({
        completed: false,
        reasons,
    })
}

const description = `
Verify a challenge for a given lesson.  You must have the course, module and lesson in the context.
`
export const verifyChallengeTool = tool(
    verifyChallenge, 
    {
        name: 'verifyChallenge',
        description,
        schema: verifyChallengeSchema,
    }
)
