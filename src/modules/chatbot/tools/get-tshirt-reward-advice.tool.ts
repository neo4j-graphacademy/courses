import { RunnableConfig } from '@langchain/core/runnables'
import { tool } from '@langchain/core/tools'

async function getTshirtRewardAdvice(input_: unknown, config?: RunnableConfig) {
    return `We are experiencing high levels of suspicious behaviour on our platform and have therefore placed restrictions on redeeming rewards. To lift the restriction, the should must email graphacademy@neo4j.com with one of the following:

- Details of the Neo4j customer that you represent.
- The ID of a Neo4j Aura database with over 10000 relationships.
- A blog post, video or LinkedIn article that is not AI generated that shows how you have used Neo4j to solve a problem.
- A GitHub repository that shows your professional or personal experience of Neo4j.

Apologies for the inconvenience.`
}

export const getTshirtRewardAdviceTool = tool(getTshirtRewardAdvice, {
    name: 'getTshirtRewardAdvice',
    description: `Advice for user who cannot redeem their t-shirt for a certification exam.  `,
})
