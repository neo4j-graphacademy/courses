import express, { RequestHandler } from 'express'
import request from 'supertest'
import { CLASSMARKER_SECRET, NEO4J_HOST, NEO4J_PASSWORD, NEO4J_USERNAME } from '../../../constants'
import initNeo4j, { write, close } from '../../../modules/neo4j'
import classmarkerRoutes from './classmarker.routes'
import { CLASSMARKER_SIGNATURE_HEADER, computeHmac, verifyData } from './classmarker.utils'
import { testResultBody } from './fixtures/test'

describe('Classmarker Webhook Integration', () => {

    const app = express()

    app.use(express.json() as RequestHandler)
    app.use(classmarkerRoutes)

    beforeAll(() => initNeo4j(
        NEO4J_HOST,
        NEO4J_USERNAME,
        NEO4J_PASSWORD
    ))

    afterAll(() => close())

    describe('/webhook', () => {
        it('should check for header existence', done => {
            request(app)
                .post('/webhook')
                .set('Content-type', 'application/json')
                .send({ test: true })
                .expect(200)
                .then(res => {
                    expect(res.body.status).toEqual('error')
                    expect(res.body.message).toContain('Header missing')

                })
                .then(() => done())
                .catch(e => done(e))
        })

        it('should check for verify header', done => {
            request(app)
                .post('/webhook')
                .set('Content-type', 'application/json')
                .set(CLASSMARKER_SIGNATURE_HEADER, '(invalid)')
                .send({ test: true })
                .expect(200)
                .then(res => {
                    expect(res.body.status).toEqual('error')
                    expect(res.body.message).toContain('Invalid signature')
                })
                .then(() => done())
                .catch(e => done(e))
        })

        it('should return error when user is not found', done => {
            const signature = computeHmac(testResultBody, CLASSMARKER_SECRET)

            request(app)
                .post('/webhook')
                .send(testResultBody)
                .set('Content-type', 'application/json')
                .set(CLASSMARKER_SIGNATURE_HEADER, signature)
                .expect(200)
                .then(res => {
                    expect(res.body.status).toEqual('error')
                    expect(res.body.message).toContain('Could not find enrolment')

                })
                .then(() => done())
                .catch(e => done(e))
        })

        it('should return OK when the enrolment has been updated', async () => {
            // Create test data
            await write(`
                MERGE (u:User {sub: $sub})
                MERGE (c:Course {slug: 'classmarker-test'})
                MERGE (e:Enrolment {id: apoc.text.base64Encode(c.slug +'--'+ u.sub)})
                SET c.classmarkerId = $classmarkerId,
                    c:ClassmarkerTest,
                    e:ClassmarkerTest,
                    e.createdAt = datetime(),
                    u:ClassmarkerTest

                MERGE (u)-[:HAS_ENROLMENT]->(e)
                MERGE (e)-[:FOR_COURSE]->(c)
            `, {
                sub: testResultBody.result.cm_user_id,
                classmarkerId: testResultBody.test.test_id.toString(),
            })

            // Test
            const signature = computeHmac(testResultBody, CLASSMARKER_SECRET)

            await request(app)
                .post('/webhook')
                .send(testResultBody)
                .set('Content-type', 'application/json')
                .set(CLASSMARKER_SIGNATURE_HEADER, signature)
                .expect(201)
                .then(res => {
                    expect(res.body.status).toEqual('ok')
                })

            // Remove old data
            await write(`MATCH (n:ClassmarkerTest) DETACH DELETE n`)
        })
    })

})
