import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import path from "path";
import fs, { existsSync } from "fs";
import { ASCIIDOC_DIRECTORY } from "../../../constants";

async function getCourseSummaries(input_: unknown, config?: RunnableConfig) {
    // read courses folder for llms.txt files
    const coursesDirectory = path.join(ASCIIDOC_DIRECTORY, 'courses')
    const files = fs.readdirSync(coursesDirectory)
    const summaries = files.map(slug => {
        const llmstxt = path.join(coursesDirectory, slug, 'llms.txt')

        if (existsSync(llmstxt)) {
            const content = fs.readFileSync(llmstxt, 'utf8')
            const title = content.split('\n')[0].replace('# ', '')
            const url = `/courses/${slug}`

            // get everything before first level 2 header 
            const intro = content.split('## ')[0].trim()

            return `- [${title}](${url}) - ${intro}`
        }
    })

    return summaries.join('\n')
}

export const getCourseSummariesTool = tool(getCourseSummaries, {
    name: 'getCourseSummaries',
    description: `Get summaries for courses that have a summary in llms.txt format.  You should use this tool to find documentation that will help the user with their question.`,
})
