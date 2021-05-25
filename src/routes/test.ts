import { Router } from 'express'
import { write } from '../modules/neo4j'

const router = Router()

router.get('/', async (req, res, next) => {
    await write(`MATCH (e:Enrolment) DETACH DELETE e`)

    res.redirect('/logout')
})

export default router