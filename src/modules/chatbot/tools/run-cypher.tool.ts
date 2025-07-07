import { z } from "zod";
import databaseProvider from "../../instances";
import { RunnableConfig } from "@langchain/core/runnables";
import { routing } from "neo4j-driver";
import { tool } from "@langchain/core/tools";


const runCypherSchema = z.object({
    cypher: z.string(),
    params: z.record(z.any()).optional(),
})

async function runCypher(input: z.infer<typeof runCypherSchema>, config?: RunnableConfig) {
    if (!config?.configurable?.enrolment) {
        throw new Error('An enrolment is required to use this tool.')
    }
    
    const provider = databaseProvider(config?.configurable?.enrolment?.databaseProvider)
    
    try {
        const result = await provider.executeCypher(
            config?.configurable?.token, 
            config?.configurable?.user,
            config?.configurable?.enrolment?.slug, 
            input.cypher, 
            input.params || {}, 
            routing.READ
        )
        
        return JSON.stringify(result?.records.map(record => record.toObject()))
    }
    catch (e: any) {
        return `Error running Cypher query: ${e.message}`
    }
}


export const runCypherTool = tool(runCypher, {
    name: 'runCypher',
    description: 'Run a cypher query on the database used within the course.',
    schema: runCypherSchema,
})
