import { Router } from "express";
import { BASE_URL, CDN_URL } from "../../constants";
import { forceTrailingSlash } from "../../middleware/trailing-slash.middleware";
import { convertCertificationOverview, loadFile } from "../asciidoc";
import getCertifications from "../../domain/services/get-certifications";
import { canonical } from "../../utils";
import { getUser } from "../../middleware/auth.middleware";
import { UserViewedCourse } from "../../domain/events/UserViewedCourse";
import { emitter } from "../../events";
import startCertification from "./services/start-certification";
import { requiresAuth } from "express-openid-connect";
import { User } from "../../domain/model/user";
import { getRef, getTeam } from "../../middleware/save-ref.middleware";
import { CertificationStatus, NextCertificationAction } from "./services/check-existing-attempts";
import getCertificationStatus from "./services/get-certification-status";
import saveAnswer from "./services/save-answer";
import { certificationOgBannerImage, } from "../../routes/route.utils";
import getQuestionHTML from "./services/get-question-html";
import getCertificationResults from "./services/get-certification-results";
import getCertification from "./services/get-certification";

const router = Router({
    caseSensitive: true,
})

const ERROR_ATTEMPTS_EXCEDED = 'You can only attempt the certification once every 24 hours.'
const ERROR_TIMES_UP = 'Time is up.  Here are your results.'

router.get(`/`, forceTrailingSlash, async (req, res, next) => {
    try {
        const file = loadFile(`pages/certification.adoc`)

        const certifications = await getCertifications()

        res.render('certification', {
            hero: {
                title: file.getTitle(),
                // overline: file.getAttribute('overline'),
                byline: file.getAttribute('caption'),
            },
            canonical: canonical(req.originalUrl),
            title: file.getTitle(),
            content: file.getContent(),
            certifications: certifications.reverse(),
            classes: 'certifications',
            ogImage: CDN_URL ? `${CDN_URL}/img/categories/banners/certification.png` : `${BASE_URL}/img/og/og-categories.png`
        })
    }
    catch (e) {
        next(e)
    }
})

router.get(`/:slug`, forceTrailingSlash, async (req, res, next) => {
    try {
        const { slug } = req.params
        const user = await getUser(req)

        const { course, updatedAt, ...status } = await getCertification(slug, user)

        const updated = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt

        // Emit user viewed course
        if (user) {
            emitter.emit(new UserViewedCourse(user, course))
        }

        const doc = await convertCertificationOverview(course.slug)

        res.render('certification/overview', {
            classes: `course ${course.certification ? 'certification' : ''} ${course.slug} ${status.completed ? 'course--completed' : ''}`,

            // For analytics.pug
            analytics: {
                course: {
                    slug: course.slug,
                    title: course.title,
                    link: course.link,
                },
                user: {
                    id: user?.id
                }
            },

            course,
            title: `${course.title}`,
            canonical: canonical(course.link),
            // ...course,

            ogDescription: course.caption,
            ogTitle: `Take the ${course.title} with Neo4j GraphAcademy`,
            ogImage: certificationOgBannerImage(course.slug),

            doc,
            feedback: true,
            ...status,
            updatedAt: updated,
        })
    }
    catch (e) {
        next(e)
    }
})

// router.post('/:slug/enrol', (req, res) => {
router.get('/:slug/enrol', requiresAuth(), async (req, res) => {
    // Check for active enrolment
    // - if in progress, go to /exam
    // - if created at more than an hour ago - redirect to /certifications/:slug with flash
    // - if an attempt exists in the last day - redirect to /certifications/:slug with flash

    // else
    // - create the enrolment node
    // - assign random questions based on weighting
    // -  redirect to /certifications/:slug/:exam

    const { slug } = req.params
    const user = await getUser(req) as User
    const ref = getRef(req)
    const team = getTeam(req)

    const { action } = await startCertification(slug, user, ref, team)

    if (action === NextCertificationAction.ATTEMPTS_EXCEDED) {
        req.flash('info', ERROR_ATTEMPTS_EXCEDED)

        return res.redirect(`/certifications/${slug}/`)
    }
    else if (action === NextCertificationAction.SUCCEEDED) {
        return res.redirect(`/certifications/${slug}/results/`)
    }
    else {
        return res.redirect(`/certifications/${slug}/exam/`)
    }
})

const displayQuestion = async (req, res, user: User, status: CertificationStatus) => {
    const { slug } = req.params

    // If complete, send to results page
    if (status.action === NextCertificationAction.COMPLETE) {
        res.redirect(`/certifications/${slug}/results/`)
    }
    else if (status.action === NextCertificationAction.ATTEMPTS_EXCEDED) {
        req.flash('info', ERROR_TIMES_UP)
        res.redirect(`/certifications/${slug}/results/`)
    }
    // If continue,
    else if (status.action === NextCertificationAction.CONTINUE && typeof status.course.slug === 'string' && typeof status.question !== 'undefined') {
        const { title, role, html } = await getQuestionHTML(status.course.slug, status.question.id)

        res.render('certification/exam', {
            ...status,
            user,
            question: {
                ...status.question,
                title,
                role,
                html,
            },
            title: title,
        })
    }
    // If there isn't an active certification attempt, return to home page
    else {
        res.redirect(`/certifications/${slug}/`)
    }
}

router.get('/:slug/exam', requiresAuth(), async (req, res) => {
    // Select a question from the next level at random
    const { slug } = req.params
    const user = await getUser(req) as User

    const status = await getCertificationStatus(slug, user)

    void displayQuestion(req, res, user, status)
})

router.post('/:slug/exam', requiresAuth(), async (req, res, next) => {
    try {
        const { slug } = req.params
        const user = await getUser(req) as User

        const { id } = req.body
        let { answers } = req.body

        // TODO: Validation
        if (typeof answers === 'string') {
            answers = [answers]
        }

        answers = answers.map((answer: string) => answer.trim())

        // Save the question answer
        const output = await saveAnswer(slug, user, id, answers)

        void displayQuestion(req, res, user, output)
    }
    catch (e) {
        next(e)
    }
})

router.get('/:slug/results', requiresAuth(), async (req, res) => {
    const { slug } = req.params
    const user = await getUser(req) as User

    const results = await getCertificationResults(slug, user)

    res.render('certification/results', {
        ...results,
        updatedAt: results?.updatedAt ? new Date(results.updatedAt) : undefined,
    })
})

export default router
