// import pug from 'pug'
import { Router } from 'express'
import { devSandbox } from '../domain/model/sandbox.mocks'
import { read, write } from '../modules/neo4j'
import { getToken, getUser } from '../middleware/auth.middleware'
import { getAuth0UserInfo, getSandboxes, getUserInfo } from '../modules/sandbox'
import { AsciidocEmailFilename, prepareEmail } from '../modules/mailer'
import NotFoundError from '../errors/not-found.error'
import { TokenExpiredError } from '../errors/token-expired.error'
import { send } from '../modules/mailer'
import { User } from '../domain/model/user'

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

router.get('/sandbox/SandboxGetRunningInstancesForUser', (req, res) => {
    res.json([
        devSandbox()
    ])
})

router.post('/sandbox/SandboxRunInstance', (req, res) => {
    res.json({
        ...devSandbox(),
        usecase: req.body.usecase,
    })
})

router.get('/sandbox/SandboxRunInstance', (req, res) => {
    res.json(devSandbox())
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
    catch(e) {
        next(e)
    }
})

router.get('/profile/oidc', async (req, res, next) => {
    try {
        const user = await req.oidc.fetchUserInfo()

        res.json(user)
    }
    catch(e) {
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
    catch(e) {
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
        MATCH (c:Course) WITH u, c ORDER BY rand() LIMIT 1
        RETURN u, c
    `)
    const user = {email: 'adam@neo4j.com', ... result.records[0].get('u').properties}
    const course = result.records[0].get('c').properties
    const sandbox = devSandbox()

    const data = { user, course, sandbox }
    const email = prepareEmail(req.params.template as AsciidocEmailFilename, data)

    if ( req.query.send === 'true' ) {
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