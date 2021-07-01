import pug from 'pug'
import { Router } from 'express'
import { devSandbox } from '../domain/model/sandbox.mocks'
import { read, write } from '../modules/neo4j'

const router = Router()

router.get('/', async (req, res) => {
    await write(`MATCH (e:Enrolment) DETACH DELETE e`)

    res.redirect('/logout')
})

router.get('/sandbox/SandboxGetRunningInstancesForUser', (req, res) => {
    res.json([
        devSandbox()
    ])
})

router.get('/sandbox/SandboxRunInstance', (req, res) => {
    res.json(devSandbox())
})

router.get('/email/enrolment', async (req, res) => {
    const result = await read(`
        MATCH (u:User) WHERE exists(u.name) WITH u ORDER BY rand() LIMIT 1
        MATCH (c:Course) WITH u, c ORDER BY rand() LIMIT 1

        RETURN u, c
    `)
    const user = result!.records[0].get('u').properties
    const course = result!.records[0].get('c').properties
    const sandbox = devSandbox()

    const html = pug.renderFile('views/emails/enrolment.pug', {
        user,
        course,
        sandbox,
        baseUrl: process.env.AUTH0_BASE_URL
    })

    res.send(html)
})

export default router