// import pug from 'pug'
import { Request, Response, Router } from 'express'
import { devInstance } from '../domain/model/instance.mocks'
import { read, write } from '../modules/neo4j'
import { getToken, getUser } from '../middleware/auth.middleware'
import databaseProvider, { DatabaseProvider } from '../modules/instances'
import { AsciidocEmailFilename, prepareEmail } from '../modules/mailer/mailer'
import NotFoundError from '../errors/not-found.error'
import { TokenExpiredError } from '../errors/token-expired.error'
import { send } from '../modules/mailer/mailer'
import { User } from '../domain/model/user'
import { Instance } from '../domain/model/instance'
import { readFileSync } from 'fs'
import { courseSummaryPdfPath } from '../modules/asciidoc'
import { CompletionSource, UserCompletedCourse } from '../domain/events/UserCompletedCourse'
import { formatCourse } from '../utils'
import { emitter } from '../events'
import { CourseWithProgress } from '../domain/model/course'

const router = Router()

router.get('/reset', async (req, res) => {
    const result = await write(
        `
        MATCH (u:User)-[:HAS_ENROLMENT]->(e:Enrolment)
        WHERE u.email = $email
        DETACH DELETE e
        RETURN count(*) AS count
    `,
        { email: req.query.email }
    )

    console.log('\n\n--\n', result.records[0].get('count'), ' enrolments deleted for ', req.query.email)

    res.redirect('/logout')
})

const instances: Record<string, Instance> = {}

router.post('/sandbox/tokeninfo', (req, res) => {
    const json = {
        email: 'adam+graphacademy@neo4j.com',
        email_verified: true,
    } as Partial<User>

    res.json(json)
})

router.get('/sandbox/SandboxGetRunningInstancesForUser', (req, res) => {
    console.log(`[test sandbox] Sending ${Object.keys(instances)}`)

    res.json(Object.values(instances))
})

const runInstance = (req: Request, res: Response) => {
    const id = Object.keys(instances).length + 1
    const instanceHashKey = `test--${id}`
    const instance: Instance = {
        ...devInstance(),
        usecase: req.body.usecase || 'recommendations',
        instanceHashKey,
        instanceId: id.toString(),
        createdAt: Date.now(),
        ip: undefined,
    }

    instances[instanceHashKey] = instance

    console.log(`[test sandbox] ${instanceHashKey} created`)

    res.json(instance)
}

router.get('/sandbox/SandboxRunInstance', runInstance)
router.post('/sandbox/SandboxRunInstance', runInstance)

router.post('/sandbox/SandboxStopInstance', (req, res) => {
    res.send('ok')
})

/**
 * Sandbox creation process:
 *
 * 1. Sandbox is created, IP address is undefined - sandbox returns a 404 but with error "no ip"
 * 2. After 30 seconds - 3 minutes, the sandbox will be assigned an IP - ready to connect to
 */
router.get('/sandbox/getInstanceById', (req, res) => {
    const { instanceHashKey } = req.query

    if (!instanceHashKey || !instances.hasOwnProperty(instanceHashKey as string)) {
        // console.log(`[test sandbox] ${sandboxHashKey} not found`);

        return res.status(404).send('Instance not found')
    }

    const instance = instances[instanceHashKey as string]

    console.log(`[test sandbox] ${instanceHashKey} found, created at ${instance.createdAt}`)

    const age = Date.now() - instance.createdAt

    if (age > 10000) {
        console.log(`[test sandbox] ${instanceHashKey} found, sending IP`)
        return res.send('127.0.0.1')
    }

    console.log(`[test sandbox] ${instanceHashKey} still too young, wait 10s`)

    res.status(404).send('no ip')
})

router.get('/:provider/instances', async (req, res, next) => {
    try {
        const token = await getToken(req)
        const user = await getUser(req)
        const provider = databaseProvider(req.params.provider as DatabaseProvider)
        const instances = await provider.getInstances(token, user as User)

        res.json(instances)
    } catch (e) {
        next(e)
    }
})

router.get('/profile', (req, res) => {
    const user = req.oidc.user

    res.json(user)
})


router.get('/profile/oidc', async (req, res, next) => {
    try {
        const user = await req.oidc.fetchUserInfo()

        res.json(user)
    } catch (e) {
        next(e)
    }
})

router.get('/session', (req, res) => {
    const session = req.session

    res.json(session)
})

router.get('/email/:template', async (req, res) => {
    const result = await read(`
        MATCH (u:User) WITH u ORDER BY rand() LIMIT 1
        MATCH (c:Course {slug: 'neo4j-fundamentals'}) WITH u, c ORDER BY rand() LIMIT 1
        MATCH (e:Enrolment) WITH * LIMIT 1
        RETURN u, c, e
    `)

    if (result.records.length == 0) {
        return res.send('No results from query - try seeding the database')
    }

    const user = { email: 'adam@neo4j.com', ...result.records[0]?.get('u').properties }
    const course = {
        ...result.records[0].get('c').properties,
        summary: true,
    }
    course.title_encoded = encodeURIComponent(course.title)

    const instance = devInstance()

    const data = {
        user,
        course,
        instance,
        suggestion1: { title: 'Building Foo With Bar', link: '/bar', count: 1215 },
        suggestion2: { title: 'Baz Fundamentals', link: '/baz', count: 798 },
        suggestion3: { title: 'Introduction to Foo', link: '/foo', count: 516 },
        somethingDifferent: { title: 'Something Different', link: '/left-field', count: 26 },
    }

    const email = prepareEmail(req.params.template as AsciidocEmailFilename, data)

    if (req.query.send === 'true') {
        const summaryPath = await courseSummaryPdfPath('neo4j-fundamentals')
        const attachments = summaryPath ? [{ filename: 'summary.pdf', content: readFileSync(summaryPath).toString() }] : undefined

        send('adam.cowley@neo4j.com', email.subject, email.html, 'test', attachments)

        console.log('Email sent')
    }

    res.send(email.html)

    // const event = new UserEnrolled(user, course, sandbox)
    // emitter.emit(event)
})

router.get('/event/:event/:course', async (req, res) => {
    if (req.params.event == 'UserCompletedCourse') {
        const result = await read(
            `
            MATCH (u:User) WITH u ORDER BY rand() LIMIT 1
            MATCH (c:Course {slug: $course}) WITH u, c ORDER BY rand() LIMIT 1
            MATCH (e:Enrolment) WITH * LIMIT 1
            RETURN u, c {
                .*,
                enrolmentId: e.id,
                modules: []
            } AS c, e
        `,
            { course: req.params.course }
        )

        if (result.records.length == 0) {
            return res.send('No results from query - try seeding the database')
        }

        const user = { email: 'adam@neo4j.com', ...result.records[0]?.get('u').properties }
        const course = await formatCourse<CourseWithProgress>({
            ...result.records[0].get('c'),
            summary: true,
        })

        emitter.emit(new UserCompletedCourse(user, course, CompletionSource.WEBSITE))

        return res.send(`${req.params.event} fired!`)
    }

    return res.send('Try UserCompletedCourse')
})

router.get('/style', (req, res) => {
    res.render('test', {
        title: 'Text Styles',
        hero: {
            title: 'Free, Self-Paced, Hands-on Online Training',
            byline: 'Learn everything you need to know to about how to build, optimise and launch your Neo4j project, all from the Neo4j experts.',
            overline: 'Learn with GraphAcademy',
        },
    })
})

router.get('/404', (req, res, next) => {
    next(new NotFoundError('Throw an error'))
})

router.get('/500', (req, res, next) => {
    next(new Error('Generic Error'))
})

router.get('/token-expired', (req, res, next) => {
    next(new TokenExpiredError(Date.now() / 1000))
})

export default router
