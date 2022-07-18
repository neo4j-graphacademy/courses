import { config } from 'dotenv'

config()

describe('Sandbox Module', () => {

    describe('Setup', () => {
        it('should have env variables set', () => {
            const {
                SANDBOX_URL,
                SANDBOX_TOKEN
             } = process.env

             expect(SANDBOX_URL).toBeDefined()
             expect(SANDBOX_TOKEN).toBeDefined()
        })
    })

})