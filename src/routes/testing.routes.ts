// import pug from 'pug'
import { Router } from 'express'
import { devSandbox } from '../domain/model/sandbox.mocks'
import { read, write } from '../modules/neo4j'
import { getToken } from '../middleware/auth.middleware'
import { getAuth0UserInfo, getSandboxes, getUserInfo } from '../modules/sandbox'
import { AsciidocEmailFilename, prepareEmail } from '../modules/mailer'
import NotFoundError from '../errors/not-found.error'
import { TokenExpiredError } from '../errors/token-expired.error'
import { send } from '../modules/mailer'

const router = Router()

router.get('/reset', async (req, res) => {
    const result = await write(`
        MATCH (u:User)-[:HAS_ENROLMENT]->(e:Enrolment)
        WHERE u.email = $email
        DETACH DELETE e
        RETURN count(*) AS count
    `, { email: req.query.email })

    // tslint:disable-next-line:no-console
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
        const sandboxes = await getSandboxes(token)

        res.json(sandboxes)
    }
    catch (e) {
        next(e)
    }
})

router.get('/profile', async (req, res) => {
    // @ts-ignore
    const user = await req.oidc.user

    res.json(user)

})

router.get('/profile/sandbox', async (req, res, next) => {
    try {
        const token = await getToken(req)
        const user = await getUserInfo(token)

        res.json(user)
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
        const user = await getAuth0UserInfo(token)

        res.json(user)
    }
    catch(e) {
        // @ts-ignore
        next(e)
    }
})

router.get('/session', async (req, res, next) => {
    const session = req.session

    if ( req.query.ref ) {
        // @ts-ignore
        session.ref = req.query.ref
    }

    res.json(session)
})

router.get('/email/:template', async (req, res) => {
    const result = await read(`
        MATCH (u:User) WHERE exists(u.name) WITH u ORDER BY rand() LIMIT 1
        MATCH (c:Course) WITH u, c ORDER BY rand() LIMIT 1
        RETURN u, c
    `)
    const user = {email: 'adam@neo4j.com', ... result!.records[0].get('u').properties}
    const course = result!.records[0].get('c').properties
    const sandbox = devSandbox()

    const data = { user, course, sandbox }
    const email = prepareEmail(req.params.template as AsciidocEmailFilename, data)

    if ( req.query.send === 'true' ) {
        await send('adam.cowley@neo4j.com', email.subject, email.html)

        // tslint:disable-next-line:no-console
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
    throw new TokenExpiredError(Date.now() / 1000)
})

export default router