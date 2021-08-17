import { Router } from "express";

const router = Router()
const { AWS_URL } = process.env

router.get('/:id.pdf', (req, res) => {
    res.redirect(`${AWS_URL}certificates/${req.params.id}.pdf`)
})

router.get('/:id.html', (req, res) => {
    res.redirect(`${AWS_URL}certificates/${req.params.id}.html`)
})

export default router