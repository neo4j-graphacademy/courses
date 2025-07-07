import { RunnableConfig } from '@langchain/core/runnables'
import { tool } from '@langchain/core/tools'
import path from 'path'
import fs, { existsSync } from 'fs'
import { ASCIIDOC_DIRECTORY, BUILD_DIRECTORY } from '../../../constants'
import { getModuleContentTool } from './get-module-content.tool'

async function getLessonContent(input_: unknown, config?: RunnableConfig) {
    // If no lesson is specified but we have course and module, use module content
    if (
        !config?.configurable?.requestParams.lesson &&
        config?.configurable?.requestParams.course &&
        config?.configurable?.requestParams.module
    ) {
        return await getModuleContentTool.invoke(input_, config)
    }

    const llmsPath = path.join(
        ASCIIDOC_DIRECTORY,
        'courses',
        config?.configurable?.requestParams.course,
        'modules',
        config?.configurable?.requestParams.module,
        'lesson',
        config?.configurable?.requestParams.lesson,
        'llms.txt'
    )

    if (existsSync(llmsPath)) {
        const content = fs.readFileSync(llmsPath, 'utf8')
        return content
    }

    const htmlPath = path.join(
        BUILD_DIRECTORY,
        'html',
        config?.configurable?.requestParams.course,
        config?.configurable?.requestParams.module,
        config?.configurable?.requestParams.lesson,
        'index.html'
    )

    if (existsSync(htmlPath)) {
        const content = fs.readFileSync(htmlPath, 'utf8')
        return content
    }

    return `No content found for lesson ${config?.configurable?.requestParams.lesson}`
}

export const getLessonContentTool = tool(getLessonContent, {
    name: 'getLessonContent',
    description: `Get the content for the current lesson.  
    This tool is useful when the user asks a clarifying point on a topic that hasn't been covered in the conversation 
    history, or at the start of a conversation. If no lesson is specified but course and module are available, 
    it will fall back to module content.`,
})
