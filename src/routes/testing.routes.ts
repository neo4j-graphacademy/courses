// import pug from 'pug'
import { Request, Response, Router } from 'express'
import { devSandbox } from '../domain/model/sandbox.mocks'
import { read, write } from '../modules/neo4j'
import { getToken, getUser } from '../middleware/auth.middleware'
import { getAuth0UserInfo, getSandboxes, getUserInfo } from '../modules/sandbox'
import { AsciidocEmailFilename, prepareEmail } from '../modules/mailer'
import NotFoundError from '../errors/not-found.error'
import { TokenExpiredError } from '../errors/token-expired.error'
import { send } from '../modules/mailer'
import { User } from '../domain/model/user'
import { Sandbox } from '../domain/model/sandbox'

const router = Router()

router.get('/reset', async (req, res) => {
    const result = await write(`
        MATCH (u:User)-[:HAS_ENROLMENT]->(e:Enrolment)
        WHERE u.email = $email
        DETACH DELETE e
        RETURN count(*) AS count
    `, { email: req.query.email })

    console.log('\n\n--\n', result.records[0].get('count'), ' enrolments deleted for ', req.query.email);

    res.redirect('/logout')
})

const sandboxes: Record<string, Sandbox> = {}


router.post('/sandbox/tokeninfo', (req, res) => {
    const json = {
        email: 'adam+graphacademy@neo4j.com',
        email_verified: true,
    } as Partial<User>

    res.json(json)
})

router.get('/sandbox/SandboxGetRunningInstancesForUser', (req, res) => {
    console.log(`[test sandbox] Sending ${Object.keys(sandboxes)}`);

    res.json(Object.values(sandboxes))
})

const runInstance = (req: Request, res: Response) => {
    const id = Object.keys(sandboxes).length + 1
    const sandboxHashKey = `test--${id}`
    const sandbox: Sandbox = {
        ...devSandbox(),
        usecase: req.body.usecase || 'recommendations',
        sandboxHashKey,
        sandboxId: id.toString(),
        createdAt: Date.now(),
        ip: undefined,
    }

    sandboxes[sandboxHashKey] = sandbox

    console.log(`[test sandbox] ${sandboxHashKey} created`);

    res.json(sandbox)
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
router.get('/sandbox/getSandboxByHashKey', (req, res) => {
    const { sandboxHashKey } = req.query

    if (!sandboxHashKey || !sandboxes.hasOwnProperty(sandboxHashKey as string)) {
        console.log(`[test sandbox] ${sandboxHashKey} not found`);

        return res.status(404).send('Sandbox not found')
    }

    const sandbox = sandboxes[sandboxHashKey as string]

    console.log(`[test sandbox] ${sandboxHashKey} found, created at ${sandbox.createdAt}`);

    const age = Date.now() - sandbox.createdAt

    if (age > 10000) {
        console.log(`[test sandbox] ${sandboxHashKey} found, sending IP`);
        return res.send('127.0.0.1')
    }

    console.log(`[test sandbox] ${sandboxHashKey} still too young, wait 10s`);

    res.status(404).send('no ip')
})


router.get('/sandboxes', async (req, res, next) => {
    try {
        const token = await getToken(req)
        const user = await getUser(req)
        const sandboxes = await getSandboxes(token, user as User)

        res.json(sandboxes)
    }
    catch (e) {
        next(e)
    }
})

router.get('/profile', (req, res) => {
    const user = req.oidc.user

    res.json(user)
})

router.get('/profile/sandbox', async (req, res, next) => {
    try {
        const token = await getToken(req)
        const user = await getUser(req)
        const profile = await getUserInfo(token, user as User)

        res.json(profile)
    }
    catch (e) {
        next(e)
    }
})

router.get('/profile/oidc', async (req, res, next) => {
    try {
        const user = await req.oidc.fetchUserInfo()

        res.json(user)
    }
    catch (e) {
        next(e)
    }
})

router.get('/profile/auth0', async (req, res, next) => {
    try {
        const token = await getToken(req)
        const user = await getUser(req)
        const profile = await getAuth0UserInfo(token, user as User)

        res.json(profile)
    }
    catch (e) {
        next(e)
    }
})


router.get('/session', (req, res) => {
    const session = req.session

    res.json(session)
})

router.get('/email/:template', async (req, res) => {
    const result = await read(`
        MATCH (u:User) WHERE exists(u.name) WITH u ORDER BY rand() LIMIT 1
        MATCH (c:Course {slug: 'neo4j-fundamentals'}) WITH u, c ORDER BY rand() LIMIT 1
        MATCH (e:Enrolment) WITH * LIMIT 1
        RETURN u, c, e
    `)
    const user = { email: 'adam@neo4j.com', ...result.records[0]?.get('u').properties }
    const course = result.records[0].get('c').properties
    const sandbox = devSandbox()

    const data = {
        user,
        course,
        sandbox,
        suggestion1: { title: 'Building Foo With Bar', link: '/bar', count: 1215 },
        suggestion2: { title: 'Baz Fundamentals', link: '/baz', count: 798 },
        suggestion3: { title: 'Introduction to Foo', link: '/foo', count: 516 },
        somethingDifferent: { title: 'Something Different', link: '/left-field', count: 26 },
    }

    const email = prepareEmail(req.params.template as AsciidocEmailFilename, data)

    if (req.query.send === 'true') {
        send('adam.cowley@neo4j.com', email.subject, email.html)

        console.log('Email sent');
    }

    res.send(email.html)

    // const event = new UserEnrolled(user, course, sandbox)
    // emitter.emit(event)
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