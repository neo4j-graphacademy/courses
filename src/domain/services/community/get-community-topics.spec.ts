import { config } from 'dotenv'
import { COMMUNITY_RSS_URL } from '../../../constants'
import { getCommunityTopics } from './get-community-topics'

// Sandbox module relies on process.env being set
config()

describe('getCommunityTopics', () => {

    it('should load the RSS url into environment variables', () => {
        expect(COMMUNITY_RSS_URL).toBeDefined()
    })

    it('should fetch a list of latest topics', async () => {
        const topics = await getCommunityTopics()

        expect(topics).toBeDefined()
        expect(topics).toBeInstanceOf(Array)
        expect(topics.length).toBeGreaterThan(0)

        topics.map(item => {
            expect(item.title).toBeDefined()
            expect(item.description).toBeDefined()
            expect(item.link).toBeDefined()
            expect(item.publishedAt).toBeInstanceOf(Date)
            expect(item.author).toBeDefined()
        })
    })
})