import { RunnableConfig } from '@langchain/core/runnables'
import { tool } from '@langchain/core/tools'
import path from 'path'
import fs, { existsSync } from 'fs'
import { ASCIIDOC_DIRECTORY, BUILD_DIRECTORY } from '../../../constants'

async function getModuleContent(input_: unknown, config?: RunnableConfig) {
    const llmsPath = path.join(
        ASCIIDOC_DIRECTORY,
        'courses',
        config?.configurable?.requestParams.course,
        'modules',
        config?.configurable?.requestParams.module,
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
        'index.html'
    )

    if (existsSync(htmlPath)) {
        const content = fs.readFileSync(htmlPath, 'utf8')
        return content
    }

    return `No content found for module ${config?.configurable?.requestParams.module}`
}

export const getModuleContentTool = tool(getModuleContent, {
    name: 'getModuleContent',
    description: `Get the content for the current module.  
    This tool is useful when the user asks about module-level information or overview content 
    that isn't specific to a particular lesson.`,
})
