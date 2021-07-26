import pug from 'pug'
import { Router } from 'express'
import { devSandbox } from '../domain/model/sandbox.mocks'
import { read, write } from '../modules/neo4j'
import { getToken } from '../middleware/auth'
import { getSandboxes } from '../modules/sandbox'

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


router.get('/sandboxes', async (req, res, next) => {
    try {
        const token = await getToken(req)
        const sandboxes = await getSandboxes(token)

        res.json(sandboxes)
    }
    catch (e) {
        next(e)
    }

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
        baseUrl: process.env.BASE_URL
    })

    res.send(html)
})

router.get('/style', (req, res) => {
    res.render('test', {
        title: 'Text Styles',
        hero: {
            title: 'Free, Self-Paced, Hands-on Online Training',
            byline: 'Learn everything you need to know to about how to build, optimise and launch your Neo4j project, all from the Neo4j experts.',
            overline: 'Learn with GraphAcademy'
        }
    })
})

export default router