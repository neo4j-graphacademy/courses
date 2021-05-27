import { Router } from 'express'
import { devSandbox } from '../domain/model/sandbox.mocks'
import { write } from '../modules/neo4j'

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

export default router