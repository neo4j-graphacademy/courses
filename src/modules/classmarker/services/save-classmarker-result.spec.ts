import initNeo4j, { close } from '../../../modules/neo4j'
import { NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD, } from '../../../constants'
import { saveClassmarkerResult } from './save-classmarker-result'

describe('saveClassmarkerResult', () => {

    beforeAll(() =>
        initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD)
    )

    afterAll(() => close())

    it('should mark an existing certification as completed', async () => {
        const sub = 'google-oauth2|113046196349780988147'
        const first = 'Classmarker'
        const last = 'Override'
        const classMarkerId = 1689290
        const certificateSerial = 'XXX'
        const passed = true
        const percentage = 110
        const timeFinished = Date.now() / 1000
        const viewResultsUrl = 'https://example.com/'

        const res = await saveClassmarkerResult(sub, first, last, classMarkerId, certificateSerial, passed, percentage, timeFinished, viewResultsUrl)


        expect(res).toBeDefined()
        expect(res.completed).toEqual(true)
        expect(res.classmarkerId).toEqual(classMarkerId.toString())
        expect(res.certificateNumber).toEqual(certificateSerial)
        expect(res.completedAt).toBeDefined()
        expect(res.completedPercentage).toEqual(percentage)

    })
})
