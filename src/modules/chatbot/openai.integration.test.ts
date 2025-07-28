import { OPENAI_API_KEY } from '../../constants'
import { ChatOpenAI } from '@langchain/openai'
import { StringOutputParser } from '@langchain/core/output_parsers'

describe('OpenAI Integration', () => {
    it('should have an API key', async () => {
        expect(OPENAI_API_KEY).toBeDefined()
    })

    it('should be able to call openai via langchain', async () => {
        const model = new ChatOpenAI({
            apiKey: OPENAI_API_KEY,
            model: 'gpt-4o',
        })

        const chain = model.pipe(new StringOutputParser())

        const response = await chain.invoke('Say hello')
        console.log(response)
        expect(response.toLowerCase()).toContain('hello')
    })
})